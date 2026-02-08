// =============================================================================
// ProcGenie - Comprehensive Mock Data for S2P Orchestration Platform
// =============================================================================

// -----------------------------------------------------------------------------
// Type Definitions
// -----------------------------------------------------------------------------

export interface ProcurementRequest {
  id: string; title: string; requester: string; department: string; category: string;
  amount: number; currency: string; vendorName: string; description: string;
  businessJustification: string; status: string; priority: string; createdAt: string;
  approvalSteps: ApprovalStep[]; aiAnalysis?: AIAnalysis; comments: Comment[];
  purchaseOrderNumber?: string;
}

export interface ApprovalStep {
  id: string; name: string; role: string; status: 'pending' | 'approved' | 'rejected' | 'current' | 'skipped';
  approverName?: string; timestamp?: string;
}

export interface AIAnalysis {
  riskScore: number; riskFactors: string[]; summary: string;
  recommendedCategory: string; policyCheck: boolean; complianceNotes: string;
  suggestedChannel: string; confidence: number;
}

export interface Comment {
  id: string; author: string; text: string; timestamp: string; role?: string;
}

export interface Vendor {
  id: string; name: string; category: string; trustScore: number; isPreferred: boolean;
  contactName: string; contactEmail: string; website: string; description: string;
  spendLast12M: number; performanceRating: number; onboardingStatus: string;
  complianceStatus: { taxValid: string; bankValid: string; sanctionsCheck: string };
  riskScan: { lastScanned: string; sentiment: string; findings: string[] };
  documents: { id: string; type: string; name: string; status: string; expiryDate?: string }[];
  esgScore?: { environmental: number; social: number; governance: number; overall: number };
  diversityClassification?: string;
}

export interface Contract {
  id: string; title: string; vendorName: string; type: string; value: number;
  startDate: string; endDate: string; status: string; paymentTerms: string;
  autoRenewal: boolean; owner: string;
  aiAnalysis?: { summary: string; keyTerms: { term: string; value: string; riskLevel: string }[];
    indemnificationClause?: string; confidentialityClause?: string; governingLaw?: string; terminationClause?: string };
}

export interface PurchaseOrder {
  poNumber: string; requestId: string; vendorName: string; amount: number;
  currency: string; status: string; createdAt: string; description: string;
}

export interface Invoice {
  id: string; invoiceNumber: string; vendorName: string; amount: number;
  date: string; status: string; matchStatus: string; poNumber?: string;
}

export interface SourcingProject {
  id: string; title: string; status: string; owner: string; budget: number;
  dueDate: string; vendors: string[]; type: string;
}

export interface AIAgent {
  id: string; name: string; type: string; domain: string; autonomyLevel: string;
  status: string; tasksCompleted: number; accuracy: number; savingsGenerated: number;
  humanEscalationRate: number; lastActive: string; hitlThreshold: string;
}

export interface Integration {
  id: string; name: string; type: string; status: string; lastSync?: string;
  syncHealth: number; recordsSynced: number;
}

export interface Notification {
  id: string; title: string; message: string; type: string; timestamp: string; read: boolean;
}

export interface CatalogItem {
  id: string; name: string; description: string; price: number; vendorName: string;
  category: string; deliveryTime: string;
}

export interface ActivityEntry {
  id: string; action: string; user: string; target: string; timestamp: string; type: string;
}

export interface MonthlyAnalytics {
  month: string; spend: number; savings: number; poCount: number; avgCycleTime: number;
}

// -----------------------------------------------------------------------------
// Helper: Approval Step Templates
// -----------------------------------------------------------------------------

const approvalManagerOnly = (status1: ApprovalStep['status'], name1?: string, ts1?: string): ApprovalStep[] => [
  { id: 'as-1', name: 'Manager Approval', role: 'Department Manager', status: status1, approverName: name1, timestamp: ts1 },
  { id: 'as-2', name: 'Finance Review', role: 'Finance Analyst', status: 'pending' },
];

const approvalFull = (
  s1: ApprovalStep['status'], n1?: string, t1?: string,
  s2: ApprovalStep['status'] = 'pending', n2?: string, t2?: string,
  s3: ApprovalStep['status'] = 'pending', n3?: string, t3?: string,
  s4: ApprovalStep['status'] = 'pending', n4?: string, t4?: string,
): ApprovalStep[] => [
  { id: 'as-1', name: 'Manager Approval', role: 'Department Manager', status: s1, approverName: n1, timestamp: t1 },
  { id: 'as-2', name: 'Finance Review', role: 'Finance Analyst', status: s2, approverName: n2, timestamp: t2 },
  { id: 'as-3', name: 'Procurement Review', role: 'Procurement Lead', status: s3, approverName: n3, timestamp: t3 },
  { id: 'as-4', name: 'VP Approval', role: 'Vice President', status: s4, approverName: n4, timestamp: t4 },
];

// -----------------------------------------------------------------------------
// Procurement Requests (25)
// -----------------------------------------------------------------------------

