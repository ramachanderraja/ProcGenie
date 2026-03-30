# Universal Workflow Designer — Design Specification

**Date:** 2026-03-30
**Status:** Draft
**Approach:** Universal Workflow Engine (Approach 2)

## Overview

A visual drag-and-drop workflow designer that lets business users create, edit, and activate workflows across all ProcGenie modules. Workflows are directed graphs of steps executed by a backend engine that listens for entity lifecycle events. Save & activate instantly — no versioned publishing pipeline.

## Target Users

Non-technical procurement administrators who need an intuitive, polished experience with guardrails.

## Scope

Cross-module: Intake requests, Contracts, Invoices, Purchase Orders. A single workflow can span entity types via Action nodes that create downstream entities.

---

## 1. Data Model

### 1.1 WorkflowDefinition (enhanced existing entity)

Existing entity at `apps/api/src/modules/workflow/entities/workflow.entity.ts`. Add new columns:

| Column | Type | Description |
|--------|------|-------------|
| `entityTypes` | `text[]` | Which entity types this workflow applies to. Values: `REQUEST`, `CONTRACT`, `INVOICE`, `PURCHASE_ORDER` |
| `graph` | `jsonb` | The React Flow graph: `{ nodes: Node[], edges: Edge[] }` |
| `createdBy` | `uuid` | User who created this workflow |

Existing columns retained: `id`, `name`, `description`, `type`, `status` (DRAFT/ACTIVE/SUSPENDED/ARCHIVED), `version`, `triggerConditions`, `escalationRules`, `steps` (relation), `tenantId`, timestamps.

### 1.2 Node Types

Each node in the `graph.nodes[]` array has a `type` and `data` object:

| Node Type | `data` Schema | Behavior |
|-----------|---------------|----------|
| `start` | `{ entityType: string, event: "submitted"\|"created"\|"updated", conditions: Condition[] }` | Entry point. Conditions are field-level filters (e.g., `estimatedTotal > 5000`). |
| `approval` | `{ approvers: string[], approvalMode: "any"\|"all"\|"sequential", slaHours: number }` | Creates Approval record(s). Pauses until human acts. Has two output handles: "approved" and "rejected". `approvers` entries use prefix convention: `user:uuid` for specific users, `role:name` for role-based assignment (e.g., `role:manager`, `user:abc-123`). |
| `condition` | `{ field: string, operator: "eq"\|"neq"\|"gt"\|"gte"\|"lt"\|"lte"\|"in"\|"contains", value: any }` | Evaluates against instance context. Two output handles: "true" and "false". |
| `action` | `{ actionType: "update_status"\|"create_entity"\|"send_notification"\|"call_api", config: Record<string, any> }` | Executes an automated operation. Single output handle. |
| `ai_review` | `{ promptTemplate: string, confidenceThreshold: number }` | Calls Azure OpenAI. Stores result in context. Two output handles: "above_threshold" and "below_threshold". |
| `parallel` | `{ joinMode: "all"\|"any" }` | Used as both fork and join. A fork parallel node has multiple output handles. The engine identifies the matching join parallel node by finding the node where all branch paths converge. The join waits for all/any branches based on `joinMode`. |
| `wait` | `{ type: "duration"\|"event", durationHours?: number, eventName?: string }` | Pauses execution for a time period or until an external event. |
| `end` | `{ finalStatus: string }` | Terminal node. Sets entity status and marks instance COMPLETED. |

### 1.3 Condition Schema

Used in Start node conditions and Condition nodes:

```typescript
interface Condition {
  field: string;      // dot-notation path into entity, e.g. "estimatedTotal", "category", "priority"
  operator: "eq" | "neq" | "gt" | "gte" | "lt" | "lte" | "in" | "contains";
  value: any;         // string, number, or array (for "in" operator)
}
```

### 1.4 WorkflowInstance (NEW entity)

Runtime execution state for each triggered workflow.

