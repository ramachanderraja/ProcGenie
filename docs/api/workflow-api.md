# Workflow API

> Endpoints for workflow engine, approval management, SLA tracking, and escalation.

## List Workflows {#list-workflows}

Retrieve a paginated list of workflow instances.

```http
GET /api/v1/workflows?page=1&pageSize=20&filters[status]=active
Authorization: Bearer <token>
```

### Query Parameters

| Parameter | Type | Description |
|---|---|---|
| `page` | integer | Page number (default: 1) |
| `pageSize` | integer | Items per page (default: 20, max: 100) |
| `sort` | string | Sort field: `createdAt`, `updatedAt`, `slaStatus` |
| `filters[status]` | string | `active`, `completed`, `cancelled`, `failed` |
| `filters[templateId]` | string | Filter by workflow template |
| `filters[assigneeId]` | string | Filter by current assignee |
| `filters[slaStatus]` | string | `on_track`, `at_risk`, `breached` |

### Response (200 OK)

```json
{
  "success": true,
  "data": [
    {
      "id": "wf_01H5K3M7N8P9Q2R4",
      "templateId": "tmpl_standard_approval",
      "templateName": "Standard Approval Workflow",
      "sourceType": "requisition",
      "sourceId": "req_01H5K3M7N8P9Q2R4",
      "sourceTitle": "Video Editing Software License",
      "status": "active",
      "currentStep": {
        "id": "step_02",
        "name": "Finance Review",
        "assignee": {
          "id": "usr_finance_lead",
          "displayName": "Sarah Finance"
        },
        "status": "pending",
        "enteredAt": "2026-02-08T16:00:00.000Z",
        "sla": {
          "warningAt": "2026-02-10T16:00:00.000Z",
          "breachAt": "2026-02-11T16:00:00.000Z",
          "status": "on_track"
        }
      },
      "completedSteps": 1,
      "totalSteps": 3,
      "createdAt": "2026-02-08T14:35:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "totalItems": 42,
    "totalPages": 3,
    "hasNextPage": true,
    "hasPreviousPage": false
  },
  "timestamp": "2026-02-08T17:00:00.000Z",
  "requestId": "req_wf_list_01H5K3"
}
```

## Get Workflow {#get-workflow}

Get detailed information about a specific workflow instance, including all steps and the "pizza tracker" visualization data.

```http
GET /api/v1/workflows/:id
Authorization: Bearer <token>
```

### Response (200 OK)

```json
{
  "success": true,
  "data": {
    "id": "wf_01H5K3M7N8P9Q2R4",
    "templateId": "tmpl_standard_approval",
    "templateName": "Standard Approval Workflow",
    "sourceType": "requisition",
    "sourceId": "req_01H5K3M7N8P9Q2R4",
    "status": "active",
    "steps": [
      {
        "id": "step_01",
        "name": "Manager Approval",
        "type": "approval",
        "status": "completed",
        "assignee": {
          "id": "usr_john_manager",
          "displayName": "John Manager"
        },
        "decision": "approved",
        "comment": "Approved. Essential for Q2 campaign.",
        "enteredAt": "2026-02-08T14:35:00.000Z",
        "completedAt": "2026-02-08T15:45:00.000Z",
        "durationMinutes": 70
      },
      {
        "id": "step_02",
        "name": "Finance Review",
        "type": "approval",
        "status": "pending",
        "assignee": {
          "id": "usr_finance_lead",
          "displayName": "Sarah Finance"
        },
        "enteredAt": "2026-02-08T16:00:00.000Z",
        "sla": {
          "warningAt": "2026-02-10T16:00:00.000Z",
          "breachAt": "2026-02-11T16:00:00.000Z",
          "status": "on_track",
          "remainingHours": 47
        }
      },
      {
        "id": "step_03",
        "name": "PO Generation",
        "type": "system",
        "status": "waiting",
        "description": "Automatic PO creation upon all approvals"
      }
    ],
    "comments": [
      {
        "id": "cmt_01",
        "userId": "usr_john_manager",
        "userName": "John Manager",
        "text": "Approved. Essential for Q2 campaign.",
        "createdAt": "2026-02-08T15:45:00.000Z"
      }
    ],
    "timeline": [
      {
        "event": "workflow_created",
        "timestamp": "2026-02-08T14:35:00.000Z",
        "actor": "usr_jane_smith"
      },
      {
        "event": "step_approved",
        "timestamp": "2026-02-08T15:45:00.000Z",
        "actor": "usr_john_manager",
        "stepId": "step_01"
      }
    ],
    "createdAt": "2026-02-08T14:35:00.000Z",
    "estimatedCompletionDate": "2026-02-12T14:35:00.000Z"
  },
  "timestamp": "2026-02-08T17:00:00.000Z",
  "requestId": "req_wf_detail_01H5K3"
}
```