export const mockRequests: ProcurementRequest[] = [
  // ---- DRAFT (5) ----
  {
    id: 'REQ-001', title: 'Salesforce Enterprise Renewal FY26', requester: 'Jessica Chen', department: 'Sales',
    category: 'Software', amount: 245000, currency: 'USD', vendorName: 'Salesforce.com',
    description: 'Annual enterprise license renewal for 350 seats including Sales Cloud, Service Cloud, and Marketing Cloud.',
    businessJustification: 'Core CRM platform used by entire sales organization. Lapse in license would halt pipeline management and revenue operations.',
    status: 'Draft', priority: 'High', createdAt: '2026-01-15T09:30:00Z',
    approvalSteps: approvalManagerOnly('pending'),
    aiAnalysis: {
      riskScore: 22, riskFactors: ['Single-vendor dependency', 'Price increase expected'],
      summary: 'Renewal of existing Salesforce contract. Historical spend is consistent. Recommend negotiating multi-year discount.',
      recommendedCategory: 'Software - SaaS', policyCheck: true,
      complianceNotes: 'Within department budget allocation. SOC2 Type II compliant vendor.',
      suggestedChannel: 'Strategic Sourcing', confidence: 0.95,
    },
    comments: [
      { id: 'c-001', author: 'Jessica Chen', text: 'Need to finalize seat count with HR before submitting.', timestamp: '2026-01-15T09:35:00Z', role: 'Requester' },
    ],
  },
  {
    id: 'REQ-002', title: 'New Employee Laptops - Engineering', requester: 'Marcus Johnson', department: 'Engineering',
    category: 'Hardware', amount: 78000, currency: 'USD', vendorName: 'Apple Inc',
    description: 'MacBook Pro M4 Max laptops (30 units) for new engineering hires in Q2 2026.',
    businessJustification: 'Engineering headcount growing by 30 in Q2. Standard spec is MacBook Pro for development workflows.',
    status: 'Draft', priority: 'Medium', createdAt: '2026-01-18T14:00:00Z',
    approvalSteps: approvalManagerOnly('pending'),
    comments: [],
  },
  {
    id: 'REQ-003', title: 'Office Furniture - Floor 12 Buildout', requester: 'Samantha Wright', department: 'Facilities',
    category: 'Facilities', amount: 42500, currency: 'USD', vendorName: 'Steelcase',
    description: 'Ergonomic desks and chairs for new floor 12 expansion accommodating 45 workstations.',
    businessJustification: 'Floor 12 buildout approved by COO. Furniture required before move-in date of April 1.',
    status: 'Draft', priority: 'Medium', createdAt: '2026-01-20T10:15:00Z',
    approvalSteps: approvalManagerOnly('pending'),
    comments: [
      { id: 'c-002', author: 'Samantha Wright', text: 'Waiting on final floor plan from architect.', timestamp: '2026-01-20T10:20:00Z', role: 'Requester' },
    ],
  },
  {
    id: 'REQ-004', title: 'Q2 Trade Show Booth Materials', requester: 'David Park', department: 'Marketing',
    category: 'Marketing', amount: 15800, currency: 'USD', vendorName: 'DisplayCraft Inc',
    description: 'Updated trade show booth panels, banners, and promotional materials for SaaStr Annual 2026.',
    businessJustification: 'SaaStr Annual is our top lead-gen event. Current booth materials are outdated with old branding.',
    status: 'Draft', priority: 'Low', createdAt: '2026-01-22T08:45:00Z',
    approvalSteps: approvalManagerOnly('pending'),
    comments: [],
  },
  {
    id: 'REQ-005', title: 'Legal Research Database Subscription', requester: 'Priya Sharma', department: 'Legal',
    category: 'Software', amount: 18500, currency: 'USD', vendorName: 'LexisNexis',
    description: 'Annual subscription to LexisNexis legal research database for the legal team (8 seats).',
    businessJustification: 'Essential tool for contract review, regulatory compliance research, and litigation support.',
    status: 'Draft', priority: 'Medium', createdAt: '2026-01-25T11:00:00Z',
    approvalSteps: approvalManagerOnly('pending'),
    comments: [],
  },

  // ---- PENDING APPROVAL (7) ----
  {
    id: 'REQ-006', title: 'AWS Reserved Instances Q2', requester: 'Alex Rivera', department: 'Engineering',
    category: 'Software', amount: 380000, currency: 'USD', vendorName: 'Amazon Web Services',
    description: '1-year reserved instances for production workloads: 40x m6i.xlarge, 10x r6i.2xlarge, 5x c6i.4xlarge.',
    businessJustification: 'Converting on-demand to reserved instances saves 38% ($232K annual savings). Current on-demand spend is unsustainable.',
    status: 'Pending Approval', priority: 'Critical', createdAt: '2026-01-10T08:00:00Z',
    approvalSteps: approvalFull('approved', 'Lisa Wong', '2026-01-11T09:00:00Z', 'approved', 'Robert Kim', '2026-01-12T14:30:00Z', 'current'),
    aiAnalysis: {
      riskScore: 15, riskFactors: ['Long-term commitment', 'Usage forecast uncertainty'],
      summary: 'Reserved instance purchase aligns with historical usage patterns. 38% savings vs on-demand. Low risk given stable workload.',
      recommendedCategory: 'Cloud Infrastructure', policyCheck: true,
      complianceNotes: 'AWS BAA in place. FedRAMP authorized. Within FinOps approved commitment levels.',
      suggestedChannel: 'Direct Purchase', confidence: 0.97,
    },
    comments: [
      { id: 'c-003', author: 'Alex Rivera', text: 'Usage analysis attached. Based on 6 months of CloudWatch metrics.', timestamp: '2026-01-10T08:15:00Z', role: 'Requester' },
      { id: 'c-004', author: 'Lisa Wong', text: 'Approved. Savings projection looks solid.', timestamp: '2026-01-11T09:00:00Z', role: 'Manager' },
      { id: 'c-005', author: 'Robert Kim', text: 'Finance approved. Well within cloud budget envelope.', timestamp: '2026-01-12T14:30:00Z', role: 'Finance' },
    ],
  },
  {
    id: 'REQ-007', title: 'Marketing Agency - Brand Refresh', requester: 'Olivia Martinez', department: 'Marketing',
    category: 'Services', amount: 175000, currency: 'USD', vendorName: 'Pentagram Design',
    description: 'Comprehensive brand refresh including new visual identity, brand guidelines, website redesign, and collateral templates.',
    businessJustification: 'Current branding is 5 years old. Market perception study shows brand awareness declining. Board approved brand refresh in strategic plan.',
    status: 'Pending Approval', priority: 'High', createdAt: '2026-01-08T10:30:00Z',
    approvalSteps: approvalFull('approved', 'Tom Bradley', '2026-01-09T11:00:00Z', 'current'),
    aiAnalysis: {
      riskScore: 45, riskFactors: ['Large services engagement', 'Subjective deliverables', 'Timeline risk'],
      summary: 'Significant creative services engagement. Recommend milestone-based payments. Verify portfolio and references.',
      recommendedCategory: 'Professional Services - Creative', policyCheck: true,
      complianceNotes: 'Requires competitive bid per policy (>$100K services). RFP waiver needed if sole-source.',
      suggestedChannel: 'Competitive RFP', confidence: 0.82,
    },
    comments: [
      { id: 'c-006', author: 'Olivia Martinez', text: 'Pentagram was selected after reviewing 5 agencies. Evaluation matrix attached.', timestamp: '2026-01-08T10:45:00Z', role: 'Requester' },
    ],
  },
  {
    id: 'REQ-008', title: 'Adobe Creative Cloud Team License', requester: 'Nina Patel', department: 'Marketing',
    category: 'Software', amount: 32400, currency: 'USD', vendorName: 'Adobe Systems',
    description: 'Adobe Creative Cloud for Teams - 45 licenses including Photoshop, Illustrator, InDesign, Premiere Pro, and After Effects.',
    businessJustification: 'Design and content teams require Adobe CC for daily creative production. Current licenses expire March 31.',
    status: 'Pending Approval', priority: 'High', createdAt: '2026-01-12T13:00:00Z',
    approvalSteps: approvalFull('approved', 'Tom Bradley', '2026-01-13T09:00:00Z', 'approved', 'Robert Kim', '2026-01-14T10:00:00Z', 'current'),
    comments: [
      { id: 'c-007', author: 'Nina Patel', text: 'Negotiated 15% volume discount from list price.', timestamp: '2026-01-12T13:10:00Z', role: 'Requester' },
    ],
  },
  {
    id: 'REQ-009', title: 'Consulting - SAP S/4HANA Migration Assessment', requester: 'Frank Liu', department: 'IT',
    category: 'Consulting', amount: 450000, currency: 'USD', vendorName: 'Deloitte',
    description: 'Phase 1 assessment and roadmap for SAP S/4HANA migration. Includes current state analysis, gap analysis, and implementation plan.',
    businessJustification: 'SAP ECC support ends 2027. Board mandated migration to S/4HANA. Assessment required before implementation budget approval.',
    status: 'Pending Approval', priority: 'Critical', createdAt: '2026-01-05T07:30:00Z',
    approvalSteps: approvalFull('approved', 'Karen White', '2026-01-06T10:00:00Z', 'approved', 'Robert Kim', '2026-01-07T14:00:00Z', 'approved', 'Diana Ross', '2026-01-08T16:00:00Z', 'current'),
    aiAnalysis: {
      riskScore: 58, riskFactors: ['High-value engagement', 'Scope creep risk', 'Vendor lock-in potential', 'Change management complexity'],
      summary: 'Large consulting engagement for critical ERP migration. Recommend fixed-price phase 1 with clear deliverables and go/no-go gates.',
      recommendedCategory: 'Professional Services - IT Consulting', policyCheck: true,
      complianceNotes: 'Exceeds $250K threshold - requires CFO and CIO co-approval. Competitive bid conducted (3 firms evaluated).',
      suggestedChannel: 'Strategic Sourcing', confidence: 0.91,
    },
    comments: [
      { id: 'c-008', author: 'Frank Liu', text: 'Deloitte scored highest in evaluation. Accenture and EY also bid.', timestamp: '2026-01-05T07:45:00Z', role: 'Requester' },
      { id: 'c-009', author: 'Karen White', text: 'CIO approved. This is a board priority.', timestamp: '2026-01-06T10:00:00Z', role: 'Manager' },
    ],
  },
  {
    id: 'REQ-010', title: 'Slack Business+ Annual Renewal', requester: 'Maya Thompson', department: 'IT',
    category: 'Software', amount: 54000, currency: 'USD', vendorName: 'Slack Technologies',
    description: 'Slack Business+ plan renewal for 600 users. Includes advanced identity management, data loss prevention, and compliance features.',
    businessJustification: 'Primary internal communication platform. Business+ tier required for SSO, DLP, and compliance export features.',
    status: 'Pending Approval', priority: 'High', createdAt: '2026-01-14T15:00:00Z',
    approvalSteps: approvalFull('approved', 'Karen White', '2026-01-15T09:30:00Z', 'current'),
    comments: [],
  },
  {
    id: 'REQ-011', title: 'Annual Penetration Testing Services', requester: 'James Wilson', department: 'IT',
    category: 'Services', amount: 28000, currency: 'USD', vendorName: 'CrowdStrike',
    description: 'Annual penetration testing for web applications, API endpoints, and cloud infrastructure. Includes report and remediation guidance.',
    businessJustification: 'SOC2 and ISO 27001 compliance require annual pen testing. Current engagement expires February 28.',
    status: 'Pending Approval', priority: 'High', createdAt: '2026-01-16T11:00:00Z',
    approvalSteps: approvalFull('approved', 'Karen White', '2026-01-17T08:00:00Z', 'approved', 'Robert Kim', '2026-01-17T14:00:00Z', 'current'),
    comments: [
      { id: 'c-010', author: 'James Wilson', text: 'CrowdStrike performed last year as well. Clean track record.', timestamp: '2026-01-16T11:15:00Z', role: 'Requester' },
    ],
  },
  {
    id: 'REQ-012', title: 'Zoom Enterprise License Upgrade', requester: 'Maya Thompson', department: 'IT',
    category: 'Software', amount: 24000, currency: 'USD', vendorName: 'Zoom Video',
    description: 'Upgrade from Zoom Business to Enterprise plan for 400 users. Adds unlimited cloud storage, managed domains, and company branding.',
    businessJustification: 'Growing workforce and compliance needs require enterprise-grade video conferencing with advanced admin controls.',
    status: 'Pending Approval', priority: 'Medium', createdAt: '2026-01-19T09:00:00Z',
    approvalSteps: approvalFull('approved', 'Karen White', '2026-01-20T10:00:00Z', 'current'),
    comments: [],
  },

  // ---- APPROVED (5) ----
  {
    id: 'REQ-013', title: 'Google Workspace Enterprise Renewal', requester: 'Maya Thompson', department: 'IT',
    category: 'Software', amount: 162000, currency: 'USD', vendorName: 'Google Cloud',
    description: 'Google Workspace Enterprise Standard renewal for 600 users. Includes Gmail, Drive, Meet, and Vault.',
    businessJustification: 'Core productivity suite for entire organization. Enterprise tier required for eDiscovery, Vault, and advanced endpoint management.',
    status: 'Approved', priority: 'Critical', createdAt: '2025-12-15T08:00:00Z',
    approvalSteps: approvalFull('approved', 'Karen White', '2025-12-16T09:00:00Z', 'approved', 'Robert Kim', '2025-12-17T10:00:00Z', 'approved', 'Diana Ross', '2025-12-18T11:00:00Z', 'approved', 'Michael Stone', '2025-12-19T14:00:00Z'),
    purchaseOrderNumber: 'PO-2026-001',
    comments: [
      { id: 'c-011', author: 'Karen White', text: 'Critical renewal - cannot lapse.', timestamp: '2025-12-16T09:05:00Z', role: 'Manager' },
    ],
  },
  {
    id: 'REQ-014', title: 'Atlassian Cloud Premium - Jira & Confluence', requester: 'Alex Rivera', department: 'Engineering',
    category: 'Software', amount: 86400, currency: 'USD', vendorName: 'Atlassian',
    description: 'Atlassian Cloud Premium for 300 users. Jira Software, Confluence, and Jira Service Management.',
    businessJustification: 'Engineering and product teams rely on Jira for sprint planning and Confluence for documentation. Premium tier for advanced roadmaps.',
    status: 'Approved', priority: 'High', createdAt: '2025-12-20T10:00:00Z',
    approvalSteps: approvalFull('approved', 'Lisa Wong', '2025-12-21T09:00:00Z', 'approved', 'Robert Kim', '2025-12-22T14:00:00Z', 'approved', 'Diana Ross', '2025-12-23T10:00:00Z', 'skipped'),
    purchaseOrderNumber: 'PO-2026-002',
    comments: [],
  },
  {
    id: 'REQ-015', title: 'ServiceNow ITSM Pro License', requester: 'Frank Liu', department: 'IT',
    category: 'Software', amount: 198000, currency: 'USD', vendorName: 'ServiceNow',
    description: 'ServiceNow IT Service Management Pro for 150 IT agents. Includes Incident, Problem, Change, and CMDB modules.',
    businessJustification: 'Replacing legacy ticketing system. ServiceNow selected after 6-month evaluation. Implementation partner engaged.',
    status: 'Approved', priority: 'High', createdAt: '2025-12-10T07:00:00Z',
    approvalSteps: approvalFull('approved', 'Karen White', '2025-12-11T09:00:00Z', 'approved', 'Robert Kim', '2025-12-12T13:00:00Z', 'approved', 'Diana Ross', '2025-12-13T10:00:00Z', 'approved', 'Michael Stone', '2025-12-14T16:00:00Z'),
    purchaseOrderNumber: 'PO-2026-003',
    comments: [
      { id: 'c-012', author: 'Frank Liu', text: 'Implementation kickoff scheduled for Feb 1.', timestamp: '2025-12-15T08:00:00Z', role: 'Requester' },
    ],
  },
  {
    id: 'REQ-016', title: 'Dell PowerEdge Servers - Data Center Refresh', requester: 'James Wilson', department: 'IT',
    category: 'Hardware', amount: 156000, currency: 'USD', vendorName: 'Dell Technologies',
    description: '8x Dell PowerEdge R760 servers for on-prem data center refresh. Includes 5-year ProSupport Plus warranty.',
    businessJustification: 'Current servers are 6 years old and out of warranty. Refresh required to maintain uptime SLA and compliance posture.',
    status: 'Approved', priority: 'High', createdAt: '2025-12-18T09:30:00Z',
    approvalSteps: approvalFull('approved', 'Karen White', '2025-12-19T10:00:00Z', 'approved', 'Robert Kim', '2025-12-20T11:00:00Z', 'approved', 'Diana Ross', '2025-12-21T14:00:00Z', 'skipped'),
    purchaseOrderNumber: 'PO-2026-004',
    comments: [],
  },
  {
    id: 'REQ-017', title: 'Workday HCM Annual Subscription', requester: 'Rachel Green', department: 'HR',
    category: 'Software', amount: 210000, currency: 'USD', vendorName: 'Workday Inc',
    description: 'Workday Human Capital Management suite renewal for 2,500 employees. Includes Core HR, Payroll, Benefits, and Talent Management.',
    businessJustification: 'Enterprise HRIS platform. Renewal is mandatory - powers payroll, benefits enrollment, and performance reviews.',
    status: 'Approved', priority: 'Critical', createdAt: '2025-12-05T08:00:00Z',
    approvalSteps: approvalFull('approved', 'Linda Torres', '2025-12-06T09:00:00Z', 'approved', 'Robert Kim', '2025-12-07T10:00:00Z', 'approved', 'Diana Ross', '2025-12-08T14:00:00Z', 'approved', 'Michael Stone', '2025-12-09T11:00:00Z'),
    purchaseOrderNumber: 'PO-2026-005',
    comments: [],
  },

  // ---- REJECTED (3) ----
  {
    id: 'REQ-018', title: 'Executive Team Building Retreat - Maldives', requester: 'Brad Cooper', department: 'Sales',
    category: 'Travel', amount: 125000, currency: 'USD', vendorName: 'Corporate Travel Solutions',
    description: '5-day executive team building retreat for 15 senior leaders at Soneva Fushi resort, Maldives.',
    businessJustification: 'Annual executive offsite to align on strategy and build cross-functional relationships.',
    status: 'Rejected', priority: 'Low', createdAt: '2026-01-03T10:00:00Z',
    approvalSteps: approvalFull('approved', 'Tom Bradley', '2026-01-04T09:00:00Z', 'rejected', 'Robert Kim', '2026-01-05T14:00:00Z'),
    aiAnalysis: {
      riskScore: 78, riskFactors: ['Excessive per-person cost', 'Luxury destination', 'Optics risk', 'Policy violation - travel cap'],
      summary: 'Request significantly exceeds travel policy limits ($5K/person cap). Destination raises optics concerns. Recommend domestic alternative.',
      recommendedCategory: 'Travel - Corporate Events', policyCheck: false,
      complianceNotes: 'VIOLATES travel policy Section 4.2: Per-person cap of $5,000 for team events. This request is $8,333/person.',
      suggestedChannel: 'Manual Review Required', confidence: 0.94,
    },
    comments: [
      { id: 'c-013', author: 'Robert Kim', text: 'Rejected: Exceeds travel policy limits by 67%. Please resubmit with domestic venue under $5K/person.', timestamp: '2026-01-05T14:00:00Z', role: 'Finance' },
    ],
  },
  {
    id: 'REQ-019', title: 'Unauthorized CRM Tool - Monday.com', requester: 'Kevin Brown', department: 'Operations',
    category: 'Software', amount: 8400, currency: 'USD', vendorName: 'Monday.com',
    description: 'Monday.com Pro plan for 20 users in operations team for project tracking and CRM.',
    businessJustification: 'Operations team needs better project tracking. Monday.com offers flexibility not available in current tools.',
    status: 'Rejected', priority: 'Low', createdAt: '2026-01-07T13:00:00Z',
    approvalSteps: approvalFull('approved', 'Steve Adams', '2026-01-08T09:00:00Z', 'approved', 'Robert Kim', '2026-01-08T14:00:00Z', 'rejected', 'Diana Ross', '2026-01-09T11:00:00Z'),
    aiAnalysis: {
      riskScore: 62, riskFactors: ['Duplicate tool - Jira/Asana overlap', 'Shadow IT risk', 'Data fragmentation'],
      summary: 'Duplicate functionality with existing Jira and Asana licenses. Creates shadow IT risk and data silos.',
      recommendedCategory: 'Software - SaaS', policyCheck: false,
      complianceNotes: 'Conflicts with IT consolidation policy. Existing tools (Jira, Asana) provide equivalent functionality.',
      suggestedChannel: 'IT Review Required', confidence: 0.88,
    },
    comments: [
      { id: 'c-014', author: 'Diana Ross', text: 'Rejected: Duplicate tooling. Please work with IT to leverage existing Jira or Asana licenses.', timestamp: '2026-01-09T11:00:00Z', role: 'Procurement' },
    ],
  },
  {
    id: 'REQ-020', title: 'Blockchain Consulting Engagement', requester: 'Nathan Lee', department: 'Product',
    category: 'Consulting', amount: 95000, currency: 'USD', vendorName: 'ChainLogic Labs',
    description: 'Blockchain feasibility study and proof-of-concept for supply chain traceability using distributed ledger technology.',
    businessJustification: 'Exploring blockchain for supply chain transparency. Could reduce counterfeit risk and improve auditability.',
    status: 'Rejected', priority: 'Low', createdAt: '2026-01-06T09:00:00Z',
    approvalSteps: approvalFull('approved', 'Lisa Wong', '2026-01-07T09:00:00Z', 'rejected', 'Robert Kim', '2026-01-08T10:00:00Z'),
    aiAnalysis: {
      riskScore: 72, riskFactors: ['Unproven vendor', 'Speculative technology', 'No clear ROI', 'Not in strategic plan'],
      summary: 'Speculative engagement with unproven vendor. Blockchain use case lacks clear ROI. Not aligned with current strategic priorities.',
      recommendedCategory: 'Professional Services - Consulting', policyCheck: false,
      complianceNotes: 'Vendor not in approved vendor list. No SOC2 certification. Requires enhanced due diligence.',
      suggestedChannel: 'Not Recommended', confidence: 0.85,
    },
    comments: [
      { id: 'c-015', author: 'Robert Kim', text: 'Rejected: Not aligned with FY26 strategic priorities. Revisit in FY27 planning cycle.', timestamp: '2026-01-08T10:00:00Z', role: 'Finance' },
    ],
  },

  // ---- ORDER PLACED (3) ----
  {
    id: 'REQ-021', title: 'HubSpot Marketing Hub Enterprise', requester: 'Olivia Martinez', department: 'Marketing',
    category: 'Software', amount: 43200, currency: 'USD', vendorName: 'HubSpot',
    description: 'HubSpot Marketing Hub Enterprise for 10 marketing users. Includes ABM tools, adaptive testing, and custom reporting.',
    businessJustification: 'Marketing automation platform to replace Marketo. Better integration with Salesforce CRM and 40% lower TCO.',
    status: 'Order Placed', priority: 'High', createdAt: '2025-12-01T09:00:00Z',
    approvalSteps: approvalFull('approved', 'Tom Bradley', '2025-12-02T09:00:00Z', 'approved', 'Robert Kim', '2025-12-03T10:00:00Z', 'approved', 'Diana Ross', '2025-12-04T14:00:00Z', 'skipped'),
    purchaseOrderNumber: 'PO-2026-006',
    comments: [
      { id: 'c-016', author: 'Olivia Martinez', text: 'PO issued. Onboarding starts January 15.', timestamp: '2025-12-05T08:00:00Z', role: 'Requester' },
    ],
  },
  {
    id: 'REQ-022', title: 'Oracle Database Enterprise Edition', requester: 'Frank Liu', department: 'IT',
    category: 'Software', amount: 134000, currency: 'USD', vendorName: 'Oracle Corp',
    description: 'Oracle Database 23c Enterprise Edition - 4 processor licenses with annual support for mission-critical financial systems.',
    businessJustification: 'Core financial database requires upgrade from 19c to 23c. Extended support for 19c ends June 2026.',
    status: 'Order Placed', priority: 'High', createdAt: '2025-11-20T08:00:00Z',
    approvalSteps: approvalFull('approved', 'Karen White', '2025-11-21T09:00:00Z', 'approved', 'Robert Kim', '2025-11-22T10:00:00Z', 'approved', 'Diana Ross', '2025-11-23T14:00:00Z', 'approved', 'Michael Stone', '2025-11-24T11:00:00Z'),
    purchaseOrderNumber: 'PO-2026-007',
    comments: [],
  },
  {
    id: 'REQ-023', title: 'Ergonomic Standing Desks - Eng Floor', requester: 'Marcus Johnson', department: 'Engineering',
    category: 'Facilities', amount: 22500, currency: 'USD', vendorName: 'Fully (Hawthorne)',
    description: '25x Fully Jarvis standing desks with dual monitor arms for engineering floor renovation.',
    businessJustification: 'Part of engineering floor renovation project. Employee wellness survey showed 78% demand for standing desks.',
    status: 'Order Placed', priority: 'Medium', createdAt: '2025-12-08T10:00:00Z',
    approvalSteps: approvalFull('approved', 'Lisa Wong', '2025-12-09T09:00:00Z', 'approved', 'Robert Kim', '2025-12-10T14:00:00Z', 'approved', 'Diana Ross', '2025-12-11T10:00:00Z', 'skipped'),
    purchaseOrderNumber: 'PO-2026-008',
    comments: [],
  },

  // ---- RECEIVED (2) ----
  {
    id: 'REQ-024', title: 'Microsoft Azure Enterprise Agreement', requester: 'Alex Rivera', department: 'Engineering',
    category: 'Software', amount: 290000, currency: 'USD', vendorName: 'Microsoft Azure',
    description: 'Azure Enterprise Agreement renewal - includes compute, storage, networking, and AI/ML services. 3-year commitment.',
    businessJustification: 'Secondary cloud provider for DR and specific workloads. EA provides 25% discount over PAYG.',
    status: 'Received', priority: 'Critical', createdAt: '2025-11-01T08:00:00Z',
    approvalSteps: approvalFull('approved', 'Lisa Wong', '2025-11-02T09:00:00Z', 'approved', 'Robert Kim', '2025-11-03T10:00:00Z', 'approved', 'Diana Ross', '2025-11-04T14:00:00Z', 'approved', 'Michael Stone', '2025-11-05T11:00:00Z'),
    purchaseOrderNumber: 'PO-2025-042',
    comments: [
      { id: 'c-017', author: 'Alex Rivera', text: 'EA activated. Subscriptions migrated successfully.', timestamp: '2025-11-15T09:00:00Z', role: 'Requester' },
    ],
  },
  {
    id: 'REQ-025', title: 'SAP SuccessFactors - Performance Module', requester: 'Rachel Green', department: 'HR',
    category: 'Software', amount: 68000, currency: 'USD', vendorName: 'SAP SE',
    description: 'SAP SuccessFactors Performance & Goals module add-on for 2,500 employees. Integrates with existing Workday HCM.',
    businessJustification: 'Standardizing performance review process. SuccessFactors selected for superior goal-setting and calibration features.',
    status: 'Received', priority: 'Medium', createdAt: '2025-10-15T08:00:00Z',
    approvalSteps: approvalFull('approved', 'Linda Torres', '2025-10-16T09:00:00Z', 'approved', 'Robert Kim', '2025-10-17T10:00:00Z', 'approved', 'Diana Ross', '2025-10-18T14:00:00Z', 'skipped'),
    purchaseOrderNumber: 'PO-2025-038',
    comments: [
      { id: 'c-018', author: 'Rachel Green', text: 'Module deployed. Training sessions scheduled for all managers.', timestamp: '2025-11-01T10:00:00Z', role: 'Requester' },
    ],
  },
];