| Column | Type | Description |
|--------|------|-------------|
| `id` | `uuid` | Primary key |
| `workflowDefinitionId` | `uuid` | FK to WorkflowDefinition |
| `definitionVersion` | `integer` | Snapshot of version at trigger time |
| `entityType` | `varchar` | `REQUEST`, `CONTRACT`, `INVOICE`, `PURCHASE_ORDER` |
| `entityId` | `uuid` | ID of the entity that triggered this |
| `status` | `varchar` | `RUNNING`, `PAUSED`, `COMPLETED`, `FAILED`, `CANCELLED` |
| `currentStepIds` | `text[]` | Currently active node IDs (supports parallel execution) |
| `context` | `jsonb` | Runtime variables — entity snapshot + accumulated step outputs |
| `history` | `jsonb` | Array of `{ stepId, stepType, action, timestamp, data }` entries |
| `error` | `text` | Error message if status is FAILED |
| `startedAt` | `timestamp` | When instance was created |
| `completedAt` | `timestamp` | When instance reached End node or was cancelled |
| `tenantId` | `varchar` | Tenant isolation |

Indexes: `(entityType, entityId)`, `(status, tenantId)`, `(workflowDefinitionId)`.

### 1.5 Edge Schema

Each edge in `graph.edges[]`:

```typescript
interface WorkflowEdge {
  id: string;
  source: string;       // source node ID
  target: string;       // target node ID
  sourceHandle?: string; // "approved", "rejected", "true", "false", "above_threshold", "below_threshold"
  label?: string;        // display label on the edge
}
```

---

## 2. Workflow Execution Engine

### 2.1 Event-Driven Triggers

The engine uses NestJS `@nestjs/event-emitter` to listen for entity lifecycle events.

**Events emitted by existing services:**

| Service | Event | When |
|---------|-------|------|
| IntakeService.submit() | `request.submitted` | Request transitions to SUBMITTED |
| IntakeService.createRequest() | `request.created` | New request created |
| ContractService.submitReview() | `contract.submitted` | Contract submitted for review |
| InvoiceService.create() | `invoice.created` | New invoice created |
| BuyingService.submitPO() | `po.submitted` | PO submitted for approval |

Each event payload: `{ entityType, entityId, entity (full object), tenantId }`.

### 2.2 Trigger Matching (WorkflowTriggerService)

On receiving an event:

1. Query all ACTIVE WorkflowDefinitions where `entityTypes` includes the event's `entityType`
2. For each, find the Start node and evaluate its `conditions` against the entity data
3. For each matching definition, create a WorkflowInstance and begin execution

Multiple workflows can match the same event (e.g., an intake request could trigger both an approval workflow and a notification workflow).

### 2.3 Step Execution (WorkflowEngineService)

Core `executeStep(instance, nodeId)` method:

```
1. Load node from definition graph by nodeId
2. Record step entry in instance.history
3. Based on node.type:

   START:
     - Copy entity data into instance.context
     - Follow the single outgoing edge

   APPROVAL:
     - Create Approval record(s) based on approvers + approvalMode
     - Set instance status to PAUSED
     - Store current nodeId in currentStepIds
     - STOP (resumes when approval action is taken)

   CONDITION:
     - Evaluate condition against instance.context
     - Follow "true" or "false" edge based on result

   ACTION:
     - Execute the configured action via EntityStatusService
     - Store result in instance.context
     - Follow the single outgoing edge

   AI_REVIEW:
     - Call AiService with promptTemplate + context
     - Store AI result in instance.context.aiReview
     - Compare confidence to threshold
     - Follow "above_threshold" or "below_threshold" edge

   PARALLEL:
     - Find all outgoing edges from this node
     - Execute each target node concurrently
     - Track active branches in currentStepIds
     - When branch reaches the join node, check joinMode
     - If all/any branches complete, continue past join

   WAIT:
     - If duration: schedule a delayed event, set PAUSED
     - If event: register listener, set PAUSED

   END:
     - Update entity status to finalStatus via EntityStatusService
     - Set instance status to COMPLETED, completedAt = now()

4. Record step completion in instance.history
5. If not paused, find next edge and call executeStep recursively
```

### 2.4 Approval Resumption

When `WorkflowService.processApproval()` is called (existing endpoint):

1. Find the WorkflowInstance that has this approval's `entityType` + `entityId` and status PAUSED
2. Determine the approval result (APPROVED/REJECTED)
3. For sequential approvals: if more approvers remain, create next Approval; otherwise resume
4. For any/all approvals: check if the mode condition is met
5. Follow the corresponding edge ("approved" or "rejected") from the Approval node
6. Continue execution

