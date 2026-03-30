import { Controller, Get, Post, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { getDefaultWorkflows } from './modules/workflow/seed/default-workflows';

@ApiTags('Health')
@Controller()
export class HealthController {
  private readonly logger = new Logger('HealthController');

  constructor(private readonly dataSource: DataSource) {}

  @Get('health')
  @ApiOperation({ summary: 'Health check endpoint' })
  @ApiResponse({ status: 200, description: 'Service is healthy' })
  health() {
    return {
      status: 'ok',
      service: 'ProcGenie API',
      timestamp: new Date().toISOString(),
    };
  }

  @Post('seed')
  @ApiOperation({ summary: 'Seed database with demo data' })
  async seed() {
    this.logger.log('Starting database seed...');
    const qr = this.dataSource.createQueryRunner();
    await qr.connect();

    const T = 'GEP';
    const uid = () => 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
      const r = (Math.random() * 16) | 0;
      return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
    });
    const e = (v: string | null | undefined) => v == null ? 'NULL' : `'${v.replace(/'/g, "''")}'`;

    // Pre-gen IDs
    const U = { admin: uid(), pm: uid(), buyer: uid(), finance: uid(), legal: uid(), req1: uid(), req2: uid(), sp: uid(), sust: uid(), it: uid(), cpo: uid(), analyst: uid() };
    const RL = { admin: uid(), pm: uid(), buyer: uid(), approver: uid(), requester: uid(), finance: uid(), legal: uid(), sp: uid(), sust: uid(), it: uid(), cpo: uid(), analyst: uid() };
    const S: Record<string,string> = {};
    ['salesforce','aws','microsoft','apple','dell','google','slack','zoom','adobe','atlassian','workday','serviceNow','deloitte','oracle','sap','staples'].forEach(n => S[n] = uid());
    const C: Record<string,string> = {};
    ['dellMsa','awsFramework','msLicense','sfCrm','oracleSow','sapLicense','deloitteSow','adobeLicense','googleCloud','zoomSla','workdayHr','atlasSow'].forEach(n => C[n] = uid());
    const R: Record<string,string> = {}; for (let i=1;i<=25;i++) R[`r${i}`]=uid();
    const PO: Record<string,string> = {}; for (let i=1;i<=15;i++) PO[`po${i}`]=uid();
    const INV: Record<string,string> = {}; for (let i=1;i<=10;i++) INV[`inv${i}`]=uid();
    const AG: Record<string,string> = {}; for (let i=1;i<=15;i++) AG[`ag${i}`]=uid();
    const SRC: Record<string,string> = {}; for (let i=1;i<=5;i++) SRC[`src${i}`]=uid();
    const INT: Record<string,string> = {}; for (let i=1;i<=8;i++) INT[`int${i}`]=uid();

    try {
      // Clear tables
      const tables = ['workflow_instances','agent_decision_logs','agent_tasks','agents','notifications','three_way_matches','invoices','goods_receipts','po_line_items','purchase_orders','request_items','requests','request_templates','evaluation_criteria','bids','sourcing_projects','contract_clauses','approvals','contracts','sync_jobs','integrations','connectors','regulatory_alerts','carbon_footprints','esg_scores','supplier_performance_scores','supplier_risk_profiles','supplier_documents','catalog_items','suppliers','workflow_steps','workflows','user_roles','users','role_permissions','permissions','roles'];
      for (const t of tables) { try { await qr.query(`DELETE FROM "${t}"`); } catch { /* ignore missing tables */ } }

      // 1. Roles
      this.logger.log('Seeding roles...');
      const roles = [
        [RL.admin,'admin','System Administrator','Full system access',true],
        [RL.pm,'procurement_manager','Procurement Manager','Manages procurement operations',true],
        [RL.buyer,'buyer','Buyer','Creates and manages purchase orders',true],
        [RL.approver,'approver','Approver','Approves requests and POs',true],
        [RL.requester,'requester','Requester','Creates purchase requests',true],
        [RL.finance,'finance_manager','Finance Manager','Manages invoices and payments',true],
        [RL.legal,'legal','Legal Counsel','Reviews and approves contracts',true],
        [RL.sp,'supplier_portal','Supplier Portal User','Supplier-facing portal access',true],
        [RL.sust,'sustainability_manager','Sustainability Manager','Manages ESG programs',true],
        [RL.it,'it_admin','IT Administrator','Manages integrations and config',true],
        [RL.cpo,'cpo','Chief Procurement Officer','Executive oversight',true],
        [RL.analyst,'analyst','Procurement Analyst','Analytics and reporting',true],
      ];
      for (const [id,name,disp,desc,sys] of roles) {
        await qr.query(`INSERT INTO roles (id,name,display_name,description,is_system_role,tenant_id,created_at,updated_at) VALUES (${e(id as string)},${e(name as string)},${e(disp as string)},${e(desc as string)},${sys},'${T}',NOW(),NOW()) ON CONFLICT (id) DO NOTHING`);
      }

      // 2. Users
      this.logger.log('Seeding users...');
      const pw = await bcrypt.hash('ProcGenie2025!', 10);
      const users = [
        {id:U.admin,em:'admin@acme.com',fn:'Sarah',ln:'Chen',ti:'System Administrator',dept:'IT',role:RL.admin},
        {id:U.pm,em:'pm@acme.com',fn:'Michael',ln:'Torres',ti:'Senior Procurement Manager',dept:'Procurement',role:RL.pm},
        {id:U.buyer,em:'buyer@acme.com',fn:'Emily',ln:'Johnson',ti:'Strategic Buyer',dept:'Procurement',role:RL.buyer},
        {id:U.finance,em:'finance@acme.com',fn:'David',ln:'Kim',ti:'Finance Manager',dept:'Finance',role:RL.finance},
        {id:U.legal,em:'legal@acme.com',fn:'Jessica',ln:'Williams',ti:'Legal Counsel',dept:'Legal',role:RL.legal},
        {id:U.req1,em:'jsmith@acme.com',fn:'James',ln:'Smith',ti:'Engineering Manager',dept:'Engineering',role:RL.requester},
        {id:U.req2,em:'agarcia@acme.com',fn:'Ana',ln:'Garcia',ti:'Marketing Director',dept:'Marketing',role:RL.requester},
        {id:U.sp,em:'supplier@dell.com',fn:'Robert',ln:'Dell',ti:'Account Manager',dept:'Sales',role:RL.sp},
        {id:U.sust,em:'esg@acme.com',fn:'Priya',ln:'Patel',ti:'Sustainability Manager',dept:'ESG',role:RL.sust},
        {id:U.it,em:'itadmin@acme.com',fn:'Chris',ln:'Anderson',ti:'IT Integration Specialist',dept:'IT',role:RL.it},
        {id:U.cpo,em:'cpo@acme.com',fn:'Linda',ln:'Zhang',ti:'Chief Procurement Officer',dept:'Executive',role:RL.cpo},
        {id:U.analyst,em:'analyst@acme.com',fn:'Kevin',ln:'Brown',ti:'Procurement Analyst',dept:'Procurement',role:RL.analyst},
      ];
      for (const u of users) {
        await qr.query(`INSERT INTO users (id,email,password,first_name,last_name,title,department,status,is_sso_user,tenant_id,created_at,updated_at) VALUES (${e(u.id)},${e(u.em)},${e(pw)},${e(u.fn)},${e(u.ln)},${e(u.ti)},${e(u.dept)},'active',false,'${T}',NOW(),NOW()) ON CONFLICT (id) DO NOTHING`);
        await qr.query(`INSERT INTO user_roles (user_id,role_id) VALUES (${e(u.id)},${e(u.role)}) ON CONFLICT DO NOTHING`);
      }

      // 3. Suppliers
      this.logger.log('Seeding suppliers...');
      const suppliers = [
        {id:S.salesforce,code:'SUP-001001',name:'Salesforce Inc.',legal:'Salesforce Inc.',taxId:'11-3527854',ind:'Software',desc:'Leading CRM and enterprise cloud platform',web:'https://www.salesforce.com',cn:'Marc Benioff',ce:'enterprise@salesforce.com',st:'active',tier:'strategic',cats:'{CRM,Software Licenses,Cloud Services}',city:'San Francisco',state:'CA',country:'US',terms:'Annual',score:93.5},
        {id:S.aws,code:'SUP-001002',name:'Amazon Web Services',legal:'Amazon.com Inc.',taxId:'91-1646860',ind:'Cloud Services',desc:'Global cloud infrastructure and services',web:'https://aws.amazon.com',cn:'Jane Cloud',ce:'enterprise@aws.amazon.com',st:'active',tier:'strategic',cats:'{Cloud Services,Infrastructure,DevOps}',city:'Seattle',state:'WA',country:'US',terms:'Net 30',score:91.0},
        {id:S.microsoft,code:'SUP-001003',name:'Microsoft Corporation',legal:'Microsoft Corp.',taxId:'91-1144442',ind:'Software',desc:'Enterprise software, cloud computing, productivity',web:'https://www.microsoft.com',cn:'John Azure',ce:'licensing@microsoft.com',st:'active',tier:'strategic',cats:'{Software Licenses,Cloud Services,Productivity}',city:'Redmond',state:'WA',country:'US',terms:'Net 30',score:95.0},
        {id:S.apple,code:'SUP-001004',name:'Apple Inc.',legal:'Apple Inc.',taxId:'94-2404110',ind:'IT Hardware',desc:'Consumer electronics and enterprise devices',web:'https://www.apple.com',cn:'Lisa Hardware',ce:'business@apple.com',st:'active',tier:'preferred',cats:'{IT Equipment,Laptops,Mobile Devices}',city:'Cupertino',state:'CA',country:'US',terms:'Net 30',score:90.0},
        {id:S.dell,code:'SUP-001005',name:'Dell Technologies',legal:'Dell Inc.',taxId:'75-2589680',ind:'IT Hardware',desc:'Enterprise IT hardware, servers, and infrastructure',web:'https://www.dell.com',cn:'Robert Dell',ce:'enterprise@dell.com',st:'active',tier:'strategic',cats:'{IT Equipment,Laptops,Servers,Storage}',city:'Round Rock',state:'TX',country:'US',terms:'Net 30',score:92.5},
        {id:S.google,code:'SUP-001006',name:'Google Cloud',legal:'Alphabet Inc.',taxId:'61-1767919',ind:'Cloud Services',desc:'Cloud computing, AI/ML services, and workspace',web:'https://cloud.google.com',cn:'Sam Cloud',ce:'enterprise@google.com',st:'active',tier:'preferred',cats:'{Cloud Services,AI/ML,Productivity}',city:'Mountain View',state:'CA',country:'US',terms:'Net 30',score:89.0},
        {id:S.slack,code:'SUP-001007',name:'Slack Technologies',legal:'Slack Technologies LLC',taxId:'46-4689498',ind:'Software',desc:'Enterprise team communication platform',web:'https://slack.com',cn:'Tom Comms',ce:'enterprise@slack.com',st:'active',tier:'approved',cats:'{Software Licenses,Communication}',city:'San Francisco',state:'CA',country:'US',terms:'Annual',score:82.0},
        {id:S.zoom,code:'SUP-001008',name:'Zoom Video Communications',legal:'Zoom Video Communications Inc.',taxId:'61-1648780',ind:'Software',desc:'Video conferencing and unified communications',web:'https://zoom.us',cn:'Eric Video',ce:'enterprise@zoom.us',st:'active',tier:'approved',cats:'{Software Licenses,Communication,Video}',city:'San Jose',state:'CA',country:'US',terms:'Annual',score:80.5},
        {id:S.adobe,code:'SUP-001009',name:'Adobe Inc.',legal:'Adobe Inc.',taxId:'77-0019522',ind:'Software',desc:'Creative, document, and experience cloud',web:'https://www.adobe.com',cn:'Amy Creative',ce:'enterprise@adobe.com',st:'active',tier:'preferred',cats:'{Software Licenses,Creative Tools,Document Management}',city:'San Jose',state:'CA',country:'US',terms:'Annual',score:88.5},
        {id:S.atlassian,code:'SUP-001010',name:'Atlassian Corporation',legal:'Atlassian Corp.',taxId:'20-3780867',ind:'Software',desc:'Project management and collaboration tools',web:'https://www.atlassian.com',cn:'Mike Agile',ce:'enterprise@atlassian.com',st:'active',tier:'preferred',cats:'{Software Licenses,Project Management,DevOps}',city:'Sydney',state:null,country:'AU',terms:'Annual',score:87.0},
        {id:S.workday,code:'SUP-001011',name:'Workday Inc.',legal:'Workday Inc.',taxId:'26-1435727',ind:'Software',desc:'Enterprise cloud ERP for HR and finance',web:'https://www.workday.com',cn:'Dana HR',ce:'enterprise@workday.com',st:'active',tier:'strategic',cats:'{Software Licenses,HRIS,ERP}',city:'Pleasanton',state:'CA',country:'US',terms:'Annual',score:91.5},
        {id:S.serviceNow,code:'SUP-001012',name:'ServiceNow Inc.',legal:'ServiceNow Inc.',taxId:'20-0847504',ind:'Software',desc:'IT service management and digital workflows',web:'https://www.servicenow.com',cn:'Pat ITSM',ce:'enterprise@servicenow.com',st:'active',tier:'preferred',cats:'{Software Licenses,ITSM,Workflow}',city:'Santa Clara',state:'CA',country:'US',terms:'Annual',score:89.5},
        {id:S.deloitte,code:'SUP-001013',name:'Deloitte Consulting',legal:'Deloitte LLP',taxId:'06-1067904',ind:'Professional Services',desc:'Management consulting and advisory',web:'https://www.deloitte.com',cn:'Tom Advisor',ce:'sourcing@deloitte.com',st:'active',tier:'preferred',cats:'{Professional Services,Consulting,Audit}',city:'New York',state:'NY',country:'US',terms:'Net 60',score:86.5},
        {id:S.oracle,code:'SUP-001014',name:'Oracle Corporation',legal:'Oracle Corp.',taxId:'54-2185193',ind:'Software',desc:'Enterprise database and cloud applications',web:'https://www.oracle.com',cn:'Larry DB',ce:'enterprise@oracle.com',st:'active',tier:'strategic',cats:'{Software Licenses,Database,ERP,Cloud Services}',city:'Austin',state:'TX',country:'US',terms:'Net 45',score:88.0},
        {id:S.sap,code:'SUP-001015',name:'SAP SE',legal:'SAP SE',taxId:'DE-143293856',ind:'Software',desc:'Enterprise resource planning solutions',web:'https://www.sap.com',cn:'Hans ERP',ce:'enterprise@sap.com',st:'active',tier:'strategic',cats:'{Software Licenses,ERP,Supply Chain}',city:'Walldorf',state:null,country:'DE',terms:'Net 45',score:90.5},
        {id:S.staples,code:'SUP-001016',name:'Staples Inc.',legal:'Staples Inc.',taxId:'04-2896127',ind:'Office Supplies',desc:'Office supplies, furniture, and breakroom',web:'https://www.staples.com',cn:'Lisa Supplies',ce:'b2b@staples.com',st:'active',tier:'approved',cats:'{Office Supplies,Furniture,Breakroom}',city:'Framingham',state:'MA',country:'US',terms:'Net 30',score:78.0},
      ];
      for (const s of suppliers) {
        await qr.query(`INSERT INTO suppliers (id,supplier_code,company_name,legal_name,tax_id,industry,description,website,contact_name,contact_email,status,tier,categories,city,state,country,payment_terms,overall_score,tenant_id,created_by,created_at,updated_at) VALUES (${e(s.id)},${e(s.code)},${e(s.name)},${e(s.legal)},${e(s.taxId)},${e(s.ind)},${e(s.desc)},${e(s.web)},${e(s.cn)},${e(s.ce)},${e(s.st)},${e(s.tier)},'${s.cats}',${e(s.city)},${e(s.state)},${e(s.country)},${e(s.terms)},${s.score},'${T}',${e(U.pm)},NOW(),NOW()) ON CONFLICT (id) DO NOTHING`);
      }

      // 4. Catalog Items
      this.logger.log('Seeding catalog items...');
      const catItems = [
        {sku:'IT-LAPTOP-001',name:'MacBook Pro 16-inch M3 Max',desc:'High-performance laptop',cat:'IT Equipment',price:3499,suppId:S.apple,lead:5},
        {sku:'IT-LAPTOP-002',name:'Dell Latitude 7440',desc:'Enterprise business laptop',cat:'IT Equipment',price:1899,suppId:S.dell,lead:3},
        {sku:'IT-MONITOR-001',name:'Dell UltraSharp 32 4K Monitor',desc:'32-inch 4K USB-C hub monitor',cat:'IT Equipment',price:749,suppId:S.dell,lead:3},
        {sku:'IT-SERVER-001',name:'Dell PowerEdge R760 Server',desc:'Enterprise rack server',cat:'IT Equipment',price:12500,suppId:S.dell,lead:14},
        {sku:'SW-CRM-001',name:'Salesforce Enterprise License',desc:'Per user/year',cat:'Software Licenses',price:1800,suppId:S.salesforce,lead:1},
        {sku:'SW-CLOUD-001',name:'AWS Reserved Instance - m5.xlarge',desc:'1-year reserved',cat:'Cloud Services',price:8400,suppId:S.aws,lead:1},
        {sku:'SW-CLOUD-002',name:'Azure Enterprise Subscription',desc:'Enterprise agreement',cat:'Cloud Services',price:12000,suppId:S.microsoft,lead:1},
        {sku:'SW-COLLAB-001',name:'Slack Business+ License',desc:'Per user/year',cat:'Software Licenses',price:150,suppId:S.slack,lead:1},
        {sku:'SW-COLLAB-002',name:'Zoom Enterprise License',desc:'Per user/year',cat:'Software Licenses',price:240,suppId:S.zoom,lead:1},
        {sku:'SW-CREATE-001',name:'Adobe Creative Cloud License',desc:'All Apps per user/year',cat:'Software Licenses',price:899,suppId:S.adobe,lead:1},
        {sku:'SW-PM-001',name:'Jira Cloud Premium License',desc:'Per user/year',cat:'Software Licenses',price:175,suppId:S.atlassian,lead:1},
        {sku:'OF-SUPPLY-001',name:'Office Supply Bundle - Standard',desc:'Monthly office supply kit',cat:'Office Supplies',price:89,suppId:S.staples,lead:2},
        {sku:'OF-FURN-001',name:'Herman Miller Aeron Chair',desc:'Ergonomic office chair',cat:'Office Furniture',price:1395,suppId:S.staples,lead:10},
        {sku:'PS-CONSULT-001',name:'Deloitte Strategy Consulting',desc:'Per day rate',cat:'Professional Services',price:5500,suppId:S.deloitte,lead:10},
      ];
      for (const i of catItems) {
        await qr.query(`INSERT INTO catalog_items (id,sku,name,description,category,unit_price,currency,unit_of_measure,supplier_id,is_active,lead_time_days,tenant_id,created_at,updated_at) VALUES (${e(uid())},${e(i.sku)},${e(i.name)},${e(i.desc)},${e(i.cat)},${i.price},'USD','EA',${e(i.suppId)},true,${i.lead},'${T}',NOW(),NOW()) ON CONFLICT (id) DO NOTHING`);
      }

      // 5. Contracts
      this.logger.log('Seeding contracts...');
      const contracts = [
        {id:C.dellMsa,num:'CON-2024-000101',title:'Master Service Agreement - Dell Technologies',type:'msa',status:'active',suppId:S.dell,val:2500000,start:'2024-01-01',end:'2026-12-31',auto:true,pay:'Net 30',law:'State of Delaware, USA'},
        {id:C.awsFramework,num:'CON-2025-000102',title:'Cloud Infrastructure Framework - AWS',type:'framework',status:'active',suppId:S.aws,val:1200000,start:'2025-01-01',end:'2027-12-31',auto:true,pay:'Net 30',law:'State of Washington, USA'},
        {id:C.msLicense,num:'CON-2024-000103',title:'Enterprise License Agreement - Microsoft',type:'license',status:'active',suppId:S.microsoft,val:850000,start:'2024-07-01',end:'2027-06-30',auto:true,pay:'Annual',law:'State of Washington, USA'},
        {id:C.sfCrm,num:'CON-2024-000104',title:'CRM Platform Agreement - Salesforce',type:'license',status:'active',suppId:S.salesforce,val:540000,start:'2024-04-01',end:'2027-03-31',auto:true,pay:'Annual',law:'State of California, USA'},
        {id:C.oracleSow,num:'CON-2024-000105',title:'ERP Migration SOW - Oracle',type:'sow',status:'active',suppId:S.oracle,val:1800000,start:'2024-06-01',end:'2025-12-31',auto:false,pay:'Net 45',law:'State of Texas, USA'},
        {id:C.sapLicense,num:'CON-2023-000106',title:'S/4HANA Enterprise License - SAP',type:'license',status:'expired',suppId:S.sap,val:2200000,start:'2023-01-01',end:'2024-12-31',auto:false,pay:'Net 45',law:'Federal Republic of Germany'},
        {id:C.deloitteSow,num:'CON-2025-000107',title:'Digital Transformation SOW - Deloitte',type:'sow',status:'in_review',suppId:S.deloitte,val:1500000,start:'2025-03-01',end:'2026-08-31',auto:false,pay:'Net 60',law:'State of New York, USA'},
        {id:C.adobeLicense,num:'CON-2024-000108',title:'Creative Cloud Enterprise - Adobe',type:'license',status:'active',suppId:S.adobe,val:180000,start:'2024-09-01',end:'2027-08-31',auto:true,pay:'Annual',law:'State of California, USA'},
        {id:C.googleCloud,num:'CON-2025-000109',title:'GCP Committed Use Agreement - Google',type:'framework',status:'draft',suppId:S.google,val:960000,start:'2025-04-01',end:'2028-03-31',auto:true,pay:'Net 30',law:'State of California, USA'},
        {id:C.zoomSla,num:'CON-2024-000110',title:'Enterprise Communication SLA - Zoom',type:'sla',status:'expired',suppId:S.zoom,val:96000,start:'2023-06-01',end:'2024-05-31',auto:false,pay:'Annual',law:'State of California, USA'},
        {id:C.workdayHr,num:'CON-2024-000111',title:'HCM Cloud Subscription - Workday',type:'license',status:'active',suppId:S.workday,val:640000,start:'2024-01-01',end:'2026-12-31',auto:true,pay:'Annual',law:'State of California, USA'},
        {id:C.atlasSow,num:'CON-2025-000112',title:'DevOps Toolchain Implementation - Atlassian',type:'sow',status:'terminated',suppId:S.atlassian,val:320000,start:'2024-09-01',end:'2025-06-30',auto:false,pay:'Net 30',law:'New South Wales, Australia'},
      ];
      for (const c of contracts) {
        await qr.query(`INSERT INTO contracts (id,contract_number,title,type,status,supplier_id,total_value,currency,start_date,end_date,owner_id,auto_renew,payment_terms,governing_law,tenant_id,created_by,created_at,updated_at) VALUES (${e(c.id)},${e(c.num)},${e(c.title)},${e(c.type)},${e(c.status)},${e(c.suppId)},${c.val},'USD','${c.start}','${c.end}',${e(U.pm)},${c.auto},${e(c.pay)},${e(c.law)},'${T}',${e(U.pm)},NOW(),NOW()) ON CONFLICT (id) DO NOTHING`);
      }

      // 6. Requests
      this.logger.log('Seeding requests...');
      const reqs = [
        {id:R.r1,num:'REQ-2025-000101',title:'New developer laptops for Q3 interns',status:'draft',pri:'medium',cat:'goods',total:28000,reqer:U.req1,cc:'Engineering',by:'2025-07-01'},
        {id:R.r2,num:'REQ-2025-000102',title:'Office supplies restock - Building A',status:'draft',pri:'low',cat:'goods',total:2400,reqer:U.req2,cc:'Facilities',by:'2025-06-15'},
        {id:R.r3,num:'REQ-2025-000103',title:'Zoom Enterprise license renewal quote',status:'draft',pri:'medium',cat:'software',total:48000,reqer:U.it,cc:'IT',by:'2025-08-01'},
        {id:R.r4,num:'REQ-2025-000104',title:'Ergonomic chairs for remote workers',status:'draft',pri:'low',cat:'goods',total:41850,reqer:U.req2,cc:'HR',by:'2025-09-01'},
        {id:R.r5,num:'REQ-2025-000105',title:'Security penetration testing services',status:'draft',pri:'high',cat:'services',total:75000,reqer:U.it,cc:'InfoSec',by:'2025-06-30'},
        {id:R.r6,num:'REQ-2025-000106',title:'Marketing automation platform upgrade',status:'pending_approval',pri:'medium',cat:'software',total:24000,reqer:U.req2,cc:'Marketing',by:'2025-05-01'},
        {id:R.r7,num:'REQ-2025-000107',title:'Cloud infrastructure expansion - AWS',status:'pending_approval',pri:'critical',cat:'services',total:180000,reqer:U.it,cc:'IT Infrastructure',by:'2025-03-31'},
        {id:R.r8,num:'REQ-2025-000108',title:'Adobe Creative Cloud licenses (50 seats)',status:'pending_approval',pri:'medium',cat:'software',total:44950,reqer:U.req2,cc:'Design',by:'2025-04-15'},
        {id:R.r9,num:'REQ-2025-000109',title:'Standing desks for engineering floor',status:'pending_approval',pri:'low',cat:'goods',total:34950,reqer:U.req1,cc:'Engineering',by:'2025-07-01'},
        {id:R.r10,num:'REQ-2025-000110',title:'Deloitte strategy consulting engagement',status:'pending_approval',pri:'high',cat:'services',total:275000,reqer:U.cpo,cc:'Executive',by:'2025-04-01'},
        {id:R.r11,num:'REQ-2025-000111',title:'ServiceNow ITSM implementation',status:'pending_approval',pri:'high',cat:'software',total:360000,reqer:U.it,cc:'IT',by:'2025-06-01'},
        {id:R.r12,num:'REQ-2025-000112',title:'Annual Jira license renewal (200 seats)',status:'pending_approval',pri:'medium',cat:'software',total:35000,reqer:U.it,cc:'IT',by:'2025-05-15'},
        {id:R.r13,num:'REQ-2025-000113',title:'Engineering laptops for Q2 new hires',status:'approved',pri:'high',cat:'goods',total:45000,reqer:U.req1,cc:'Engineering',by:'2025-04-15'},
        {id:R.r14,num:'REQ-2025-000114',title:'Data center UPS replacement',status:'approved',pri:'critical',cat:'goods',total:125000,reqer:U.it,cc:'IT Infrastructure',by:'2025-03-15'},
        {id:R.r15,num:'REQ-2025-000115',title:'Salesforce CRM additional 100 seats',status:'approved',pri:'medium',cat:'software',total:180000,reqer:U.pm,cc:'Sales',by:'2025-05-01'},
        {id:R.r16,num:'REQ-2025-000116',title:'Office furniture for new wing',status:'approved',pri:'low',cat:'goods',total:62000,reqer:U.req1,cc:'Facilities',by:'2025-06-30'},
        {id:R.r17,num:'REQ-2025-000117',title:'Workday HCM upgrade project',status:'approved',pri:'high',cat:'software',total:420000,reqer:U.pm,cc:'HR',by:'2025-04-01'},
        {id:R.r18,num:'REQ-2025-000118',title:'Premium coffee machine for lobby',status:'rejected',pri:'low',cat:'goods',total:8500,reqer:U.req2,cc:'Facilities',by:'2025-06-01'},
        {id:R.r19,num:'REQ-2025-000119',title:'Personal iPad for each team lead',status:'rejected',pri:'low',cat:'goods',total:52000,reqer:U.req1,cc:'Engineering',by:'2025-05-01'},
        {id:R.r20,num:'REQ-2025-000120',title:'Unauthorized AI tool subscription',status:'rejected',pri:'medium',cat:'software',total:15000,reqer:U.req2,cc:'Marketing',by:'2025-04-15'},
        {id:R.r21,num:'REQ-2025-000121',title:'Dell monitors for new hires',status:'po_created',pri:'medium',cat:'goods',total:22470,reqer:U.req1,cc:'Engineering',by:'2025-04-01'},
        {id:R.r22,num:'REQ-2025-000122',title:'AWS reserved instances Q2',status:'po_created',pri:'high',cat:'services',total:96000,reqer:U.it,cc:'IT Infrastructure',by:'2025-04-01'},
        {id:R.r23,num:'REQ-2025-000123',title:'Staples Q1 office supply order',status:'po_created',pri:'low',cat:'goods',total:8500,reqer:U.req2,cc:'Facilities',by:'2025-03-15'},
        {id:R.r24,num:'REQ-2025-000124',title:'Microsoft 365 E5 annual renewal',status:'completed',pri:'high',cat:'software',total:380000,reqer:U.it,cc:'IT',by:'2025-01-15'},
        {id:R.r25,num:'REQ-2025-000125',title:'Q4 2024 server hardware refresh',status:'completed',pri:'critical',cat:'capex',total:450000,reqer:U.it,cc:'IT Infrastructure',by:'2024-12-31'},
      ];
      for (const r of reqs) {
        await qr.query(`INSERT INTO requests (id,request_number,title,status,priority,category,estimated_total,currency,requester_id,cost_center,needed_by_date,tenant_id,created_by,created_at,updated_at) VALUES (${e(r.id)},${e(r.num)},${e(r.title)},${e(r.status)},${e(r.pri)},${e(r.cat)},${r.total},'USD',${e(r.reqer)},${e(r.cc)},'${r.by}','${T}',${e(r.reqer)},NOW(),NOW()) ON CONFLICT (id) DO NOTHING`);
      }

      // 7. Purchase Orders
      this.logger.log('Seeding purchase orders...');
      const pos = [
        {id:PO.po1,num:'PO-2025-000101',title:'Engineering Laptops - MacBook Pro',status:'sent_to_supplier',reqId:R.r13,suppId:S.apple,conId:null as string|null,total:34990,cc:'Engineering',pay:'Net 30'},
        {id:PO.po2,num:'PO-2025-000102',title:'Dell Monitors for New Hires',status:'sent_to_supplier',reqId:R.r21,suppId:S.dell,conId:C.dellMsa,total:22470,cc:'Engineering',pay:'Net 30'},
        {id:PO.po3,num:'PO-2025-000103',title:'AWS Reserved Instances Q2',status:'approved',reqId:R.r22,suppId:S.aws,conId:C.awsFramework,total:96000,cc:'IT Infrastructure',pay:'Net 30'},
        {id:PO.po4,num:'PO-2025-000104',title:'Office Supplies Q1 Bulk Order',status:'fully_received',reqId:R.r23,suppId:S.staples,conId:null,total:8500,cc:'Facilities',pay:'Net 30'},
        {id:PO.po5,num:'PO-2025-000105',title:'Microsoft 365 E5 Annual Renewal',status:'closed',reqId:R.r24,suppId:S.microsoft,conId:C.msLicense,total:380000,cc:'IT',pay:'Annual'},
        {id:PO.po6,num:'PO-2025-000106',title:'Salesforce CRM 100 Additional Seats',status:'pending_approval',reqId:R.r15,suppId:S.salesforce,conId:C.sfCrm,total:180000,cc:'Sales',pay:'Annual'},
        {id:PO.po7,num:'PO-2025-000107',title:'Data Center UPS Replacement',status:'draft',reqId:R.r14,suppId:S.dell,conId:C.dellMsa,total:125000,cc:'IT Infrastructure',pay:'Net 30'},
        {id:PO.po8,num:'PO-2025-000108',title:'Server Hardware Refresh Q4 2024',status:'invoiced',reqId:R.r25,suppId:S.dell,conId:C.dellMsa,total:450000,cc:'IT Infrastructure',pay:'Net 30'},
        {id:PO.po9,num:'PO-2025-000109',title:'Office Furniture - New Wing',status:'acknowledged',reqId:R.r16,suppId:S.staples,conId:null,total:62000,cc:'Facilities',pay:'Net 30'},
        {id:PO.po10,num:'PO-2025-000110',title:'Adobe Creative Cloud 50 Seats',status:'pending_approval',reqId:R.r8,suppId:S.adobe,conId:C.adobeLicense,total:44950,cc:'Design',pay:'Annual'},
        {id:PO.po11,num:'PO-2025-000111',title:'Deloitte Strategy Engagement',status:'draft',reqId:R.r10,suppId:S.deloitte,conId:C.deloitteSow,total:275000,cc:'Executive',pay:'Net 60'},
        {id:PO.po12,num:'PO-2025-000112',title:'Workday HCM Upgrade',status:'approved',reqId:R.r17,suppId:S.workday,conId:C.workdayHr,total:420000,cc:'HR',pay:'Annual'},
        {id:PO.po13,num:'PO-2025-000113',title:'Google Cloud Platform Credits',status:'partially_received',reqId:null as string|null,suppId:S.google,conId:null,total:120000,cc:'IT',pay:'Net 30'},
        {id:PO.po14,num:'PO-2025-000114',title:'Jira Cloud Premium Renewal',status:'sent_to_supplier',reqId:R.r12,suppId:S.atlassian,conId:null,total:35000,cc:'IT',pay:'Annual'},
        {id:PO.po15,num:'PO-2025-000115',title:'Slack Business+ Renewal 500 seats',status:'fully_received',reqId:null,suppId:S.slack,conId:null,total:75000,cc:'IT',pay:'Annual'},
      ];
      for (const po of pos) {
        await qr.query(`INSERT INTO purchase_orders (id,po_number,title,status,request_id,supplier_id,contract_id,total_amount,currency,buyer_id,cost_center,payment_terms,tenant_id,created_by,created_at,updated_at) VALUES (${e(po.id)},${e(po.num)},${e(po.title)},${e(po.status)},${e(po.reqId)},${e(po.suppId)},${e(po.conId)},${po.total},'USD',${e(U.buyer)},${e(po.cc)},${e(po.pay)},'${T}',${e(U.buyer)},NOW(),NOW()) ON CONFLICT (id) DO NOTHING`);
      }

      // 8. Invoices
      this.logger.log('Seeding invoices...');
      const invoices = [
        {id:INV.inv1,num:'INV-2025-000101',sInv:'DELL-INV-78945',status:'matched',suppId:S.dell,sName:'Dell Technologies',poId:PO.po8,sub:450000,tax:36000,total:486000,iDate:'2025-01-15',dDate:'2025-02-14',pay:'Net 30',cc:'IT Infrastructure'},
        {id:INV.inv2,num:'INV-2025-000102',sInv:'AWS-202502-001',status:'pending_approval',suppId:S.aws,sName:'Amazon Web Services',poId:PO.po3,sub:96000,tax:0,total:96000,iDate:'2025-02-01',dDate:'2025-03-03',pay:'Net 30',cc:'IT Infrastructure'},
        {id:INV.inv3,num:'INV-2025-000103',sInv:'STP-Q1-2025',status:'paid',suppId:S.staples,sName:'Staples Inc.',poId:PO.po4,sub:8500,tax:680,total:9180,iDate:'2025-01-20',dDate:'2025-02-19',pay:'Net 30',cc:'Facilities'},
        {id:INV.inv4,num:'INV-2025-000104',sInv:'MSFT-EA-2025-001',status:'approved',suppId:S.microsoft,sName:'Microsoft Corporation',poId:PO.po5,sub:380000,tax:0,total:380000,iDate:'2025-01-05',dDate:'2025-01-05',pay:'Annual',cc:'IT'},
        {id:INV.inv5,num:'INV-2025-000105',sInv:'DELL-MON-29384',status:'received',suppId:S.dell,sName:'Dell Technologies',poId:PO.po2,sub:22470,tax:1797.60,total:24267.60,iDate:'2025-02-20',dDate:'2025-03-22',pay:'Net 30',cc:'Engineering'},
        {id:INV.inv6,num:'INV-2025-000106',sInv:'ADOBE-CC-Q1',status:'scheduled_for_payment',suppId:S.adobe,sName:'Adobe Inc.',poId:PO.po10,sub:44950,tax:0,total:44950,iDate:'2025-02-10',dDate:'2025-02-10',pay:'Annual',cc:'Design'},
        {id:INV.inv7,num:'INV-2025-000107',sInv:'GCP-JAN-2025',status:'pending_validation',suppId:S.google,sName:'Google Cloud',poId:PO.po13,sub:42000,tax:0,total:42000,iDate:'2025-02-01',dDate:'2025-03-03',pay:'Net 30',cc:'IT'},
        {id:INV.inv8,num:'INV-2025-000108',sInv:'SLK-ENT-2025',status:'paid',suppId:S.slack,sName:'Slack Technologies',poId:PO.po15,sub:75000,tax:0,total:75000,iDate:'2025-01-10',dDate:'2025-01-10',pay:'Annual',cc:'IT'},
        {id:INV.inv9,num:'INV-2025-000109',sInv:'WDAY-HCM-Q1',status:'exception',suppId:S.workday,sName:'Workday Inc.',poId:PO.po12,sub:435000,tax:0,total:435000,iDate:'2025-02-15',dDate:'2025-02-15',pay:'Annual',cc:'HR'},
        {id:INV.inv10,num:'INV-2025-000110',sInv:'ATL-JIRA-2025',status:'received',suppId:S.atlassian,sName:'Atlassian Corporation',poId:PO.po14,sub:35000,tax:0,total:35000,iDate:'2025-02-25',dDate:'2025-03-27',pay:'Annual',cc:'IT'},
      ];
      for (const inv of invoices) {
        await qr.query(`INSERT INTO invoices (id,invoice_number,supplier_invoice_number,type,status,supplier_id,supplier_name,purchase_order_id,subtotal,tax_amount,total_amount,currency,invoice_date,due_date,payment_terms,cost_center,tenant_id,created_by,created_at,updated_at) VALUES (${e(inv.id)},${e(inv.num)},${e(inv.sInv)},'standard',${e(inv.status)},${e(inv.suppId)},${e(inv.sName)},${e(inv.poId)},${inv.sub},${inv.tax},${inv.total},'USD','${inv.iDate}','${inv.dDate}',${e(inv.pay)},${e(inv.cc)},'${T}',${e(U.finance)},NOW(),NOW()) ON CONFLICT (id) DO NOTHING`);
      }

      // 9. AI Agents
      this.logger.log('Seeding agents...');
      const agents = [
        {id:AG.ag1,name:'Intake Triage Agent',type:'intake_analyst',desc:'Analyzes incoming purchase requests, auto-categorizes, suggests suppliers',status:'active',rate:94.2,time:1850,done:1247,fail:72,hitl:false,thr:75},
        {id:AG.ag2,name:'Spend Analytics Agent',type:'spend_analyzer',desc:'Analyzes procurement spend patterns, identifies savings opportunities',status:'active',rate:96.5,time:2100,done:2150,fail:78,hitl:false,thr:70},
        {id:AG.ag3,name:'Contract Review Agent',type:'contract_reviewer',desc:'AI-powered contract analysis for risk identification, clause extraction',status:'active',rate:91.8,time:4200,done:389,fail:35,hitl:true,thr:85},
        {id:AG.ag4,name:'PO Automator Agent',type:'catalog_manager',desc:'Automatically generates POs from approved requests',status:'active',rate:97.1,time:950,done:3420,fail:102,hitl:false,thr:90},
        {id:AG.ag5,name:'Supplier Risk Monitor',type:'supplier_risk_assessor',desc:'Monitors supplier financial health, compliance, cyber security',status:'active',rate:89.5,time:3500,done:678,fail:71,hitl:true,thr:80},
        {id:AG.ag6,name:'Invoice Matching Agent',type:'invoice_matcher',desc:'Automated three-way matching of invoices against POs and GRs',status:'active',rate:97.8,time:850,done:5420,fail:120,hitl:false,thr:90},
        {id:AG.ag7,name:'Compliance Monitor',type:'compliance_monitor',desc:'Tracks regulatory changes and monitors procurement compliance',status:'active',rate:93.0,time:1200,done:890,fail:67,hitl:true,thr:85},
        {id:AG.ag8,name:'Market Intelligence Agent',type:'market_intelligence',desc:'Scans market data for commodity pricing trends',status:'active',rate:88.2,time:5600,done:456,fail:56,hitl:false,thr:75},
        {id:AG.ag9,name:'Negotiation Advisor',type:'negotiation_advisor',desc:'Data-driven negotiation strategies based on market analysis',status:'idle',rate:85.0,time:3800,done:234,fail:42,hitl:true,thr:80},
        {id:AG.ag10,name:'Demand Forecaster',type:'demand_forecaster',desc:'Predicts future procurement demand based on historical patterns',status:'active',rate:87.5,time:4500,done:567,fail:78,hitl:false,thr:70},
        {id:AG.ag11,name:'ESG Scoring Agent',type:'esg_scorer',desc:'Evaluates supplier ESG performance and carbon footprint',status:'active',rate:90.3,time:2800,done:345,fail:34,hitl:false,thr:75},
        {id:AG.ag12,name:'Catalog Manager Agent',type:'catalog_manager',desc:'Maintains catalog accuracy, suggests price updates',status:'idle',rate:92.0,time:1500,done:890,fail:72,hitl:false,thr:80},
        {id:AG.ag13,name:'Approval Router',type:'approval_router',desc:'Intelligently routes approval requests based on amount thresholds',status:'active',rate:98.5,time:200,done:8920,fail:134,hitl:false,thr:95},
        {id:AG.ag14,name:'Exception Handler',type:'exception_handler',desc:'Resolves common procurement exceptions like price variances',status:'active',rate:86.0,time:1800,done:1234,fail:202,hitl:true,thr:80},
        {id:AG.ag15,name:'Reporting Agent',type:'reporting_agent',desc:'Generates automated procurement reports and dashboards',status:'active',rate:95.0,time:3200,done:678,fail:36,hitl:false,thr:70},
      ];
      for (const a of agents) {
        await qr.query(`INSERT INTO agents (id,name,type,description,status,model_id,version,success_rate,avg_response_time_ms,total_tasks_completed,total_tasks_failed,requires_hitl,confidence_threshold,max_concurrent_tasks,last_active_at,tenant_id,created_by,created_at,updated_at) VALUES (${e(a.id)},${e(a.name)},${e(a.type)},${e(a.desc)},${e(a.status)},'gpt-4o','1.0.0',${a.rate},${a.time},${a.done},${a.fail},${a.hitl},${a.thr},5,NOW(),'${T}',${e(U.admin)},NOW(),NOW()) ON CONFLICT (id) DO NOTHING`);
      }

      // 10. Sourcing Projects + Bids
      this.logger.log('Seeding sourcing projects...');
      const srcProjects = [
        {id:SRC.src1,num:'SRC-2025-000101',title:'Enterprise Laptop Fleet Renewal 2025',desc:'Strategic sourcing for 500+ laptops',type:'rfp',status:'evaluation',cat:'IT Equipment',val:750000,startD:'2025-01-15',endD:'2025-02-28'},
        {id:SRC.src2,num:'SRC-2025-000102',title:'Cloud Services Consolidation',desc:'Multi-cloud strategy evaluation',type:'rfq',status:'bidding_open',cat:'Cloud Services',val:2000000,startD:'2025-02-01',endD:'2025-03-15'},
        {id:SRC.src3,num:'SRC-2025-000103',title:'Professional Services Panel Refresh',desc:'Consulting services panel agreement',type:'rfp',status:'published',cat:'Professional Services',val:5000000,startD:'2025-03-01',endD:'2025-04-30'},
        {id:SRC.src4,num:'SRC-2025-000104',title:'Office Supplies Category Review',desc:'Annual office supplies contract review',type:'rfq',status:'awarded',cat:'Office Supplies',val:350000,startD:'2024-11-01',endD:'2024-12-15'},
        {id:SRC.src5,num:'SRC-2025-000105',title:'Next-Gen ERP Platform Selection',desc:'Strategic ERP platform evaluation',type:'rfi',status:'draft',cat:'Software',val:8000000,startD:null as string|null,endD:null as string|null},
      ];
      for (const p of srcProjects) {
        await qr.query(`INSERT INTO sourcing_projects (id,project_number,title,description,type,status,category,estimated_value,currency,owner_id,is_sealed,bid_start_date,bid_end_date,tenant_id,created_by,created_at,updated_at) VALUES (${e(p.id)},${e(p.num)},${e(p.title)},${e(p.desc)},${e(p.type)},${e(p.status)},${e(p.cat)},${p.val},'USD',${e(U.pm)},false,${p.startD ? `'${p.startD}'` : 'NULL'},${p.endD ? `'${p.endD}'` : 'NULL'},'${T}',${e(U.pm)},NOW(),NOW()) ON CONFLICT (id) DO NOTHING`);
      }

      // Bids
      this.logger.log('Seeding bids...');
      const bids = [
        {num:'BID-2025-000101',srcId:SRC.src1,suppId:S.dell,sName:'Dell Technologies',status:'under_evaluation',price:680000,tech:92,com:85,over:89.2},
        {num:'BID-2025-000102',srcId:SRC.src1,suppId:S.apple,sName:'Apple Inc.',status:'under_evaluation',price:820000,tech:95,com:72,over:85.4},
        {num:'BID-2025-000103',srcId:SRC.src2,suppId:S.aws,sName:'Amazon Web Services',status:'submitted',price:850000,tech:94,com:88,over:91.6},
        {num:'BID-2025-000104',srcId:SRC.src2,suppId:S.microsoft,sName:'Microsoft Corporation',status:'submitted',price:920000,tech:91,com:82,over:87.4},
        {num:'BID-2025-000105',srcId:SRC.src2,suppId:S.google,sName:'Google Cloud',status:'submitted',price:780000,tech:89,com:90,over:89.4},
        {num:'BID-2025-000106',srcId:SRC.src4,suppId:S.staples,sName:'Staples Inc.',status:'awarded',price:310000,tech:78,com:95,over:85.8},
      ];
      for (const b of bids) {
        await qr.query(`INSERT INTO bids (id,bid_number,sourcing_project_id,supplier_id,supplier_name,status,total_price,currency,technical_score,commercial_score,overall_score,submitted_at,tenant_id,created_by,created_at,updated_at) VALUES (${e(uid())},${e(b.num)},${e(b.srcId)},${e(b.suppId)},${e(b.sName)},${e(b.status)},${b.price},'USD',${b.tech},${b.com},${b.over},NOW(),'${T}',${e(U.sp)},NOW(),NOW()) ON CONFLICT (id) DO NOTHING`);
      }

      // 11. Integrations
      this.logger.log('Seeding integrations...');
      const connectors = [
        {code:'sap_s4hana',name:'SAP S/4HANA',desc:'Enterprise ERP integration',cat:'erp',vendor:'SAP',ver:'2.1.0',prem:true},
        {code:'salesforce_crm',name:'Salesforce CRM',desc:'CRM integration',cat:'crm',vendor:'Salesforce',ver:'1.5.0',prem:false},
        {code:'workday_hcm',name:'Workday HCM',desc:'HR data sync',cat:'hr',vendor:'Workday',ver:'1.3.0',prem:true},
        {code:'docusign',name:'DocuSign',desc:'E-signature for contracts',cat:'e_signature',vendor:'DocuSign',ver:'1.2.0',prem:false},
        {code:'power_bi',name:'Power BI',desc:'Analytics dashboards',cat:'analytics',vendor:'Microsoft',ver:'1.0.0',prem:false},
        {code:'coupa_bsm',name:'Coupa BSM',desc:'Business spend management',cat:'erp',vendor:'Coupa',ver:'1.0.0',prem:true},
        {code:'stripe_pay',name:'Stripe Payments',desc:'Payment processing',cat:'payment',vendor:'Stripe',ver:'2.0.0',prem:false},
        {code:'sharepoint',name:'SharePoint Online',desc:'Document management',cat:'document_management',vendor:'Microsoft',ver:'1.1.0',prem:false},
      ];
      for (const c of connectors) {
        await qr.query(`INSERT INTO connectors (id,connector_code,name,description,category,vendor,version,is_available,is_premium,tenant_id,created_at,updated_at) VALUES (${e(uid())},${e(c.code)},${e(c.name)},${e(c.desc)},${e(c.cat)},${e(c.vendor)},${e(c.ver)},true,${c.prem},'${T}',NOW(),NOW()) ON CONFLICT (id) DO NOTHING`);
      }

      const integrations = [
        {id:INT.int1,name:'SAP S/4HANA - Production',desc:'Primary ERP integration',type:'erp',status:'active',connId:'sap_s4hana',freq:'every_15_minutes',recs:24580},
        {id:INT.int2,name:'Salesforce CRM',desc:'CRM data sync',type:'crm',status:'active',connId:'salesforce_crm',freq:'hourly',recs:8920},
        {id:INT.int3,name:'Workday HCM',desc:'HR data sync',type:'hr',status:'active',connId:'workday_hcm',freq:'daily',recs:15400},
        {id:INT.int4,name:'DocuSign E-Signature',desc:'Contract e-signature workflow',type:'e_signature',status:'active',connId:'docusign',freq:'realtime',recs:2340},
        {id:INT.int5,name:'Power BI Analytics',desc:'Spend analytics dashboards',type:'analytics',status:'active',connId:'power_bi',freq:'daily',recs:45000},
        {id:INT.int6,name:'Coupa BSM (Legacy)',desc:'Legacy procurement system',type:'erp',status:'inactive',connId:'coupa_bsm',freq:'daily',recs:120000},
        {id:INT.int7,name:'Stripe Payments',desc:'Supplier payment processing',type:'payment',status:'active',connId:'stripe_pay',freq:'realtime',recs:5680},
        {id:INT.int8,name:'SharePoint Documents',desc:'Contract and document storage',type:'document_management',status:'active',connId:'sharepoint',freq:'realtime',recs:18900},
      ];
      for (const i of integrations) {
        await qr.query(`INSERT INTO integrations (id,name,description,type,status,connector_id,sync_frequency,records_synced,last_sync_at,last_sync_status,tenant_id,created_by,created_at,updated_at) VALUES (${e(i.id)},${e(i.name)},${e(i.desc)},${e(i.type)},${e(i.status)},${e(i.connId)},${e(i.freq)},${i.recs},${i.status==='active'?'NOW()':'NULL'},${i.status==='active'?"'success'":'NULL'},'${T}',${e(U.it)},NOW(),NOW()) ON CONFLICT (id) DO NOTHING`);
      }

      // 12. ESG Scores
      this.logger.log('Seeding ESG scores...');
      const esgData = [
        {suppId:S.dell,name:'Dell Technologies',overall:85.5,env:82,soc:88,gov:90,grade:'A',certs:'{ISO 14001,Carbon Neutral,EPEAT Gold}'},
        {suppId:S.microsoft,name:'Microsoft Corporation',overall:92.0,env:95,soc:89,gov:91,grade:'A+',certs:'{Carbon Negative,RE100,ISO 14001}'},
        {suppId:S.aws,name:'Amazon Web Services',overall:78.5,env:75,soc:80,gov:82,grade:'B+',certs:'{RE100,Climate Pledge}'},
        {suppId:S.salesforce,name:'Salesforce Inc.',overall:90.0,env:88,soc:94,gov:89,grade:'A',certs:'{Net Zero,1-1-1 Model,RE100}'},
        {suppId:S.google,name:'Google Cloud',overall:88.0,env:92,soc:84,gov:86,grade:'A',certs:'{Carbon Neutral since 2007,RE100}'},
        {suppId:S.apple,name:'Apple Inc.',overall:87.0,env:90,soc:82,gov:88,grade:'A',certs:'{Carbon Neutral,RE100,Zero Waste}'},
        {suppId:S.deloitte,name:'Deloitte Consulting',overall:82.0,env:78,soc:88,gov:80,grade:'B+',certs:'{WorldClimate,SBTi}'},
        {suppId:S.workday,name:'Workday Inc.',overall:84.0,env:80,soc:90,gov:82,grade:'A-',certs:'{Carbon Neutral,VERRA}'},
      ];
      for (const es of esgData) {
        await qr.query(`INSERT INTO esg_scores (id,supplier_id,supplier_name,category,overall_score,environmental_score,social_score,governance_score,assessment_date,next_assessment_date,rating_grade,certifications,data_source,tenant_id,created_by,created_at,updated_at) VALUES (${e(uid())},${e(es.suppId)},${e(es.name)},'environmental',${es.overall},${es.env},${es.soc},${es.gov},'2025-01-15','2025-07-15',${e(es.grade)},'${es.certs}','EcoVadis + Internal Assessment','${T}',${e(U.sust)},NOW(),NOW()) ON CONFLICT (id) DO NOTHING`);
      }

      // 13. Carbon Footprints
      this.logger.log('Seeding carbon footprints...');
      const carbonData = [
        {suppId:S.dell,name:'Dell Technologies',scope:'scope_3',co2:4500,kwh:12000000,renew:45.0},
        {suppId:S.microsoft,name:'Microsoft Corporation',scope:'scope_2',co2:1200,kwh:8500000,renew:100.0},
        {suppId:S.aws,name:'Amazon Web Services',scope:'scope_2',co2:3800,kwh:15000000,renew:65.0},
        {suppId:S.google,name:'Google Cloud',scope:'scope_2',co2:950,kwh:6000000,renew:100.0},
      ];
      for (const c of carbonData) {
        await qr.query(`INSERT INTO carbon_footprints (id,supplier_id,entity_name,entity_type,emission_scope,co2_emissions_tons,reporting_period,start_date,end_date,energy_consumption_kwh,renewable_energy_percentage,verification_status,data_source,tenant_id,created_by,created_at,updated_at) VALUES (${e(uid())},${e(c.suppId)},${e(c.name)},'supplier',${e(c.scope)},${c.co2},'Q4 2024','2024-10-01','2024-12-31',${c.kwh},${c.renew},'verified','CDP + Supplier Self-Report','${T}',${e(U.sust)},NOW(),NOW()) ON CONFLICT (id) DO NOTHING`);
      }

      // 14. Workflow Definitions (with React Flow graphs)
      this.logger.log('Seeding workflow definitions...');
      const defaultWorkflows = getDefaultWorkflows(T);
      let workflowCount = 0;
      for (const wf of defaultWorkflows) {
        const wfId = uid();
        const graphJson = JSON.stringify(wf.graph).replace(/'/g, "''");
        const entityTypesArr = wf.entityTypes ? `'{${wf.entityTypes.join(',')}}'` : 'NULL';
        await qr.query(`INSERT INTO workflows (id,name,description,type,status,version,entity_types,graph,tenant_id,created_by,created_at,updated_at) VALUES (${e(wfId)},${e(wf.name)},${e(wf.description)},${e(wf.type)},${e(wf.status)},1,${entityTypesArr},'${graphJson}'::jsonb,'${T}',${e(U.admin)},NOW(),NOW()) ON CONFLICT (id) DO NOTHING`);
        workflowCount++;
      }

      this.logger.log('Database seed completed successfully!');
      return {
        status: 'success',
        message: 'Database seeded with demo data',
        counts: { roles: 12, users: 12, suppliers: 16, catalogItems: catItems.length, contracts: 12, requests: 25, purchaseOrders: 15, invoices: 10, agents: 15, sourcingProjects: 5, bids: 6, connectors: 8, integrations: 8, esgScores: 8, carbonFootprints: 4, workflows: workflowCount },
      };
    } catch (error) {
      this.logger.error('Seed failed:', error.message);
      throw error;
    } finally {
      await qr.release();
    }
  }
}