// -----------------------------------------------------------------------------
// Vendors (15)
// -----------------------------------------------------------------------------

export const mockVendors: Vendor[] = [
  {
    id: 'VND-001', name: 'Salesforce.com', category: 'Software', trustScore: 94, isPreferred: true,
    contactName: 'Sarah Mitchell', contactEmail: 'sarah.mitchell@salesforce.com', website: 'https://salesforce.com',
    description: 'Global leader in CRM and cloud-based enterprise software solutions.',
    spendLast12M: 482000, performanceRating: 4.7, onboardingStatus: 'Active',
    complianceStatus: { taxValid: 'Valid (W-9 on file)', bankValid: 'Verified (ACH)', sanctionsCheck: 'Clear - 2026-01-01' },
    riskScan: { lastScanned: '2026-01-28T06:00:00Z', sentiment: 'Positive', findings: ['Strong Q4 earnings', 'AI Cloud expansion', 'No adverse findings'] },
    documents: [
      { id: 'doc-001', type: 'W-9', name: 'Salesforce_W9_2026.pdf', status: 'Valid', expiryDate: '2026-12-31' },
      { id: 'doc-002', type: 'SOC2', name: 'Salesforce_SOC2_TypeII.pdf', status: 'Valid', expiryDate: '2026-06-30' },
      { id: 'doc-003', type: 'MSA', name: 'Salesforce_MSA_2024.pdf', status: 'Valid', expiryDate: '2027-03-31' },
      { id: 'doc-004', type: 'Insurance', name: 'Salesforce_COI_2026.pdf', status: 'Valid', expiryDate: '2026-12-31' },
    ],
    esgScore: { environmental: 82, social: 88, governance: 91, overall: 87 },
    diversityClassification: 'None',
  },
  {
    id: 'VND-002', name: 'Amazon Web Services', category: 'Cloud', trustScore: 96, isPreferred: true,
    contactName: 'Jason Park', contactEmail: 'jpark@amazon.com', website: 'https://aws.amazon.com',
    description: 'Leading cloud infrastructure provider offering compute, storage, database, AI/ML, and 200+ services.',
    spendLast12M: 1240000, performanceRating: 4.8, onboardingStatus: 'Active',
    complianceStatus: { taxValid: 'Valid (W-9 on file)', bankValid: 'Verified (Wire)', sanctionsCheck: 'Clear - 2026-01-15' },
    riskScan: { lastScanned: '2026-02-01T06:00:00Z', sentiment: 'Positive', findings: ['Market leader position maintained', 'FedRAMP High authorized', 'No adverse findings'] },
    documents: [
      { id: 'doc-005', type: 'W-9', name: 'AWS_W9_2026.pdf', status: 'Valid', expiryDate: '2026-12-31' },
      { id: 'doc-006', type: 'SOC2', name: 'AWS_SOC2_TypeII.pdf', status: 'Valid', expiryDate: '2026-09-30' },
      { id: 'doc-007', type: 'BAA', name: 'AWS_BAA_HIPAA.pdf', status: 'Valid', expiryDate: '2027-01-31' },
      { id: 'doc-008', type: 'DPA', name: 'AWS_DPA_GDPR.pdf', status: 'Valid', expiryDate: '2027-01-31' },
      { id: 'doc-009', type: 'MSA', name: 'AWS_Enterprise_Agreement.pdf', status: 'Valid', expiryDate: '2028-01-31' },
    ],
    esgScore: { environmental: 78, social: 75, governance: 88, overall: 80 },
  },
  {
    id: 'VND-003', name: 'Microsoft Azure', category: 'Cloud', trustScore: 92, isPreferred: true,
    contactName: 'Emily Zhang', contactEmail: 'ezhang@microsoft.com', website: 'https://azure.microsoft.com',
    description: 'Enterprise cloud platform providing hybrid cloud solutions, AI, and developer tools.',
    spendLast12M: 580000, performanceRating: 4.5, onboardingStatus: 'Active',
    complianceStatus: { taxValid: 'Valid (W-9 on file)', bankValid: 'Verified (ACH)', sanctionsCheck: 'Clear - 2026-01-10' },
    riskScan: { lastScanned: '2026-01-25T06:00:00Z', sentiment: 'Positive', findings: ['Copilot adoption accelerating', 'Strong enterprise growth', 'Minor outage reported Dec 2025'] },
    documents: [
      { id: 'doc-010', type: 'W-9', name: 'Microsoft_W9_2026.pdf', status: 'Valid', expiryDate: '2026-12-31' },
      { id: 'doc-011', type: 'SOC2', name: 'Microsoft_SOC2_TypeII.pdf', status: 'Valid', expiryDate: '2026-08-31' },
      { id: 'doc-012', type: 'EA', name: 'Microsoft_EA_Agreement.pdf', status: 'Valid', expiryDate: '2028-10-31' },
    ],
    esgScore: { environmental: 90, social: 85, governance: 92, overall: 89 },
  },
  {
    id: 'VND-004', name: 'Apple Inc', category: 'Hardware', trustScore: 99, isPreferred: true,
    contactName: 'David Chen', contactEmail: 'dchen@apple.com', website: 'https://apple.com',
    description: 'Premium hardware manufacturer of laptops, desktops, and mobile devices for enterprise.',
    spendLast12M: 324000, performanceRating: 4.9, onboardingStatus: 'Active',
    complianceStatus: { taxValid: 'Valid (W-9 on file)', bankValid: 'Verified (Wire)', sanctionsCheck: 'Clear - 2026-02-01' },
    riskScan: { lastScanned: '2026-02-01T06:00:00Z', sentiment: 'Positive', findings: ['Record Q1 revenue', 'Apple Intelligence launch', 'No supply chain concerns'] },
    documents: [
      { id: 'doc-013', type: 'W-9', name: 'Apple_W9_2026.pdf', status: 'Valid', expiryDate: '2026-12-31' },
      { id: 'doc-014', type: 'MSA', name: 'Apple_Business_Agreement.pdf', status: 'Valid', expiryDate: '2027-06-30' },
      { id: 'doc-015', type: 'Insurance', name: 'Apple_COI_2026.pdf', status: 'Valid', expiryDate: '2026-12-31' },
    ],
    esgScore: { environmental: 95, social: 82, governance: 90, overall: 89 },
  },
  {
    id: 'VND-005', name: 'Dell Technologies', category: 'Hardware', trustScore: 88, isPreferred: true,
    contactName: 'Mark Thompson', contactEmail: 'mark.thompson@dell.com', website: 'https://dell.com',
    description: 'Enterprise hardware solutions including servers, storage, workstations, and IT infrastructure.',
    spendLast12M: 412000, performanceRating: 4.3, onboardingStatus: 'Active',
    complianceStatus: { taxValid: 'Valid (W-9 on file)', bankValid: 'Verified (ACH)', sanctionsCheck: 'Clear - 2025-12-15' },
    riskScan: { lastScanned: '2026-01-20T06:00:00Z', sentiment: 'Neutral', findings: ['Restructuring announcement', 'Server delivery delays reported', 'TAA compliant products available'] },
    documents: [
      { id: 'doc-016', type: 'W-9', name: 'Dell_W9_2026.pdf', status: 'Valid', expiryDate: '2026-12-31' },
      { id: 'doc-017', type: 'SOC2', name: 'Dell_SOC2_TypeII.pdf', status: 'Valid', expiryDate: '2026-07-31' },
      { id: 'doc-018', type: 'MSA', name: 'Dell_Premier_Agreement.pdf', status: 'Valid', expiryDate: '2026-12-31' },
      { id: 'doc-019', type: 'Insurance', name: 'Dell_COI_2026.pdf', status: 'Valid', expiryDate: '2026-12-31' },
    ],
    esgScore: { environmental: 72, social: 70, governance: 80, overall: 74 },
  },
  {
    id: 'VND-006', name: 'Google Cloud', category: 'Cloud', trustScore: 91, isPreferred: true,
    contactName: 'Amanda Lewis', contactEmail: 'alewis@google.com', website: 'https://cloud.google.com',
    description: 'Cloud computing platform offering data analytics, AI/ML, and productivity suite (Google Workspace).',
    spendLast12M: 298000, performanceRating: 4.5, onboardingStatus: 'Active',
    complianceStatus: { taxValid: 'Valid (W-9 on file)', bankValid: 'Verified (ACH)', sanctionsCheck: 'Clear - 2026-01-20' },
    riskScan: { lastScanned: '2026-01-30T06:00:00Z', sentiment: 'Positive', findings: ['Gemini 2.0 platform growth', 'Vertex AI adoption increasing', 'No adverse findings'] },
    documents: [
      { id: 'doc-020', type: 'W-9', name: 'Google_W9_2026.pdf', status: 'Valid', expiryDate: '2026-12-31' },
      { id: 'doc-021', type: 'SOC2', name: 'Google_SOC2_TypeII.pdf', status: 'Valid', expiryDate: '2026-10-31' },
      { id: 'doc-022', type: 'DPA', name: 'Google_DPA_GDPR.pdf', status: 'Valid', expiryDate: '2027-03-31' },
    ],
    esgScore: { environmental: 92, social: 80, governance: 86, overall: 86 },
  },
  {
    id: 'VND-007', name: 'Slack Technologies', category: 'Software', trustScore: 87, isPreferred: true,
    contactName: 'Chris Anderson', contactEmail: 'canderson@slack.com', website: 'https://slack.com',
    description: 'Enterprise messaging and collaboration platform (Salesforce company).',
    spendLast12M: 54000, performanceRating: 4.4, onboardingStatus: 'Active',
    complianceStatus: { taxValid: 'Valid (W-9 on file)', bankValid: 'Verified (ACH)', sanctionsCheck: 'Clear - 2026-01-05' },
    riskScan: { lastScanned: '2026-01-15T06:00:00Z', sentiment: 'Positive', findings: ['Salesforce integration deepening', 'Enterprise adoption growing', 'No adverse findings'] },
    documents: [
      { id: 'doc-023', type: 'W-9', name: 'Slack_W9_2026.pdf', status: 'Valid', expiryDate: '2026-12-31' },
      { id: 'doc-024', type: 'SOC2', name: 'Slack_SOC2_TypeII.pdf', status: 'Valid', expiryDate: '2026-05-31' },
      { id: 'doc-025', type: 'MSA', name: 'Slack_Enterprise_Agreement.pdf', status: 'Valid', expiryDate: '2027-01-31' },
    ],
    esgScore: { environmental: 76, social: 84, governance: 82, overall: 81 },
  },
  {
    id: 'VND-008', name: 'Zoom Video', category: 'Software', trustScore: 85, isPreferred: false,
    contactName: 'Laura Kim', contactEmail: 'lkim@zoom.us', website: 'https://zoom.us',
    description: 'Video communications platform providing meetings, phone, chat, and webinar solutions.',
    spendLast12M: 38000, performanceRating: 4.2, onboardingStatus: 'Active',
    complianceStatus: { taxValid: 'Valid (W-9 on file)', bankValid: 'Verified (ACH)', sanctionsCheck: 'Clear - 2025-12-20' },
    riskScan: { lastScanned: '2026-01-18T06:00:00Z', sentiment: 'Neutral', findings: ['Competitive pressure from Teams/Meet', 'AI Companion feature launch', 'Revenue growth slowing'] },
    documents: [
      { id: 'doc-026', type: 'W-9', name: 'Zoom_W9_2026.pdf', status: 'Valid', expiryDate: '2026-12-31' },
      { id: 'doc-027', type: 'SOC2', name: 'Zoom_SOC2_TypeII.pdf', status: 'Valid', expiryDate: '2026-04-30' },
      { id: 'doc-028', type: 'DPA', name: 'Zoom_DPA.pdf', status: 'Valid', expiryDate: '2027-01-31' },
    ],
    esgScore: { environmental: 68, social: 74, governance: 78, overall: 73 },
  },
  {
    id: 'VND-009', name: 'Adobe Systems', category: 'Software', trustScore: 90, isPreferred: true,
    contactName: 'Michael Brooks', contactEmail: 'mbrooks@adobe.com', website: 'https://adobe.com',
    description: 'Creative, document, and experience cloud solutions for enterprises.',
    spendLast12M: 89000, performanceRating: 4.5, onboardingStatus: 'Active',
    complianceStatus: { taxValid: 'Valid (W-9 on file)', bankValid: 'Verified (ACH)', sanctionsCheck: 'Clear - 2026-01-12' },
    riskScan: { lastScanned: '2026-01-22T06:00:00Z', sentiment: 'Positive', findings: ['Firefly AI integration strong', 'Creative Cloud dominance continues', 'No adverse findings'] },
    documents: [
      { id: 'doc-029', type: 'W-9', name: 'Adobe_W9_2026.pdf', status: 'Valid', expiryDate: '2026-12-31' },
      { id: 'doc-030', type: 'SOC2', name: 'Adobe_SOC2_TypeII.pdf', status: 'Valid', expiryDate: '2026-06-30' },
      { id: 'doc-031', type: 'VLP', name: 'Adobe_VLP_Agreement.pdf', status: 'Valid', expiryDate: '2027-03-31' },
    ],
    esgScore: { environmental: 80, social: 86, governance: 88, overall: 85 },
  },
  {
    id: 'VND-010', name: 'Atlassian', category: 'Software', trustScore: 89, isPreferred: true,
    contactName: 'Ryan Cooper', contactEmail: 'rcooper@atlassian.com', website: 'https://atlassian.com',
    description: 'Collaboration and project management tools including Jira, Confluence, and Bitbucket.',
    spendLast12M: 112000, performanceRating: 4.4, onboardingStatus: 'Active',
    complianceStatus: { taxValid: 'Valid (W-8BEN-E on file)', bankValid: 'Verified (Wire)', sanctionsCheck: 'Clear - 2026-01-08' },
    riskScan: { lastScanned: '2026-01-25T06:00:00Z', sentiment: 'Positive', findings: ['Cloud migration mandate (Server EOL)', 'Rovo AI assistant launch', 'Strong developer ecosystem'] },
    documents: [
      { id: 'doc-032', type: 'W-8BEN-E', name: 'Atlassian_W8BENE.pdf', status: 'Valid', expiryDate: '2028-12-31' },
      { id: 'doc-033', type: 'SOC2', name: 'Atlassian_SOC2_TypeII.pdf', status: 'Valid', expiryDate: '2026-07-31' },
      { id: 'doc-034', type: 'MSA', name: 'Atlassian_Cloud_Agreement.pdf', status: 'Valid', expiryDate: '2027-06-30' },
    ],
    esgScore: { environmental: 74, social: 90, governance: 84, overall: 83 },
    diversityClassification: 'None',
  },
  {
    id: 'VND-011', name: 'ServiceNow', category: 'Software', trustScore: 93, isPreferred: true,
    contactName: 'Jennifer Walsh', contactEmail: 'jwalsh@servicenow.com', website: 'https://servicenow.com',
    description: 'Enterprise IT service management, workflow automation, and digital operations platform.',
    spendLast12M: 198000, performanceRating: 4.6, onboardingStatus: 'Active',
    complianceStatus: { taxValid: 'Valid (W-9 on file)', bankValid: 'Verified (ACH)', sanctionsCheck: 'Clear - 2026-01-18' },
    riskScan: { lastScanned: '2026-01-28T06:00:00Z', sentiment: 'Positive', findings: ['Industry leader in ITSM', 'Now Assist AI capabilities', 'Strong financial performance'] },
    documents: [
      { id: 'doc-035', type: 'W-9', name: 'ServiceNow_W9_2026.pdf', status: 'Valid', expiryDate: '2026-12-31' },
      { id: 'doc-036', type: 'SOC2', name: 'ServiceNow_SOC2_TypeII.pdf', status: 'Valid', expiryDate: '2026-09-30' },
      { id: 'doc-037', type: 'MSA', name: 'ServiceNow_Subscription_Agreement.pdf', status: 'Valid', expiryDate: '2027-12-31' },
      { id: 'doc-038', type: 'Insurance', name: 'ServiceNow_COI_2026.pdf', status: 'Valid', expiryDate: '2026-12-31' },
    ],
    esgScore: { environmental: 78, social: 82, governance: 90, overall: 83 },
  },
  {
    id: 'VND-012', name: 'Workday Inc', category: 'HR Software', trustScore: 86, isPreferred: true,
    contactName: 'Patricia Moore', contactEmail: 'pmoore@workday.com', website: 'https://workday.com',
    description: 'Cloud-based enterprise platform for human capital management, financial management, and planning.',
    spendLast12M: 210000, performanceRating: 4.3, onboardingStatus: 'Active',
    complianceStatus: { taxValid: 'Valid (W-9 on file)', bankValid: 'Verified (ACH)', sanctionsCheck: 'Clear - 2026-01-05' },
    riskScan: { lastScanned: '2026-01-20T06:00:00Z', sentiment: 'Positive', findings: ['AI/ML features expanding', 'Strong retention rates', 'Competitor to SAP HCM'] },
    documents: [
      { id: 'doc-039', type: 'W-9', name: 'Workday_W9_2026.pdf', status: 'Valid', expiryDate: '2026-12-31' },
      { id: 'doc-040', type: 'SOC2', name: 'Workday_SOC2_TypeII.pdf', status: 'Valid', expiryDate: '2026-08-31' },
      { id: 'doc-041', type: 'MSA', name: 'Workday_Subscription_Agreement.pdf', status: 'Valid', expiryDate: '2028-01-31' },
    ],
    esgScore: { environmental: 70, social: 88, governance: 84, overall: 81 },
  },
  {
    id: 'VND-013', name: 'SAP SE', category: 'ERP', trustScore: 82, isPreferred: false,
    contactName: 'Hans Mueller', contactEmail: 'hans.mueller@sap.com', website: 'https://sap.com',
    description: 'Enterprise application software for ERP, supply chain, HR, and business analytics.',
    spendLast12M: 168000, performanceRating: 3.9, onboardingStatus: 'Active',
    complianceStatus: { taxValid: 'Valid (W-8BEN-E on file)', bankValid: 'Verified (Wire)', sanctionsCheck: 'Clear - 2025-12-20' },
    riskScan: { lastScanned: '2026-01-15T06:00:00Z', sentiment: 'Neutral', findings: ['S/4HANA migration pressure', 'Complex licensing model', 'EU data sovereignty compliant'] },
    documents: [
      { id: 'doc-042', type: 'W-8BEN-E', name: 'SAP_W8BENE.pdf', status: 'Valid', expiryDate: '2028-12-31' },
      { id: 'doc-043', type: 'SOC2', name: 'SAP_SOC2_TypeII.pdf', status: 'Valid', expiryDate: '2026-05-31' },
      { id: 'doc-044', type: 'MSA', name: 'SAP_Enterprise_Agreement.pdf', status: 'Valid', expiryDate: '2027-06-30' },
      { id: 'doc-045', type: 'DPA', name: 'SAP_DPA_GDPR.pdf', status: 'Valid', expiryDate: '2027-06-30' },
    ],
    esgScore: { environmental: 84, social: 78, governance: 86, overall: 83 },
  },
  {
    id: 'VND-014', name: 'Oracle Corp', category: 'Database', trustScore: 78, isPreferred: false,
    contactName: 'Steve Rodriguez', contactEmail: 'srodriguez@oracle.com', website: 'https://oracle.com',
    description: 'Database technology, cloud infrastructure, and enterprise software solutions.',
    spendLast12M: 234000, performanceRating: 3.7, onboardingStatus: 'Active',
    complianceStatus: { taxValid: 'Valid (W-9 on file)', bankValid: 'Verified (Wire)', sanctionsCheck: 'Clear - 2025-12-10' },
    riskScan: { lastScanned: '2026-01-10T06:00:00Z', sentiment: 'Neutral', findings: ['Aggressive audit practices reported', 'OCI growing but behind AWS/Azure', 'Complex license compliance'] },
    documents: [
      { id: 'doc-046', type: 'W-9', name: 'Oracle_W9_2026.pdf', status: 'Valid', expiryDate: '2026-12-31' },
      { id: 'doc-047', type: 'SOC2', name: 'Oracle_SOC2_TypeII.pdf', status: 'Valid', expiryDate: '2026-03-31' },
      { id: 'doc-048', type: 'ULA', name: 'Oracle_ULA_Agreement.pdf', status: 'Valid', expiryDate: '2027-12-31' },
      { id: 'doc-049', type: 'Insurance', name: 'Oracle_COI_2026.pdf', status: 'Valid', expiryDate: '2026-12-31' },
      { id: 'doc-050', type: 'NDA', name: 'Oracle_NDA.pdf', status: 'Valid', expiryDate: '2028-01-31' },
    ],
    esgScore: { environmental: 65, social: 62, governance: 74, overall: 67 },
  },
  {
    id: 'VND-015', name: 'HubSpot', category: 'Marketing', trustScore: 84, isPreferred: false,
    contactName: 'Kelly Nguyen', contactEmail: 'knguyen@hubspot.com', website: 'https://hubspot.com',
    description: 'Inbound marketing, sales, and customer service platform with CRM capabilities.',
    spendLast12M: 43200, performanceRating: 4.2, onboardingStatus: 'Active',
    complianceStatus: { taxValid: 'Valid (W-9 on file)', bankValid: 'Verified (ACH)', sanctionsCheck: 'Clear - 2026-01-02' },
    riskScan: { lastScanned: '2026-01-12T06:00:00Z', sentiment: 'Positive', findings: ['Strong SMB/mid-market growth', 'AI content tools expanding', 'No adverse findings'] },
    documents: [
      { id: 'doc-051', type: 'W-9', name: 'HubSpot_W9_2026.pdf', status: 'Valid', expiryDate: '2026-12-31' },
      { id: 'doc-052', type: 'SOC2', name: 'HubSpot_SOC2_TypeII.pdf', status: 'Valid', expiryDate: '2026-06-30' },
      { id: 'doc-053', type: 'MSA', name: 'HubSpot_Subscription_Agreement.pdf', status: 'Valid', expiryDate: '2026-12-31' },
    ],
    esgScore: { environmental: 72, social: 86, governance: 80, overall: 79 },
    diversityClassification: 'None',
  },
];