### 2.5 Context Object

The instance `context` is a JSON bag that accumulates data through the workflow:

```json
{
  "entity": { /* full entity snapshot at trigger time */ },
  "trigger": { "event": "request.submitted", "timestamp": "..." },
  "steps": {
    "ai_review_1": { "confidence": 85, "analysis": "...", "suggestions": [...] },
    "approval_1": { "approver": "user-123", "action": "APPROVED", "comments": "LGTM" }
  }
}
```

Condition nodes reference fields via dot notation: `entity.estimatedTotal`, `steps.ai_review_1.confidence`, etc.

### 2.6 Error Handling

- If any step throws an exception, the instance transitions to FAILED with the error message
- Failed instances appear in a dashboard widget
- A "Retry" action resets the instance to the failed step and re-executes
- If no workflow matches an event, the entity continues its default lifecycle (backward compatible)

---

## 3. Frontend — Visual Workflow Designer

### 3.1 New Pages

**`/workflows`** — Workflow list page
- Table: name, entity types (pill badges), status (badge), version, last modified
- "Create Workflow" button opens a modal: name, description, entity types (multi-select)
- Click row navigates to `/workflows/[id]`
- Status filter tabs: All, Active, Draft, Archived

**`/workflows/[id]`** — Canvas editor page
- Full-viewport React Flow canvas with sidebar

### 3.2 Canvas Editor Layout

**Top Bar** (sticky, 56px):
- Back arrow to `/workflows`
- Workflow name (editable inline text field)
- Entity type pills (clickable to edit)
- Status badge
- "Save" button (primary) — persists graph JSON
- "Activate" / "Deactivate" toggle button
- "Test" button — dry-run modal

**Left Sidebar** (280px, collapsible):

Two modes, switched by selection state:

**Mode 1: Node Palette** (when no node selected)
- Section header "Add Steps"
- Draggable cards for each node type, grouped:
  - **Flow**: Start, End
  - **Gates**: Approval, Condition, Parallel
  - **Automation**: Action, AI Review, Wait
- Each card: icon + name + one-line description
- Drag from palette onto canvas to create node

