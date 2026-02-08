import { DataSource } from 'typeorm';
import { Logger } from '@nestjs/common';
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

const logger = new Logger('Seed');

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

const TENANT_ID = 'acme-corp';

// ── UUID Helpers ───────────────────────────────────────────────────────

function uuid(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// Pre-generated UUIDs for cross-referencing
const userIds = {
  admin: uuid(),
  procurementManager: uuid(),
  buyer: uuid(),
  finance: uuid(),
  legal: uuid(),
  requester1: uuid(),
  requester2: uuid(),
  supplierPortal: uuid(),
  sustainability: uuid(),
  itAdmin: uuid(),
  cpo: uuid(),
  analyst: uuid(),
};

const roleIds = {
  admin: uuid(),
  procurementManager: uuid(),
  buyer: uuid(),
  approver: uuid(),
  requester: uuid(),
  finance: uuid(),
  legal: uuid(),
  supplierPortal: uuid(),
  sustainabilityManager: uuid(),
  itAdmin: uuid(),
  cpo: uuid(),
  analyst: uuid(),
};

const supplierIds = {
  dell: uuid(),
  accenture: uuid(),
  microsoft: uuid(),
  aws: uuid(),
  deloitte: uuid(),
  staples: uuid(),
  salesforce: uuid(),
  ibm: uuid(),
};

const contractIds = {
  dellMsa: uuid(),
  accentureSow: uuid(),
  microsoftLicense: uuid(),
  awsFramework: uuid(),
};

const requestIds = {
  req1: uuid(),
  req2: uuid(),
  req3: uuid(),
  req4: uuid(),
};

const poIds = {
  po1: uuid(),
  po2: uuid(),
  po3: uuid(),
};

async function seed() {
  logger.log('Connecting to database...');
  await dataSource.initialize();
  logger.log('Database connected. Starting seed...');

  const queryRunner = dataSource.createQueryRunner();
  await queryRunner.connect();

  try {
    // ── 1. Roles ───────────────────────────────────────────────────

    logger.log('Seeding roles...');
    await queryRunner.query(`
      INSERT INTO roles (id, name, display_name, description, permissions, is_system, tenant_id, created_at, updated_at)
      VALUES
        ('${roleIds.admin}', 'admin', 'System Administrator', 'Full system access', '{"all": true}', true, '${TENANT_ID}', NOW(), NOW()),
        ('${roleIds.procurementManager}', 'procurement_manager', 'Procurement Manager', 'Manages procurement operations', '{"procurement": true}', true, '${TENANT_ID}', NOW(), NOW()),
        ('${roleIds.buyer}', 'buyer', 'Buyer', 'Creates and manages purchase orders', '{"buying": true}', true, '${TENANT_ID}', NOW(), NOW()),
        ('${roleIds.approver}', 'approver', 'Approver', 'Approves requests and POs', '{"approval": true}', true, '${TENANT_ID}', NOW(), NOW()),
        ('${roleIds.requester}', 'requester', 'Requester', 'Creates purchase requests', '{"request": true}', true, '${TENANT_ID}', NOW(), NOW()),
        ('${roleIds.finance}', 'finance_manager', 'Finance Manager', 'Manages invoices and payments', '{"finance": true}', true, '${TENANT_ID}', NOW(), NOW()),
        ('${roleIds.legal}', 'legal', 'Legal Counsel', 'Reviews and approves contracts', '{"legal": true}', true, '${TENANT_ID}', NOW(), NOW()),
        ('${roleIds.supplierPortal}', 'supplier_portal', 'Supplier Portal User', 'Supplier-facing portal access', '{"supplier": true}', true, '${TENANT_ID}', NOW(), NOW()),
        ('${roleIds.sustainabilityManager}', 'sustainability_manager', 'Sustainability Manager', 'Manages ESG and sustainability programs', '{"sustainability": true}', true, '${TENANT_ID}', NOW(), NOW()),
        ('${roleIds.itAdmin}', 'it_admin', 'IT Administrator', 'Manages integrations and system config', '{"it": true}', true, '${TENANT_ID}', NOW(), NOW()),
        ('${roleIds.cpo}', 'cpo', 'Chief Procurement Officer', 'Executive oversight of procurement', '{"executive": true}', true, '${TENANT_ID}', NOW(), NOW()),
        ('${roleIds.analyst}', 'analyst', 'Procurement Analyst', 'Analytics and reporting', '{"analytics": true}', true, '${TENANT_ID}', NOW(), NOW())
      ON CONFLICT (id) DO NOTHING;
    `);

    // ── 2. Users ───────────────────────────────────────────────────

    logger.log('Seeding users...');
    const passwordHash = await bcrypt.hash('ProcGenie2025!', 10);

    const users = [
      { id: userIds.admin, email: 'admin@acme.com', firstName: 'Sarah', lastName: 'Chen', title: 'System Administrator', department: 'IT', roleId: roleIds.admin },
      { id: userIds.procurementManager, email: 'pm@acme.com', firstName: 'Michael', lastName: 'Torres', title: 'Senior Procurement Manager', department: 'Procurement', roleId: roleIds.procurementManager },
      { id: userIds.buyer, email: 'buyer@acme.com', firstName: 'Emily', lastName: 'Johnson', title: 'Strategic Buyer', department: 'Procurement', roleId: roleIds.buyer },
      { id: userIds.finance, email: 'finance@acme.com', firstName: 'David', lastName: 'Kim', title: 'Finance Manager', department: 'Finance', roleId: roleIds.finance },
      { id: userIds.legal, email: 'legal@acme.com', firstName: 'Jessica', lastName: 'Williams', title: 'Legal Counsel', department: 'Legal', roleId: roleIds.legal },
      { id: userIds.requester1, email: 'jsmith@acme.com', firstName: 'James', lastName: 'Smith', title: 'Engineering Manager', department: 'Engineering', roleId: roleIds.requester },
      { id: userIds.requester2, email: 'agarcia@acme.com', firstName: 'Ana', lastName: 'Garcia', title: 'Marketing Director', department: 'Marketing', roleId: roleIds.requester },
      { id: userIds.supplierPortal, email: 'supplier@dell.com', firstName: 'Robert', lastName: 'Dell', title: 'Account Manager', department: 'Sales', roleId: roleIds.supplierPortal },
      { id: userIds.sustainability, email: 'esg@acme.com', firstName: 'Priya', lastName: 'Patel', title: 'Sustainability Manager', department: 'ESG', roleId: roleIds.sustainabilityManager },
      { id: userIds.itAdmin, email: 'itadmin@acme.com', firstName: 'Chris', lastName: 'Anderson', title: 'IT Integration Specialist', department: 'IT', roleId: roleIds.itAdmin },
      { id: userIds.cpo, email: 'cpo@acme.com', firstName: 'Linda', lastName: 'Zhang', title: 'Chief Procurement Officer', department: 'Executive', roleId: roleIds.cpo },
      { id: userIds.analyst, email: 'analyst@acme.com', firstName: 'Kevin', lastName: 'Brown', title: 'Procurement Analyst', department: 'Procurement', roleId: roleIds.analyst },
    ];

    for (const u of users) {
      await queryRunner.query(`
        INSERT INTO users (id, email, password, first_name, last_name, title, department, status, is_sso_user, tenant_id, created_at, updated_at)
        VALUES ('${u.id}', '${u.email}', '${passwordHash}', '${u.firstName}', '${u.lastName}', '${u.title}', '${u.department}', 'active', false, '${TENANT_ID}', NOW(), NOW())
        ON CONFLICT (id) DO NOTHING;
      `);
      await queryRunner.query(`
        INSERT INTO user_roles (user_id, role_id) VALUES ('${u.id}', '${u.roleId}') ON CONFLICT DO NOTHING;
      `);
    }

    // ── 3. Suppliers ───────────────────────────────────────────────

    logger.log('Seeding suppliers...');
    const suppliers = [
      { id: supplierIds.dell, code: 'SUP-001001', company: 'Dell Technologies', legal: 'Dell Inc.', taxId: '75-2589680', status: 'active', tier: 'strategic', industry: 'IT Hardware', contactName: 'Robert Dell', contactEmail: 'enterprise@dell.com', city: 'Round Rock', state: 'TX', country: 'US', paymentTerms: 'Net 30', score: 92.5, categories: '{IT Equipment,Laptops,Servers}' },
      { id: supplierIds.accenture, code: 'SUP-001002', company: 'Accenture', legal: 'Accenture PLC', taxId: '98-0627530', status: 'active', tier: 'strategic', industry: 'Professional Services', contactName: 'Mary Thompson', contactEmail: 'procurement@accenture.com', city: 'Dublin', state: null, country: 'IE', paymentTerms: 'Net 45', score: 88.0, categories: '{Professional Services,Consulting,IT Services}' },
      { id: supplierIds.microsoft, code: 'SUP-001003', company: 'Microsoft Corporation', legal: 'Microsoft Corp.', taxId: '91-1144442', status: 'active', tier: 'strategic', industry: 'Software', contactName: 'John Azure', contactEmail: 'licensing@microsoft.com', city: 'Redmond', state: 'WA', country: 'US', paymentTerms: 'Net 30', score: 95.0, categories: '{Software Licenses,Cloud Services}' },
      { id: supplierIds.aws, code: 'SUP-001004', company: 'Amazon Web Services', legal: 'Amazon.com Inc.', taxId: '91-1646860', status: 'active', tier: 'preferred', industry: 'Cloud Services', contactName: 'Jane Cloud', contactEmail: 'enterprise@aws.amazon.com', city: 'Seattle', state: 'WA', country: 'US', paymentTerms: 'Net 30', score: 90.0, categories: '{Cloud Services,Infrastructure}' },
      { id: supplierIds.deloitte, code: 'SUP-001005', company: 'Deloitte Consulting', legal: 'Deloitte LLP', taxId: '06-1067904', status: 'active', tier: 'preferred', industry: 'Professional Services', contactName: 'Tom Advisor', contactEmail: 'sourcing@deloitte.com', city: 'New York', state: 'NY', country: 'US', paymentTerms: 'Net 60', score: 86.5, categories: '{Professional Services,Consulting,Audit}' },
      { id: supplierIds.staples, code: 'SUP-001006', company: 'Staples Inc.', legal: 'Staples Inc.', taxId: '04-2896127', status: 'active', tier: 'approved', industry: 'Office Supplies', contactName: 'Lisa Supplies', contactEmail: 'b2b@staples.com', city: 'Framingham', state: 'MA', country: 'US', paymentTerms: 'Net 30', score: 78.0, categories: '{Office Supplies,Furniture}' },
      { id: supplierIds.salesforce, code: 'SUP-001007', company: 'Salesforce Inc.', legal: 'Salesforce Inc.', taxId: '11-3527854', status: 'active', tier: 'preferred', industry: 'Software', contactName: 'Mark CRM', contactEmail: 'enterprise@salesforce.com', city: 'San Francisco', state: 'CA', country: 'US', paymentTerms: 'Annual', score: 91.0, categories: '{Software Licenses,CRM}' },
      { id: supplierIds.ibm, code: 'SUP-001008', company: 'IBM Corporation', legal: 'International Business Machines Corp.', taxId: '13-0871985', status: 'active', tier: 'strategic', industry: 'IT Services', contactName: 'Sam Watson', contactEmail: 'procurement@ibm.com', city: 'Armonk', state: 'NY', country: 'US', paymentTerms: 'Net 45', score: 87.5, categories: '{IT Services,Cloud Services,Software Licenses}' },
    ];

    for (const s of suppliers) {
      await queryRunner.query(`
        INSERT INTO suppliers (id, supplier_code, company_name, legal_name, tax_id, status, tier, industry, contact_name, contact_email, city, state, country, payment_terms, overall_score, categories, tenant_id, created_by, created_at, updated_at)
        VALUES ('${s.id}', '${s.code}', '${s.company}', '${s.legal}', '${s.taxId}', '${s.status}', '${s.tier}', '${s.industry}', '${s.contactName}', '${s.contactEmail}', '${s.city}', ${s.state ? `'${s.state}'` : 'NULL'}, '${s.country}', '${s.paymentTerms}', ${s.score}, '${s.categories}', '${TENANT_ID}', '${userIds.procurementManager}', NOW(), NOW())
        ON CONFLICT (id) DO NOTHING;
      `);
    }

    // ── 4. Contracts ───────────────────────────────────────────────

    logger.log('Seeding contracts...');
    const contracts = [
      { id: contractIds.dellMsa, number: 'CON-2024-000101', title: 'Master Service Agreement - Dell Technologies', type: 'msa', status: 'active', supplierId: supplierIds.dell, value: 2500000, start: '2024-01-01', end: '2026-12-31', ownerId: userIds.procurementManager, autoRenew: true, paymentTerms: 'Net 30', governingLaw: 'State of Delaware, USA' },
      { id: contractIds.accentureSow, number: 'CON-2024-000102', title: 'Digital Transformation SOW - Accenture', type: 'sow', status: 'active', supplierId: supplierIds.accenture, value: 1800000, start: '2024-03-01', end: '2025-08-31', ownerId: userIds.procurementManager, autoRenew: false, paymentTerms: 'Net 45', governingLaw: 'State of New York, USA' },
      { id: contractIds.microsoftLicense, number: 'CON-2024-000103', title: 'Enterprise License Agreement - Microsoft', type: 'license', status: 'active', supplierId: supplierIds.microsoft, value: 850000, start: '2024-07-01', end: '2027-06-30', ownerId: userIds.legal, autoRenew: true, paymentTerms: 'Annual', governingLaw: 'State of Washington, USA' },
      { id: contractIds.awsFramework, number: 'CON-2025-000104', title: 'Cloud Infrastructure Framework - AWS', type: 'framework', status: 'executed', supplierId: supplierIds.aws, value: 1200000, start: '2025-01-01', end: '2027-12-31', ownerId: userIds.procurementManager, autoRenew: true, paymentTerms: 'Net 30', governingLaw: 'State of Washington, USA' },
    ];

    for (const c of contracts) {
      await queryRunner.query(`
        INSERT INTO contracts (id, contract_number, title, type, status, supplier_id, total_value, currency, start_date, end_date, owner_id, auto_renew, payment_terms, governing_law, tenant_id, created_by, created_at, updated_at)
        VALUES ('${c.id}', '${c.number}', '${c.title}', '${c.type}', '${c.status}', '${c.supplierId}', ${c.value}, 'USD', '${c.start}', '${c.end}', '${c.ownerId}', ${c.autoRenew}, '${c.paymentTerms}', '${c.governingLaw}', '${TENANT_ID}', '${userIds.procurementManager}', NOW(), NOW())
        ON CONFLICT (id) DO NOTHING;
      `);
    }

    // ── 5. Requests ────────────────────────────────────────────────

    logger.log('Seeding purchase requests...');
    const requests = [
      { id: requestIds.req1, number: 'REQ-2025-000101', title: 'Engineering laptops for Q2 new hires', status: 'approved', priority: 'high', category: 'goods', total: 45000, requesterId: userIds.requester1, costCenter: 'Engineering', neededBy: '2025-04-15' },
      { id: requestIds.req2, number: 'REQ-2025-000102', title: 'Marketing automation software license', status: 'pending_approval', priority: 'medium', category: 'software', total: 24000, requesterId: userIds.requester2, costCenter: 'Marketing', neededBy: '2025-05-01' },
      { id: requestIds.req3, number: 'REQ-2025-000103', title: 'Office furniture for new wing', status: 'submitted', priority: 'low', category: 'goods', total: 62000, requesterId: userIds.requester1, costCenter: 'Facilities', neededBy: '2025-06-30' },
      { id: requestIds.req4, number: 'REQ-2025-000104', title: 'Cloud infrastructure expansion', status: 'in_sourcing', priority: 'critical', category: 'services', total: 180000, requesterId: userIds.itAdmin, costCenter: 'IT Infrastructure', neededBy: '2025-03-31' },
    ];

    for (const r of requests) {
      await queryRunner.query(`
        INSERT INTO requests (id, request_number, title, status, priority, category, estimated_total, currency, requester_id, cost_center, needed_by_date, tenant_id, created_by, created_at, updated_at)
        VALUES ('${r.id}', '${r.number}', '${r.title}', '${r.status}', '${r.priority}', '${r.category}', ${r.total}, 'USD', '${r.requesterId}', '${r.costCenter}', '${r.neededBy}', '${TENANT_ID}', '${r.requesterId}', NOW(), NOW())
        ON CONFLICT (id) DO NOTHING;
      `);
    }

    // ── 6. Purchase Orders ─────────────────────────────────────────

    logger.log('Seeding purchase orders...');
    const pos = [
      { id: poIds.po1, number: 'PO-2025-000101', title: 'Engineering Laptops - Dell Latitude 7440', status: 'sent_to_supplier', requestId: requestIds.req1, supplierId: supplierIds.dell, contractId: contractIds.dellMsa, total: 42000, buyerId: userIds.buyer, costCenter: 'Engineering', paymentTerms: 'Net 30' },
      { id: poIds.po2, number: 'PO-2025-000102', title: 'AWS Reserved Instances - Q2', status: 'approved', requestId: requestIds.req4, supplierId: supplierIds.aws, contractId: contractIds.awsFramework, total: 96000, buyerId: userIds.buyer, costCenter: 'IT Infrastructure', paymentTerms: 'Net 30' },
      { id: poIds.po3, number: 'PO-2025-000103', title: 'Office Supplies - Q1 Bulk Order', status: 'fully_received', requestId: null, supplierId: supplierIds.staples, contractId: null, total: 8500, buyerId: userIds.buyer, costCenter: 'Office Operations', paymentTerms: 'Net 30' },
    ];

    for (const po of pos) {
      await queryRunner.query(`
        INSERT INTO purchase_orders (id, po_number, title, status, request_id, supplier_id, contract_id, total_amount, currency, buyer_id, cost_center, payment_terms, tenant_id, created_by, created_at, updated_at)
        VALUES ('${po.id}', '${po.number}', '${po.title}', '${po.status}', ${po.requestId ? `'${po.requestId}'` : 'NULL'}, '${po.supplierId}', ${po.contractId ? `'${po.contractId}'` : 'NULL'}, ${po.total}, 'USD', '${po.buyerId}', '${po.costCenter}', '${po.paymentTerms}', '${TENANT_ID}', '${userIds.buyer}', NOW(), NOW())
        ON CONFLICT (id) DO NOTHING;
      `);
    }

    // ── 7. Invoices ────────────────────────────────────────────────

    logger.log('Seeding invoices...');
    const invoiceId1 = uuid();
    const invoiceId2 = uuid();
    const invoiceId3 = uuid();

    const invoices = [
      { id: invoiceId1, number: 'INV-2025-000101', supplierInvNum: 'DELL-INV-78945', type: 'standard', status: 'matched', supplierId: supplierIds.dell, supplierName: 'Dell Technologies', poId: poIds.po1, subtotal: 42000, tax: 3360, total: 45360, invoiceDate: '2025-02-15', dueDate: '2025-03-17', paymentTerms: 'Net 30', costCenter: 'Engineering' },
      { id: invoiceId2, number: 'INV-2025-000102', supplierInvNum: 'AWS-202502-001', type: 'standard', status: 'pending_approval', supplierId: supplierIds.aws, supplierName: 'Amazon Web Services', poId: poIds.po2, subtotal: 96000, tax: 0, total: 96000, invoiceDate: '2025-02-01', dueDate: '2025-03-03', paymentTerms: 'Net 30', costCenter: 'IT Infrastructure' },
      { id: invoiceId3, number: 'INV-2025-000103', supplierInvNum: 'STP-Q1-2025', type: 'standard', status: 'paid', supplierId: supplierIds.staples, supplierName: 'Staples Inc.', poId: poIds.po3, subtotal: 8500, tax: 680, total: 9180, invoiceDate: '2025-01-20', dueDate: '2025-02-19', paymentTerms: 'Net 30', costCenter: 'Office Operations' },
    ];

    for (const inv of invoices) {
      await queryRunner.query(`
        INSERT INTO invoices (id, invoice_number, supplier_invoice_number, type, status, supplier_id, supplier_name, purchase_order_id, subtotal, tax_amount, total_amount, currency, invoice_date, due_date, payment_terms, cost_center, tenant_id, created_by, created_at, updated_at)
        VALUES ('${inv.id}', '${inv.number}', '${inv.supplierInvNum}', '${inv.type}', '${inv.status}', '${inv.supplierId}', '${inv.supplierName}', '${inv.poId}', ${inv.subtotal}, ${inv.tax}, ${inv.total}, 'USD', '${inv.invoiceDate}', '${inv.dueDate}', '${inv.paymentTerms}', '${inv.costCenter}', '${TENANT_ID}', '${userIds.finance}', NOW(), NOW())
        ON CONFLICT (id) DO NOTHING;
      `);
    }

    // ── 8. Sourcing Projects ───────────────────────────────────────

    logger.log('Seeding sourcing projects...');
    const srcProjectId = uuid();
    const bidId1 = uuid();
    const bidId2 = uuid();

    await queryRunner.query(`
      INSERT INTO sourcing_projects (id, project_number, title, description, type, status, request_id, category, estimated_value, currency, owner_id, is_sealed, tenant_id, created_by, created_at, updated_at)
      VALUES ('${srcProjectId}', 'SRC-2025-000101', 'Enterprise Laptop Fleet Renewal 2025', 'Strategic sourcing for 500+ laptops for enterprise-wide fleet renewal', 'rfp', 'evaluation', '${requestIds.req1}', 'IT Equipment', 750000, 'USD', '${userIds.procurementManager}', false, '${TENANT_ID}', '${userIds.procurementManager}', NOW(), NOW())
      ON CONFLICT (id) DO NOTHING;
    `);

    await queryRunner.query(`
      INSERT INTO bids (id, bid_number, sourcing_project_id, supplier_id, supplier_name, status, total_price, currency, technical_score, commercial_score, overall_score, delivery_timeline, payment_terms, warranty_terms, submitted_at, tenant_id, created_by, created_at, updated_at)
      VALUES
        ('${bidId1}', 'BID-2025-000101', '${srcProjectId}', '${supplierIds.dell}', 'Dell Technologies', 'under_evaluation', 680000, 'USD', 92.0, 85.0, 89.2, '4-6 weeks', 'Net 30', '3-year ProSupport', NOW(), '${TENANT_ID}', '${userIds.supplierPortal}', NOW(), NOW()),
        ('${bidId2}', 'BID-2025-000102', '${srcProjectId}', '${supplierIds.ibm}', 'IBM Corporation', 'under_evaluation', 720000, 'USD', 88.0, 78.0, 84.0, '6-8 weeks', 'Net 45', '3-year OnSite', NOW(), '${TENANT_ID}', '${userIds.supplierPortal}', NOW(), NOW())
      ON CONFLICT (id) DO NOTHING;
    `);

    // ── 9. Workflows ───────────────────────────────────────────────

    logger.log('Seeding workflows...');
    const wfId1 = uuid();
    const wfId2 = uuid();

    await queryRunner.query(`
      INSERT INTO workflows (id, name, description, type, status, version, trigger_conditions, tenant_id, created_by, created_at, updated_at)
      VALUES
        ('${wfId1}', 'Standard PO Approval', 'Multi-level approval for purchase orders based on amount thresholds', 'approval', 'active', 1, '{"minAmount": 5000, "entityType": "purchase_order"}', '${TENANT_ID}', '${userIds.admin}', NOW(), NOW()),
        ('${wfId2}', 'Contract Review Workflow', 'Legal review and approval workflow for new contracts', 'contract', 'active', 1, '{"entityType": "contract", "minValue": 50000}', '${TENANT_ID}', '${userIds.admin}', NOW(), NOW())
      ON CONFLICT (id) DO NOTHING;
    `);

    // ── 10. ESG Scores ─────────────────────────────────────────────

    logger.log('Seeding ESG scores...');
    const esgScores = [
      { supplierId: supplierIds.dell, name: 'Dell Technologies', overall: 85.5, env: 82.0, social: 88.0, gov: 90.0, grade: 'A', certs: '{ISO 14001,Carbon Neutral}' },
      { supplierId: supplierIds.microsoft, name: 'Microsoft Corporation', overall: 92.0, env: 95.0, social: 89.0, gov: 91.0, grade: 'A+', certs: '{Carbon Negative,RE100}' },
      { supplierId: supplierIds.aws, name: 'Amazon Web Services', overall: 78.5, env: 75.0, social: 80.0, gov: 82.0, grade: 'B+', certs: '{RE100}' },
      { supplierId: supplierIds.accenture, name: 'Accenture', overall: 88.0, env: 85.0, social: 92.0, gov: 87.0, grade: 'A', certs: '{UNGC,CDP A-List}' },
    ];

    for (const e of esgScores) {
      await queryRunner.query(`
        INSERT INTO esg_scores (id, supplier_id, supplier_name, category, overall_score, environmental_score, social_score, governance_score, assessment_date, rating_grade, certifications, tenant_id, created_by, created_at, updated_at)
        VALUES ('${uuid()}', '${e.supplierId}', '${e.name}', 'environmental', ${e.overall}, ${e.env}, ${e.social}, ${e.gov}, '2025-01-15', '${e.grade}', '${e.certs}', '${TENANT_ID}', '${userIds.sustainability}', NOW(), NOW())
        ON CONFLICT (id) DO NOTHING;
      `);
    }

    // ── 11. Carbon Footprints ──────────────────────────────────────

    logger.log('Seeding carbon footprints...');
    await queryRunner.query(`
      INSERT INTO carbon_footprints (id, supplier_id, entity_name, entity_type, emission_scope, co2_emissions_tons, reporting_period, start_date, end_date, energy_consumption_kwh, renewable_energy_percentage, verification_status, tenant_id, created_by, created_at, updated_at)
      VALUES
        ('${uuid()}', '${supplierIds.dell}', 'Dell Technologies', 'supplier', 'scope_3', 4500, 'Q4 2024', '2024-10-01', '2024-12-31', 12000000, 45.0, 'verified', '${TENANT_ID}', '${userIds.sustainability}', NOW(), NOW()),
        ('${uuid()}', '${supplierIds.microsoft}', 'Microsoft Corporation', 'supplier', 'scope_2', 1200, 'Q4 2024', '2024-10-01', '2024-12-31', 8500000, 100.0, 'verified', '${TENANT_ID}', '${userIds.sustainability}', NOW(), NOW()),
        ('${uuid()}', NULL, 'IT Equipment Category', 'category', 'scope_3', 8200, 'Q4 2024', '2024-10-01', '2024-12-31', NULL, NULL, 'estimated', '${TENANT_ID}', '${userIds.sustainability}', NOW(), NOW())
      ON CONFLICT (id) DO NOTHING;
    `);

    // ── 12. Regulatory Alerts ──────────────────────────────────────

    logger.log('Seeding regulatory alerts...');
    await queryRunner.query(`
      INSERT INTO regulatory_alerts (id, title, description, severity, status, regulation_name, regulation_body, jurisdiction, compliance_deadline, affected_categories, impact_assessment, tenant_id, created_by, created_at, updated_at)
      VALUES
        ('${uuid()}', 'CSRD Reporting Deadline Q2 2025', 'Corporate Sustainability Reporting Directive requires ESG disclosure for suppliers above threshold', 'high', 'acknowledged', 'CSRD', 'European Commission', 'European Union', '2025-06-30', '{IT Equipment,Professional Services}', 'Affects 12 strategic suppliers requiring sustainability data collection', '${TENANT_ID}', '${userIds.sustainability}', NOW(), NOW()),
        ('${uuid()}', 'CBAM Phase 2 Implementation', 'Carbon Border Adjustment Mechanism requires carbon content reporting for imported goods', 'medium', 'new', 'CBAM', 'European Commission', 'European Union', '2025-12-31', '{IT Equipment,Raw Materials}', 'Impacts hardware imports from non-EU suppliers', '${TENANT_ID}', '${userIds.sustainability}', NOW(), NOW()),
        ('${uuid()}', 'US Executive Order on AI Procurement', 'New requirements for AI safety and transparency in government-adjacent procurement', 'low', 'new', 'EO 14110', 'White House', 'United States', '2025-09-01', '{Software Licenses,IT Services}', 'Relevant for AI-powered procurement tools and vendor selection', '${TENANT_ID}', '${userIds.sustainability}', NOW(), NOW())
      ON CONFLICT (id) DO NOTHING;
    `);

    // ── 13. Integrations & Connectors ──────────────────────────────

    logger.log('Seeding integrations and connectors...');
    const sapConnectorId = uuid();
    const sfConnectorId = uuid();

    await queryRunner.query(`
      INSERT INTO connectors (id, connector_code, name, description, category, vendor, version, is_available, is_premium, supported_entities, auth_types, tenant_id, created_at, updated_at)
      VALUES
        ('${sapConnectorId}', 'sap_s4hana', 'SAP S/4HANA', 'Enterprise ERP integration for PO, invoice, and master data sync', 'erp', 'SAP', '2.1.0', true, true, '{purchase_orders,invoices,suppliers,contracts}', '{oauth2,api_key}', '${TENANT_ID}', NOW(), NOW()),
        ('${sfConnectorId}', 'salesforce_crm', 'Salesforce CRM', 'CRM integration for supplier and contract management', 'crm', 'Salesforce', '1.5.0', true, false, '{suppliers,contracts,contacts}', '{oauth2}', '${TENANT_ID}', NOW(), NOW()),
        ('${uuid()}', 'docusign', 'DocuSign', 'E-signature integration for contract execution', 'e_signature', 'DocuSign', '1.2.0', true, false, '{contracts}', '{oauth2}', '${TENANT_ID}', NOW(), NOW()),
        ('${uuid()}', 'coupa', 'Coupa BSM', 'Procurement and business spend management integration', 'erp', 'Coupa', '1.0.0', true, true, '{purchase_orders,invoices,suppliers}', '{oauth2,api_key}', '${TENANT_ID}', NOW(), NOW())
      ON CONFLICT (id) DO NOTHING;
    `);

    const integrationId1 = uuid();
    await queryRunner.query(`
      INSERT INTO integrations (id, name, description, type, status, connector_id, sync_frequency, records_synced, tenant_id, created_by, created_at, updated_at)
      VALUES
        ('${integrationId1}', 'SAP S/4HANA - Production', 'Primary ERP integration for PO and invoice sync', 'erp', 'active', 'sap_s4hana', 'every_15_minutes', 24580, '${TENANT_ID}', '${userIds.itAdmin}', NOW(), NOW()),
        ('${uuid()}', 'Salesforce CRM', 'CRM integration for supplier relationship data', 'crm', 'active', 'salesforce_crm', 'hourly', 8920, '${TENANT_ID}', '${userIds.itAdmin}', NOW(), NOW())
      ON CONFLICT (id) DO NOTHING;
    `);

    // ── 14. AI Agents ──────────────────────────────────────────────

    logger.log('Seeding AI agents...');
    const agentIds = {
      intakeAnalyst: uuid(),
      contractReviewer: uuid(),
      spendAnalyzer: uuid(),
      invoiceMatcher: uuid(),
      supplierRisk: uuid(),
      complianceMonitor: uuid(),
    };

    const agents = [
      { id: agentIds.intakeAnalyst, name: 'Intake Analysis Agent', type: 'intake_analyst', desc: 'Analyzes incoming purchase requests, suggests categories, suppliers, and cost estimates using historical data', status: 'active', model: 'claude-sonnet-4-20250514', successRate: 94.2, avgTime: 1850, tasksCompleted: 1247, tasksFailed: 72, requiresHitl: false, threshold: 75.0 },
      { id: agentIds.contractReviewer, name: 'Contract Review Agent', type: 'contract_reviewer', desc: 'AI-powered contract analysis for risk identification, clause extraction, and compliance verification', status: 'active', model: 'claude-sonnet-4-20250514', successRate: 91.8, avgTime: 4200, tasksCompleted: 389, tasksFailed: 35, requiresHitl: true, threshold: 85.0 },
      { id: agentIds.spendAnalyzer, name: 'Spend Analytics Agent', type: 'spend_analyzer', desc: 'Analyzes procurement spend patterns, identifies savings opportunities, and generates forecasts', status: 'active', model: 'claude-sonnet-4-20250514', successRate: 96.5, avgTime: 2100, tasksCompleted: 2150, tasksFailed: 78, requiresHitl: false, threshold: 70.0 },
      { id: agentIds.invoiceMatcher, name: 'Invoice Matching Agent', type: 'invoice_matcher', desc: 'Automated three-way matching of invoices against POs and goods receipts', status: 'active', model: 'claude-sonnet-4-20250514', successRate: 97.8, avgTime: 850, tasksCompleted: 5420, tasksFailed: 120, requiresHitl: false, threshold: 90.0 },
      { id: agentIds.supplierRisk, name: 'Supplier Risk Assessment Agent', type: 'supplier_risk_assessor', desc: 'Monitors supplier financial health, compliance, and geopolitical risk factors', status: 'active', model: 'claude-sonnet-4-20250514', successRate: 89.5, avgTime: 3500, tasksCompleted: 678, tasksFailed: 71, requiresHitl: true, threshold: 80.0 },
      { id: agentIds.complianceMonitor, name: 'Compliance Monitor Agent', type: 'compliance_monitor', desc: 'Tracks regulatory changes and monitors procurement compliance across jurisdictions', status: 'idle', model: 'claude-sonnet-4-20250514', successRate: 93.0, avgTime: 1200, tasksCompleted: 890, tasksFailed: 67, requiresHitl: true, threshold: 85.0 },
    ];

    for (const a of agents) {
      await queryRunner.query(`
        INSERT INTO agents (id, name, type, description, status, model_id, version, success_rate, avg_response_time_ms, total_tasks_completed, total_tasks_failed, requires_hitl, confidence_threshold, last_active_at, tenant_id, created_by, created_at, updated_at)
        VALUES ('${a.id}', '${a.name}', '${a.type}', '${a.desc}', '${a.status}', '${a.model}', '1.0.0', ${a.successRate}, ${a.avgTime}, ${a.tasksCompleted}, ${a.tasksFailed}, ${a.requiresHitl}, ${a.threshold}, NOW(), '${TENANT_ID}', '${userIds.admin}', NOW(), NOW())
        ON CONFLICT (id) DO NOTHING;
      `);
    }

    // Seed agent tasks (including HITL checkpoint)
    const taskId1 = uuid();
    const taskId2 = uuid();
    await queryRunner.query(`
      INSERT INTO agent_tasks (id, agent_id, title, description, status, priority, entity_type, entity_id, confidence_score, started_at, completed_at, execution_time_ms, tokens_used, tenant_id, created_by, created_at, updated_at)
      VALUES
        ('${taskId1}', '${agentIds.contractReviewer}', 'Review Dell MSA Contract Renewal', 'Automated risk analysis and clause review for Dell MSA renewal terms', 'awaiting_approval', 'high', 'contract', '${contractIds.dellMsa}', 88.5, NOW() - INTERVAL '10 minutes', NULL, NULL, 3200, '${TENANT_ID}', '${userIds.admin}', NOW(), NOW()),
        ('${taskId2}', '${agentIds.invoiceMatcher}', 'Three-Way Match - Dell Invoice', 'Automated matching of Dell invoice against PO and goods receipt', 'completed', 'medium', 'invoice', '${invoiceId1}', 98.2, NOW() - INTERVAL '1 hour', NOW() - INTERVAL '50 minutes', 820, 1500, '${TENANT_ID}', '${userIds.admin}', NOW(), NOW())
      ON CONFLICT (id) DO NOTHING;
    `);

    // Seed decision logs
    await queryRunner.query(`
      INSERT INTO agent_decision_logs (id, agent_id, task_id, decision_type, outcome, reasoning, confidence_score, entity_type, entity_id, human_reviewed, execution_time_ms, tenant_id, created_at, updated_at)
      VALUES
        ('${uuid()}', '${agentIds.contractReviewer}', '${taskId1}', 'risk_assessment', 'escalated', 'Contract contains auto-renewal clause with 180-day notice period (above threshold of 90 days). Escalating for human review.', 88.5, 'contract', '${contractIds.dellMsa}', false, 4200, '${TENANT_ID}', NOW(), NOW()),
        ('${uuid()}', '${agentIds.invoiceMatcher}', '${taskId2}', 'three_way_match', 'approved', 'Invoice amount matches PO within 0.0% variance. Goods receipt confirmed full delivery. Auto-approved.', 98.2, 'invoice', '${invoiceId1}', false, 820, '${TENANT_ID}', NOW(), NOW()),
        ('${uuid()}', '${agentIds.spendAnalyzer}', NULL, 'spend_anomaly', 'approved', 'Detected 15% increase in IT Equipment category spend. Within expected seasonal variance for Q1 laptop procurement cycle.', 91.0, NULL, NULL, false, 2100, '${TENANT_ID}', NOW(), NOW())
      ON CONFLICT (id) DO NOTHING;
    `);

    // ── 15. Notifications ──────────────────────────────────────────

    logger.log('Seeding notifications...');
    const notifications = [
      { recipientId: userIds.procurementManager, title: 'HITL Checkpoint: Contract Review Required', message: 'The Contract Review Agent has flagged the Dell MSA renewal for human review due to a high-risk auto-renewal clause.', type: 'agent_hitl', priority: 'high', entityType: 'agent_task', entityId: taskId1, actionUrl: '/agents/hitl', actionLabel: 'Review Decision' },
      { recipientId: userIds.finance, title: 'Invoice Pending Approval', message: 'Invoice INV-2025-000102 from Amazon Web Services for $96,000 requires your approval.', type: 'approval_required', priority: 'medium', entityType: 'invoice', entityId: invoiceId2, actionUrl: '/invoices/' + invoiceId2, actionLabel: 'Review Invoice' },
      { recipientId: userIds.procurementManager, title: 'Sourcing Project Ready for Award', message: 'Enterprise Laptop Fleet Renewal 2025 has completed bid evaluation. 2 bids received.', type: 'sourcing_awarded', priority: 'medium', entityType: 'sourcing_project', entityId: srcProjectId, actionUrl: '/sourcing/projects/' + srcProjectId, actionLabel: 'View Bids' },
      { recipientId: userIds.legal, title: 'Contract Expiring Soon', message: 'Digital Transformation SOW with Accenture expires on 2025-08-31 (within 6 months).', type: 'contract_expiring', priority: 'high', entityType: 'contract', entityId: contractIds.accentureSow, actionUrl: '/contracts/' + contractIds.accentureSow, actionLabel: 'Review Contract' },
      { recipientId: userIds.sustainability, title: 'New Regulatory Alert: CSRD', message: 'CSRD reporting deadline approaching. 12 strategic suppliers require sustainability data collection.', type: 'regulatory_alert', priority: 'high', entityType: null, entityId: null, actionUrl: '/sustainability/regulatory-alerts', actionLabel: 'View Alert' },
      { recipientId: userIds.cpo, title: 'Monthly Spend Report Available', message: 'January 2025 spend analytics report is ready. Total spend: $2.1M, Savings: $280K (13.3%).', type: 'system_alert', priority: 'low', entityType: null, entityId: null, actionUrl: '/analytics/spend-dashboard', actionLabel: 'View Report' },
    ];

    for (const n of notifications) {
      await queryRunner.query(`
        INSERT INTO notifications (id, title, message, type, priority, channels, recipient_id, is_read, entity_type, entity_id, action_url, action_label, email_sent, tenant_id, created_at, updated_at)
        VALUES ('${uuid()}', '${n.title}', '${n.message}', '${n.type}', '${n.priority}', '{in_app,email}', '${n.recipientId}', false, ${n.entityType ? `'${n.entityType}'` : 'NULL'}, ${n.entityId ? `'${n.entityId}'` : 'NULL'}, '${n.actionUrl}', '${n.actionLabel}', false, '${TENANT_ID}', NOW(), NOW())
        ON CONFLICT (id) DO NOTHING;
      `);
    }

    logger.log('Seed completed successfully!');
    logger.log('');
    logger.log('  Login credentials:');
    logger.log('  ──────────────────────────────────────────');
    logger.log('  Admin:        admin@acme.com / ProcGenie2025!');
    logger.log('  Proc Manager: pm@acme.com / ProcGenie2025!');
    logger.log('  Buyer:        buyer@acme.com / ProcGenie2025!');
    logger.log('  Finance:      finance@acme.com / ProcGenie2025!');
    logger.log('  Legal:        legal@acme.com / ProcGenie2025!');
    logger.log('  CPO:          cpo@acme.com / ProcGenie2025!');
    logger.log('  Analyst:      analyst@acme.com / ProcGenie2025!');
    logger.log('  ──────────────────────────────────────────');
    logger.log('  Tenant ID: ' + TENANT_ID);
    logger.log('');
  } catch (error) {
    logger.error('Seed failed:', error.message);
    logger.error(error.stack);
    throw error;
  } finally {
    await queryRunner.release();
    await dataSource.destroy();
    logger.log('Database connection closed.');
  }
}

seed().catch((err) => {
  console.error('Fatal seed error:', err);
  process.exit(1);
});