## Get Workflow Steps {#get-steps}

Get just the steps for a workflow (lighter payload for pizza tracker updates).

```http
GET /api/v1/workflows/:id/steps
Authorization: Bearer <token>
```

## Approve Step {#approve-step}

Approve a workflow step.

```http
POST /api/v1/workflows/:id/steps/:stepId/approve
Authorization: Bearer <token>
Content-Type: application/json
```

### Request Body

```json
{
  "comment": "Approved. Within Q1 budget allocation.",
  "conditions": []
}
```

### Response (200 OK)

```json
{
  "success": true,
  "data": {
    "workflowId": "wf_01H5K3M7N8P9Q2R4",
    "stepId": "step_02",
    "decision": "approved",
    "approvedBy": {
      "id": "usr_finance_lead",
      "displayName": "Sarah Finance"
    },
    "approvedAt": "2026-02-09T10:30:00.000Z",
    "nextStep": {
      "id": "step_03",
      "name": "PO Generation",
      "type": "system"
    }
  },
  "timestamp": "2026-02-09T10:30:00.000Z",
  "requestId": "req_approve_01H5K3"
}
```

### Error Response (422 - SoD Violation)

```json
{
  "success": false,
  "error": {
    "code": "SOD_VIOLATION",
    "message": "Segregation of duties violation: Requester cannot approve their own request.",
    "type": "POLICY_VIOLATION",
    "details": [
      {
        "field": "approver",
        "message": "User usr_jane_smith is the requester and cannot also be the approver",
        "code": "SOD_SELF_APPROVAL"
      }
    ],
    "requestId": "req_approve_01H5K3",
    "timestamp": "2026-02-09T10:30:00.000Z"
  }
}
```

## Reject Step {#reject-step}

Reject a workflow step. A rejection reason is required.

```http
POST /api/v1/workflows/:id/steps/:stepId/reject
Authorization: Bearer <token>
Content-Type: application/json
```

### Request Body

```json
{
  "reason": "Insufficient budget justification. Please provide projected ROI.",
  "returnToStep": "step_01"
}
```

### Response (200 OK)

```json
{
  "success": true,
  "data": {
    "workflowId": "wf_01H5K3M7N8P9Q2R4",
    "stepId": "step_02",
    "decision": "rejected",
    "rejectedBy": {
      "id": "usr_finance_lead",
      "displayName": "Sarah Finance"
    },
    "rejectedAt": "2026-02-09T10:30:00.000Z",
    "reason": "Insufficient budget justification. Please provide projected ROI.",
    "returnedToStep": "step_01",
    "workflowStatus": "returned"
  },
  "timestamp": "2026-02-09T10:30:00.000Z",
  "requestId": "req_reject_01H5K3"
}
```

## Pending Approvals {#pending-approvals}

List all pending approval tasks assigned to the current user.

```http
GET /api/v1/workflows/approvals/pending
Authorization: Bearer <token>
```

### Response (200 OK)