**Mode 2: Properties Panel** (when a node is selected)
- Section header shows node type icon + name
- Configuration form specific to node type (see Section 1.2 for each type's data schema)
- "Delete Node" button at bottom (red, with confirmation)
- Click canvas background to deselect and return to palette

**Canvas Area**:
- React Flow with `fitView`, `snapToGrid` (20px), `connectionMode: "loose"`
- Minimap in bottom-right
- Controls (zoom in/out/fit) in bottom-left
- Background: dots pattern
- Nodes render as custom React Flow nodes (see 3.3)
- Edges render as smoothstep with optional labels

### 3.3 Custom Node Components

All nodes share a base style: 180px wide, rounded-lg, white background, shadow-sm, colored left border (4px).

| Node | Left Border | Icon | Handles |
|------|-------------|------|---------|
| Start | `emerald-500` | `Play` | 1 output (bottom) |
| Approval | `amber-500` | `UserCheck` | 1 input (top), 2 outputs: "Approved" (bottom-left), "Rejected" (bottom-right) |
| Condition | `blue-500` | `GitBranch` | 1 input (top), 2 outputs: "True" (bottom-left), "False" (bottom-right) |
| Action | `indigo-500` | `Zap` | 1 input (top), 1 output (bottom) |
| AI Review | `purple-500` | `Brain` | 1 input (top), 2 outputs: "Pass" (bottom-left), "Fail" (bottom-right) |
| Parallel | `cyan-500` | `GitFork` | 1 input (top), N outputs (bottom, dynamically added) |
| Wait | `slate-500` | `Clock` | 1 input (top), 1 output (bottom) |
| End | `red-500` | `Square` | 1 input (top), no outputs |

Inside each node: icon (16px), node label (bold, 13px), subtitle with key config detail (e.g., "Amount > $5,000" for condition, "Manager + VP" for approval).

### 3.4 Edge Labels

Conditional edges (from Approval, Condition, AI Review) display a small pill label on the edge: "Approved" / "Rejected", "True" / "False", "Pass" / "Fail". Labels are color-coded: green for positive path, red for negative.

### 3.5 Test Mode

Clicking "Test" opens a modal:
- Entity type selector (pre-filled from workflow)
- JSON editor or form to input sample entity data (pre-populated with a seeded entity)
- "Run Test" button
- Results panel: step-by-step execution trace with pass/fail indicators
- Animated dots flow along edges in the canvas during test execution

### 3.6 Sidebar Navigation

Add "Workflows" to the sidebar under ADMIN section, between "Integrations" and "Settings". Icon: `Workflow` from lucide-react.

---

## 4. API Endpoints

### 4.1 Workflow Definition CRUD (enhanced existing)

| Method | Route | Body/Params | Response |
|--------|-------|-------------|----------|
| `GET` | `/workflows` | `?status=ACTIVE&entityType=REQUEST` | `{ data: WorkflowDefinition[], total }` |
| `POST` | `/workflows` | `CreateWorkflowDto` (enhanced with `graph`, `entityTypes`) | `WorkflowDefinition` |
| `GET` | `/workflows/:id` | — | `WorkflowDefinition` with graph |
| `PUT` | `/workflows/:id` | `UpdateWorkflowDto` | `WorkflowDefinition` |
| `PATCH` | `/workflows/:id/activate` | — | `WorkflowDefinition` (status → ACTIVE) |
| `PATCH` | `/workflows/:id/archive` | — | `WorkflowDefinition` (status → ARCHIVED) |
| `POST` | `/workflows/:id/test` | `{ entityData: Record<string, any> }` | `{ steps: StepResult[], success: boolean }` |

### 4.2 Workflow Instance Endpoints (NEW)

| Method | Route | Body/Params | Response |
|--------|-------|-------------|----------|
| `GET` | `/workflows/instances` | `?status=RUNNING&entityType=REQUEST` | `{ data: WorkflowInstance[], total }` |
| `GET` | `/workflows/instances/:id` | — | `WorkflowInstance` with full history |
| `PATCH` | `/workflows/instances/:id/cancel` | — | `WorkflowInstance` (status → CANCELLED) |
| `PATCH` | `/workflows/instances/:id/retry` | — | `WorkflowInstance` (re-execute from failed step) |

### 4.3 Existing Approval Endpoints (unchanged)

| Method | Route | Purpose |
|--------|-------|---------|
| `GET` | `/workflows/approvals/pending` | Get user's pending approvals |
| `PATCH` | `/workflows/approvals/:id/action` | Approve/reject/delegate |

---

## 5. Seeded Default Workflows

Four default workflows created during database seed, status ACTIVE:

### 5.1 Intake Approval Workflow

```
Start (request.submitted)
  → Condition (estimatedTotal > 5000?)
    → [True] Approval (role: manager, mode: sequential, SLA: 24h)
      → Approval (role: vp_finance, mode: any, SLA: 48h)
        → Action (update_status → APPROVED)
          → End (approved)
    → [False] Approval (role: manager, mode: any, SLA: 24h)
      → Action (update_status → APPROVED)
        → End (approved)
```

Rejection from any Approval node → Action (update_status → REJECTED) → End (rejected).

### 5.2 Contract Review Workflow

```
Start (contract.submitted)
  → AI Review (clause analysis, threshold: 70%)
    → [Pass] Approval (role: legal_reviewer, SLA: 72h)
      → Approval (role: finance_approver, SLA: 48h)
        → Action (update_status → EXECUTED)
          → End (executed)
    → [Fail] Action (send_notification → legal team, flag for manual review)
      → Approval (role: legal_reviewer, SLA: 72h)
        → same as above
```

### 5.3 Invoice Processing Workflow

```
Start (invoice.created)
  → Action (three_way_match)
    → Condition (matchResult == "passed"?)
      → [True] Action (update_status → APPROVED)
        → Action (schedule_payment)
          → End (paid)
      → [False] Approval (role: ap_clerk, SLA: 24h)
        → [Approved] Action (update_status → APPROVED) → End (approved)
        → [Rejected] Action (update_status → REJECTED) → End (rejected)
```

### 5.4 PO Approval Workflow

```
Start (po.submitted)
  → Condition (totalAmount > 10000?)
    → [True] Approval (role: director, SLA: 48h)
      → Action (update_status → APPROVED)
        → End (approved)
    → [False] Action (update_status → APPROVED, auto-approve)
      → End (approved)
```

---

## 6. File Structure

```
apps/api/src/modules/workflow/
├── entities/
│   ├── workflow.entity.ts              ← MODIFY: add graph, entityTypes columns
│   ├── workflow-step.entity.ts         ← existing, unchanged
│   ├── workflow-instance.entity.ts     ← NEW
│   ├── approval.entity.ts             ← existing, unchanged
│   └── sla.entity.ts                  ← existing, unchanged
├── workflow.controller.ts              ← MODIFY: add instance + archive + test endpoints
├── workflow.service.ts                 ← MODIFY: enhanced definition CRUD
├── workflow-engine.service.ts          ← NEW: core step execution logic
├── workflow-trigger.service.ts         ← NEW: event listener + trigger matching
├── entity-status.service.ts            ← NEW: generic cross-module status updater
├── workflow.module.ts                  ← MODIFY: register new services, EventEmitterModule
├── dto/
│   └── workflow.dto.ts                 ← MODIFY: add graph, entityTypes, test DTOs
└── seed/
    └── default-workflows.ts            ← NEW: 4 seeded workflow definitions

apps/web/src/app/workflows/
├── page.tsx                            ← NEW: workflow list page
└── [id]/
    └── page.tsx                        ← NEW: canvas editor page

apps/web/src/components/workflow/
├── WorkflowCanvas.tsx                  ← NEW: React Flow wrapper with config
├── nodes/
│   ├── BaseNode.tsx                    ← NEW: shared node shell (border, icon, handles)
│   ├── StartNode.tsx                   ← NEW
│   ├── ApprovalNode.tsx                ← NEW
│   ├── ConditionNode.tsx               ← NEW
│   ├── ActionNode.tsx                  ← NEW
│   ├── AiReviewNode.tsx                ← NEW
│   ├── ParallelNode.tsx                ← NEW
│   ├── WaitNode.tsx                    ← NEW
│   └── EndNode.tsx                     ← NEW
├── NodePalette.tsx                     ← NEW: draggable node list
├── PropertiesPanel.tsx                 ← NEW: node configuration form
├── TestModal.tsx                       ← NEW: dry-run test UI
└── edges/
    └── ConditionalEdge.tsx             ← NEW: labeled edge with pill

apps/web/src/services/api.ts            ← MODIFY: add workflow API functions
apps/web/src/components/layout/Sidebar.tsx ← MODIFY: add Workflows nav link
```

### New Dependencies

| Package | Where | Purpose |
|---------|-------|---------|
| `@xyflow/react` | `apps/web` | React Flow v12 canvas library |
| `@nestjs/event-emitter` | `apps/api` | Event-driven workflow triggers |

---

## 7. Integration with Existing Services

### 7.1 Event Emission

Each service adds a single line after its status-changing operation:

```typescript
// In IntakeService.submit():
this.eventEmitter.emit('request.submitted', { entityType: 'REQUEST', entityId: id, entity: request, tenantId });
```

Same pattern for ContractService, InvoiceService, BuyingService.

### 7.2 EntityStatusService

A new service that maps `(entityType, action)` to the correct module service call:

```typescript
async updateStatus(entityType: string, entityId: string, status: string, tenantId: string) {
  switch (entityType) {
    case 'REQUEST': return this.intakeService.updateStatus(entityId, status, tenantId);
    case 'CONTRACT': return this.contractService.updateStatus(entityId, status, tenantId);
    case 'INVOICE': return this.invoiceService.updateStatus(entityId, status, tenantId);
    case 'PURCHASE_ORDER': return this.buyingService.updateStatus(entityId, status, tenantId);
  }
}
```

### 7.3 Backward Compatibility

If no workflow matches an entity event, nothing happens — the entity keeps its default status flow. This means the system works identically to today until workflows are activated.

---

## 8. Constraints & Non-Goals

- **No versioned publishing** — save & activate instantly. Business users accept the risk.
- **No cross-tenant workflows** — all workflows scoped to `tenantId`
- **No custom code steps** — node types are fixed; extensibility comes from Action node configs
- **No undo/redo on canvas** — React Flow provides this if needed later, but not in v1
- **No workflow analytics/metrics** — instance history provides raw data; dashboards are a future enhancement