// -----------------------------------------------------------------------------
// Contracts (12)
// -----------------------------------------------------------------------------

export const mockContracts: Contract[] = [
  {
    id: 'CTR-001', title: 'Salesforce Enterprise License Agreement', vendorName: 'Salesforce.com',
    type: 'SaaS Subscription', value: 482000, startDate: '2025-04-01', endDate: '2026-03-31',
    status: 'Active', paymentTerms: 'Annual upfront', autoRenewal: true, owner: 'Jessica Chen',
    aiAnalysis: {
      summary: 'Standard Salesforce ELA with favorable terms. Auto-renewal clause with 60-day notice period. Price escalator capped at 5% annually.',
      keyTerms: [
        { term: 'License Seats', value: '350 users', riskLevel: 'Low' },
        { term: 'Price Escalator', value: '5% annual cap', riskLevel: 'Medium' },
        { term: 'Auto-Renewal Notice', value: '60 days', riskLevel: 'Medium' },
        { term: 'Data Portability', value: 'Full export within 90 days', riskLevel: 'Low' },
      ],
      indemnificationClause: 'Mutual indemnification for IP infringement. Salesforce indemnifies for third-party IP claims related to service use.',
      confidentialityClause: 'Mutual NDA with 3-year survival period post-termination. Excludes publicly available information.',
      governingLaw: 'State of California, USA',
      terminationClause: 'Either party may terminate for material breach with 30-day cure period. Customer may terminate for convenience with 90-day notice.',
    },
  },
  {
    id: 'CTR-002', title: 'AWS Enterprise Discount Program', vendorName: 'Amazon Web Services',
    type: 'Cloud Commitment', value: 1240000, startDate: '2025-02-01', endDate: '2028-01-31',
    status: 'Active', paymentTerms: 'Monthly consumption', autoRenewal: false, owner: 'Alex Rivera',
    aiAnalysis: {
      summary: '3-year EDP with committed spend of $1.24M/year. 15% discount on on-demand pricing. Includes $50K in AWS credits for new services.',
      keyTerms: [
        { term: 'Annual Commitment', value: '$1.24M minimum', riskLevel: 'High' },
        { term: 'Discount Rate', value: '15% off on-demand', riskLevel: 'Low' },
        { term: 'Credits', value: '$50K new service credits', riskLevel: 'Low' },
        { term: 'Commitment Shortfall', value: 'Forfeit unused balance', riskLevel: 'High' },
      ],
      governingLaw: 'State of Washington, USA',
      terminationClause: 'Cannot terminate before commitment period. AWS may terminate for payment default with 30-day cure.',
    },
  },
  {
    id: 'CTR-003', title: 'Microsoft Enterprise Agreement', vendorName: 'Microsoft Azure',
    type: 'Enterprise Agreement', value: 580000, startDate: '2025-11-01', endDate: '2028-10-31',
    status: 'Active', paymentTerms: 'Annual upfront', autoRenewal: true, owner: 'Alex Rivera',
    aiAnalysis: {
      summary: '3-year EA covering Azure consumption and M365 licenses. True-up mechanism for additional users. Includes Software Assurance.',
      keyTerms: [
        { term: 'Azure Commitment', value: '$290K/year', riskLevel: 'Medium' },
        { term: 'M365 Licenses', value: '600 E5 seats', riskLevel: 'Low' },
        { term: 'True-Up', value: 'Annual, January', riskLevel: 'Medium' },
        { term: 'Price Lock', value: '3-year fixed pricing', riskLevel: 'Low' },
      ],
      governingLaw: 'State of Washington, USA',
      terminationClause: 'Standard Microsoft EA terms. 90-day notice for non-renewal. Early termination subject to remaining commitment.',
    },
  },
  {
    id: 'CTR-004', title: 'Dell Premier Services Agreement', vendorName: 'Dell Technologies',
    type: 'Hardware + Services', value: 412000, startDate: '2025-06-01', endDate: '2026-05-31',
    status: 'Active', paymentTerms: 'Net 30', autoRenewal: true, owner: 'James Wilson',
    aiAnalysis: {
      summary: 'Premier-tier purchasing agreement with volume discounts and priority support. Covers servers, workstations, and peripherals.',
      keyTerms: [
        { term: 'Volume Discount', value: '12-18% off list', riskLevel: 'Low' },
        { term: 'Support SLA', value: '4-hour onsite response', riskLevel: 'Low' },
        { term: 'Warranty', value: '5-year ProSupport Plus', riskLevel: 'Low' },
      ],
      governingLaw: 'State of Texas, USA',
      terminationClause: 'Either party may terminate with 30 days written notice. Outstanding POs remain binding.',
    },
  },
  {
    id: 'CTR-005', title: 'Google Workspace Enterprise Agreement', vendorName: 'Google Cloud',
    type: 'SaaS Subscription', value: 162000, startDate: '2026-01-01', endDate: '2026-12-31',
    status: 'Active', paymentTerms: 'Annual upfront', autoRenewal: true, owner: 'Maya Thompson',
    aiAnalysis: {
      summary: 'Google Workspace Enterprise Standard for 600 users. Includes enhanced security, Vault, and endpoint management.',
      keyTerms: [
        { term: 'Seats', value: '600 users', riskLevel: 'Low' },
        { term: 'Storage', value: '5TB pooled per user', riskLevel: 'Low' },
        { term: 'SLA', value: '99.9% uptime guarantee', riskLevel: 'Low' },
        { term: 'Data Residency', value: 'US data centers', riskLevel: 'Low' },
      ],
      governingLaw: 'State of California, USA',
      terminationClause: 'Annual commitment. Auto-renews unless cancelled 45 days before renewal.',
    },
  },
  {
    id: 'CTR-006', title: 'ServiceNow ITSM Pro Subscription', vendorName: 'ServiceNow',
    type: 'SaaS Subscription', value: 198000, startDate: '2026-02-01', endDate: '2029-01-31',
    status: 'Active', paymentTerms: 'Annual upfront', autoRenewal: true, owner: 'Frank Liu',
    aiAnalysis: {
      summary: '3-year ITSM Pro subscription. Includes implementation support and 150 agent licenses. Now Assist AI included.',
      keyTerms: [
        { term: 'Agent Licenses', value: '150 fulfillers', riskLevel: 'Low' },
        { term: 'AI Features', value: 'Now Assist included', riskLevel: 'Low' },
        { term: 'Price Escalator', value: '3% annual cap', riskLevel: 'Low' },
        { term: 'Implementation', value: 'Included in Year 1', riskLevel: 'Medium' },
      ],
      governingLaw: 'State of California, USA',
      terminationClause: '3-year commitment. Early termination requires payment of remaining term.',
    },
  },
  {
    id: 'CTR-007', title: 'Workday HCM Enterprise Subscription', vendorName: 'Workday Inc',
    type: 'SaaS Subscription', value: 210000, startDate: '2025-07-01', endDate: '2028-06-30',
    status: 'Active', paymentTerms: 'Annual upfront', autoRenewal: true, owner: 'Rachel Green',
    aiAnalysis: {
      summary: '3-year Workday HCM suite including Core HR, Payroll, Benefits, Talent, and Learning for 2,500 employees.',
      keyTerms: [
        { term: 'Employee Count', value: '2,500 workers', riskLevel: 'Low' },
        { term: 'Modules', value: 'Core HR, Payroll, Benefits, Talent, Learning', riskLevel: 'Low' },
        { term: 'Price Escalator', value: '4% annual cap', riskLevel: 'Medium' },
      ],
      governingLaw: 'State of California, USA',
      terminationClause: 'Non-cancellable for term. Data export available for 60 days post-termination.',
    },
  },
  {
    id: 'CTR-008', title: 'Oracle Database ULA', vendorName: 'Oracle Corp',
    type: 'Unlimited License Agreement', value: 234000, startDate: '2024-01-01', endDate: '2027-12-31',
    status: 'Active', paymentTerms: 'Annual upfront', autoRenewal: false, owner: 'Frank Liu',
    aiAnalysis: {
      summary: 'Unlimited License Agreement for Oracle Database Enterprise Edition. Includes RAC, Partitioning, and Advanced Security options. CAUTION: Certification process is complex.',
      keyTerms: [
        { term: 'License Scope', value: 'Unlimited processors', riskLevel: 'Medium' },
        { term: 'Certification', value: 'Required at ULA end', riskLevel: 'High' },
        { term: 'Included Options', value: 'RAC, Partitioning, Advanced Security', riskLevel: 'Low' },
        { term: 'Support Rate', value: '22% of net license fees', riskLevel: 'High' },
      ],
      governingLaw: 'State of California, USA',
      terminationClause: 'ULA cannot be terminated early. Must certify deployment count at end of term or renew.',
    },
  },
  {
    id: 'CTR-009', title: 'Adobe VIP Enterprise Agreement', vendorName: 'Adobe Systems',
    type: 'SaaS Subscription', value: 89000, startDate: '2025-04-01', endDate: '2026-03-31',
    status: 'Active', paymentTerms: 'Annual upfront', autoRenewal: true, owner: 'Nina Patel',
    aiAnalysis: {
      summary: 'Adobe Creative Cloud for Teams (45 licenses) and Acrobat Pro (100 licenses) under VIP Select pricing tier.',
      keyTerms: [
        { term: 'CC Licenses', value: '45 named users', riskLevel: 'Low' },
        { term: 'Acrobat Licenses', value: '100 named users', riskLevel: 'Low' },
        { term: 'VIP Tier', value: 'Select (Level 3)', riskLevel: 'Low' },
      ],
      governingLaw: 'State of California, USA',
      terminationClause: 'Annual subscription. Non-refundable. Auto-renews at then-current pricing.',
    },
  },
  {
    id: 'CTR-010', title: 'HubSpot Marketing Hub Enterprise', vendorName: 'HubSpot',
    type: 'SaaS Subscription', value: 43200, startDate: '2026-01-15', endDate: '2027-01-14',
    status: 'Active', paymentTerms: 'Annual upfront', autoRenewal: true, owner: 'Olivia Martinez',
    aiAnalysis: {
      summary: 'Marketing Hub Enterprise with 10 seats. Includes ABM tools, custom objects, adaptive testing, and predictive lead scoring.',
      keyTerms: [
        { term: 'Marketing Contacts', value: '50,000 included', riskLevel: 'Low' },
        { term: 'Seats', value: '10 paid users', riskLevel: 'Low' },
        { term: 'Overage', value: '$0.01/contact over 50K', riskLevel: 'Medium' },
      ],
      governingLaw: 'State of Massachusetts, USA',
      terminationClause: 'Annual commitment. 30-day written notice for non-renewal. No refund for early cancellation.',
    },
  },
  {
    id: 'CTR-011', title: 'Atlassian Cloud Premium Agreement', vendorName: 'Atlassian',
    type: 'SaaS Subscription', value: 86400, startDate: '2026-01-01', endDate: '2026-12-31',
    status: 'Active', paymentTerms: 'Annual upfront', autoRenewal: true, owner: 'Alex Rivera',
    aiAnalysis: {
      summary: 'Atlassian Cloud Premium for Jira Software (300 users), Confluence (300 users), and JSM (50 agents).',
      keyTerms: [
        { term: 'Jira Users', value: '300', riskLevel: 'Low' },
        { term: 'Confluence Users', value: '300', riskLevel: 'Low' },
        { term: 'JSM Agents', value: '50', riskLevel: 'Low' },
        { term: 'Storage', value: 'Unlimited', riskLevel: 'Low' },
      ],
      governingLaw: 'State of California, USA (Atlassian US entity)',
      terminationClause: 'Annual subscription. Auto-renews. 30-day cancellation notice required.',
    },
  },
  {
    id: 'CTR-012', title: 'SAP SuccessFactors Module License', vendorName: 'SAP SE',
    type: 'SaaS Subscription', value: 68000, startDate: '2025-11-01', endDate: '2028-10-31',
    status: 'Active', paymentTerms: 'Annual upfront', autoRenewal: false, owner: 'Rachel Green',
    aiAnalysis: {
      summary: 'SAP SuccessFactors Performance & Goals module for 2,500 employees. 3-year term aligned with Workday integration roadmap.',
      keyTerms: [
        { term: 'Employee Count', value: '2,500', riskLevel: 'Low' },
        { term: 'Modules', value: 'Performance, Goals, Calibration', riskLevel: 'Low' },
        { term: 'Integration', value: 'Workday HCM connector required', riskLevel: 'Medium' },
      ],
      governingLaw: 'Germany (SAP SE headquarters)',
      terminationClause: '3-year non-cancellable term. Must provide 180-day notice for non-renewal.',
    },
  },
];