```json
{
  "success": true,
  "data": [
    {
      "workflowId": "wf_01H5K3M7N8P9Q2R4",
      "stepId": "step_02",
      "stepName": "Finance Review",
      "sourceType": "requisition",
      "sourceId": "req_01H5K3M7N8P9Q2R4",
      "sourceTitle": "Video Editing Software License",
      "requester": {
        "id": "usr_jane_smith",
        "displayName": "Jane Smith"
      },
      "amount": { "amount": 1799.40, "code": "USD" },
      "assignedAt": "2026-02-08T16:00:00.000Z",
      "sla": {
        "warningAt": "2026-02-10T16:00:00.000Z",
        "breachAt": "2026-02-11T16:00:00.000Z",
        "status": "on_track",
        "remainingHours": 47
      },
      "priority": "medium"
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "totalItems": 7,
    "totalPages": 1,
    "hasNextPage": false,
    "hasPreviousPage": false
  },
  "timestamp": "2026-02-08T17:00:00.000Z",
  "requestId": "req_pending_01H5K3"
}
```

## List Workflow Templates {#list-templates}

List available workflow templates.

```http
GET /api/v1/workflows/templates
Authorization: Bearer <token>
```

### Response (200 OK)

```json
{
  "success": true,
  "data": [
    {
      "id": "tmpl_standard_approval",
      "name": "Standard Approval Workflow",
      "description": "Sequential approval: Manager → Finance → PO Generation",
      "version": 3,
      "isActive": true,
      "triggerConditions": {
        "requestType": ["software", "hardware", "services"],
        "amountRange": { "min": 1000, "max": 50000 }
      },
      "steps": [
        { "name": "Manager Approval", "type": "approval", "slaHours": 72 },
        { "name": "Finance Review", "type": "approval", "slaHours": 72 },
        { "name": "PO Generation", "type": "system" }
      ],
      "createdAt": "2026-01-15T10:00:00.000Z",
      "updatedAt": "2026-02-01T14:00:00.000Z"
    },
    {
      "id": "tmpl_high_value",
      "name": "High-Value Approval Workflow",
      "description": "Parallel Legal + Security review, then VP + Finance Director approval",
      "version": 2,
      "isActive": true,
      "triggerConditions": {
        "amountRange": { "min": 50000, "max": null }
      },
      "steps": [
        {
          "name": "Parallel Review",
          "type": "parallel",
          "branches": [
            { "name": "Legal Review", "type": "approval", "slaHours": 120 },
            { "name": "Security Review", "type": "approval", "slaHours": 96 }
          ]
        },
        { "name": "VP Approval", "type": "approval", "slaHours": 120 },
        { "name": "Finance Director Approval", "type": "approval", "slaHours": 120 },
        { "name": "PO Generation", "type": "system" }
      ]
    }
  ],
  "timestamp": "2026-02-08T17:00:00.000Z",
  "requestId": "req_tmpl_list_01H5K3"
}
```

## Create Workflow Template {#create-template}

Create a new workflow template. Requires `ProcurementManager` or `TenantAdmin` role.

```http
POST /api/v1/workflows/templates
Authorization: Bearer <token>
Content-Type: application/json
```

### Request Body

```json
{
  "name": "Expedited Software Approval",
  "description": "Fast-track approval for pre-approved software vendors under $5K",
  "triggerConditions": {
    "requestType": ["software"],
    "amountRange": { "min": 0, "max": 5000 },
    "vendorSegment": ["preferred", "strategic"]
  },
  "steps": [
    {
      "name": "Manager Approval",
      "type": "approval",
      "assignmentRule": "requester_manager",
      "slaHours": 24,
      "escalationHours": 48,
      "escalateTo": "requester_manager_manager"
    },
    {
      "name": "PO Generation",
      "type": "system",
      "action": "create_po"
    }
  ]
}
```

### Response (201 Created)

Returns the created workflow template with an assigned ID and version 1.
