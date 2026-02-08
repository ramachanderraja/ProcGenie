# Supplier API

> Endpoints for supplier lifecycle management, onboarding, risk profiles, performance scoring, and document management.

## Create Supplier {#create-supplier}

Create a new supplier record. This does not initiate onboarding -- use the [Onboard](#onboard) endpoint for the full onboarding workflow.

```http
POST /api/v1/suppliers
Authorization: Bearer <token>
Content-Type: application/json
```

### Request Body

```json
{
  "legalName": "Globex Corporation",
  "tradingName": "Globex",
  "taxId": "47-1234567",
  "dunsNumber": "123456789",
  "website": "https://www.globex.com",
  "industry": "Professional Services",
  "categoryCode": "80101500",
  "address": {
    "street1": "100 Industrial Way",
    "street2": "Suite 400",
    "city": "Springfield",
    "state": "IL",
    "postalCode": "62704",
    "country": "US"
  },
  "primaryContact": {
    "firstName": "Hank",
    "lastName": "Scorpio",
    "email": "h.scorpio@globex.com",
    "phone": "+1-555-0199",
    "title": "VP Sales"
  },
  "bankDetails": {
    "bankName": "First National Bank",
    "routingNumber": "021000021",
    "accountNumber": "****6789",
    "accountType": "checking"
  },
  "diversityCertifications": ["MBE", "SDB"],
  "segment": "preferred",
  "tags": [
    { "key": "region", "value": "midwest" }
  ]
}
```

### Response (201 Created)

```json
{
  "success": true,
  "data": {
    "id": "sup_01H7G4R2K9M3N5P8",
    "tenantId": "tenant_acme_corp",
    "legalName": "Globex Corporation",
    "tradingName": "Globex",
    "supplierNumber": "SUP-2026-004521",
    "status": "pending_verification",
    "taxId": "47-1234567",
    "dunsNumber": "123456789",
    "website": "https://www.globex.com",
    "industry": "Professional Services",
    "categoryCode": "80101500",
    "address": {
      "street1": "100 Industrial Way",
      "street2": "Suite 400",
      "city": "Springfield",
      "state": "IL",
      "postalCode": "62704",
      "country": "US"
    },
    "primaryContact": {
      "id": "con_01H7G4R2K9M3N5P9",
      "firstName": "Hank",
      "lastName": "Scorpio",
      "email": "h.scorpio@globex.com",
      "phone": "+1-555-0199",
      "title": "VP Sales"
    },
    "segment": "preferred",
    "riskProfile": null,
    "performanceScore": null,
    "createdBy": "usr_procurement_lead",
    "createdAt": "2026-02-08T14:30:00.000Z",
    "updatedAt": "2026-02-08T14:30:00.000Z",
    "version": 1
  },
  "timestamp": "2026-02-08T14:30:00.000Z",
  "requestId": "req_sup_create_01H7G4"
}
```

## List Suppliers {#list-suppliers}

Retrieve a paginated list of suppliers.

```http
GET /api/v1/suppliers?page=1&pageSize=20&sort=legalName:asc&filters[status]=active
Authorization: Bearer <token>
```

### Query Parameters

| Parameter | Type | Description |
|---|---|---|
| `page` | integer | Page number (default: 1) |
| `pageSize` | integer | Items per page (default: 20, max: 100) |
| `sort` | string | Sort field and direction (e.g., `legalName:asc`, `createdAt:desc`) |
| `search` | string | Full-text search across legal name, trading name, and contact email |
| `filters[status]` | string | Filter by status: `pending_verification`, `active`, `suspended`, `blocked`, `archived` |
| `filters[segment]` | string | Filter by segment: `strategic`, `preferred`, `approved`, `transactional`, `restricted` |
| `filters[industry]` | string | Filter by industry classification |
| `filters[categoryCode]` | string | Filter by UNSPSC category code |
| `filters[riskLevel]` | string | Filter by risk level: `low`, `medium`, `high`, `critical` |
| `filters[country]` | string | Filter by country ISO code |
| `filters[diversityCert]` | string | Filter by diversity certification type |
| `filters[hasExpiring]` | boolean | Filter suppliers with expiring qualifications |

### Response (200 OK)

```json
{
  "success": true,
  "data": [
    {
      "id": "sup_01H7G4R2K9M3N5P8",
      "supplierNumber": "SUP-2026-004521",
      "legalName": "Globex Corporation",
      "tradingName": "Globex",
      "status": "active",
      "segment": "preferred",
      "industry": "Professional Services",
      "country": "US",
      "primaryContact": {
        "name": "Hank Scorpio",
        "email": "h.scorpio@globex.com"
      },
      "riskLevel": "low",
      "performanceScore": 4.3,
      "activeContracts": 3,
      "totalSpendYTD": { "amount": 245000.00, "code": "USD" },
      "diversityCertifications": ["MBE", "SDB"],
      "createdAt": "2026-02-08T14:30:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "totalItems": 342,
    "totalPages": 18,
    "hasNextPage": true,
    "hasPreviousPage": false
  },
  "timestamp": "2026-02-08T15:00:00.000Z",
  "requestId": "req_sup_list_01H7G4"
}
```

## Get Supplier {#get-supplier}

Retrieve detailed information about a single supplier, including contacts, qualifications, contracts summary, and compliance status.

```http
GET /api/v1/suppliers/:id
Authorization: Bearer <token>
```

### Response (200 OK)

```json
{
  "success": true,
  "data": {
    "id": "sup_01H7G4R2K9M3N5P8",
    "tenantId": "tenant_acme_corp",
    "legalName": "Globex Corporation",
    "tradingName": "Globex",
    "supplierNumber": "SUP-2026-004521",
    "status": "active",
    "taxId": "47-1234567",
    "dunsNumber": "123456789",
    "website": "https://www.globex.com",
    "industry": "Professional Services",
    "categoryCode": "80101500",
    "segment": "preferred",
    "address": {
      "street1": "100 Industrial Way",
      "street2": "Suite 400",
      "city": "Springfield",
      "state": "IL",
      "postalCode": "62704",
      "country": "US"
    },
    "contacts": [
      {
        "id": "con_01H7G4R2K9M3N5P9",
        "firstName": "Hank",
        "lastName": "Scorpio",
        "email": "h.scorpio@globex.com",
        "phone": "+1-555-0199",
        "title": "VP Sales",
        "isPrimary": true
      },
      {
        "id": "con_01H7G4R2K9M3N5PA",
        "firstName": "Frank",
        "lastName": "Grimes",
        "email": "f.grimes@globex.com",
        "phone": "+1-555-0200",
        "title": "Account Manager",
        "isPrimary": false
      }
    ],
    "qualifications": [
      {
        "id": "qual_01H7G4",
        "type": "W9",
        "status": "valid",
        "uploadedAt": "2026-01-15T10:00:00.000Z",
        "expiresAt": null
      },
      {
        "id": "qual_02H7G4",
        "type": "SOC2_TYPE2",
        "status": "valid",
        "uploadedAt": "2026-01-20T10:00:00.000Z",
        "expiresAt": "2026-12-31T23:59:59.000Z"
      },
      {
        "id": "qual_03H7G4",
        "type": "INSURANCE_COI",
        "status": "expiring_soon",
        "uploadedAt": "2025-03-15T10:00:00.000Z",
        "expiresAt": "2026-03-15T23:59:59.000Z"
      }
    ],
    "riskProfile": {
      "overallLevel": "low",
      "financialRisk": "low",
      "operationalRisk": "low",
      "complianceRisk": "low",
      "reputationalRisk": "low",
      "lastAssessedAt": "2026-02-01T08:00:00.000Z",
      "sanctionsScreening": "clear",
      "sanctionsScreenedAt": "2026-02-01T08:00:00.000Z"
    },
    "performanceScore": {
      "overall": 4.3,
      "quality": 4.5,
      "delivery": 4.1,
      "responsiveness": 4.4,
      "costCompetitiveness": 4.2,
      "evaluationCount": 12,
      "lastEvaluatedAt": "2026-01-31T10:00:00.000Z"
    },
    "contractsSummary": {
      "activeContracts": 3,
      "totalContractValue": { "amount": 1250000.00, "code": "USD" },
      "nextExpiring": {
        "contractId": "ctr_01H7G4",
        "title": "Professional Services MSA",
        "expiresAt": "2026-06-30T23:59:59.000Z"
      }
    },
    "spendSummary": {
      "ytd": { "amount": 245000.00, "code": "USD" },
      "lastYear": { "amount": 890000.00, "code": "USD" },
      "poCount": 18
    },
    "diversityCertifications": [
      { "type": "MBE", "certifyingBody": "NMSDC", "expiresAt": "2027-01-15T23:59:59.000Z" },
      { "type": "SDB", "certifyingBody": "SBA", "expiresAt": "2027-03-30T23:59:59.000Z" }
    ],
    "esgScore": {
      "overall": 72,
      "environmental": 68,
      "social": 78,
      "governance": 70,
      "lastAssessedAt": "2026-01-15T10:00:00.000Z"
    },
    "tags": [
      { "key": "region", "value": "midwest" }
    ],
    "createdBy": "usr_procurement_lead",
    "createdAt": "2026-02-08T14:30:00.000Z",
    "updatedAt": "2026-02-08T16:00:00.000Z",
    "version": 5
  },
  "timestamp": "2026-02-08T17:00:00.000Z",
  "requestId": "req_sup_detail_01H7G4"
}
```

## Update Supplier {#update-supplier}

Update supplier record fields. Partial updates are supported.

```http
PATCH /api/v1/suppliers/:id
Authorization: Bearer <token>
Content-Type: application/json
```

### Request Body

```json
{
  "segment": "strategic",
  "address": {
    "street1": "200 Innovation Drive",
    "city": "Chicago",
    "state": "IL",
    "postalCode": "60601"
  },
  "tags": [
    { "key": "region", "value": "midwest" },
    { "key": "tier", "value": "1" }
  ]
}
```

### Response (200 OK)

Returns the updated supplier object.

## Get Supplier Risk Profile {#get-risk}

Retrieve the comprehensive risk assessment for a supplier. Risk profiles are generated by the Risk Monitoring Agent (A7) and updated continuously based on financial data, sanctions screening, news monitoring, and operational metrics.

```http
GET /api/v1/suppliers/:id/risk
Authorization: Bearer <token>
```

### Response (200 OK)

```json
{
  "success": true,
  "data": {
    "supplierId": "sup_01H7G4R2K9M3N5P8",
    "supplierName": "Globex Corporation",
    "overallLevel": "low",
    "overallScore": 22,
    "dimensions": {
      "financial": {
        "level": "low",
        "score": 18,
        "factors": [
          { "factor": "Credit rating", "value": "A-", "impact": "positive" },
          { "factor": "Revenue trend", "value": "+12% YoY", "impact": "positive" },
          { "factor": "Debt-to-equity", "value": "0.45", "impact": "neutral" }
        ],
        "lastUpdated": "2026-02-01T08:00:00.000Z"
      },
      "operational": {
        "level": "low",
        "score": 20,
        "factors": [
          { "factor": "On-time delivery rate", "value": "96.5%", "impact": "positive" },
          { "factor": "Quality defect rate", "value": "0.8%", "impact": "positive" },
          { "factor": "Average lead time", "value": "5.2 days", "impact": "neutral" }
        ],
        "lastUpdated": "2026-02-01T08:00:00.000Z"
      },
      "compliance": {
        "level": "low",
        "score": 15,
        "factors": [
          { "factor": "Sanctions screening", "value": "Clear", "impact": "positive" },
          { "factor": "SOC 2 Type II", "value": "Valid until Dec 2026", "impact": "positive" },
          { "factor": "Insurance coverage", "value": "Expiring in 35 days", "impact": "warning" }
        ],
        "lastUpdated": "2026-02-01T08:00:00.000Z"
      },
      "reputational": {
        "level": "low",
        "score": 25,
        "factors": [
          { "factor": "News sentiment", "value": "Positive", "impact": "positive" },
          { "factor": "Legal actions", "value": "None found", "impact": "positive" },
          { "factor": "ESG controversies", "value": "None", "impact": "positive" }
        ],
        "lastUpdated": "2026-02-01T08:00:00.000Z"
      },
      "concentration": {
        "level": "medium",
        "score": 45,
        "factors": [
          { "factor": "Spend concentration", "value": "8.2% of total", "impact": "neutral" },
          { "factor": "Single source categories", "value": "1 category", "impact": "warning" },
          { "factor": "Geographic concentration", "value": "Single location", "impact": "warning" }
        ],
        "lastUpdated": "2026-02-01T08:00:00.000Z"
      }
    },
    "alerts": [
      {
        "id": "alert_01H7G4",
        "severity": "warning",
        "message": "Insurance Certificate of Insurance expires on 2026-03-15",
        "category": "compliance",
        "createdAt": "2026-02-08T08:00:00.000Z",
        "acknowledged": false
      }
    ],
    "sanctionsScreening": {
      "status": "clear",
      "listsChecked": ["OFAC_SDN", "EU_CONSOLIDATED", "UN_SANCTIONS", "UK_HMT"],
      "lastScreenedAt": "2026-02-01T08:00:00.000Z",
      "nextScheduledAt": "2026-02-15T08:00:00.000Z"
    },
    "assessedBy": "agent_risk_monitoring",
    "lastFullAssessment": "2026-02-01T08:00:00.000Z",
    "nextScheduledAssessment": "2026-03-01T08:00:00.000Z"
  },
  "timestamp": "2026-02-08T17:00:00.000Z",
  "requestId": "req_sup_risk_01H7G4"
}
```

### Risk Score Ranges

| Score Range | Level | Description |
|---|---|---|
| 0 -- 25 | Low | Minimal risk; standard monitoring |
| 26 -- 50 | Medium | Moderate risk; enhanced monitoring recommended |
| 51 -- 75 | High | Significant risk; active mitigation required |
| 76 -- 100 | Critical | Severe risk; immediate action required, consider suspension |

## Get Performance Scores {#get-performance}

Retrieve historical performance evaluations for a supplier.

```http
GET /api/v1/suppliers/:id/performance?period=last12months
Authorization: Bearer <token>
```

### Query Parameters

| Parameter | Type | Description |
|---|---|---|
| `period` | string | Time period: `last3months`, `last6months`, `last12months`, `all` |
| `page` | integer | Page number for evaluation history |
| `pageSize` | integer | Items per page (default: 12) |

### Response (200 OK)

```json
{
  "success": true,
  "data": {
    "supplierId": "sup_01H7G4R2K9M3N5P8",
    "supplierName": "Globex Corporation",
    "currentScore": {
      "overall": 4.3,
      "quality": 4.5,
      "delivery": 4.1,
      "responsiveness": 4.4,
      "costCompetitiveness": 4.2,
      "innovation": 3.9
    },
    "trend": {
      "overall": "+0.2",
      "direction": "improving"
    },
    "benchmarks": {
      "categoryAverage": 3.8,
      "topQuartile": 4.5,
      "percentileRank": 78
    },
    "evaluations": [
      {
        "id": "eval_01H7G4",
        "period": "2026-Q1",
        "scores": {
          "overall": 4.3,
          "quality": 4.5,
          "delivery": 4.1,
          "responsiveness": 4.4,
          "costCompetitiveness": 4.2,
          "innovation": 3.9
        },
        "evaluatedBy": {
          "id": "usr_procurement_lead",
          "displayName": "Maria Gonzalez"
        },
        "comments": "Consistent delivery quality. Lead times slightly above target but improving.",
        "associatedPOs": ["PO-2026-001234", "PO-2026-001256"],
        "evaluatedAt": "2026-01-31T10:00:00.000Z"
      },
      {
        "id": "eval_02H7G4",
        "period": "2025-Q4",
        "scores": {
          "overall": 4.1,
          "quality": 4.3,
          "delivery": 3.9,
          "responsiveness": 4.2,
          "costCompetitiveness": 4.1,
          "innovation": 3.8
        },
        "evaluatedBy": {
          "id": "usr_procurement_lead",
          "displayName": "Maria Gonzalez"
        },
        "comments": "Solid quarter. Minor delays on two deliveries due to supply chain issues.",
        "associatedPOs": ["PO-2025-008901", "PO-2025-009012"],
        "evaluatedAt": "2025-10-31T10:00:00.000Z"
      }
    ],
    "kpis": {
      "onTimeDeliveryRate": 96.5,
      "qualityDefectRate": 0.8,
      "averageLeadTimeDays": 5.2,
      "invoiceAccuracyRate": 99.1,
      "responseTimeSLAMet": 94.0
    }
  },
  "pagination": {
    "page": 1,
    "pageSize": 12,
    "totalItems": 8,
    "totalPages": 1,
    "hasNextPage": false,
    "hasPreviousPage": false
  },
  "timestamp": "2026-02-08T17:00:00.000Z",
  "requestId": "req_sup_perf_01H7G4"
}
```

## Upload Qualification Documents {#upload-qualification}

Upload onboarding or compliance qualification documents for a supplier (W-9, SOC 2 report, insurance certificates, diversity certifications, etc.).

```http
POST /api/v1/suppliers/:id/qualifications
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

### Request

| Field | Type | Required | Description |
|---|---|---|---|
| `file` | File | Yes | PDF, DOCX, JPG, or PNG document (max 25 MB) |
| `type` | string | Yes | Document type (see table below) |
| `expiresAt` | ISO-8601 | No | Expiration date for time-limited documents |
| `notes` | string | No | Additional context or notes |

### Qualification Document Types

| Type | Description | Expiry Required |
|---|---|---|
| `W9` | IRS W-9 Tax Form | No |
| `W8BEN` | IRS W-8BEN (non-US entities) | No |
| `SOC2_TYPE2` | SOC 2 Type II Audit Report | Yes |
| `ISO27001` | ISO 27001 Certificate | Yes |
| `INSURANCE_COI` | Certificate of Insurance | Yes |
| `INSURANCE_GL` | General Liability Insurance | Yes |
| `INSURANCE_CYBER` | Cyber Liability Insurance | Yes |
| `BUSINESS_LICENSE` | Business License | Yes |
| `DIVERSITY_CERT` | Diversity Certification (MBE, WBE, etc.) | Yes |
| `FINANCIAL_STATEMENT` | Audited Financial Statement | No |
| `NDA` | Non-Disclosure Agreement | Yes |
| `MSA` | Master Service Agreement | Yes |
| `OTHER` | Other qualification document | No |

### Response (201 Created)

```json
{
  "success": true,
  "data": {
    "id": "qual_04H7G4",
    "supplierId": "sup_01H7G4R2K9M3N5P8",
    "type": "INSURANCE_COI",
    "fileName": "globex_coi_2026.pdf",
    "fileSize": 245678,
    "mimeType": "application/pdf",
    "status": "pending_review",
    "expiresAt": "2027-03-15T23:59:59.000Z",
    "notes": "Renewed COI with increased coverage",
    "uploadedBy": "usr_procurement_lead",
    "uploadedAt": "2026-02-08T17:30:00.000Z",
    "extractedData": {
      "insurer": { "value": "Liberty Mutual", "confidence": 0.96 },
      "policyNumber": { "value": "GL-2026-78901", "confidence": 0.94 },
      "coverageAmount": { "value": 5000000, "confidence": 0.92 },
      "effectiveDate": { "value": "2026-03-15", "confidence": 0.97 },
      "expirationDate": { "value": "2027-03-15", "confidence": 0.97 }
    }
  },
  "timestamp": "2026-02-08T17:30:00.000Z",
  "requestId": "req_sup_qual_01H7G4"
}
```

## List Supplier Contracts {#list-supplier-contracts}

List all contracts associated with a supplier.

```http
GET /api/v1/suppliers/:id/contracts?filters[status]=active
Authorization: Bearer <token>
```

### Query Parameters

| Parameter | Type | Description |
|---|---|---|
| `page` | integer | Page number (default: 1) |
| `pageSize` | integer | Items per page (default: 20) |
| `filters[status]` | string | Filter by contract status: `draft`, `active`, `expired`, `terminated` |
| `filters[type]` | string | Filter by contract type: `MSA`, `SOW`, `PO_CONTRACT`, `NDA` |
| `sort` | string | Sort field (e.g., `expiresAt:asc`, `value:desc`) |

### Response (200 OK)

```json
{
  "success": true,
  "data": [
    {
      "id": "ctr_01H7G4",
      "contractNumber": "CTR-2026-001234",
      "title": "Professional Services MSA",
      "type": "MSA",
      "status": "active",
      "value": { "amount": 500000.00, "code": "USD" },
      "startDate": "2025-07-01T00:00:00.000Z",
      "expiresAt": "2026-06-30T23:59:59.000Z",
      "autoRenewal": true,
      "renewalNoticeDays": 90,
      "activeObligations": 4,
      "complianceStatus": "compliant"
    },
    {
      "id": "ctr_02H7G4",
      "contractNumber": "CTR-2025-008901",
      "title": "Cloud Infrastructure SOW",
      "type": "SOW",
      "status": "active",
      "value": { "amount": 750000.00, "code": "USD" },
      "startDate": "2025-09-01T00:00:00.000Z",
      "expiresAt": "2026-08-31T23:59:59.000Z",
      "autoRenewal": false,
      "renewalNoticeDays": 60,
      "activeObligations": 7,
      "complianceStatus": "compliant"
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "totalItems": 3,
    "totalPages": 1,
    "hasNextPage": false,
    "hasPreviousPage": false
  },
  "timestamp": "2026-02-08T17:00:00.000Z",
  "requestId": "req_sup_ctrs_01H7G4"
}
```

## Initiate Supplier Onboarding {#onboard}

Start the full onboarding workflow for a new supplier. This creates the supplier record (if not already existing), triggers sanctions screening, sends the supplier a portal invitation, and starts the internal approval workflow.

```http
POST /api/v1/suppliers/onboard
Authorization: Bearer <token>
Content-Type: application/json
```

### Request Body

```json
{
  "legalName": "Initech Solutions",
  "taxId": "52-9876543",
  "website": "https://www.initech.com",
  "industry": "IT Consulting",
  "categoryCode": "81112000",
  "primaryContact": {
    "firstName": "Bill",
    "lastName": "Lumbergh",
    "email": "b.lumbergh@initech.com",
    "phone": "+1-555-0142",
    "title": "Director of Partnerships"
  },
  "requestedBy": "usr_procurement_lead",
  "justification": "Needed for upcoming ERP migration project. Recommended by IT architecture team.",
  "requiredQualifications": ["W9", "SOC2_TYPE2", "INSURANCE_COI", "INSURANCE_CYBER"],
  "segment": "approved",
  "urgency": "standard"
}
```

### Response (202 Accepted)

```json
{
  "success": true,
  "data": {
    "onboardingId": "onb_01H7G4R2K9M3N5PB",
    "supplierId": "sup_02H7G4R2K9M3N5PC",
    "supplierNumber": "SUP-2026-004522",
    "status": "in_progress",
    "steps": [
      {
        "id": "step_sanctions",
        "name": "Sanctions Screening",
        "status": "in_progress",
        "assignee": "agent_risk_monitoring",
        "type": "automated"
      },
      {
        "id": "step_portal_invite",
        "name": "Supplier Portal Invitation",
        "status": "pending",
        "type": "automated"
      },
      {
        "id": "step_doc_collection",
        "name": "Document Collection",
        "status": "pending",
        "requiredDocuments": ["W9", "SOC2_TYPE2", "INSURANCE_COI", "INSURANCE_CYBER"],
        "type": "supplier_action"
      },
      {
        "id": "step_doc_review",
        "name": "Document Review",
        "status": "pending",
        "type": "approval"
      },
      {
        "id": "step_internal_approval",
        "name": "Internal Approval",
        "status": "pending",
        "type": "approval"
      },
      {
        "id": "step_erp_sync",
        "name": "ERP Synchronization",
        "status": "pending",
        "type": "automated"
      }
    ],
    "workflowId": "wf_02H7G4R2K9M3N5PD",
    "estimatedCompletionDate": "2026-02-22T14:30:00.000Z",
    "createdAt": "2026-02-08T14:30:00.000Z"
  },
  "timestamp": "2026-02-08T14:30:00.000Z",
  "requestId": "req_sup_onboard_01H7G4"
}
```

### Onboarding Statuses

| Status | Description |
|---|---|
| `in_progress` | Onboarding workflow is active |
| `awaiting_supplier` | Waiting for supplier to complete portal registration or document upload |
| `awaiting_review` | Documents submitted and pending internal review |
| `awaiting_approval` | Internal approval pending |
| `completed` | Supplier fully onboarded and active |
| `rejected` | Onboarding rejected (sanctions hit, document issues, etc.) |
| `cancelled` | Onboarding cancelled by the requesting user |

## Error Responses

### 404 -- Supplier Not Found

```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Supplier sup_nonexistent not found",
    "type": "NOT_FOUND",
    "requestId": "req_sup_01H7G4",
    "timestamp": "2026-02-08T17:00:00.000Z"
  }
}
```

### 409 -- Duplicate Supplier

```json
{
  "success": false,
  "error": {
    "code": "CONFLICT",
    "message": "A supplier with Tax ID 47-1234567 already exists",
    "type": "CONFLICT",
    "details": [
      {
        "field": "taxId",
        "message": "Existing supplier: SUP-2026-004521 (Globex Corporation)",
        "code": "DUPLICATE_TAX_ID"
      }
    ],
    "requestId": "req_sup_dup_01H7G4",
    "timestamp": "2026-02-08T17:00:00.000Z"
  }
}
```

### 422 -- Sanctions Hit

```json
{
  "success": false,
  "error": {
    "code": "SANCTIONS_HIT",
    "message": "Supplier onboarding blocked due to sanctions screening match",
    "type": "POLICY_VIOLATION",
    "details": [
      {
        "field": "sanctionsScreening",
        "message": "Potential match found on OFAC SDN list. Manual review required.",
        "code": "SANCTIONS_MATCH",
        "matchScore": 0.87
      }
    ],
    "requestId": "req_sup_sanctions_01H7G4",
    "timestamp": "2026-02-08T17:00:00.000Z"
  }
}
```