// -----------------------------------------------------------------------------
// Purchase Orders (20)
// -----------------------------------------------------------------------------

export const mockPurchaseOrders: PurchaseOrder[] = [
  { poNumber: 'PO-2026-001', requestId: 'REQ-013', vendorName: 'Google Cloud', amount: 162000, currency: 'USD', status: 'Issued', createdAt: '2025-12-20T10:00:00Z', description: 'Google Workspace Enterprise Standard - 600 users annual renewal' },
  { poNumber: 'PO-2026-002', requestId: 'REQ-014', vendorName: 'Atlassian', amount: 86400, currency: 'USD', status: 'Issued', createdAt: '2025-12-24T09:00:00Z', description: 'Atlassian Cloud Premium - Jira, Confluence, JSM annual subscription' },
  { poNumber: 'PO-2026-003', requestId: 'REQ-015', vendorName: 'ServiceNow', amount: 198000, currency: 'USD', status: 'Issued', createdAt: '2025-12-15T11:00:00Z', description: 'ServiceNow ITSM Pro - 150 agent licenses, Year 1 of 3' },
  { poNumber: 'PO-2026-004', requestId: 'REQ-016', vendorName: 'Dell Technologies', amount: 156000, currency: 'USD', status: 'Shipped', createdAt: '2025-12-22T14:00:00Z', description: 'Dell PowerEdge R760 servers (8 units) with ProSupport Plus' },
  { poNumber: 'PO-2026-005', requestId: 'REQ-017', vendorName: 'Workday Inc', amount: 210000, currency: 'USD', status: 'Issued', createdAt: '2025-12-10T08:00:00Z', description: 'Workday HCM annual renewal - Core HR, Payroll, Benefits, Talent' },
  { poNumber: 'PO-2026-006', requestId: 'REQ-021', vendorName: 'HubSpot', amount: 43200, currency: 'USD', status: 'Acknowledged', createdAt: '2025-12-06T09:00:00Z', description: 'HubSpot Marketing Hub Enterprise - 10 seats, 50K contacts' },
  { poNumber: 'PO-2026-007', requestId: 'REQ-022', vendorName: 'Oracle Corp', amount: 134000, currency: 'USD', status: 'Acknowledged', createdAt: '2025-11-25T10:00:00Z', description: 'Oracle Database 23c Enterprise - 4 processor licenses + annual support' },
  { poNumber: 'PO-2026-008', requestId: 'REQ-023', vendorName: 'Fully (Hawthorne)', amount: 22500, currency: 'USD', status: 'Shipped', createdAt: '2025-12-12T11:00:00Z', description: 'Fully Jarvis standing desks (25 units) with dual monitor arms' },
  { poNumber: 'PO-2025-042', requestId: 'REQ-024', vendorName: 'Microsoft Azure', amount: 290000, currency: 'USD', status: 'Received', createdAt: '2025-11-06T09:00:00Z', description: 'Microsoft Azure EA - 3-year commitment, Year 1' },
  { poNumber: 'PO-2025-038', requestId: 'REQ-025', vendorName: 'SAP SE', amount: 68000, currency: 'USD', status: 'Received', createdAt: '2025-10-20T10:00:00Z', description: 'SAP SuccessFactors Performance & Goals - 2,500 employees' },
  { poNumber: 'PO-2026-009', requestId: '', vendorName: 'Amazon Web Services', amount: 103500, currency: 'USD', status: 'Issued', createdAt: '2026-01-05T08:00:00Z', description: 'AWS monthly consumption - January 2026 estimated' },
  { poNumber: 'PO-2026-010', requestId: '', vendorName: 'Salesforce.com', amount: 245000, currency: 'USD', status: 'Pending', createdAt: '2026-01-20T09:00:00Z', description: 'Salesforce Enterprise renewal FY26 - pending approval' },
  { poNumber: 'PO-2026-011', requestId: '', vendorName: 'Adobe Systems', amount: 32400, currency: 'USD', status: 'Pending', createdAt: '2026-01-25T10:00:00Z', description: 'Adobe Creative Cloud Team - 45 licenses renewal' },
  { poNumber: 'PO-2026-012', requestId: '', vendorName: 'Slack Technologies', amount: 54000, currency: 'USD', status: 'Pending', createdAt: '2026-01-28T11:00:00Z', description: 'Slack Business+ renewal - 600 users' },
  { poNumber: 'PO-2025-045', requestId: '', vendorName: 'Apple Inc', amount: 52000, currency: 'USD', status: 'Received', createdAt: '2025-11-15T14:00:00Z', description: 'MacBook Pro M4 (20 units) for Q4 new hires' },
  { poNumber: 'PO-2025-040', requestId: '', vendorName: 'Dell Technologies', amount: 28000, currency: 'USD', status: 'Received', createdAt: '2025-10-28T09:00:00Z', description: 'Dell Latitude 5550 laptops (20 units) for finance team' },
  { poNumber: 'PO-2025-043', requestId: '', vendorName: 'Zoom Video', amount: 18000, currency: 'USD', status: 'Received', createdAt: '2025-11-10T10:00:00Z', description: 'Zoom Business plan renewal - 400 users' },
  { poNumber: 'PO-2025-044', requestId: '', vendorName: 'Google Cloud', amount: 86000, currency: 'USD', status: 'Received', createdAt: '2025-11-12T11:00:00Z', description: 'Google Cloud Platform monthly consumption - November 2025' },
  { poNumber: 'PO-2026-013', requestId: '', vendorName: 'CrowdStrike', amount: 28000, currency: 'USD', status: 'Pending', createdAt: '2026-01-30T09:00:00Z', description: 'Annual penetration testing services engagement' },
  { poNumber: 'PO-2026-014', requestId: '', vendorName: 'Steelcase', amount: 42500, currency: 'USD', status: 'Draft', createdAt: '2026-02-01T10:00:00Z', description: 'Office furniture for Floor 12 buildout - 45 workstations' },
];

