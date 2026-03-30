/**
 * Default workflow definitions with React Flow graph JSON.
 * These are seeded during database initialization.
 */

export function getDefaultWorkflows(tenantId: string) {
  return [
    // ═══════════════════════════════════════════════════════════════
    // 1. Intake Approval Workflow
    // ═══════════════════════════════════════════════════════════════
    {
      name: 'Intake Approval Workflow',
      description: 'Routes intake requests through conditional approval chains based on estimated total value',
      type: 'approval',
      status: 'active',
      entityTypes: ['REQUEST'],
      graph: {
        nodes: [
          {
            id: 'node-start-1',
            type: 'start',
            position: { x: 300, y: 0 },
            data: {
              entityType: 'REQUEST',
              event: 'submitted',
              conditions: [],
            },
          },
          {
            id: 'node-cond-1',
            type: 'condition',
            position: { x: 300, y: 120 },
            data: {
              field: 'entity.estimatedTotal',
              operator: 'gt',
              value: 5000,
            },
          },
          // High value path (> $5,000)
          {
            id: 'node-approval-1',
            type: 'approval',
            position: { x: 100, y: 260 },
            data: {
              approvers: ['role:manager'],
              approvalMode: 'sequential',
              slaHours: 24,
            },
          },
          {
            id: 'node-approval-2',
            type: 'approval',
            position: { x: 100, y: 400 },
            data: {
              approvers: ['role:vp_finance'],
              approvalMode: 'any',
              slaHours: 48,
            },
          },
          {
            id: 'node-action-1',
            type: 'action',
            position: { x: 100, y: 540 },
            data: {
              actionType: 'update_status',
              config: { status: 'approved' },
            },
          },
          {
            id: 'node-end-1',
            type: 'end',
            position: { x: 100, y: 660 },
            data: { finalStatus: 'approved' },
          },
          // Low value path (<= $5,000)
          {
            id: 'node-approval-3',
            type: 'approval',
            position: { x: 500, y: 260 },
            data: {
              approvers: ['role:manager'],
              approvalMode: 'any',
              slaHours: 24,
            },
          },
          {
            id: 'node-action-2',
            type: 'action',
            position: { x: 500, y: 400 },
            data: {
              actionType: 'update_status',
              config: { status: 'approved' },
            },
          },
          {
            id: 'node-end-2',
            type: 'end',
            position: { x: 500, y: 520 },
            data: { finalStatus: 'approved' },
          },
          // Rejection path
          {
            id: 'node-action-reject-1',
            type: 'action',
            position: { x: 300, y: 700 },
            data: {
              actionType: 'update_status',
              config: { status: 'rejected' },
            },
          },
          {
            id: 'node-end-reject-1',
            type: 'end',
            position: { x: 300, y: 820 },
            data: { finalStatus: 'rejected' },
          },
        ],
        edges: [
          { id: 'edge-1', source: 'node-start-1', target: 'node-cond-1' },
          { id: 'edge-2', source: 'node-cond-1', target: 'node-approval-1', sourceHandle: 'true', label: 'True' },
          { id: 'edge-3', source: 'node-cond-1', target: 'node-approval-3', sourceHandle: 'false', label: 'False' },
          { id: 'edge-4', source: 'node-approval-1', target: 'node-approval-2', sourceHandle: 'approved', label: 'Approved' },
          { id: 'edge-5', source: 'node-approval-2', target: 'node-action-1', sourceHandle: 'approved', label: 'Approved' },
          { id: 'edge-6', source: 'node-action-1', target: 'node-end-1' },
          { id: 'edge-7', source: 'node-approval-3', target: 'node-action-2', sourceHandle: 'approved', label: 'Approved' },
          { id: 'edge-8', source: 'node-action-2', target: 'node-end-2' },
          // Rejection edges
          { id: 'edge-9', source: 'node-approval-1', target: 'node-action-reject-1', sourceHandle: 'rejected', label: 'Rejected' },
          { id: 'edge-10', source: 'node-approval-2', target: 'node-action-reject-1', sourceHandle: 'rejected', label: 'Rejected' },
          { id: 'edge-11', source: 'node-approval-3', target: 'node-action-reject-1', sourceHandle: 'rejected', label: 'Rejected' },
          { id: 'edge-12', source: 'node-action-reject-1', target: 'node-end-reject-1' },
        ],
      },
    },

    // ═══════════════════════════════════════════════════════════════
    // 2. Contract Review Workflow
    // ═══════════════════════════════════════════════════════════════
    {
      name: 'Contract Review Workflow',
      description: 'AI-powered contract analysis followed by legal and finance approval chain',
      type: 'contract',
      status: 'active',
      entityTypes: ['CONTRACT'],
      graph: {
        nodes: [
          {
            id: 'node-start-2',
            type: 'start',
            position: { x: 300, y: 0 },
            data: {
              entityType: 'CONTRACT',
              event: 'submitted',
              conditions: [],
            },
          },
          {
            id: 'node-ai-1',
            type: 'ai_review',
            position: { x: 300, y: 120 },
            data: {
              promptTemplate: 'Analyze this contract for risk clauses, compliance issues, and key terms. Assess overall risk level.',
              confidenceThreshold: 70,
            },
          },
          // AI Pass path
          {
            id: 'node-approval-4',
            type: 'approval',
            position: { x: 100, y: 280 },
            data: {
              approvers: ['role:legal_reviewer'],
              approvalMode: 'any',
              slaHours: 72,
            },
          },
          // AI Fail path — notification then same approval
          {
            id: 'node-action-notify',
            type: 'action',
            position: { x: 500, y: 280 },
            data: {
              actionType: 'send_notification',
              config: { recipient: 'legal_team', message: 'Contract flagged for manual review by AI' },
            },
          },
          {
            id: 'node-approval-5',
            type: 'approval',
            position: { x: 500, y: 420 },
            data: {
              approvers: ['role:legal_reviewer'],
              approvalMode: 'any',
              slaHours: 72,
            },
          },
          // Shared finance approval
          {
            id: 'node-approval-6',
            type: 'approval',
            position: { x: 300, y: 540 },
            data: {
              approvers: ['role:finance_approver'],
              approvalMode: 'any',
              slaHours: 48,
            },
          },
          {
            id: 'node-action-3',
            type: 'action',
            position: { x: 300, y: 680 },
            data: {
              actionType: 'update_status',
              config: { status: 'executed' },
            },
          },
          {
            id: 'node-end-3',
            type: 'end',
            position: { x: 300, y: 800 },
            data: { finalStatus: 'executed' },
          },
          // Rejection
          {
            id: 'node-action-reject-2',
            type: 'action',
            position: { x: 600, y: 680 },
            data: {
              actionType: 'update_status',
              config: { status: 'rejected' },
            },
          },
          {
            id: 'node-end-reject-2',
            type: 'end',
            position: { x: 600, y: 800 },
            data: { finalStatus: 'rejected' },
          },
        ],
        edges: [
          { id: 'edge-20', source: 'node-start-2', target: 'node-ai-1' },
          { id: 'edge-21', source: 'node-ai-1', target: 'node-approval-4', sourceHandle: 'above_threshold', label: 'Pass' },
          { id: 'edge-22', source: 'node-ai-1', target: 'node-action-notify', sourceHandle: 'below_threshold', label: 'Fail' },
          { id: 'edge-23', source: 'node-action-notify', target: 'node-approval-5' },
          { id: 'edge-24', source: 'node-approval-4', target: 'node-approval-6', sourceHandle: 'approved', label: 'Approved' },
          { id: 'edge-25', source: 'node-approval-5', target: 'node-approval-6', sourceHandle: 'approved', label: 'Approved' },
          { id: 'edge-26', source: 'node-approval-6', target: 'node-action-3', sourceHandle: 'approved', label: 'Approved' },
          { id: 'edge-27', source: 'node-action-3', target: 'node-end-3' },
          // Rejection edges
          { id: 'edge-28', source: 'node-approval-4', target: 'node-action-reject-2', sourceHandle: 'rejected', label: 'Rejected' },
          { id: 'edge-29', source: 'node-approval-5', target: 'node-action-reject-2', sourceHandle: 'rejected', label: 'Rejected' },
          { id: 'edge-30', source: 'node-approval-6', target: 'node-action-reject-2', sourceHandle: 'rejected', label: 'Rejected' },
          { id: 'edge-31', source: 'node-action-reject-2', target: 'node-end-reject-2' },
        ],
      },
    },

    // ═══════════════════════════════════════════════════════════════
    // 3. Invoice Processing Workflow
    // ═══════════════════════════════════════════════════════════════
    {
      name: 'Invoice Processing Workflow',
      description: 'Automated three-way matching with exception handling for invoice processing',
      type: 'invoice',
      status: 'active',
      entityTypes: ['INVOICE'],
      graph: {
        nodes: [
          {
            id: 'node-start-3',
            type: 'start',
            position: { x: 300, y: 0 },
            data: {
              entityType: 'INVOICE',
              event: 'created',
              conditions: [],
            },
          },
          {
            id: 'node-action-match',
            type: 'action',
            position: { x: 300, y: 120 },
            data: {
              actionType: 'three_way_match',
              config: {},
            },
          },
          {
            id: 'node-cond-2',
            type: 'condition',
            position: { x: 300, y: 260 },
            data: {
              field: 'steps.node-action-match.result.matchResult',
              operator: 'eq',
              value: 'passed',
            },
          },
          // Match passed path
          {
            id: 'node-action-auto-approve',
            type: 'action',
            position: { x: 100, y: 400 },
            data: {
              actionType: 'update_status',
              config: { status: 'approved' },
            },
          },
          {
            id: 'node-action-schedule',
            type: 'action',
            position: { x: 100, y: 540 },
            data: {
              actionType: 'schedule_payment',
              config: {},
            },
          },
          {
            id: 'node-end-4',
            type: 'end',
            position: { x: 100, y: 660 },
            data: { finalStatus: 'scheduled_for_payment' },
          },
          // Match failed path — manual review
          {
            id: 'node-approval-7',
            type: 'approval',
            position: { x: 500, y: 400 },
            data: {
              approvers: ['role:ap_clerk'],
              approvalMode: 'any',
              slaHours: 24,
            },
          },
          {
            id: 'node-action-inv-approve',
            type: 'action',
            position: { x: 400, y: 560 },
            data: {
              actionType: 'update_status',
              config: { status: 'approved' },
            },
          },
          {
            id: 'node-end-5',
            type: 'end',
            position: { x: 400, y: 680 },
            data: { finalStatus: 'approved' },
          },
          // Rejection path
          {
            id: 'node-action-inv-reject',
            type: 'action',
            position: { x: 600, y: 560 },
            data: {
              actionType: 'update_status',
              config: { status: 'rejected' },
            },
          },
          {
            id: 'node-end-reject-3',
            type: 'end',
            position: { x: 600, y: 680 },
            data: { finalStatus: 'rejected' },
          },
        ],
        edges: [
          { id: 'edge-40', source: 'node-start-3', target: 'node-action-match' },
          { id: 'edge-41', source: 'node-action-match', target: 'node-cond-2' },
          { id: 'edge-42', source: 'node-cond-2', target: 'node-action-auto-approve', sourceHandle: 'true', label: 'True' },
          { id: 'edge-43', source: 'node-cond-2', target: 'node-approval-7', sourceHandle: 'false', label: 'False' },
          { id: 'edge-44', source: 'node-action-auto-approve', target: 'node-action-schedule' },
          { id: 'edge-45', source: 'node-action-schedule', target: 'node-end-4' },
          { id: 'edge-46', source: 'node-approval-7', target: 'node-action-inv-approve', sourceHandle: 'approved', label: 'Approved' },
          { id: 'edge-47', source: 'node-action-inv-approve', target: 'node-end-5' },
          { id: 'edge-48', source: 'node-approval-7', target: 'node-action-inv-reject', sourceHandle: 'rejected', label: 'Rejected' },
          { id: 'edge-49', source: 'node-action-inv-reject', target: 'node-end-reject-3' },
        ],
      },
    },

    // ═══════════════════════════════════════════════════════════════
    // 4. PO Approval Workflow
    // ═══════════════════════════════════════════════════════════════
    {
      name: 'PO Approval Workflow',
      description: 'Conditional PO approval routing based on total amount threshold',
      type: 'approval',
      status: 'active',
      entityTypes: ['PURCHASE_ORDER'],
      graph: {
        nodes: [
          {
            id: 'node-start-4',
            type: 'start',
            position: { x: 300, y: 0 },
            data: {
              entityType: 'PURCHASE_ORDER',
              event: 'submitted',
              conditions: [],
            },
          },
          {
            id: 'node-cond-3',
            type: 'condition',
            position: { x: 300, y: 120 },
            data: {
              field: 'entity.totalAmount',
              operator: 'gt',
              value: 10000,
            },
          },
          // High value path (> $10,000)
          {
            id: 'node-approval-8',
            type: 'approval',
            position: { x: 100, y: 280 },
            data: {
              approvers: ['role:director'],
              approvalMode: 'any',
              slaHours: 48,
            },
          },
          {
            id: 'node-action-4',
            type: 'action',
            position: { x: 100, y: 420 },
            data: {
              actionType: 'update_status',
              config: { status: 'approved' },
            },
          },
          {
            id: 'node-end-6',
            type: 'end',
            position: { x: 100, y: 540 },
            data: { finalStatus: 'approved' },
          },
          // Low value path — auto-approve
          {
            id: 'node-action-auto-5',
            type: 'action',
            position: { x: 500, y: 280 },
            data: {
              actionType: 'auto_approve',
              config: { status: 'approved' },
            },
          },
          {
            id: 'node-end-7',
            type: 'end',
            position: { x: 500, y: 400 },
            data: { finalStatus: 'approved' },
          },
          // Rejection
          {
            id: 'node-action-reject-3',
            type: 'action',
            position: { x: 300, y: 500 },
            data: {
              actionType: 'update_status',
              config: { status: 'rejected' },
            },
          },
          {
            id: 'node-end-reject-4',
            type: 'end',
            position: { x: 300, y: 620 },
            data: { finalStatus: 'rejected' },
          },
        ],
        edges: [
          { id: 'edge-60', source: 'node-start-4', target: 'node-cond-3' },
          { id: 'edge-61', source: 'node-cond-3', target: 'node-approval-8', sourceHandle: 'true', label: 'True' },
          { id: 'edge-62', source: 'node-cond-3', target: 'node-action-auto-5', sourceHandle: 'false', label: 'False' },
          { id: 'edge-63', source: 'node-approval-8', target: 'node-action-4', sourceHandle: 'approved', label: 'Approved' },
          { id: 'edge-64', source: 'node-action-4', target: 'node-end-6' },
          { id: 'edge-65', source: 'node-action-auto-5', target: 'node-end-7' },
          { id: 'edge-66', source: 'node-approval-8', target: 'node-action-reject-3', sourceHandle: 'rejected', label: 'Rejected' },
          { id: 'edge-67', source: 'node-action-reject-3', target: 'node-end-reject-4' },
        ],
      },
    },
  ];
}
