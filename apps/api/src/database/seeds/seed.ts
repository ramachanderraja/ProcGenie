import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';

/**
 * Comprehensive seed script for ProcGenie S2P Platform.
 *
 * Run with:
 *   npx ts-node -r tsconfig-paths/register src/database/seeds/seed.ts
 *
 * Or via npm script:
 *   npm run seed
 */

const dataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT, 10) || 5432,
  username: process.env.DB_USERNAME || 'procgenie',
  password: process.env.DB_PASSWORD || 'procgenie_secret',
  database: process.env.DB_DATABASE || 'procgenie_dev',
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
  synchronize: true,
  logging: false,
  entities: [__dirname + '/../../**/*.entity{.ts,.js}'],
});

const TENANT_ID = 'GEP';

// ── UUID Helper ──────────────────────────────────────────────────────
function uuid(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// ── Pre-generated IDs ────────────────────────────────────────────────
const userIds = {
  admin: uuid(), procurementManager: uuid(), buyer: uuid(), finance: uuid(),
  legal: uuid(), requester1: uuid(), requester2: uuid(), supplierPortal: uuid(),
  sustainability: uuid(), itAdmin: uuid(), cpo: uuid(), analyst: uuid(),
};

const roleIds = {
  admin: uuid(), procurementManager: uuid(), buyer: uuid(), approver: uuid(),
  requester: uuid(), finance: uuid(), legal: uuid(), supplierPortal: uuid(),
  sustainabilityManager: uuid(), itAdmin: uuid(), cpo: uuid(), analyst: uuid(),
};

const S = {
  salesforce: uuid(), aws: uuid(), microsoft: uuid(), apple: uuid(),
  dell: uuid(), google: uuid(), slack: uuid(), zoom: uuid(),
  adobe: uuid(), atlassian: uuid(), workday: uuid(), serviceNow: uuid(),
  deloitte: uuid(), oracle: uuid(), sap: uuid(), staples: uuid(),
};

const C = {
  dellMsa: uuid(), awsFramework: uuid(), msLicense: uuid(), sfCrm: uuid(),
  oracleSow: uuid(), sapLicense: uuid(), deloitteSow: uuid(), adobeLicense: uuid(),
  googleCloud: uuid(), zoomSla: uuid(), workdayHr: uuid(), atlasSow: uuid(),
};

const R: Record<string, string> = {};
for (let i = 1; i <= 25; i++) R[`r${i}`] = uuid();

const PO: Record<string, string> = {};
for (let i = 1; i <= 15; i++) PO[`po${i}`] = uuid();

const INV: Record<string, string> = {};
for (let i = 1; i <= 10; i++) INV[`inv${i}`] = uuid();

const AG: Record<string, string> = {};
for (let i = 1; i <= 15; i++) AG[`ag${i}`] = uuid();

const SRC: Record<string, string> = {};
for (let i = 1; i <= 5; i++) SRC[`src${i}`] = uuid();

const INT: Record<string, string> = {};
for (let i = 1; i <= 8; i++) INT[`int${i}`] = uuid();

const WF: Record<string, string> = {};
for (let i = 1; i <= 3; i++) WF[`wf${i}`] = uuid();

// ── SQL escape helper ────────────────────────────────────────────────
function esc(val: string | null | undefined): string {
  if (val === null || val === undefined) return 'NULL';
  return `'${val.replace(/'/g, "''")}'`;
}

// ── Logging ──────────────────────────────────────────────────────────
function log(msg: string) {
  console.log(`[Seed] ${msg}`);
}

// ── Clear tables ─────────────────────────────────────────────────────
async function clearTables(qr: any) {
  log('Clearing existing data...');
  const tables = [
    'agent_decision_logs', 'agent_tasks', 'agents',
    'notifications',
    'three_way_matches', 'invoices',
    'goods_receipts', 'po_line_items', 'purchase_orders',
    'request_items', 'requests', 'request_templates',
    'evaluation_criteria', 'bids', 'sourcing_projects',
    'contract_clauses', 'approvals', 'contracts',
    'sync_jobs', 'integrations', 'connectors',
    'regulatory_alerts', 'carbon_footprints', 'esg_scores',
    'supplier_performance_scores', 'supplier_risk_profiles',
    'supplier_documents', 'catalog_items', 'suppliers',
    'workflow_steps', 'workflows',
    'user_roles', 'users', 'role_permissions', 'permissions', 'roles',
  ];
  for (const t of tables) {
    try { await qr.query(`DELETE FROM "${t}"`); } catch { /* table may not exist yet */ }
  }
}

// ══════════════════════════════════════════════════════════════════════
// SEED FUNCTIONS
// ══════════════════════════════════════════════════════════════════════

async function seedRoles(qr: any) {
  log('Seeding roles...');
  const roles = [
    [roleIds.admin, 'admin', 'System Administrator', 'Full system access', true],
    [roleIds.procurementManager, 'procurement_manager', 'Procurement Manager', 'Manages procurement operations', true],
    [roleIds.buyer, 'buyer', 'Buyer', 'Creates and manages purchase orders', true],
    [roleIds.approver, 'approver', 'Approver', 'Approves requests and POs', true],
    [roleIds.requester, 'requester', 'Requester', 'Creates purchase requests', true],
    [roleIds.finance, 'finance_manager', 'Finance Manager', 'Manages invoices and payments', true],
    [roleIds.legal, 'legal', 'Legal Counsel', 'Reviews and approves contracts', true],
    [roleIds.supplierPortal, 'supplier_portal', 'Supplier Portal User', 'Supplier-facing portal access', true],
    [roleIds.sustainabilityManager, 'sustainability_manager', 'Sustainability Manager', 'Manages ESG programs', true],
    [roleIds.itAdmin, 'it_admin', 'IT Administrator', 'Manages integrations and config', true],
    [roleIds.cpo, 'cpo', 'Chief Procurement Officer', 'Executive oversight', true],
    [roleIds.analyst, 'analyst', 'Procurement Analyst', 'Analytics and reporting', true],
  ];
  for (const [id, name, display, desc, isSys] of roles) {
    await qr.query(`INSERT INTO roles (id, name, display_name, description, is_system_role, tenant_id, created_at, updated_at) VALUES (${esc(id as string)}, ${esc(name as string)}, ${esc(display as string)}, ${esc(desc as string)}, ${isSys}, ${esc(TENANT_ID)}, NOW(), NOW()) ON CONFLICT (id) DO NOTHING`);
  }
}

async function seedUsers(qr: any) {
  log('Seeding users...');
  const pw = await bcrypt.hash('ProcGenie2025!', 10);
  const users = [
    { id: userIds.admin, email: 'admin@acme.com', fn: 'Sarah', ln: 'Chen', title: 'System Administrator', dept: 'IT', role: roleIds.admin },
    { id: userIds.procurementManager, email: 'pm@acme.com', fn: 'Michael', ln: 'Torres', title: 'Senior Procurement Manager', dept: 'Procurement', role: roleIds.procurementManager },
    { id: userIds.buyer, email: 'buyer@acme.com', fn: 'Emily', ln: 'Johnson', title: 'Strategic Buyer', dept: 'Procurement', role: roleIds.buyer },
    { id: userIds.finance, email: 'finance@acme.com', fn: 'David', ln: 'Kim', title: 'Finance Manager', dept: 'Finance', role: roleIds.finance },
    { id: userIds.legal, email: 'legal@acme.com', fn: 'Jessica', ln: 'Williams', title: 'Legal Counsel', dept: 'Legal', role: roleIds.legal },
    { id: userIds.requester1, email: 'jsmith@acme.com', fn: 'James', ln: 'Smith', title: 'Engineering Manager', dept: 'Engineering', role: roleIds.requester },
    { id: userIds.requester2, email: 'agarcia@acme.com', fn: 'Ana', ln: 'Garcia', title: 'Marketing Director', dept: 'Marketing', role: roleIds.requester },
    { id: userIds.supplierPortal, email: 'supplier@dell.com', fn: 'Robert', ln: 'Dell', title: 'Account Manager', dept: 'Sales', role: roleIds.supplierPortal },
    { id: userIds.sustainability, email: 'esg@acme.com', fn: 'Priya', ln: 'Patel', title: 'Sustainability Manager', dept: 'ESG', role: roleIds.sustainabilityManager },
    { id: userIds.itAdmin, email: 'itadmin@acme.com', fn: 'Chris', ln: 'Anderson', title: 'IT Integration Specialist', dept: 'IT', role: roleIds.itAdmin },
    { id: userIds.cpo, email: 'cpo@acme.com', fn: 'Linda', ln: 'Zhang', title: 'Chief Procurement Officer', dept: 'Executive', role: roleIds.cpo },
    { id: userIds.analyst, email: 'analyst@acme.com', fn: 'Kevin', ln: 'Brown', title: 'Procurement Analyst', dept: 'Procurement', role: roleIds.analyst },
  ];
  for (const u of users) {
    await qr.query(`INSERT INTO users (id, email, password, first_name, last_name, title, department, status, is_sso_user, tenant_id, created_at, updated_at) VALUES (${esc(u.id)}, ${esc(u.email)}, ${esc(pw)}, ${esc(u.fn)}, ${esc(u.ln)}, ${esc(u.title)}, ${esc(u.dept)}, 'active', false, ${esc(TENANT_ID)}, NOW(), NOW()) ON CONFLICT (id) DO NOTHING`);
    await qr.query(`INSERT INTO user_roles (user_id, role_id) VALUES (${esc(u.id)}, ${esc(u.role)}) ON CONFLICT DO NOTHING`);
  }
}

async function seedSuppliers(qr: any) {
  log('Seeding 16 suppliers...');
  const suppliers = [
    { id: S.salesforce, code: 'SUP-001001', name: 'Salesforce Inc.', legal: 'Salesforce Inc.', taxId: '11-3527854', industry: 'Software', desc: 'Leading CRM and enterprise cloud platform provider', website: 'https://www.salesforce.com', contact: 'Marc Benioff', email: 'enterprise@salesforce.com', status: 'active', tier: 'strategic', cats: '{CRM,Software Licenses,Cloud Services}', city: 'San Francisco', state: 'CA', country: 'US', terms: 'Annual', score: 93.5 },
    { id: S.aws, code: 'SUP-001002', name: 'Amazon Web Services', legal: 'Amazon.com Inc.', taxId: '91-1646860', industry: 'Cloud Services', desc: 'Global cloud infrastructure and services provider', website: 'https://aws.amazon.com', contact: 'Jane Cloud', email: 'enterprise@aws.amazon.com', status: 'active', tier: 'strategic', cats: '{Cloud Services,Infrastructure,DevOps}', city: 'Seattle', state: 'WA', country: 'US', terms: 'Net 30', score: 91.0 },
    { id: S.microsoft, code: 'SUP-001003', name: 'Microsoft Corporation', legal: 'Microsoft Corp.', taxId: '91-1144442', industry: 'Software', desc: 'Enterprise software, cloud computing, and productivity tools', website: 'https://www.microsoft.com', contact: 'John Azure', email: 'licensing@microsoft.com', status: 'active', tier: 'strategic', cats: '{Software Licenses,Cloud Services,Productivity}', city: 'Redmond', state: 'WA', country: 'US', terms: 'Net 30', score: 95.0 },
    { id: S.apple, code: 'SUP-001004', name: 'Apple Inc.', legal: 'Apple Inc.', taxId: '94-2404110', industry: 'IT Hardware', desc: 'Consumer electronics and enterprise device management', website: 'https://www.apple.com', contact: 'Lisa Hardware', email: 'business@apple.com', status: 'active', tier: 'preferred', cats: '{IT Equipment,Laptops,Mobile Devices}', city: 'Cupertino', state: 'CA', country: 'US', terms: 'Net 30', score: 90.0 },
    { id: S.dell, code: 'SUP-001005', name: 'Dell Technologies', legal: 'Dell Inc.', taxId: '75-2589680', industry: 'IT Hardware', desc: 'Enterprise IT hardware, servers, and infrastructure', website: 'https://www.dell.com', contact: 'Robert Dell', email: 'enterprise@dell.com', status: 'active', tier: 'strategic', cats: '{IT Equipment,Laptops,Servers,Storage}', city: 'Round Rock', state: 'TX', country: 'US', terms: 'Net 30', score: 92.5 },
    { id: S.google, code: 'SUP-001006', name: 'Google Cloud', legal: 'Alphabet Inc.', taxId: '61-1767919', industry: 'Cloud Services', desc: 'Cloud computing, AI/ML services, and workspace tools', website: 'https://cloud.google.com', contact: 'Sam Cloud', email: 'enterprise@google.com', status: 'active', tier: 'preferred', cats: '{Cloud Services,AI/ML,Productivity}', city: 'Mountain View', state: 'CA', country: 'US', terms: 'Net 30', score: 89.0 },
    { id: S.slack, code: 'SUP-001007', name: 'Slack Technologies', legal: 'Slack Technologies LLC', taxId: '46-4689498', industry: 'Software', desc: 'Enterprise team communication and collaboration platform', website: 'https://slack.com', contact: 'Tom Comms', email: 'enterprise@slack.com', status: 'active', tier: 'approved', cats: '{Software Licenses,Communication}', city: 'San Francisco', state: 'CA', country: 'US', terms: 'Annual', score: 82.0 },
    { id: S.zoom, code: 'SUP-001008', name: 'Zoom Video Communications', legal: 'Zoom Video Communications Inc.', taxId: '61-1648780', industry: 'Software', desc: 'Video conferencing and unified communications', website: 'https://zoom.us', contact: 'Eric Video', email: 'enterprise@zoom.us', status: 'active', tier: 'approved', cats: '{Software Licenses,Communication,Video}', city: 'San Jose', state: 'CA', country: 'US', terms: 'Annual', score: 80.5 },
    { id: S.adobe, code: 'SUP-001009', name: 'Adobe Inc.', legal: 'Adobe Inc.', taxId: '77-0019522', industry: 'Software', desc: 'Creative, document, and experience cloud solutions', website: 'https://www.adobe.com', contact: 'Amy Creative', email: 'enterprise@adobe.com', status: 'active', tier: 'preferred', cats: '{Software Licenses,Creative Tools,Document Management}', city: 'San Jose', state: 'CA', country: 'US', terms: 'Annual', score: 88.5 },
    { id: S.atlassian, code: 'SUP-001010', name: 'Atlassian Corporation', legal: 'Atlassian Corp.', taxId: '20-3780867', industry: 'Software', desc: 'Project management, issue tracking, and collaboration tools', website: 'https://www.atlassian.com', contact: 'Mike Agile', email: 'enterprise@atlassian.com', status: 'active', tier: 'preferred', cats: '{Software Licenses,Project Management,DevOps}', city: 'Sydney', state: null, country: 'AU', terms: 'Annual', score: 87.0 },
    { id: S.workday, code: 'SUP-001011', name: 'Workday Inc.', legal: 'Workday Inc.', taxId: '26-1435727', industry: 'Software', desc: 'Enterprise cloud ERP for HR and finance', website: 'https://www.workday.com', contact: 'Dana HR', email: 'enterprise@workday.com', status: 'active', tier: 'strategic', cats: '{Software Licenses,HRIS,ERP}', city: 'Pleasanton', state: 'CA', country: 'US', terms: 'Annual', score: 91.5 },
    { id: S.serviceNow, code: 'SUP-001012', name: 'ServiceNow Inc.', legal: 'ServiceNow Inc.', taxId: '20-0847504', industry: 'Software', desc: 'IT service management and digital workflows', website: 'https://www.servicenow.com', contact: 'Pat ITSM', email: 'enterprise@servicenow.com', status: 'active', tier: 'preferred', cats: '{Software Licenses,ITSM,Workflow}', city: 'Santa Clara', state: 'CA', country: 'US', terms: 'Annual', score: 89.5 },
    { id: S.deloitte, code: 'SUP-001013', name: 'Deloitte Consulting', legal: 'Deloitte LLP', taxId: '06-1067904', industry: 'Professional Services', desc: 'Management consulting, audit, and advisory services', website: 'https://www.deloitte.com', contact: 'Tom Advisor', email: 'sourcing@deloitte.com', status: 'active', tier: 'preferred', cats: '{Professional Services,Consulting,Audit}', city: 'New York', state: 'NY', country: 'US', terms: 'Net 60', score: 86.5 },
    { id: S.oracle, code: 'SUP-001014', name: 'Oracle Corporation', legal: 'Oracle Corp.', taxId: '54-2185193', industry: 'Software', desc: 'Enterprise database, cloud applications, and ERP systems', website: 'https://www.oracle.com', contact: 'Larry DB', email: 'enterprise@oracle.com', status: 'active', tier: 'strategic', cats: '{Software Licenses,Database,ERP,Cloud Services}', city: 'Austin', state: 'TX', country: 'US', terms: 'Net 45', score: 88.0 },
    { id: S.sap, code: 'SUP-001015', name: 'SAP SE', legal: 'SAP SE', taxId: 'DE-143293856', industry: 'Software', desc: 'Enterprise resource planning and business process solutions', website: 'https://www.sap.com', contact: 'Hans ERP', email: 'enterprise@sap.com', status: 'active', tier: 'strategic', cats: '{Software Licenses,ERP,Supply Chain}', city: 'Walldorf', state: null, country: 'DE', terms: 'Net 45', score: 90.5 },
    { id: S.staples, code: 'SUP-001016', name: 'Staples Inc.', legal: 'Staples Inc.', taxId: '04-2896127', industry: 'Office Supplies', desc: 'Office supplies, furniture, and breakroom essentials', website: 'https://www.staples.com', contact: 'Lisa Supplies', email: 'b2b@staples.com', status: 'active', tier: 'approved', cats: '{Office Supplies,Furniture,Breakroom}', city: 'Framingham', state: 'MA', country: 'US', terms: 'Net 30', score: 78.0 },
  ];
  for (const s of suppliers) {
    await qr.query(`INSERT INTO suppliers (id, supplier_code, company_name, legal_name, tax_id, industry, description, website, contact_name, contact_email, status, tier, categories, city, state, country, payment_terms, overall_score, tenant_id, created_by, created_at, updated_at) VALUES (${esc(s.id)}, ${esc(s.code)}, ${esc(s.name)}, ${esc(s.legal)}, ${esc(s.taxId)}, ${esc(s.industry)}, ${esc(s.desc)}, ${esc(s.website)}, ${esc(s.contact)}, ${esc(s.email)}, ${esc(s.status)}, ${esc(s.tier)}, '${s.cats}', ${esc(s.city)}, ${esc(s.state)}, ${esc(s.country)}, ${esc(s.terms)}, ${s.score}, ${esc(TENANT_ID)}, ${esc(userIds.procurementManager)}, NOW(), NOW()) ON CONFLICT (id) DO NOTHING`);
  }
}

async function seedCatalogItems(qr: any) {
  log('Seeding 22 catalog items...');
  const items = [
    { sku: 'IT-LAPTOP-001', name: 'MacBook Pro 16-inch M3 Max', desc: 'High-performance laptop for development', cat: 'IT Equipment', price: 3499.00, suppId: S.apple, lead: 5 },
    { sku: 'IT-LAPTOP-002', name: 'Dell Latitude 7440', desc: 'Enterprise business laptop', cat: 'IT Equipment', price: 1899.00, suppId: S.dell, lead: 3 },
    { sku: 'IT-LAPTOP-003', name: 'Dell XPS 15', desc: 'Premium ultrabook for executives', cat: 'IT Equipment', price: 2499.00, suppId: S.dell, lead: 5 },
    { sku: 'IT-MONITOR-001', name: 'Dell UltraSharp 32 4K Monitor', desc: '32-inch 4K USB-C hub monitor', cat: 'IT Equipment', price: 749.00, suppId: S.dell, lead: 3 },
    { sku: 'IT-SERVER-001', name: 'Dell PowerEdge R760 Server', desc: 'Enterprise rack server', cat: 'IT Equipment', price: 12500.00, suppId: S.dell, lead: 14 },
    { sku: 'SW-CRM-001', name: 'Salesforce Enterprise License', desc: 'Salesforce Enterprise Edition per user/year', cat: 'Software Licenses', price: 1800.00, suppId: S.salesforce, lead: 1 },
    { sku: 'SW-CLOUD-001', name: 'AWS Reserved Instance - m5.xlarge', desc: 'AWS EC2 reserved instance 1-year', cat: 'Cloud Services', price: 8400.00, suppId: S.aws, lead: 1 },
    { sku: 'SW-CLOUD-002', name: 'Azure Enterprise Subscription', desc: 'Microsoft Azure enterprise agreement', cat: 'Cloud Services', price: 12000.00, suppId: S.microsoft, lead: 1 },
    { sku: 'SW-CLOUD-003', name: 'Google Cloud Platform Credits', desc: 'GCP committed use discount plan', cat: 'Cloud Services', price: 10000.00, suppId: S.google, lead: 1 },
    { sku: 'SW-COLLAB-001', name: 'Slack Business+ License', desc: 'Slack Business+ per user/year', cat: 'Software Licenses', price: 150.00, suppId: S.slack, lead: 1 },
    { sku: 'SW-COLLAB-002', name: 'Zoom Enterprise License', desc: 'Zoom enterprise per user/year', cat: 'Software Licenses', price: 240.00, suppId: S.zoom, lead: 1 },
    { sku: 'SW-CREATE-001', name: 'Adobe Creative Cloud License', desc: 'Adobe CC All Apps per user/year', cat: 'Software Licenses', price: 899.00, suppId: S.adobe, lead: 1 },
    { sku: 'SW-PM-001', name: 'Jira Cloud Premium License', desc: 'Atlassian Jira Cloud Premium per user/year', cat: 'Software Licenses', price: 175.00, suppId: S.atlassian, lead: 1 },
    { sku: 'SW-ITSM-001', name: 'ServiceNow ITSM Pro License', desc: 'ServiceNow IT Service Management Pro', cat: 'Software Licenses', price: 1200.00, suppId: S.serviceNow, lead: 1 },
    { sku: 'SW-ERP-001', name: 'Oracle ERP Cloud License', desc: 'Oracle Fusion ERP Cloud per user/year', cat: 'Software Licenses', price: 2400.00, suppId: S.oracle, lead: 3 },
    { sku: 'SW-ERP-002', name: 'SAP S/4HANA Cloud License', desc: 'SAP S/4HANA Cloud per user/year', cat: 'Software Licenses', price: 2800.00, suppId: S.sap, lead: 5 },
    { sku: 'SW-HR-001', name: 'Workday HCM License', desc: 'Workday Human Capital Management', cat: 'Software Licenses', price: 1600.00, suppId: S.workday, lead: 1 },
    { sku: 'OF-SUPPLY-001', name: 'Office Supply Bundle - Standard', desc: 'Monthly office supply kit (paper, pens, toner)', cat: 'Office Supplies', price: 89.00, suppId: S.staples, lead: 2 },
    { sku: 'OF-FURN-001', name: 'Herman Miller Aeron Chair', desc: 'Ergonomic office chair - Size B', cat: 'Office Furniture', price: 1395.00, suppId: S.staples, lead: 10 },
    { sku: 'OF-FURN-002', name: 'Standing Desk - Electric', desc: 'Height-adjustable standing desk 60x30', cat: 'Office Furniture', price: 699.00, suppId: S.staples, lead: 7 },
    { sku: 'PS-CONSULT-001', name: 'Deloitte Strategy Consulting', desc: 'Strategy consulting engagement per day', cat: 'Professional Services', price: 5500.00, suppId: S.deloitte, lead: 10 },
    { sku: 'PS-CONSULT-002', name: 'Deloitte Technology Advisory', desc: 'Technology advisory services per day', cat: 'Professional Services', price: 4800.00, suppId: S.deloitte, lead: 10 },
  ];
  for (const i of items) {
    await qr.query(`INSERT INTO catalog_items (id, sku, name, description, category, unit_price, currency, unit_of_measure, supplier_id, is_active, lead_time_days, tenant_id, created_at, updated_at) VALUES (${esc(uuid())}, ${esc(i.sku)}, ${esc(i.name)}, ${esc(i.desc)}, ${esc(i.cat)}, ${i.price}, 'USD', 'EA', ${esc(i.suppId)}, true, ${i.lead}, ${esc(TENANT_ID)}, NOW(), NOW()) ON CONFLICT (id) DO NOTHING`);
  }
}

async function seedContracts(qr: any) {
  log('Seeding 12 contracts...');
  const contracts = [
    { id: C.dellMsa, num: 'CON-2024-000101', title: 'Master Service Agreement - Dell Technologies', type: 'msa', status: 'active', suppId: S.dell, val: 2500000, start: '2024-01-01', end: '2026-12-31', auto: true, pay: 'Net 30', law: 'State of Delaware, USA' },
    { id: C.awsFramework, num: 'CON-2025-000102', title: 'Cloud Infrastructure Framework - AWS', type: 'framework', status: 'active', suppId: S.aws, val: 1200000, start: '2025-01-01', end: '2027-12-31', auto: true, pay: 'Net 30', law: 'State of Washington, USA' },
    { id: C.msLicense, num: 'CON-2024-000103', title: 'Enterprise License Agreement - Microsoft', type: 'license', status: 'active', suppId: S.microsoft, val: 850000, start: '2024-07-01', end: '2027-06-30', auto: true, pay: 'Annual', law: 'State of Washington, USA' },
    { id: C.sfCrm, num: 'CON-2024-000104', title: 'CRM Platform Agreement - Salesforce', type: 'license', status: 'active', suppId: S.salesforce, val: 540000, start: '2024-04-01', end: '2027-03-31', auto: true, pay: 'Annual', law: 'State of California, USA' },
    { id: C.oracleSow, num: 'CON-2024-000105', title: 'ERP Migration SOW - Oracle', type: 'sow', status: 'active', suppId: S.oracle, val: 1800000, start: '2024-06-01', end: '2025-12-31', auto: false, pay: 'Net 45', law: 'State of Texas, USA' },
    { id: C.sapLicense, num: 'CON-2023-000106', title: 'S/4HANA Enterprise License - SAP', type: 'license', status: 'expired', suppId: S.sap, val: 2200000, start: '2023-01-01', end: '2024-12-31', auto: false, pay: 'Net 45', law: 'Federal Republic of Germany' },
    { id: C.deloitteSow, num: 'CON-2025-000107', title: 'Digital Transformation SOW - Deloitte', type: 'sow', status: 'in_review', suppId: S.deloitte, val: 1500000, start: '2025-03-01', end: '2026-08-31', auto: false, pay: 'Net 60', law: 'State of New York, USA' },
    { id: C.adobeLicense, num: 'CON-2024-000108', title: 'Creative Cloud Enterprise - Adobe', type: 'license', status: 'active', suppId: S.adobe, val: 180000, start: '2024-09-01', end: '2027-08-31', auto: true, pay: 'Annual', law: 'State of California, USA' },
    { id: C.googleCloud, num: 'CON-2025-000109', title: 'GCP Committed Use Agreement - Google', type: 'framework', status: 'draft', suppId: S.google, val: 960000, start: '2025-04-01', end: '2028-03-31', auto: true, pay: 'Net 30', law: 'State of California, USA' },
    { id: C.zoomSla, num: 'CON-2024-000110', title: 'Enterprise Communication SLA - Zoom', type: 'sla', status: 'expired', suppId: S.zoom, val: 96000, start: '2023-06-01', end: '2024-05-31', auto: false, pay: 'Annual', law: 'State of California, USA' },
    { id: C.workdayHr, num: 'CON-2024-000111', title: 'HCM Cloud Subscription - Workday', type: 'license', status: 'active', suppId: S.workday, val: 640000, start: '2024-01-01', end: '2026-12-31', auto: true, pay: 'Annual', law: 'State of California, USA' },
    { id: C.atlasSow, num: 'CON-2025-000112', title: 'DevOps Toolchain Implementation - Atlassian', type: 'sow', status: 'terminated', suppId: S.atlassian, val: 320000, start: '2024-09-01', end: '2025-06-30', auto: false, pay: 'Net 30', law: 'New South Wales, Australia' },
  ];
  for (const c of contracts) {
    await qr.query(`INSERT INTO contracts (id, contract_number, title, type, status, supplier_id, total_value, currency, start_date, end_date, owner_id, auto_renew, payment_terms, governing_law, tenant_id, created_by, created_at, updated_at) VALUES (${esc(c.id)}, ${esc(c.num)}, ${esc(c.title)}, ${esc(c.type)}, ${esc(c.status)}, ${esc(c.suppId)}, ${c.val}, 'USD', '${c.start}', '${c.end}', ${esc(userIds.procurementManager)}, ${c.auto}, ${esc(c.pay)}, ${esc(c.law)}, ${esc(TENANT_ID)}, ${esc(userIds.procurementManager)}, NOW(), NOW()) ON CONFLICT (id) DO NOTHING`);
  }
}

async function seedRequests(qr: any) {
  log('Seeding 25 intake requests...');
  const reqs = [
    // DRAFT (5)
    { id: R.r1, num: 'REQ-2025-000101', title: 'New developer laptops for Q3 interns', status: 'draft', pri: 'medium', cat: 'goods', total: 28000, reqer: userIds.requester1, cc: 'Engineering', by: '2025-07-01' },
    { id: R.r2, num: 'REQ-2025-000102', title: 'Office supplies restock - Building A', status: 'draft', pri: 'low', cat: 'goods', total: 2400, reqer: userIds.requester2, cc: 'Facilities', by: '2025-06-15' },
    { id: R.r3, num: 'REQ-2025-000103', title: 'Zoom Enterprise license renewal quote', status: 'draft', pri: 'medium', cat: 'software', total: 48000, reqer: userIds.itAdmin, cc: 'IT', by: '2025-08-01' },
    { id: R.r4, num: 'REQ-2025-000104', title: 'Ergonomic chairs for remote workers', status: 'draft', pri: 'low', cat: 'goods', total: 41850, reqer: userIds.requester2, cc: 'HR', by: '2025-09-01' },
    { id: R.r5, num: 'REQ-2025-000105', title: 'Security penetration testing services', status: 'draft', pri: 'high', cat: 'services', total: 75000, reqer: userIds.itAdmin, cc: 'InfoSec', by: '2025-06-30' },
    // PENDING_APPROVAL (7)
    { id: R.r6, num: 'REQ-2025-000106', title: 'Marketing automation platform upgrade', status: 'pending_approval', pri: 'medium', cat: 'software', total: 24000, reqer: userIds.requester2, cc: 'Marketing', by: '2025-05-01' },
    { id: R.r7, num: 'REQ-2025-000107', title: 'Cloud infrastructure expansion - AWS', status: 'pending_approval', pri: 'critical', cat: 'services', total: 180000, reqer: userIds.itAdmin, cc: 'IT Infrastructure', by: '2025-03-31' },
    { id: R.r8, num: 'REQ-2025-000108', title: 'Adobe Creative Cloud licenses (50 seats)', status: 'pending_approval', pri: 'medium', cat: 'software', total: 44950, reqer: userIds.requester2, cc: 'Design', by: '2025-04-15' },
    { id: R.r9, num: 'REQ-2025-000109', title: 'Standing desks for engineering floor', status: 'pending_approval', pri: 'low', cat: 'goods', total: 34950, reqer: userIds.requester1, cc: 'Engineering', by: '2025-07-01' },
    { id: R.r10, num: 'REQ-2025-000110', title: 'Deloitte strategy consulting engagement', status: 'pending_approval', pri: 'high', cat: 'services', total: 275000, reqer: userIds.cpo, cc: 'Executive', by: '2025-04-01' },
    { id: R.r11, num: 'REQ-2025-000111', title: 'ServiceNow ITSM implementation', status: 'pending_approval', pri: 'high', cat: 'software', total: 360000, reqer: userIds.itAdmin, cc: 'IT', by: '2025-06-01' },
    { id: R.r12, num: 'REQ-2025-000112', title: 'Annual Jira license renewal (200 seats)', status: 'pending_approval', pri: 'medium', cat: 'software', total: 35000, reqer: userIds.itAdmin, cc: 'IT', by: '2025-05-15' },
    // APPROVED (5)
    { id: R.r13, num: 'REQ-2025-000113', title: 'Engineering laptops for Q2 new hires', status: 'approved', pri: 'high', cat: 'goods', total: 45000, reqer: userIds.requester1, cc: 'Engineering', by: '2025-04-15' },
    { id: R.r14, num: 'REQ-2025-000114', title: 'Data center UPS replacement', status: 'approved', pri: 'critical', cat: 'goods', total: 125000, reqer: userIds.itAdmin, cc: 'IT Infrastructure', by: '2025-03-15' },
    { id: R.r15, num: 'REQ-2025-000115', title: 'Salesforce CRM additional 100 seats', status: 'approved', pri: 'medium', cat: 'software', total: 180000, reqer: userIds.procurementManager, cc: 'Sales', by: '2025-05-01' },
    { id: R.r16, num: 'REQ-2025-000116', title: 'Office furniture for new wing', status: 'approved', pri: 'low', cat: 'goods', total: 62000, reqer: userIds.requester1, cc: 'Facilities', by: '2025-06-30' },
    { id: R.r17, num: 'REQ-2025-000117', title: 'Workday HCM upgrade project', status: 'approved', pri: 'high', cat: 'software', total: 420000, reqer: userIds.procurementManager, cc: 'HR', by: '2025-04-01' },
    // REJECTED (3)
    { id: R.r18, num: 'REQ-2025-000118', title: 'Premium coffee machine for lobby', status: 'rejected', pri: 'low', cat: 'goods', total: 8500, reqer: userIds.requester2, cc: 'Facilities', by: '2025-06-01' },
    { id: R.r19, num: 'REQ-2025-000119', title: 'Personal iPad for each team lead', status: 'rejected', pri: 'low', cat: 'goods', total: 52000, reqer: userIds.requester1, cc: 'Engineering', by: '2025-05-01' },
    { id: R.r20, num: 'REQ-2025-000120', title: 'Unauthorized AI tool subscription', status: 'rejected', pri: 'medium', cat: 'software', total: 15000, reqer: userIds.requester2, cc: 'Marketing', by: '2025-04-15' },
    // PO_CREATED (3)
    { id: R.r21, num: 'REQ-2025-000121', title: 'Dell monitors for new hires', status: 'po_created', pri: 'medium', cat: 'goods', total: 22470, reqer: userIds.requester1, cc: 'Engineering', by: '2025-04-01' },
    { id: R.r22, num: 'REQ-2025-000122', title: 'AWS reserved instances Q2', status: 'po_created', pri: 'high', cat: 'services', total: 96000, reqer: userIds.itAdmin, cc: 'IT Infrastructure', by: '2025-04-01' },
    { id: R.r23, num: 'REQ-2025-000123', title: 'Staples Q1 office supply order', status: 'po_created', pri: 'low', cat: 'goods', total: 8500, reqer: userIds.requester2, cc: 'Facilities', by: '2025-03-15' },
    // COMPLETED (2)
    { id: R.r24, num: 'REQ-2025-000124', title: 'Microsoft 365 E5 annual renewal', status: 'completed', pri: 'high', cat: 'software', total: 380000, reqer: userIds.itAdmin, cc: 'IT', by: '2025-01-15' },
    { id: R.r25, num: 'REQ-2025-000125', title: 'Q4 2024 server hardware refresh', status: 'completed', pri: 'critical', cat: 'capex', total: 450000, reqer: userIds.itAdmin, cc: 'IT Infrastructure', by: '2024-12-31' },
  ];
  for (const r of reqs) {
    await qr.query(`INSERT INTO requests (id, request_number, title, status, priority, category, estimated_total, currency, requester_id, cost_center, needed_by_date, tenant_id, created_by, created_at, updated_at) VALUES (${esc(r.id)}, ${esc(r.num)}, ${esc(r.title)}, ${esc(r.status)}, ${esc(r.pri)}, ${esc(r.cat)}, ${r.total}, 'USD', ${esc(r.reqer)}, ${esc(r.cc)}, '${r.by}', ${esc(TENANT_ID)}, ${esc(r.reqer)}, NOW(), NOW()) ON CONFLICT (id) DO NOTHING`);
  }

  // Seed some request items for key requests
  log('Seeding request items...');
  const items = [
    { reqId: R.r13, desc: 'MacBook Pro 16-inch M3 Max', qty: 10, price: 3499, total: 34990 },
    { reqId: R.r13, desc: 'Dell UltraSharp 32 4K Monitor', qty: 10, price: 749, total: 7490 },
    { reqId: R.r14, desc: 'APC Smart-UPS 10kVA', qty: 5, price: 25000, total: 125000 },
    { reqId: R.r21, desc: 'Dell UltraSharp 32 4K Monitor', qty: 30, price: 749, total: 22470 },
    { reqId: R.r22, desc: 'AWS m5.xlarge Reserved Instance (1yr)', qty: 12, price: 8000, total: 96000 },
    { reqId: R.r23, desc: 'Office Supply Bundle - Standard', qty: 50, price: 89, total: 4450 },
    { reqId: R.r23, desc: 'Copy Paper Case (10 reams)', qty: 100, price: 40.50, total: 4050 },
  ];
  for (const it of items) {
    await qr.query(`INSERT INTO request_items (id, request_id, description, quantity, unit_of_measure, estimated_unit_price, total_price, tenant_id, created_at, updated_at) VALUES (${esc(uuid())}, ${esc(it.reqId)}, ${esc(it.desc)}, ${it.qty}, 'EA', ${it.price}, ${it.total}, ${esc(TENANT_ID)}, NOW(), NOW()) ON CONFLICT (id) DO NOTHING`);
  }
}

async function seedPurchaseOrders(qr: any) {
  log('Seeding 15 purchase orders...');
  const pos = [
    { id: PO.po1, num: 'PO-2025-000101', title: 'Engineering Laptops - MacBook Pro', status: 'sent_to_supplier', reqId: R.r13, suppId: S.apple, conId: null, total: 34990, cc: 'Engineering', pay: 'Net 30' },
    { id: PO.po2, num: 'PO-2025-000102', title: 'Dell Monitors for New Hires', status: 'sent_to_supplier', reqId: R.r21, suppId: S.dell, conId: C.dellMsa, total: 22470, cc: 'Engineering', pay: 'Net 30' },
    { id: PO.po3, num: 'PO-2025-000103', title: 'AWS Reserved Instances Q2', status: 'approved', reqId: R.r22, suppId: S.aws, conId: C.awsFramework, total: 96000, cc: 'IT Infrastructure', pay: 'Net 30' },
    { id: PO.po4, num: 'PO-2025-000104', title: 'Office Supplies Q1 Bulk Order', status: 'fully_received', reqId: R.r23, suppId: S.staples, conId: null, total: 8500, cc: 'Facilities', pay: 'Net 30' },
    { id: PO.po5, num: 'PO-2025-000105', title: 'Microsoft 365 E5 Annual Renewal', status: 'closed', reqId: R.r24, suppId: S.microsoft, conId: C.msLicense, total: 380000, cc: 'IT', pay: 'Annual' },
    { id: PO.po6, num: 'PO-2025-000106', title: 'Salesforce CRM 100 Additional Seats', status: 'pending_approval', reqId: R.r15, suppId: S.salesforce, conId: C.sfCrm, total: 180000, cc: 'Sales', pay: 'Annual' },
    { id: PO.po7, num: 'PO-2025-000107', title: 'Data Center UPS Replacement', status: 'draft', reqId: R.r14, suppId: S.dell, conId: C.dellMsa, total: 125000, cc: 'IT Infrastructure', pay: 'Net 30' },
    { id: PO.po8, num: 'PO-2025-000108', title: 'Server Hardware Refresh Q4 2024', status: 'invoiced', reqId: R.r25, suppId: S.dell, conId: C.dellMsa, total: 450000, cc: 'IT Infrastructure', pay: 'Net 30' },
    { id: PO.po9, num: 'PO-2025-000109', title: 'Office Furniture - New Wing', status: 'acknowledged', reqId: R.r16, suppId: S.staples, conId: null, total: 62000, cc: 'Facilities', pay: 'Net 30' },
    { id: PO.po10, num: 'PO-2025-000110', title: 'Adobe Creative Cloud 50 Seats', status: 'pending_approval', reqId: R.r8, suppId: S.adobe, conId: C.adobeLicense, total: 44950, cc: 'Design', pay: 'Annual' },
    { id: PO.po11, num: 'PO-2025-000111', title: 'Deloitte Strategy Engagement', status: 'draft', reqId: R.r10, suppId: S.deloitte, conId: C.deloitteSow, total: 275000, cc: 'Executive', pay: 'Net 60' },
    { id: PO.po12, num: 'PO-2025-000112', title: 'Workday HCM Upgrade', status: 'approved', reqId: R.r17, suppId: S.workday, conId: C.workdayHr, total: 420000, cc: 'HR', pay: 'Annual' },
    { id: PO.po13, num: 'PO-2025-000113', title: 'Google Cloud Platform Credits', status: 'partially_received', reqId: null, suppId: S.google, conId: null, total: 120000, cc: 'IT', pay: 'Net 30' },
    { id: PO.po14, num: 'PO-2025-000114', title: 'Jira Cloud Premium Renewal', status: 'sent_to_supplier', reqId: R.r12, suppId: S.atlassian, conId: null, total: 35000, cc: 'IT', pay: 'Annual' },
    { id: PO.po15, num: 'PO-2025-000115', title: 'Slack Business+ Renewal 500 seats', status: 'fully_received', reqId: null, suppId: S.slack, conId: null, total: 75000, cc: 'IT', pay: 'Annual' },
  ];
  for (const po of pos) {
    await qr.query(`INSERT INTO purchase_orders (id, po_number, title, status, request_id, supplier_id, contract_id, total_amount, currency, buyer_id, cost_center, payment_terms, tenant_id, created_by, created_at, updated_at) VALUES (${esc(po.id)}, ${esc(po.num)}, ${esc(po.title)}, ${esc(po.status)}, ${esc(po.reqId)}, ${esc(po.suppId)}, ${esc(po.conId)}, ${po.total}, 'USD', ${esc(userIds.buyer)}, ${esc(po.cc)}, ${esc(po.pay)}, ${esc(TENANT_ID)}, ${esc(userIds.buyer)}, NOW(), NOW()) ON CONFLICT (id) DO NOTHING`);
  }

  // Seed line items for key POs
  log('Seeding PO line items...');
  const lines = [
    { poId: PO.po1, line: 1, desc: 'MacBook Pro 16-inch M3 Max', qty: 10, price: 3499, total: 34990, recv: 0 },
    { poId: PO.po2, line: 1, desc: 'Dell UltraSharp 32 4K Monitor', qty: 30, price: 749, total: 22470, recv: 0 },
    { poId: PO.po3, line: 1, desc: 'AWS m5.xlarge Reserved Instance', qty: 12, price: 8000, total: 96000, recv: 0 },
    { poId: PO.po4, line: 1, desc: 'Office Supply Bundle', qty: 50, price: 89, total: 4450, recv: 50 },
    { poId: PO.po4, line: 2, desc: 'Copy Paper Case', qty: 100, price: 40.50, total: 4050, recv: 100 },
    { poId: PO.po5, line: 1, desc: 'Microsoft 365 E5 License (Annual)', qty: 500, price: 760, total: 380000, recv: 500 },
    { poId: PO.po8, line: 1, desc: 'Dell PowerEdge R760 Server', qty: 30, price: 12500, total: 375000, recv: 30 },
    { poId: PO.po8, line: 2, desc: 'Dell PowerVault Storage', qty: 5, price: 15000, total: 75000, recv: 5 },
  ];
  for (const l of lines) {
    await qr.query(`INSERT INTO po_line_items (id, purchase_order_id, line_number, description, quantity, unit_of_measure, unit_price, total_price, received_quantity, tenant_id, created_at, updated_at) VALUES (${esc(uuid())}, ${esc(l.poId)}, ${l.line}, ${esc(l.desc)}, ${l.qty}, 'EA', ${l.price}, ${l.total}, ${l.recv}, ${esc(TENANT_ID)}, NOW(), NOW()) ON CONFLICT (id) DO NOTHING`);
  }
}

async function seedInvoices(qr: any) {
  log('Seeding 10 invoices...');
  const invoices = [
    { id: INV.inv1, num: 'INV-2025-000101', sInv: 'DELL-INV-78945', status: 'matched', suppId: S.dell, sName: 'Dell Technologies', poId: PO.po8, sub: 450000, tax: 36000, total: 486000, iDate: '2025-01-15', dDate: '2025-02-14', pay: 'Net 30', cc: 'IT Infrastructure' },
    { id: INV.inv2, num: 'INV-2025-000102', sInv: 'AWS-202502-001', status: 'pending_approval', suppId: S.aws, sName: 'Amazon Web Services', poId: PO.po3, sub: 96000, tax: 0, total: 96000, iDate: '2025-02-01', dDate: '2025-03-03', pay: 'Net 30', cc: 'IT Infrastructure' },
    { id: INV.inv3, num: 'INV-2025-000103', sInv: 'STP-Q1-2025', status: 'paid', suppId: S.staples, sName: 'Staples Inc.', poId: PO.po4, sub: 8500, tax: 680, total: 9180, iDate: '2025-01-20', dDate: '2025-02-19', pay: 'Net 30', cc: 'Facilities' },
    { id: INV.inv4, num: 'INV-2025-000104', sInv: 'MSFT-EA-2025-001', status: 'approved', suppId: S.microsoft, sName: 'Microsoft Corporation', poId: PO.po5, sub: 380000, tax: 0, total: 380000, iDate: '2025-01-05', dDate: '2025-01-05', pay: 'Annual', cc: 'IT' },
    { id: INV.inv5, num: 'INV-2025-000105', sInv: 'DELL-MON-29384', status: 'received', suppId: S.dell, sName: 'Dell Technologies', poId: PO.po2, sub: 22470, tax: 1797.60, total: 24267.60, iDate: '2025-02-20', dDate: '2025-03-22', pay: 'Net 30', cc: 'Engineering' },
    { id: INV.inv6, num: 'INV-2025-000106', sInv: 'ADOBE-CC-Q1', status: 'scheduled_for_payment', suppId: S.adobe, sName: 'Adobe Inc.', poId: PO.po10, sub: 44950, tax: 0, total: 44950, iDate: '2025-02-10', dDate: '2025-02-10', pay: 'Annual', cc: 'Design' },
    { id: INV.inv7, num: 'INV-2025-000107', sInv: 'GCP-JAN-2025', status: 'pending_validation', suppId: S.google, sName: 'Google Cloud', poId: PO.po13, sub: 42000, tax: 0, total: 42000, iDate: '2025-02-01', dDate: '2025-03-03', pay: 'Net 30', cc: 'IT' },
    { id: INV.inv8, num: 'INV-2025-000108', sInv: 'SLK-ENT-2025', status: 'paid', suppId: S.slack, sName: 'Slack Technologies', poId: PO.po15, sub: 75000, tax: 0, total: 75000, iDate: '2025-01-10', dDate: '2025-01-10', pay: 'Annual', cc: 'IT' },
    { id: INV.inv9, num: 'INV-2025-000109', sInv: 'WDAY-HCM-Q1', status: 'exception', suppId: S.workday, sName: 'Workday Inc.', poId: PO.po12, sub: 435000, tax: 0, total: 435000, iDate: '2025-02-15', dDate: '2025-02-15', pay: 'Annual', cc: 'HR' },
    { id: INV.inv10, num: 'INV-2025-000110', sInv: 'ATL-JIRA-2025', status: 'received', suppId: S.atlassian, sName: 'Atlassian Corporation', poId: PO.po14, sub: 35000, tax: 0, total: 35000, iDate: '2025-02-25', dDate: '2025-03-27', pay: 'Annual', cc: 'IT' },
  ];
  for (const inv of invoices) {
    await qr.query(`INSERT INTO invoices (id, invoice_number, supplier_invoice_number, type, status, supplier_id, supplier_name, purchase_order_id, subtotal, tax_amount, total_amount, currency, invoice_date, due_date, payment_terms, cost_center, tenant_id, created_by, created_at, updated_at) VALUES (${esc(inv.id)}, ${esc(inv.num)}, ${esc(inv.sInv)}, 'standard', ${esc(inv.status)}, ${esc(inv.suppId)}, ${esc(inv.sName)}, ${esc(inv.poId)}, ${inv.sub}, ${inv.tax}, ${inv.total}, 'USD', '${inv.iDate}', '${inv.dDate}', ${esc(inv.pay)}, ${esc(inv.cc)}, ${esc(TENANT_ID)}, ${esc(userIds.finance)}, NOW(), NOW()) ON CONFLICT (id) DO NOTHING`);
  }
}

async function seedAgents(qr: any) {
  log('Seeding 15 AI agents...');
  const agents = [
    { id: AG.ag1, name: 'Intake Triage Agent', type: 'intake_analyst', desc: 'Analyzes incoming purchase requests, auto-categorizes, suggests suppliers, and estimates costs using historical spend data', status: 'active', rate: 94.2, time: 1850, done: 1247, fail: 72, hitl: false, thr: 75 },
    { id: AG.ag2, name: 'Spend Analytics Agent', type: 'spend_analyzer', desc: 'Analyzes procurement spend patterns across categories, identifies savings opportunities, maverick spend, and generates forecasts', status: 'active', rate: 96.5, time: 2100, done: 2150, fail: 78, hitl: false, thr: 70 },
    { id: AG.ag3, name: 'Contract Review Agent', type: 'contract_reviewer', desc: 'AI-powered contract analysis for risk identification, clause extraction, compliance verification, and obligation tracking', status: 'active', rate: 91.8, time: 4200, done: 389, fail: 35, hitl: true, thr: 85 },
    { id: AG.ag4, name: 'PO Automator Agent', type: 'catalog_manager', desc: 'Automatically generates purchase orders from approved requests, matches to catalog items and existing contracts', status: 'active', rate: 97.1, time: 950, done: 3420, fail: 102, hitl: false, thr: 90 },
    { id: AG.ag5, name: 'Supplier Risk Monitor', type: 'supplier_risk_assessor', desc: 'Continuously monitors supplier financial health, compliance status, geopolitical risk, and cyber security posture', status: 'active', rate: 89.5, time: 3500, done: 678, fail: 71, hitl: true, thr: 80 },
    { id: AG.ag6, name: 'Invoice Matching Agent', type: 'invoice_matcher', desc: 'Automated three-way matching of invoices against POs and goods receipts with tolerance checking', status: 'active', rate: 97.8, time: 850, done: 5420, fail: 120, hitl: false, thr: 90 },
    { id: AG.ag7, name: 'Compliance Monitor', type: 'compliance_monitor', desc: 'Tracks regulatory changes across jurisdictions and monitors procurement compliance with internal policies', status: 'active', rate: 93.0, time: 1200, done: 890, fail: 67, hitl: true, thr: 85 },
    { id: AG.ag8, name: 'Market Intelligence Agent', type: 'market_intelligence', desc: 'Scans market data for commodity pricing trends, supplier benchmarks, and industry insights', status: 'active', rate: 88.2, time: 5600, done: 456, fail: 56, hitl: false, thr: 75 },
    { id: AG.ag9, name: 'Negotiation Advisor', type: 'negotiation_advisor', desc: 'Provides data-driven negotiation strategies based on market analysis, historical pricing, and supplier leverage', status: 'idle', rate: 85.0, time: 3800, done: 234, fail: 42, hitl: true, thr: 80 },
    { id: AG.ag10, name: 'Demand Forecaster', type: 'demand_forecaster', desc: 'Predicts future procurement demand based on historical patterns, seasonal trends, and business growth', status: 'active', rate: 87.5, time: 4500, done: 567, fail: 78, hitl: false, thr: 70 },
    { id: AG.ag11, name: 'ESG Scoring Agent', type: 'esg_scorer', desc: 'Evaluates supplier ESG performance, calculates carbon footprint impact, and monitors sustainability certifications', status: 'active', rate: 90.3, time: 2800, done: 345, fail: 34, hitl: false, thr: 75 },
    { id: AG.ag12, name: 'Catalog Manager Agent', type: 'catalog_manager', desc: 'Maintains catalog accuracy, suggests price updates, identifies duplicate items, and manages supplier catalogs', status: 'idle', rate: 92.0, time: 1500, done: 890, fail: 72, hitl: false, thr: 80 },
    { id: AG.ag13, name: 'Approval Router', type: 'approval_router', desc: 'Intelligently routes approval requests based on amount thresholds, category rules, and approver availability', status: 'active', rate: 98.5, time: 200, done: 8920, fail: 134, hitl: false, thr: 95 },
    { id: AG.ag14, name: 'Exception Handler', type: 'exception_handler', desc: 'Automatically resolves common procurement exceptions like price variances, quantity mismatches, and missing data', status: 'active', rate: 86.0, time: 1800, done: 1234, fail: 202, hitl: true, thr: 80 },
    { id: AG.ag15, name: 'Reporting Agent', type: 'reporting_agent', desc: 'Generates automated procurement reports, dashboards, and executive summaries with natural language insights', status: 'active', rate: 95.0, time: 3200, done: 678, fail: 36, hitl: false, thr: 70 },
  ];
  for (const a of agents) {
    await qr.query(`INSERT INTO agents (id, name, type, description, status, model_id, version, success_rate, avg_response_time_ms, total_tasks_completed, total_tasks_failed, requires_hitl, confidence_threshold, max_concurrent_tasks, last_active_at, tenant_id, created_by, created_at, updated_at) VALUES (${esc(a.id)}, ${esc(a.name)}, ${esc(a.type)}, ${esc(a.desc)}, ${esc(a.status)}, 'gpt-4o', '1.0.0', ${a.rate}, ${a.time}, ${a.done}, ${a.fail}, ${a.hitl}, ${a.thr}, 5, NOW(), ${esc(TENANT_ID)}, ${esc(userIds.admin)}, NOW(), NOW()) ON CONFLICT (id) DO NOTHING`);
  }
}

async function seedSourcingProjects(qr: any) {
  log('Seeding 5 sourcing projects...');
  const projects = [
    { id: SRC.src1, num: 'SRC-2025-000101', title: 'Enterprise Laptop Fleet Renewal 2025', desc: 'Strategic sourcing for 500+ laptops for enterprise-wide fleet renewal', type: 'rfp', status: 'evaluation', cat: 'IT Equipment', val: 750000, startD: '2025-01-15', endD: '2025-02-28' },
    { id: SRC.src2, num: 'SRC-2025-000102', title: 'Cloud Services Consolidation', desc: 'Multi-cloud strategy evaluation for AWS, Azure, and GCP consolidation', type: 'rfq', status: 'bidding_open', cat: 'Cloud Services', val: 2000000, startD: '2025-02-01', endD: '2025-03-15' },
    { id: SRC.src3, num: 'SRC-2025-000103', title: 'Professional Services Panel Refresh', desc: 'Refresh of consulting services panel agreement for FY2026', type: 'rfp', status: 'published', cat: 'Professional Services', val: 5000000, startD: '2025-03-01', endD: '2025-04-30' },
    { id: SRC.src4, num: 'SRC-2025-000104', title: 'Office Supplies Category Review', desc: 'Annual review and sourcing of office supplies contracts', type: 'rfq', status: 'awarded', cat: 'Office Supplies', val: 350000, startD: '2024-11-01', endD: '2024-12-15' },
    { id: SRC.src5, num: 'SRC-2025-000105', title: 'Next-Gen ERP Platform Selection', desc: 'Strategic evaluation of ERP platforms for enterprise modernization', type: 'rfi', status: 'draft', cat: 'Software', val: 8000000, startD: null, endD: null },
  ];
  for (const p of projects) {
    await qr.query(`INSERT INTO sourcing_projects (id, project_number, title, description, type, status, category, estimated_value, currency, owner_id, is_sealed, bid_start_date, bid_end_date, tenant_id, created_by, created_at, updated_at) VALUES (${esc(p.id)}, ${esc(p.num)}, ${esc(p.title)}, ${esc(p.desc)}, ${esc(p.type)}, ${esc(p.status)}, ${esc(p.cat)}, ${p.val}, 'USD', ${esc(userIds.procurementManager)}, false, ${p.startD ? `'${p.startD}'` : 'NULL'}, ${p.endD ? `'${p.endD}'` : 'NULL'}, ${esc(TENANT_ID)}, ${esc(userIds.procurementManager)}, NOW(), NOW()) ON CONFLICT (id) DO NOTHING`);
  }

  // Seed bids
  log('Seeding bids...');
  const bids = [
    { num: 'BID-2025-000101', srcId: SRC.src1, suppId: S.dell, sName: 'Dell Technologies', status: 'under_evaluation', price: 680000, tech: 92, com: 85, over: 89.2, timeline: '4-6 weeks', pay: 'Net 30', warranty: '3-year ProSupport' },
    { num: 'BID-2025-000102', srcId: SRC.src1, suppId: S.apple, sName: 'Apple Inc.', status: 'under_evaluation', price: 820000, tech: 95, com: 72, over: 85.4, timeline: '3-5 weeks', pay: 'Net 30', warranty: '3-year AppleCare+' },
    { num: 'BID-2025-000103', srcId: SRC.src2, suppId: S.aws, sName: 'Amazon Web Services', status: 'submitted', price: 850000, tech: 94, com: 88, over: 91.6, timeline: 'Immediate', pay: 'Net 30', warranty: 'SLA-backed' },
    { num: 'BID-2025-000104', srcId: SRC.src2, suppId: S.microsoft, sName: 'Microsoft Corporation', status: 'submitted', price: 920000, tech: 91, com: 82, over: 87.4, timeline: 'Immediate', pay: 'Net 30', warranty: 'SLA-backed' },
    { num: 'BID-2025-000105', srcId: SRC.src2, suppId: S.google, sName: 'Google Cloud', status: 'submitted', price: 780000, tech: 89, com: 90, over: 89.4, timeline: 'Immediate', pay: 'Net 30', warranty: 'SLA-backed' },
    { num: 'BID-2025-000106', srcId: SRC.src4, suppId: S.staples, sName: 'Staples Inc.', status: 'awarded', price: 310000, tech: 78, com: 95, over: 85.8, timeline: '2-3 days', pay: 'Net 30', warranty: 'Standard' },
  ];
  for (const b of bids) {
    await qr.query(`INSERT INTO bids (id, bid_number, sourcing_project_id, supplier_id, supplier_name, status, total_price, currency, technical_score, commercial_score, overall_score, delivery_timeline, payment_terms, warranty_terms, submitted_at, tenant_id, created_by, created_at, updated_at) VALUES (${esc(uuid())}, ${esc(b.num)}, ${esc(b.srcId)}, ${esc(b.suppId)}, ${esc(b.sName)}, ${esc(b.status)}, ${b.price}, 'USD', ${b.tech}, ${b.com}, ${b.over}, ${esc(b.timeline)}, ${esc(b.pay)}, ${esc(b.warranty)}, NOW(), ${esc(TENANT_ID)}, ${esc(userIds.supplierPortal)}, NOW(), NOW()) ON CONFLICT (id) DO NOTHING`);
  }
}

async function seedIntegrations(qr: any) {
  log('Seeding connectors and integrations...');
  const connectors = [
    { code: 'sap_s4hana', name: 'SAP S/4HANA', desc: 'Enterprise ERP integration', cat: 'erp', vendor: 'SAP', ver: '2.1.0', prem: true, ents: '{purchase_orders,invoices,suppliers,contracts}', auth: '{oauth2,api_key}' },
    { code: 'salesforce_crm', name: 'Salesforce CRM', desc: 'CRM integration for supplier management', cat: 'crm', vendor: 'Salesforce', ver: '1.5.0', prem: false, ents: '{suppliers,contracts,contacts}', auth: '{oauth2}' },
    { code: 'workday_hcm', name: 'Workday HCM', desc: 'HR integration for employee and org data', cat: 'hr', vendor: 'Workday', ver: '1.3.0', prem: true, ents: '{employees,departments,cost_centers}', auth: '{oauth2}' },
    { code: 'docusign', name: 'DocuSign', desc: 'E-signature for contract execution', cat: 'e_signature', vendor: 'DocuSign', ver: '1.2.0', prem: false, ents: '{contracts}', auth: '{oauth2}' },
    { code: 'power_bi', name: 'Power BI', desc: 'Analytics and reporting dashboards', cat: 'analytics', vendor: 'Microsoft', ver: '1.0.0', prem: false, ents: '{reports,dashboards}', auth: '{oauth2}' },
    { code: 'coupa_bsm', name: 'Coupa BSM', desc: 'Business spend management', cat: 'erp', vendor: 'Coupa', ver: '1.0.0', prem: true, ents: '{purchase_orders,invoices,suppliers}', auth: '{oauth2,api_key}' },
    { code: 'stripe_pay', name: 'Stripe Payments', desc: 'Payment processing integration', cat: 'payment', vendor: 'Stripe', ver: '2.0.0', prem: false, ents: '{payments,invoices}', auth: '{api_key}' },
    { code: 'sharepoint', name: 'SharePoint Online', desc: 'Document management and storage', cat: 'document_management', vendor: 'Microsoft', ver: '1.1.0', prem: false, ents: '{documents,contracts}', auth: '{oauth2}' },
  ];
  for (const c of connectors) {
    await qr.query(`INSERT INTO connectors (id, connector_code, name, description, category, vendor, version, is_available, is_premium, supported_entities, auth_types, tenant_id, created_at, updated_at) VALUES (${esc(uuid())}, ${esc(c.code)}, ${esc(c.name)}, ${esc(c.desc)}, ${esc(c.cat)}, ${esc(c.vendor)}, ${esc(c.ver)}, true, ${c.prem}, '${c.ents}', '${c.auth}', ${esc(TENANT_ID)}, NOW(), NOW()) ON CONFLICT (id) DO NOTHING`);
  }

  const integrations = [
    { id: INT.int1, name: 'SAP S/4HANA - Production', desc: 'Primary ERP integration', type: 'erp', status: 'active', connId: 'sap_s4hana', freq: 'every_15_minutes', recs: 24580 },
    { id: INT.int2, name: 'Salesforce CRM', desc: 'CRM data sync', type: 'crm', status: 'active', connId: 'salesforce_crm', freq: 'hourly', recs: 8920 },
    { id: INT.int3, name: 'Workday HCM', desc: 'HR data sync for cost centers and approvers', type: 'hr', status: 'active', connId: 'workday_hcm', freq: 'daily', recs: 15400 },
    { id: INT.int4, name: 'DocuSign E-Signature', desc: 'Contract e-signature workflow', type: 'e_signature', status: 'active', connId: 'docusign', freq: 'realtime', recs: 2340 },
    { id: INT.int5, name: 'Power BI Analytics', desc: 'Spend analytics dashboards', type: 'analytics', status: 'active', connId: 'power_bi', freq: 'daily', recs: 45000 },
    { id: INT.int6, name: 'Coupa BSM (Legacy)', desc: 'Legacy procurement system bridge', type: 'erp', status: 'inactive', connId: 'coupa_bsm', freq: 'daily', recs: 120000 },
    { id: INT.int7, name: 'Stripe Payments', desc: 'Supplier payment processing', type: 'payment', status: 'active', connId: 'stripe_pay', freq: 'realtime', recs: 5680 },
    { id: INT.int8, name: 'SharePoint Documents', desc: 'Contract and document storage', type: 'document_management', status: 'active', connId: 'sharepoint', freq: 'realtime', recs: 18900 },
  ];
  for (const i of integrations) {
    await qr.query(`INSERT INTO integrations (id, name, description, type, status, connector_id, sync_frequency, records_synced, last_sync_at, last_sync_status, tenant_id, created_by, created_at, updated_at) VALUES (${esc(i.id)}, ${esc(i.name)}, ${esc(i.desc)}, ${esc(i.type)}, ${esc(i.status)}, ${esc(i.connId)}, ${esc(i.freq)}, ${i.recs}, ${i.status === 'active' ? 'NOW()' : 'NULL'}, ${i.status === 'active' ? "'success'" : 'NULL'}, ${esc(TENANT_ID)}, ${esc(userIds.itAdmin)}, NOW(), NOW()) ON CONFLICT (id) DO NOTHING`);
  }
}

async function seedSustainability(qr: any) {
  log('Seeding ESG scores...');
  const esg = [
    { suppId: S.dell, name: 'Dell Technologies', overall: 85.5, env: 82, social: 88, gov: 90, grade: 'A', certs: '{ISO 14001,Carbon Neutral,EPEAT Gold}' },
    { suppId: S.microsoft, name: 'Microsoft Corporation', overall: 92.0, env: 95, social: 89, gov: 91, grade: 'A+', certs: '{Carbon Negative,RE100,ISO 14001}' },
    { suppId: S.aws, name: 'Amazon Web Services', overall: 78.5, env: 75, social: 80, gov: 82, grade: 'B+', certs: '{RE100,Climate Pledge}' },
    { suppId: S.salesforce, name: 'Salesforce Inc.', overall: 90.0, env: 88, social: 94, gov: 89, grade: 'A', certs: '{Net Zero,1-1-1 Model,RE100}' },
    { suppId: S.google, name: 'Google Cloud', overall: 88.0, env: 92, social: 84, gov: 86, grade: 'A', certs: '{Carbon Neutral since 2007,RE100}' },
    { suppId: S.apple, name: 'Apple Inc.', overall: 87.0, env: 90, social: 82, gov: 88, grade: 'A', certs: '{Carbon Neutral,RE100,Zero Waste}' },
    { suppId: S.deloitte, name: 'Deloitte Consulting', overall: 82.0, env: 78, social: 88, gov: 80, grade: 'B+', certs: '{WorldClimate,SBTi}' },
    { suppId: S.workday, name: 'Workday Inc.', overall: 84.0, env: 80, social: 90, gov: 82, grade: 'A-', certs: '{Carbon Neutral,VERRA}' },
  ];
  for (const e of esg) {
    await qr.query(`INSERT INTO esg_scores (id, supplier_id, supplier_name, category, overall_score, environmental_score, social_score, governance_score, assessment_date, next_assessment_date, rating_grade, certifications, data_source, tenant_id, created_by, created_at, updated_at) VALUES (${esc(uuid())}, ${esc(e.suppId)}, ${esc(e.name)}, 'environmental', ${e.overall}, ${e.env}, ${e.social}, ${e.gov}, '2025-01-15', '2025-07-15', ${esc(e.grade)}, '${e.certs}', 'EcoVadis + Internal Assessment', ${esc(TENANT_ID)}, ${esc(userIds.sustainability)}, NOW(), NOW()) ON CONFLICT (id) DO NOTHING`);
  }

  log('Seeding carbon footprints...');
  const carbon = [
    { suppId: S.dell, name: 'Dell Technologies', type: 'supplier', scope: 'scope_3', co2: 4500, period: 'Q4 2024', start: '2024-10-01', end: '2024-12-31', kwh: 12000000, renew: 45.0, verif: 'verified' },
    { suppId: S.microsoft, name: 'Microsoft Corporation', type: 'supplier', scope: 'scope_2', co2: 1200, period: 'Q4 2024', start: '2024-10-01', end: '2024-12-31', kwh: 8500000, renew: 100.0, verif: 'verified' },
    { suppId: S.aws, name: 'Amazon Web Services', type: 'supplier', scope: 'scope_2', co2: 3800, period: 'Q4 2024', start: '2024-10-01', end: '2024-12-31', kwh: 15000000, renew: 65.0, verif: 'verified' },
    { suppId: null, name: 'IT Equipment Category', type: 'category', scope: 'scope_3', co2: 8200, period: 'Q4 2024', start: '2024-10-01', end: '2024-12-31', kwh: null, renew: null, verif: 'estimated' },
    { suppId: null, name: 'Professional Services', type: 'category', scope: 'scope_1', co2: 1500, period: 'Q4 2024', start: '2024-10-01', end: '2024-12-31', kwh: null, renew: null, verif: 'estimated' },
    { suppId: S.google, name: 'Google Cloud', type: 'supplier', scope: 'scope_2', co2: 950, period: 'Q4 2024', start: '2024-10-01', end: '2024-12-31', kwh: 6000000, renew: 100.0, verif: 'verified' },
  ];
  for (const c of carbon) {
    await qr.query(`INSERT INTO carbon_footprints (id, supplier_id, entity_name, entity_type, emission_scope, co2_emissions_tons, reporting_period, start_date, end_date, energy_consumption_kwh, renewable_energy_percentage, verification_status, data_source, tenant_id, created_by, created_at, updated_at) VALUES (${esc(uuid())}, ${esc(c.suppId)}, ${esc(c.name)}, ${esc(c.type)}, ${esc(c.scope)}, ${c.co2}, ${esc(c.period)}, '${c.start}', '${c.end}', ${c.kwh ?? 'NULL'}, ${c.renew ?? 'NULL'}, ${esc(c.verif)}, 'CDP + Supplier Self-Report', ${esc(TENANT_ID)}, ${esc(userIds.sustainability)}, NOW(), NOW()) ON CONFLICT (id) DO NOTHING`);
  }

  log('Seeding regulatory alerts...');
  const alerts = [
    { title: 'CSRD Reporting Deadline Q2 2025', desc: 'Corporate Sustainability Reporting Directive requires ESG disclosure for suppliers above revenue threshold', sev: 'high', status: 'acknowledged', reg: 'CSRD', body: 'European Commission', jur: 'European Union', deadline: '2025-06-30', cats: '{IT Equipment,Professional Services,Software Licenses}', impact: 'Affects 12 strategic suppliers requiring sustainability data collection and third-party verification' },
    { title: 'CBAM Phase 2 Implementation', desc: 'Carbon Border Adjustment Mechanism requires carbon content reporting for imported goods', sev: 'medium', status: 'new', reg: 'CBAM', body: 'European Commission', jur: 'European Union', deadline: '2025-12-31', cats: '{IT Equipment,Raw Materials}', impact: 'Impacts hardware imports from non-EU manufacturers including Dell and Apple supply chains' },
    { title: 'US Executive Order on AI Procurement', desc: 'New requirements for AI safety, transparency, and accountability in procurement technology', sev: 'medium', status: 'in_progress', reg: 'EO 14110', body: 'White House', jur: 'United States', deadline: '2025-09-01', cats: '{Software Licenses,IT Services,AI/ML}', impact: 'Relevant for AI-powered procurement tools and vendor selection criteria' },
    { title: 'California Supply Chain Transparency Act Update', desc: 'Updated requirements for supply chain human rights and labor practice disclosures', sev: 'low', status: 'new', reg: 'SB 657', body: 'California Legislature', jur: 'California, USA', deadline: '2025-12-31', cats: '{All Categories}', impact: 'Requires annual disclosure of supply chain verification and auditing efforts' },
  ];
  for (const a of alerts) {
    await qr.query(`INSERT INTO regulatory_alerts (id, title, description, severity, status, regulation_name, regulation_body, jurisdiction, compliance_deadline, affected_categories, impact_assessment, tenant_id, created_by, created_at, updated_at) VALUES (${esc(uuid())}, ${esc(a.title)}, ${esc(a.desc)}, ${esc(a.sev)}, ${esc(a.status)}, ${esc(a.reg)}, ${esc(a.body)}, ${esc(a.jur)}, '${a.deadline}', '${a.cats}', ${esc(a.impact)}, ${esc(TENANT_ID)}, ${esc(userIds.sustainability)}, NOW(), NOW()) ON CONFLICT (id) DO NOTHING`);
  }
}

async function seedWorkflows(qr: any) {
  log('Seeding 3 workflows...');
  const workflows = [
    { id: WF.wf1, name: 'Simple PO Approval', desc: 'Single-level approval for purchase orders under $10,000', type: 'approval', status: 'active', trigger: '{"minAmount": 0, "maxAmount": 10000, "entityType": "purchase_order"}' },
    { id: WF.wf2, name: 'Standard PO Approval', desc: 'Multi-level approval for purchase orders between $10,000 and $100,000', type: 'approval', status: 'active', trigger: '{"minAmount": 10000, "maxAmount": 100000, "entityType": "purchase_order"}' },
    { id: WF.wf3, name: 'Complex PO Approval', desc: 'Executive approval chain for purchase orders above $100,000', type: 'approval', status: 'active', trigger: '{"minAmount": 100000, "entityType": "purchase_order"}' },
  ];
  for (const w of workflows) {
    await qr.query(`INSERT INTO workflows (id, name, description, type, status, version, trigger_conditions, tenant_id, created_by, created_at, updated_at) VALUES (${esc(w.id)}, ${esc(w.name)}, ${esc(w.desc)}, ${esc(w.type)}, ${esc(w.status)}, 1, '${w.trigger}', ${esc(TENANT_ID)}, ${esc(userIds.admin)}, NOW(), NOW()) ON CONFLICT (id) DO NOTHING`);
  }

  // Workflow steps
  log('Seeding workflow steps...');
  const steps = [
    // Simple: 1 step
    { wfId: WF.wf1, name: 'Manager Approval', type: 'approval', order: 1, sla: 24, mandatory: true },
    // Standard: 3 steps
    { wfId: WF.wf2, name: 'AI Pre-screening', type: 'ai_review', order: 1, sla: 1, mandatory: true },
    { wfId: WF.wf2, name: 'Manager Approval', type: 'approval', order: 2, sla: 48, mandatory: true },
    { wfId: WF.wf2, name: 'Finance Review', type: 'approval', order: 3, sla: 24, mandatory: true },
    // Complex: 5 steps
    { wfId: WF.wf3, name: 'AI Pre-screening', type: 'ai_review', order: 1, sla: 1, mandatory: true },
    { wfId: WF.wf3, name: 'Department Manager Approval', type: 'approval', order: 2, sla: 48, mandatory: true },
    { wfId: WF.wf3, name: 'Finance Director Review', type: 'approval', order: 3, sla: 48, mandatory: true },
    { wfId: WF.wf3, name: 'Legal Review', type: 'approval', order: 4, sla: 72, mandatory: false },
    { wfId: WF.wf3, name: 'CPO Final Approval', type: 'approval', order: 5, sla: 24, mandatory: true },
  ];
  for (const s of steps) {
    await qr.query(`INSERT INTO workflow_steps (id, workflow_id, name, type, step_order, sla_hours, is_mandatory, tenant_id, created_at, updated_at) VALUES (${esc(uuid())}, ${esc(s.wfId)}, ${esc(s.name)}, ${esc(s.type)}, ${s.order}, ${s.sla}, ${s.mandatory}, ${esc(TENANT_ID)}, NOW(), NOW()) ON CONFLICT (id) DO NOTHING`);
  }
}

async function seedNotifications(qr: any) {
  log('Seeding notifications...');
  const notifs = [
    { recipId: userIds.procurementManager, title: 'HITL Checkpoint: Contract Review Required', msg: 'The Contract Review Agent has flagged the Dell MSA renewal for human review due to a high-risk auto-renewal clause.', type: 'agent_hitl', pri: 'high', entType: 'contract', entId: C.dellMsa, url: '/agents/hitl', label: 'Review Decision' },
    { recipId: userIds.finance, title: 'Invoice Pending Approval - AWS', msg: 'Invoice INV-2025-000102 from Amazon Web Services for $96,000 requires your approval.', type: 'approval_required', pri: 'medium', entType: 'invoice', entId: INV.inv2, url: '/invoices', label: 'Review Invoice' },
    { recipId: userIds.procurementManager, title: 'Sourcing Project Ready for Award', msg: 'Enterprise Laptop Fleet Renewal 2025 has completed bid evaluation. 2 bids received and scored.', type: 'sourcing_awarded', pri: 'medium', entType: 'sourcing_project', entId: SRC.src1, url: '/sourcing', label: 'View Bids' },
    { recipId: userIds.legal, title: 'Contract Expiring: Oracle ERP SOW', msg: 'ERP Migration SOW with Oracle expires on 2025-12-31. Review required for renewal decision.', type: 'contract_expiring', pri: 'high', entType: 'contract', entId: C.oracleSow, url: '/contracts', label: 'Review Contract' },
    { recipId: userIds.sustainability, title: 'New Regulatory Alert: CSRD', msg: 'CSRD reporting deadline approaching. 12 strategic suppliers require sustainability data collection.', type: 'regulatory_alert', pri: 'high', entType: null, entId: null, url: '/sustainability/regulatory-alerts', label: 'View Alert' },
    { recipId: userIds.cpo, title: 'Monthly Spend Report Available', msg: 'January 2025 spend analytics report is ready. Total spend: $2.1M across 16 active suppliers.', type: 'system_alert', pri: 'low', entType: null, entId: null, url: '/analytics', label: 'View Report' },
    { recipId: userIds.finance, title: 'Invoice Exception: Workday HCM', msg: 'Invoice INV-2025-000109 from Workday shows a $15,000 variance from PO amount. Review required.', type: 'invoice_exception', pri: 'high', entType: 'invoice', entId: INV.inv9, url: '/invoices', label: 'Resolve Exception' },
    { recipId: userIds.buyer, title: 'PO Acknowledged by Supplier', msg: 'Dell Technologies has acknowledged PO-2025-000102 for monitors. Expected delivery in 3-5 business days.', type: 'po_created', pri: 'low', entType: 'purchase_order', entId: PO.po2, url: '/buying/purchase-orders', label: 'View PO' },
  ];
  for (const n of notifs) {
    await qr.query(`INSERT INTO notifications (id, title, message, type, priority, channels, recipient_id, is_read, entity_type, entity_id, action_url, action_label, email_sent, tenant_id, created_at, updated_at) VALUES (${esc(uuid())}, ${esc(n.title)}, ${esc(n.msg)}, ${esc(n.type)}, ${esc(n.pri)}, '{in_app,email}', ${esc(n.recipId)}, false, ${esc(n.entType)}, ${esc(n.entId)}, ${esc(n.url)}, ${esc(n.label)}, false, ${esc(TENANT_ID)}, NOW(), NOW()) ON CONFLICT (id) DO NOTHING`);
  }
}

// ══════════════════════════════════════════════════════════════════════
// MAIN
// ══════════════════════════════════════════════════════════════════════
async function seed() {
  log('Connecting to database...');
  await dataSource.initialize();
  log('Database connected. Starting comprehensive seed...');

  const qr = dataSource.createQueryRunner();
  await qr.connect();

  try {
    await clearTables(qr);
    await seedRoles(qr);
    await seedUsers(qr);
    await seedSuppliers(qr);
    await seedCatalogItems(qr);
    await seedContracts(qr);
    await seedRequests(qr);
    await seedPurchaseOrders(qr);
    await seedInvoices(qr);
    await seedAgents(qr);
    await seedSourcingProjects(qr);
    await seedIntegrations(qr);
    await seedSustainability(qr);
    await seedWorkflows(qr);
    await seedNotifications(qr);

    log('');
    log('=== Seed completed successfully! ===');
    log('');
    log('  Summary:');
    log('  - 12 roles, 12 users');
    log('  - 16 suppliers, 22 catalog items');
    log('  - 12 contracts');
    log('  - 25 intake requests + request items');
    log('  - 15 purchase orders + line items');
    log('  - 10 invoices');
    log('  - 15 AI agents');
    log('  - 5 sourcing projects + 6 bids');
    log('  - 8 integrations + 8 connectors');
    log('  - 8 ESG scores, 6 carbon footprints, 4 regulatory alerts');
    log('  - 3 workflows + 9 workflow steps');
    log('  - 8 notifications');
    log('');
    log('  Login credentials:');
    log('  ──────────────────────────────────────────');
    log('  Admin:        admin@acme.com / ProcGenie2025!');
    log('  Proc Manager: pm@acme.com / ProcGenie2025!');
    log('  Buyer:        buyer@acme.com / ProcGenie2025!');
    log('  Finance:      finance@acme.com / ProcGenie2025!');
    log('  Legal:        legal@acme.com / ProcGenie2025!');
    log('  CPO:          cpo@acme.com / ProcGenie2025!');
    log('  Analyst:      analyst@acme.com / ProcGenie2025!');
    log('  IT Admin:     itadmin@acme.com / ProcGenie2025!');
    log('  ESG:          esg@acme.com / ProcGenie2025!');
    log('  ──────────────────────────────────────────');
    log('  Tenant ID: ' + TENANT_ID);
    log('');
  } catch (error) {
    log('ERROR: Seed failed: ' + (error as Error).message);
    console.error((error as Error).stack);
    throw error;
  } finally {
    await qr.release();
    await dataSource.destroy();
    log('Database connection closed.');
  }
}

seed().catch((err) => {
  console.error('Fatal seed error:', err);
  process.exit(1);
});