// -----------------------------------------------------------------------------
// Invoices (15)
// -----------------------------------------------------------------------------

export const mockInvoices: Invoice[] = [
  { id: 'INV-001', invoiceNumber: 'SF-2026-001234', vendorName: 'Salesforce.com', amount: 482000, date: '2025-04-01', status: 'Paid', matchStatus: '3-Way Match', poNumber: 'PO-2025-012' },
  { id: 'INV-002', invoiceNumber: 'AWS-2026-JAN', vendorName: 'Amazon Web Services', amount: 103487.52, date: '2026-02-01', status: 'Pending', matchStatus: '2-Way Match', poNumber: 'PO-2026-009' },
  { id: 'INV-003', invoiceNumber: 'MSFT-EA-2026-01', vendorName: 'Microsoft Azure', amount: 290000, date: '2025-11-01', status: 'Paid', matchStatus: '3-Way Match', poNumber: 'PO-2025-042' },
  { id: 'INV-004', invoiceNumber: 'DELL-INV-887432', vendorName: 'Dell Technologies', amount: 156000, date: '2026-01-15', status: 'Pending', matchStatus: '3-Way Match', poNumber: 'PO-2026-004' },
  { id: 'INV-005', invoiceNumber: 'GOOG-WS-2026-01', vendorName: 'Google Cloud', amount: 162000, date: '2025-12-20', status: 'Approved', matchStatus: '3-Way Match', poNumber: 'PO-2026-001' },
  { id: 'INV-006', invoiceNumber: 'SNOW-SUB-2026', vendorName: 'ServiceNow', amount: 198000, date: '2026-02-01', status: 'Pending', matchStatus: '2-Way Match', poNumber: 'PO-2026-003' },
  { id: 'INV-007', invoiceNumber: 'WD-HCM-2026', vendorName: 'Workday Inc', amount: 210000, date: '2025-12-15', status: 'Approved', matchStatus: '3-Way Match', poNumber: 'PO-2026-005' },
  { id: 'INV-008', invoiceNumber: 'ORA-LIC-2026-Q1', vendorName: 'Oracle Corp', amount: 134000, date: '2026-01-10', status: 'Pending', matchStatus: 'Pending Match', poNumber: 'PO-2026-007' },
  { id: 'INV-009', invoiceNumber: 'ATLS-CLD-2026', vendorName: 'Atlassian', amount: 86400, date: '2025-12-28', status: 'Approved', matchStatus: '3-Way Match', poNumber: 'PO-2026-002' },
  { id: 'INV-010', invoiceNumber: 'HS-MKT-2026', vendorName: 'HubSpot', amount: 43200, date: '2026-01-15', status: 'Pending', matchStatus: '2-Way Match', poNumber: 'PO-2026-006' },
  { id: 'INV-011', invoiceNumber: 'AAPL-HW-2025-Q4', vendorName: 'Apple Inc', amount: 52000, date: '2025-11-20', status: 'Paid', matchStatus: '3-Way Match', poNumber: 'PO-2025-045' },
  { id: 'INV-012', invoiceNumber: 'SAP-SF-2025', vendorName: 'SAP SE', amount: 68000, date: '2025-10-25', status: 'Paid', matchStatus: '3-Way Match', poNumber: 'PO-2025-038' },
  { id: 'INV-013', invoiceNumber: 'ZOOM-BIZ-2025', vendorName: 'Zoom Video', amount: 18000, date: '2025-11-15', status: 'Paid', matchStatus: '3-Way Match', poNumber: 'PO-2025-043' },
  { id: 'INV-014', invoiceNumber: 'ADBE-CC-2025', vendorName: 'Adobe Systems', amount: 89000, date: '2025-04-05', status: 'Paid', matchStatus: '3-Way Match' },
  { id: 'INV-015', invoiceNumber: 'SLACK-BIZ-2025', vendorName: 'Slack Technologies', amount: 54000, date: '2025-08-01', status: 'Paid', matchStatus: '3-Way Match' },
];

// -----------------------------------------------------------------------------
// Sourcing Projects (8)
// -----------------------------------------------------------------------------

export const mockSourcingProjects: SourcingProject[] = [
  { id: 'SRC-001', title: 'Cloud Infrastructure Consolidation RFP', status: 'Active', owner: 'Alex Rivera', budget: 2000000, dueDate: '2026-03-31', vendors: ['Amazon Web Services', 'Microsoft Azure', 'Google Cloud'], type: 'RFP' },
  { id: 'SRC-002', title: 'Marketing Automation Platform Selection', status: 'Completed', owner: 'Olivia Martinez', budget: 60000, dueDate: '2025-11-30', vendors: ['HubSpot', 'Marketo (Adobe)', 'Salesforce Marketing Cloud'], type: 'RFP' },
  { id: 'SRC-003', title: 'Office Supplies Vendor Consolidation', status: 'Active', owner: 'Samantha Wright', budget: 150000, dueDate: '2026-04-15', vendors: ['Staples', 'Office Depot', 'Amazon Business', 'W.B. Mason'], type: 'RFQ' },
  { id: 'SRC-004', title: 'Cybersecurity Penetration Testing Services', status: 'Evaluation', owner: 'James Wilson', budget: 50000, dueDate: '2026-02-28', vendors: ['CrowdStrike', 'Mandiant', 'Rapid7', 'NCC Group'], type: 'RFP' },
  { id: 'SRC-005', title: 'Employee Benefits Broker Review', status: 'Draft', owner: 'Rachel Green', budget: 80000, dueDate: '2026-06-30', vendors: ['Mercer', 'Aon', 'Willis Towers Watson'], type: 'RFP' },
  { id: 'SRC-006', title: 'Managed Print Services RFQ', status: 'Active', owner: 'Samantha Wright', budget: 35000, dueDate: '2026-03-15', vendors: ['Xerox', 'Ricoh', 'Canon'], type: 'RFQ' },
  { id: 'SRC-007', title: 'SAP S/4HANA Implementation Partner', status: 'Evaluation', owner: 'Frank Liu', budget: 5000000, dueDate: '2026-05-31', vendors: ['Deloitte', 'Accenture', 'EY', 'IBM Consulting', 'Capgemini'], type: 'RFP' },
  { id: 'SRC-008', title: 'Corporate Travel Management Program', status: 'Draft', owner: 'Kevin Brown', budget: 500000, dueDate: '2026-07-31', vendors: ['Concur (SAP)', 'Navan', 'TripActions', 'Egencia'], type: 'RFP' },
];

// -----------------------------------------------------------------------------
// AI Agents (15)
// -----------------------------------------------------------------------------

export const mockAIAgents: AIAgent[] = [
  {
    id: 'AGT-001', name: 'Intake Classifier', type: 'Reactive', domain: 'Intake Management',
    autonomyLevel: 'Level 3 - Supervised', status: 'Active', tasksCompleted: 12847,
    accuracy: 96.2, savingsGenerated: 185000, humanEscalationRate: 4.1,
    lastActive: '2026-02-08T08:45:00Z',
    hitlThreshold: 'Escalates when confidence < 85% or amount > $100K',
  },
  {
    id: 'AGT-002', name: 'Document Extraction', type: 'Reactive', domain: 'Intake Management',
    autonomyLevel: 'Level 4 - Autonomous', status: 'Active', tasksCompleted: 34521,
    accuracy: 98.1, savingsGenerated: 420000, humanEscalationRate: 1.8,
    lastActive: '2026-02-08T09:12:00Z',
    hitlThreshold: 'Escalates when OCR confidence < 90% or unrecognized document format',
  },
  {
    id: 'AGT-003', name: 'Routing & Assignment', type: 'Reactive', domain: 'Orchestration',
    autonomyLevel: 'Level 3 - Supervised', status: 'Active', tasksCompleted: 8932,
    accuracy: 94.7, savingsGenerated: 92000, humanEscalationRate: 5.3,
    lastActive: '2026-02-08T09:00:00Z',
    hitlThreshold: 'Escalates when no matching workflow found or cross-department approval needed',
  },
  {
    id: 'AGT-004', name: 'Tail Spend Negotiation', type: 'Proactive', domain: 'Buying & Execution',
    autonomyLevel: 'Level 4 - Autonomous', status: 'Active', tasksCompleted: 2156,
    accuracy: 91.3, savingsGenerated: 1240000, humanEscalationRate: 8.7,
    lastActive: '2026-02-08T07:30:00Z',
    hitlThreshold: 'Escalates when savings < 5% achievable or vendor relationship risk detected',
  },
  {
    id: 'AGT-005', name: 'Strategic Sourcing', type: 'Proactive', domain: 'Buying & Execution',
    autonomyLevel: 'Level 2 - Advisory', status: 'Active', tasksCompleted: 487,
    accuracy: 89.5, savingsGenerated: 3200000, humanEscalationRate: 42.1,
    lastActive: '2026-02-07T16:00:00Z',
    hitlThreshold: 'Always requires human approval for sourcing recommendations > $50K',
  },
  {
    id: 'AGT-006', name: 'Supplier Discovery', type: 'Proactive', domain: 'Supplier Management',
    autonomyLevel: 'Level 3 - Supervised', status: 'Active', tasksCompleted: 1823,
    accuracy: 87.9, savingsGenerated: 560000, humanEscalationRate: 12.4,
    lastActive: '2026-02-08T06:00:00Z',
    hitlThreshold: 'Escalates when diversity requirements not met or single-source situation',
  },
  {
    id: 'AGT-007', name: 'Risk Monitoring', type: 'Proactive', domain: 'Supplier Management',
    autonomyLevel: 'Level 4 - Autonomous', status: 'Active', tasksCompleted: 45230,
    accuracy: 95.8, savingsGenerated: 890000, humanEscalationRate: 3.2,
    lastActive: '2026-02-08T09:15:00Z',
    hitlThreshold: 'Escalates when risk score exceeds 70 or sanctions match detected',
  },
  {
    id: 'AGT-008', name: 'Contract Analysis', type: 'Reactive', domain: 'Contract Management',
    autonomyLevel: 'Level 3 - Supervised', status: 'Active', tasksCompleted: 3456,
    accuracy: 93.4, savingsGenerated: 1750000, humanEscalationRate: 15.2,
    lastActive: '2026-02-08T08:30:00Z',
    hitlThreshold: 'Escalates for non-standard clauses, indemnification changes, or liability caps',
  },
  {
    id: 'AGT-009', name: 'Contract Negotiation', type: 'Proactive', domain: 'Contract Management',
    autonomyLevel: 'Level 2 - Advisory', status: 'Active', tasksCompleted: 892,
    accuracy: 88.1, savingsGenerated: 2100000, humanEscalationRate: 55.3,
    lastActive: '2026-02-07T14:00:00Z',
    hitlThreshold: 'Always requires human approval before sending counter-proposals',
  },
  {
    id: 'AGT-010', name: 'Invoice Matching', type: 'Reactive', domain: 'Buying & Execution',
    autonomyLevel: 'Level 4 - Autonomous', status: 'Active', tasksCompleted: 28934,
    accuracy: 97.6, savingsGenerated: 340000, humanEscalationRate: 2.4,
    lastActive: '2026-02-08T09:10:00Z',
    hitlThreshold: 'Escalates when variance > 2% or no matching PO found',
  },
  {
    id: 'AGT-011', name: 'Spend Analytics', type: 'Proactive', domain: 'Analytics',
    autonomyLevel: 'Level 3 - Supervised', status: 'Active', tasksCompleted: 5670,
    accuracy: 92.8, savingsGenerated: 1560000, humanEscalationRate: 7.8,
    lastActive: '2026-02-08T06:00:00Z',
    hitlThreshold: 'Escalates when anomaly detected > 2 standard deviations from baseline',
  },
  {
    id: 'AGT-012', name: 'Compliance Checker', type: 'Reactive', domain: 'Compliance',
    autonomyLevel: 'Level 4 - Autonomous', status: 'Active', tasksCompleted: 18234,
    accuracy: 99.1, savingsGenerated: 280000, humanEscalationRate: 0.9,
    lastActive: '2026-02-08T09:05:00Z',
    hitlThreshold: 'Escalates when regulatory change detected or policy conflict identified',
  },
  {
    id: 'AGT-013', name: 'ESG Scoring', type: 'Proactive', domain: 'Sustainability',
    autonomyLevel: 'Level 3 - Supervised', status: 'Active', tasksCompleted: 2340,
    accuracy: 86.5, savingsGenerated: 0, humanEscalationRate: 18.9,
    lastActive: '2026-02-07T12:00:00Z',
    hitlThreshold: 'Escalates when ESG data unavailable or score drops > 10 points',
  },
  {
    id: 'AGT-014', name: 'Helpdesk / FAQ', type: 'Reactive', domain: 'User Support',
    autonomyLevel: 'Level 4 - Autonomous', status: 'Active', tasksCompleted: 67890,
    accuracy: 94.3, savingsGenerated: 520000, humanEscalationRate: 5.7,
    lastActive: '2026-02-08T09:20:00Z',
    hitlThreshold: 'Escalates when user satisfaction < 3/5 or query complexity exceeds knowledge base',
  },
  {
    id: 'AGT-015', name: 'Agent Orchestrator', type: 'Meta-Agent', domain: 'Platform',
    autonomyLevel: 'Level 3 - Supervised', status: 'Active', tasksCompleted: 156780,
    accuracy: 97.2, savingsGenerated: 0, humanEscalationRate: 2.1,
    lastActive: '2026-02-08T09:25:00Z',
    hitlThreshold: 'Escalates when inter-agent conflict detected or SLA breach imminent',
  },
];

// -----------------------------------------------------------------------------
// Integrations (8)
// -----------------------------------------------------------------------------

export const mockIntegrations: Integration[] = [
  { id: 'INT-001', name: 'SAP ERP (ECC 6.0)', type: 'ERP', status: 'Connected', lastSync: '2026-02-08T09:00:00Z', syncHealth: 98, recordsSynced: 1245890 },
  { id: 'INT-002', name: 'Workday HCM', type: 'HRIS', status: 'Connected', lastSync: '2026-02-08T08:00:00Z', syncHealth: 99, recordsSynced: 542300 },
  { id: 'INT-003', name: 'Salesforce CRM', type: 'CRM', status: 'Connected', lastSync: '2026-02-08T09:15:00Z', syncHealth: 97, recordsSynced: 892450 },
  { id: 'INT-004', name: 'NetSuite Financials', type: 'Finance', status: 'Connected', lastSync: '2026-02-08T07:30:00Z', syncHealth: 95, recordsSynced: 3456780 },
  { id: 'INT-005', name: 'Coupa Procurement', type: 'P2P', status: 'Connected', lastSync: '2026-02-08T09:10:00Z', syncHealth: 96, recordsSynced: 678900 },
  { id: 'INT-006', name: 'DocuSign eSignature', type: 'Contract', status: 'Connected', lastSync: '2026-02-08T08:45:00Z', syncHealth: 100, recordsSynced: 34560 },
  { id: 'INT-007', name: 'Dun & Bradstreet', type: 'Risk Data', status: 'Warning', lastSync: '2026-02-07T23:00:00Z', syncHealth: 82, recordsSynced: 15230 },
  { id: 'INT-008', name: 'Azure Active Directory', type: 'Identity', status: 'Connected', lastSync: '2026-02-08T09:20:00Z', syncHealth: 100, recordsSynced: 2500 },
];

// -----------------------------------------------------------------------------
// Notifications (20)
// -----------------------------------------------------------------------------

export const mockNotifications: Notification[] = [
  { id: 'NTF-001', title: 'Approval Required', message: 'REQ-006 "AWS Reserved Instances Q2" requires your procurement review. Amount: $380,000.', type: 'approval', timestamp: '2026-02-08T09:00:00Z', read: false },
  { id: 'NTF-002', title: 'Contract Expiring Soon', message: 'Salesforce Enterprise License Agreement (CTR-001) expires March 31, 2026. 51 days remaining.', type: 'warning', timestamp: '2026-02-08T06:00:00Z', read: false },
  { id: 'NTF-003', title: 'Invoice Matched', message: 'Invoice SF-2026-001234 from Salesforce.com has been 3-way matched with PO-2025-012.', type: 'info', timestamp: '2026-02-07T15:30:00Z', read: true },
  { id: 'NTF-004', title: 'Risk Alert - Vendor', message: 'Dell Technologies risk scan detected: "Server delivery delays reported". Current trust score: 88.', type: 'alert', timestamp: '2026-02-07T14:00:00Z', read: false },
  { id: 'NTF-005', title: 'Request Rejected', message: 'REQ-018 "Executive Team Building Retreat - Maldives" was rejected by Finance. Reason: Exceeds travel policy.', type: 'error', timestamp: '2026-01-05T14:05:00Z', read: true },
  { id: 'NTF-006', title: 'PO Shipped', message: 'PO-2026-004 (Dell PowerEdge servers) status updated to "Shipped". Expected delivery: Feb 15, 2026.', type: 'info', timestamp: '2026-02-06T10:00:00Z', read: true },
  { id: 'NTF-007', title: 'AI Agent Alert', message: 'Tail Spend Negotiation agent identified $45K savings opportunity on office supplies across 3 vendors.', type: 'info', timestamp: '2026-02-07T08:00:00Z', read: false },
  { id: 'NTF-008', title: 'Compliance Check Failed', message: 'Oracle Corp SOC2 report expires March 31, 2026. Renewal documentation required.', type: 'warning', timestamp: '2026-02-06T06:00:00Z', read: false },
  { id: 'NTF-009', title: 'Sourcing Project Update', message: 'Cloud Infrastructure Consolidation RFP (SRC-001) - 3 vendor responses received. Evaluation phase starting.', type: 'info', timestamp: '2026-02-05T16:00:00Z', read: true },
  { id: 'NTF-010', title: 'Budget Threshold Alert', message: 'IT department has consumed 78% of Q1 software budget ($892K of $1.14M allocated).', type: 'warning', timestamp: '2026-02-04T09:00:00Z', read: true },
  { id: 'NTF-011', title: 'New Request Submitted', message: 'REQ-009 "SAP S/4HANA Migration Assessment" submitted by Frank Liu. Amount: $450,000. Awaiting VP approval.', type: 'info', timestamp: '2026-01-05T07:35:00Z', read: true },
  { id: 'NTF-012', title: 'Integration Warning', message: 'Dun & Bradstreet sync health degraded to 82%. Last successful sync: 10 hours ago.', type: 'warning', timestamp: '2026-02-08T09:00:00Z', read: false },
  { id: 'NTF-013', title: 'Contract Auto-Renewal Notice', message: 'Adobe VIP Enterprise Agreement (CTR-009) will auto-renew on March 31. Cancel by March 1 if not renewing.', type: 'warning', timestamp: '2026-02-01T06:00:00Z', read: true },
  { id: 'NTF-014', title: 'Approval Completed', message: 'REQ-013 "Google Workspace Enterprise Renewal" fully approved. PO-2026-001 has been generated.', type: 'success', timestamp: '2025-12-19T14:30:00Z', read: true },
  { id: 'NTF-015', title: 'ESG Score Update', message: 'Apple Inc environmental score increased to 95 (+3) following carbon neutrality certification renewal.', type: 'info', timestamp: '2026-02-03T12:00:00Z', read: true },
  { id: 'NTF-016', title: 'Savings Milestone', message: 'AI agents have generated $12.34M in cumulative savings this fiscal year. Top performer: Strategic Sourcing ($3.2M).', type: 'success', timestamp: '2026-02-01T09:00:00Z', read: true },
  { id: 'NTF-017', title: 'Approval Required', message: 'REQ-007 "Marketing Agency - Brand Refresh" requires your finance review. Amount: $175,000.', type: 'approval', timestamp: '2026-01-09T08:00:00Z', read: false },
  { id: 'NTF-018', title: 'Vendor Onboarding Complete', message: 'HubSpot vendor onboarding completed. All compliance documents verified and approved.', type: 'success', timestamp: '2025-12-15T10:00:00Z', read: true },
  { id: 'NTF-019', title: 'Payment Processed', message: 'Payment of $290,000 to Microsoft Azure (Invoice MSFT-EA-2026-01) processed successfully via wire transfer.', type: 'info', timestamp: '2025-11-15T14:00:00Z', read: true },
  { id: 'NTF-020', title: 'Approval Required', message: 'REQ-012 "Zoom Enterprise License Upgrade" requires your finance review. Amount: $24,000.', type: 'approval', timestamp: '2026-01-20T10:30:00Z', read: false },
];

// -----------------------------------------------------------------------------
// Activity Log (15)
// -----------------------------------------------------------------------------

export const mockActivityLog: ActivityEntry[] = [
  { id: 'ACT-001', action: 'Submitted procurement request', user: 'Alex Rivera', target: 'REQ-006 - AWS Reserved Instances Q2', timestamp: '2026-01-10T08:00:00Z', type: 'request' },
  { id: 'ACT-002', action: 'Approved procurement request', user: 'Lisa Wong', target: 'REQ-006 - AWS Reserved Instances Q2', timestamp: '2026-01-11T09:00:00Z', type: 'approval' },
  { id: 'ACT-003', action: 'Completed 3-way invoice match', user: 'Invoice Matching Agent', target: 'INV-001 - Salesforce.com ($482,000)', timestamp: '2026-02-07T15:30:00Z', type: 'invoice' },
  { id: 'ACT-004', action: 'Generated purchase order', user: 'System', target: 'PO-2026-001 - Google Workspace ($162,000)', timestamp: '2025-12-20T10:00:00Z', type: 'po' },
  { id: 'ACT-005', action: 'Rejected procurement request', user: 'Robert Kim', target: 'REQ-018 - Executive Retreat Maldives', timestamp: '2026-01-05T14:00:00Z', type: 'rejection' },
  { id: 'ACT-006', action: 'Updated vendor risk scan', user: 'Risk Monitoring Agent', target: 'Dell Technologies - New findings detected', timestamp: '2026-01-20T06:00:00Z', type: 'vendor' },
  { id: 'ACT-007', action: 'Created sourcing project', user: 'Alex Rivera', target: 'SRC-001 - Cloud Infrastructure Consolidation RFP', timestamp: '2026-01-02T10:00:00Z', type: 'sourcing' },
  { id: 'ACT-008', action: 'Analyzed contract terms', user: 'Contract Analysis Agent', target: 'CTR-008 - Oracle Database ULA', timestamp: '2026-01-15T09:00:00Z', type: 'contract' },
  { id: 'ACT-009', action: 'Identified savings opportunity', user: 'Tail Spend Negotiation Agent', target: '$45K savings on office supplies consolidation', timestamp: '2026-02-07T08:00:00Z', type: 'savings' },
  { id: 'ACT-010', action: 'Completed vendor onboarding', user: 'Samantha Wright', target: 'HubSpot - All documents verified', timestamp: '2025-12-15T10:00:00Z', type: 'vendor' },
  { id: 'ACT-011', action: 'Processed payment', user: 'System', target: 'Microsoft Azure - $290,000 wire transfer', timestamp: '2025-11-15T14:00:00Z', type: 'payment' },
  { id: 'ACT-012', action: 'Escalated to human reviewer', user: 'Intake Classifier Agent', target: 'REQ-009 - SAP Consulting ($450K exceeds threshold)', timestamp: '2026-01-05T07:32:00Z', type: 'escalation' },
  { id: 'ACT-013', action: 'Updated ESG scores', user: 'ESG Scoring Agent', target: 'Apple Inc - Environmental score +3 to 95', timestamp: '2026-02-03T12:00:00Z', type: 'esg' },
  { id: 'ACT-014', action: 'Flagged compliance issue', user: 'Compliance Checker Agent', target: 'Oracle Corp SOC2 expiring March 2026', timestamp: '2026-02-06T06:00:00Z', type: 'compliance' },
  { id: 'ACT-015', action: 'Submitted procurement request', user: 'Frank Liu', target: 'REQ-009 - SAP S/4HANA Migration Assessment', timestamp: '2026-01-05T07:30:00Z', type: 'request' },
];

// -----------------------------------------------------------------------------
// Catalog Items (12)
// -----------------------------------------------------------------------------

export const mockCatalogItems: CatalogItem[] = [
  { id: 'CAT-001', name: 'MacBook Pro 16" M4 Max', description: 'Apple MacBook Pro 16-inch with M4 Max chip, 36GB RAM, 1TB SSD. Standard engineering spec.', price: 2599, vendorName: 'Apple Inc', category: 'Hardware - Laptops', deliveryTime: '5-7 business days' },
  { id: 'CAT-002', name: 'Dell Latitude 5550', description: 'Dell Latitude 5550, Intel Core Ultra 7, 16GB RAM, 512GB SSD. Standard business spec.', price: 1249, vendorName: 'Dell Technologies', category: 'Hardware - Laptops', deliveryTime: '3-5 business days' },
  { id: 'CAT-003', name: 'Dell 27" UltraSharp Monitor (U2724D)', description: 'Dell UltraSharp 27" QHD IPS monitor with USB-C hub. Dual monitor arm compatible.', price: 479, vendorName: 'Dell Technologies', category: 'Hardware - Monitors', deliveryTime: '3-5 business days' },
  { id: 'CAT-004', name: 'Herman Miller Aeron Chair', description: 'Herman Miller Aeron ergonomic office chair, Size B, graphite frame. 12-year warranty.', price: 1395, vendorName: 'Herman Miller', category: 'Facilities - Furniture', deliveryTime: '10-14 business days' },
  { id: 'CAT-005', name: 'Fully Jarvis Standing Desk', description: 'Fully Jarvis bamboo standing desk, 60x30", programmable height memory, cable management tray.', price: 749, vendorName: 'Fully (Hawthorne)', category: 'Facilities - Furniture', deliveryTime: '7-10 business days' },
  { id: 'CAT-006', name: 'Logitech MX Master 3S Mouse', description: 'Logitech MX Master 3S wireless mouse with MagSpeed scroll. USB-C charging, multi-device.', price: 99, vendorName: 'Logitech', category: 'Hardware - Peripherals', deliveryTime: '2-3 business days' },
  { id: 'CAT-007', name: 'Logitech MX Keys S Keyboard', description: 'Logitech MX Keys S wireless keyboard with smart backlighting. Multi-OS, multi-device support.', price: 109, vendorName: 'Logitech', category: 'Hardware - Peripherals', deliveryTime: '2-3 business days' },
  { id: 'CAT-008', name: 'Jabra Evolve2 85 Headset', description: 'Jabra Evolve2 85 wireless ANC headset with charging stand. UC certified for Teams/Zoom.', price: 449, vendorName: 'Jabra', category: 'Hardware - Audio', deliveryTime: '3-5 business days' },
  { id: 'CAT-009', name: 'Poly Studio X50 Video Bar', description: 'Poly Studio X50 all-in-one video bar for medium conference rooms. 4K camera, stereo speakers.', price: 2999, vendorName: 'Poly (HP)', category: 'Hardware - Video', deliveryTime: '5-7 business days' },
  { id: 'CAT-010', name: 'APC Smart-UPS 1500VA', description: 'APC Smart-UPS 1500VA LCD RM 2U 120V. Rack-mount UPS for server room power protection.', price: 899, vendorName: 'APC (Schneider)', category: 'Hardware - Infrastructure', deliveryTime: '5-7 business days' },
  { id: 'CAT-011', name: 'Cisco Meraki MR46 Access Point', description: 'Cisco Meraki MR46 Wi-Fi 6 cloud-managed access point. Enterprise-grade wireless for offices.', price: 1199, vendorName: 'Cisco Meraki', category: 'Hardware - Networking', deliveryTime: '7-10 business days' },
  { id: 'CAT-012', name: 'YubiKey 5 NFC Security Key', description: 'Yubico YubiKey 5 NFC multi-protocol security key. FIDO2, U2F, OTP. Required for privileged access.', price: 50, vendorName: 'Yubico', category: 'Hardware - Security', deliveryTime: '2-3 business days' },
];

// -----------------------------------------------------------------------------
// Monthly Analytics (12 months)
// -----------------------------------------------------------------------------

export const mockMonthlyAnalytics: MonthlyAnalytics[] = [
  { month: '2025-03', spend: 1820000, savings: 145000, poCount: 42, avgCycleTime: 8.2 },
  { month: '2025-04', spend: 2150000, savings: 198000, poCount: 51, avgCycleTime: 7.8 },
  { month: '2025-05', spend: 1960000, savings: 167000, poCount: 47, avgCycleTime: 7.5 },
  { month: '2025-06', spend: 2340000, savings: 212000, poCount: 56, avgCycleTime: 7.1 },
  { month: '2025-07', spend: 1780000, savings: 134000, poCount: 39, avgCycleTime: 8.0 },
  { month: '2025-08', spend: 1650000, savings: 128000, poCount: 36, avgCycleTime: 8.5 },
  { month: '2025-09', spend: 2080000, savings: 187000, poCount: 48, avgCycleTime: 7.3 },
  { month: '2025-10', spend: 2420000, savings: 234000, poCount: 58, avgCycleTime: 6.9 },
  { month: '2025-11', spend: 2680000, savings: 276000, poCount: 63, avgCycleTime: 6.5 },
  { month: '2025-12', spend: 3150000, savings: 342000, poCount: 74, avgCycleTime: 6.2 },
  { month: '2026-01', spend: 2890000, savings: 298000, poCount: 67, avgCycleTime: 6.0 },
  { month: '2026-02', spend: 1240000, savings: 112000, poCount: 28, avgCycleTime: 5.8 },
];

// -----------------------------------------------------------------------------
// Dashboard Summary Statistics (derived)
// -----------------------------------------------------------------------------

export const mockDashboardStats = {
  totalActiveRequests: mockRequests.filter(r => !['Rejected', 'Received'].includes(r.status)).length,
  totalPendingApprovals: mockRequests.filter(r => r.status === 'Pending Approval').length,
  totalVendors: mockVendors.length,
  preferredVendors: mockVendors.filter(v => v.isPreferred).length,
  activeContracts: mockContracts.filter(c => c.status === 'Active').length,
  totalContractValue: mockContracts.reduce((sum, c) => sum + c.value, 0),
  openPOs: mockPurchaseOrders.filter(po => !['Received', 'Cancelled'].includes(po.status)).length,
  pendingInvoices: mockInvoices.filter(inv => inv.status === 'Pending').length,
  activeSourcingProjects: mockSourcingProjects.filter(sp => ['Active', 'Evaluation'].includes(sp.status)).length,
  activeAIAgents: mockAIAgents.filter(a => a.status === 'Active').length,
  totalAISavings: mockAIAgents.reduce((sum, a) => sum + a.savingsGenerated, 0),
  avgAIAccuracy: Math.round((mockAIAgents.reduce((sum, a) => sum + a.accuracy, 0) / mockAIAgents.length) * 10) / 10,
  unreadNotifications: mockNotifications.filter(n => !n.read).length,
  totalSpendYTD: mockMonthlyAnalytics.reduce((sum, m) => sum + m.spend, 0),
  totalSavingsYTD: mockMonthlyAnalytics.reduce((sum, m) => sum + m.savings, 0),
  avgCycleTime: Math.round((mockMonthlyAnalytics.reduce((sum, m) => sum + m.avgCycleTime, 0) / mockMonthlyAnalytics.length) * 10) / 10,
  connectedIntegrations: mockIntegrations.filter(i => i.status === 'Connected').length,
  totalIntegrations: mockIntegrations.length,
};

// Aliases for backward compatibility / alternative import names
export const mockAgents = mockAIAgents;
export const mockActivityFeed = mockActivityLog;
export const mockAnalyticsData = {
  spendByCategory: [
    { category: 'Software', amount: 2820000, percentage: 34 },
    { category: 'Cloud Services', amount: 2120000, percentage: 26 },
    { category: 'Hardware', amount: 892000, percentage: 11 },
    { category: 'Consulting', amount: 745000, percentage: 9 },
    { category: 'HR Software', amount: 478000, percentage: 6 },
    { category: 'Marketing', amount: 340000, percentage: 4 },
    { category: 'Facilities', amount: 265000, percentage: 3 },
    { category: 'Other', amount: 560000, percentage: 7 },
  ],
  monthlySpend: mockMonthlyAnalytics.map(m => ({ month: m.month.split('-')[1] === '01' ? 'Jan' : m.month.split('-')[1] === '02' ? 'Feb' : m.month.split('-')[1] === '03' ? 'Mar' : m.month.split('-')[1] === '04' ? 'Apr' : m.month.split('-')[1] === '05' ? 'May' : m.month.split('-')[1] === '06' ? 'Jun' : m.month.split('-')[1] === '07' ? 'Jul' : m.month.split('-')[1] === '08' ? 'Aug' : m.month.split('-')[1] === '09' ? 'Sep' : m.month.split('-')[1] === '10' ? 'Oct' : m.month.split('-')[1] === '11' ? 'Nov' : 'Dec', amount: m.spend })),
  topSuppliers: [
    { name: 'Amazon Web Services', spend: 1240000 },
    { name: 'Microsoft Azure', spend: 580000 },
    { name: 'Salesforce.com', spend: 482000 },
    { name: 'Dell Technologies', spend: 412000 },
    { name: 'Workday Inc', spend: 210000 },
  ],
};
