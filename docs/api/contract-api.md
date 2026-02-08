# Contract API

> Endpoints for contract lifecycle management, AI clause analysis, clause library, obligation tracking, amendments, and renewal management.

## Create Contract {#create-contract}

Create a new contract record. Contracts can be created manually or generated from an approved purchase request.

```http
POST /api/v1/contracts
Authorization: Bearer <token>
Content-Type: application/json
```

### Request Body

```json
{
  "title": "Enterprise SaaS Agreement - CloudSync Platform",
  "type": "MSA",
  "supplierId": "sup_01H7G4R2K9M3N5P8",
  "description": "Master service agreement for CloudSync enterprise platform including implementation, training, and 3-year SaaS subscription.",
  "value": {
    "amount": 450000.00,
    "code": "USD"
  },
  "paymentTerms": "Net 30",
  "startDate": "2026-03-01",
  "endDate": "2029-02-28",
  "autoRenewal": true,
  "renewalTermMonths": 12,
  "renewalNoticeDays": 90,
  "terminationNoticeDays": 180,
  "department": "Information Technology",
  "costCenter": "IT-3300",
  "owner": "usr_it_director",
  "signatories": [
    {
      "role": "internal",
      "name": "Jane Chen",
      "title": "VP Information Technology",
      "email": "j.chen@acme.com"
    },
    {
      "role": "supplier",
      "name": "Hank Scorpio",
      "title": "VP Sales",
      "email": "h.scorpio@globex.com"
    }
  ],
  "linkedRequisitionId": "req_01H5K3M7N8P9Q2R4",
  "tags": [
    { "key": "project", "value": "digital-transformation" }
  ]
}
```

### Response (201 Created)

```json
{
  "success": true,
  "data": {
    "id": "ctr_01H8F5S3L0N4O6Q9",
    "tenantId": "tenant_acme_corp",
    "contractNumber": "CTR-2026-002345",
    "title": "Enterprise SaaS Agreement - CloudSync Platform",
    "type": "MSA",
    "status": "draft",
    "supplierId": "sup_01H7G4R2K9M3N5P8",
    "supplierName": "Globex Corporation",
    "value": {
      "amount": 450000.00,
      "code": "USD"
    },
    "paymentTerms": "Net 30",
    "startDate": "2026-03-01T00:00:00.000Z",
    "endDate": "2029-02-28T23:59:59.000Z",
    "autoRenewal": true,
    "renewalTermMonths": 12,
    "renewalNoticeDays": 90,
    "terminationNoticeDays": 180,
    "department": "Information Technology",
    "costCenter": "IT-3300",
    "owner": {
      "id": "usr_it_director",
      "displayName": "Jane Chen"
    },
    "currentVersion": 1,
    "createdBy": "usr_procurement_lead",
    "createdAt": "2026-02-08T14:30:00.000Z",
    "updatedAt": "2026-02-08T14:30:00.000Z",
    "version": 1
  },
  "timestamp": "2026-02-08T14:30:00.000Z",
  "requestId": "req_ctr_create_01H8F5"
}
```

## List Contracts {#list-contracts}

Retrieve a paginated list of contracts.

```http
GET /api/v1/contracts?page=1&pageSize=20&sort=endDate:asc&filters[status]=active
Authorization: Bearer <token>
```

### Query Parameters

| Parameter | Type | Description |
|---|---|---|
| `page` | integer | Page number (default: 1) |
| `pageSize` | integer | Items per page (default: 20, max: 100) |
| `sort` | string | Sort field: `createdAt`, `endDate`, `value`, `title` |
| `search` | string | Full-text search across title, supplier name, contract number |
| `filters[status]` | string | `draft`, `pending_approval`, `pending_signature`, `active`, `expired`, `terminated`, `renewed` |
| `filters[type]` | string | `MSA`, `SOW`, `PO_CONTRACT`, `NDA`, `AMENDMENT`, `SLA` |
| `filters[supplierId]` | string | Filter by supplier ID |
| `filters[department]` | string | Filter by department |
| `filters[owner]` | string | Filter by contract owner user ID |
| `filters[value_gte]` | number | Minimum contract value |
| `filters[value_lte]` | number | Maximum contract value |
| `filters[endDate_gte]` | ISO-8601 | Ending after date |
| `filters[endDate_lte]` | ISO-8601 | Ending before date |
| `filters[autoRenewal]` | boolean | Filter by auto-renewal status |

### Response (200 OK)

```json
{
  "success": true,
  "data": [
    {
      "id": "ctr_01H8F5S3L0N4O6Q9",
      "contractNumber": "CTR-2026-002345",
      "title": "Enterprise SaaS Agreement - CloudSync Platform",
      "type": "MSA",
      "status": "active",
      "supplierName": "Globex Corporation",
      "value": { "amount": 450000.00, "code": "USD" },
      "startDate": "2026-03-01T00:00:00.000Z",
      "endDate": "2029-02-28T23:59:59.000Z",
      "autoRenewal": true,
      "owner": {
        "id": "usr_it_director",
        "displayName": "Jane Chen"
      },
      "activeObligations": 6,
      "complianceStatus": "compliant",
      "daysToExpiry": 1116,
      "createdAt": "2026-02-08T14:30:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "totalItems": 87,
    "totalPages": 5,
    "hasNextPage": true,
    "hasPreviousPage": false
  },
  "timestamp": "2026-02-08T17:00:00.000Z",
  "requestId": "req_ctr_list_01H8F5"
}
```

## Get Contract {#get-contract}

Retrieve detailed information about a single contract including versions, clauses summary, obligations summary, and related entities.

```http
GET /api/v1/contracts/:id
Authorization: Bearer <token>
```

### Response (200 OK)

```json
{
  "success": true,
  "data": {
    "id": "ctr_01H8F5S3L0N4O6Q9",
    "tenantId": "tenant_acme_corp",
    "contractNumber": "CTR-2026-002345",
    "title": "Enterprise SaaS Agreement - CloudSync Platform",
    "type": "MSA",
    "status": "active",
    "supplierId": "sup_01H7G4R2K9M3N5P8",
    "supplierName": "Globex Corporation",
    "description": "Master service agreement for CloudSync enterprise platform...",
    "value": { "amount": 450000.00, "code": "USD" },
    "paymentTerms": "Net 30",
    "startDate": "2026-03-01T00:00:00.000Z",
    "endDate": "2029-02-28T23:59:59.000Z",
    "autoRenewal": true,
    "renewalTermMonths": 12,
    "renewalNoticeDays": 90,
    "terminationNoticeDays": 180,
    "department": "Information Technology",
    "costCenter": "IT-3300",
    "owner": {
      "id": "usr_it_director",
      "displayName": "Jane Chen",
      "email": "j.chen@acme.com"
    },
    "signatories": [
      {
        "role": "internal",
        "name": "Jane Chen",
        "title": "VP Information Technology",
        "signedAt": "2026-02-25T10:00:00.000Z"
      },
      {
        "role": "supplier",
        "name": "Hank Scorpio",
        "title": "VP Sales",
        "signedAt": "2026-02-26T14:00:00.000Z"
      }
    ],
    "versions": [
      {
        "version": 3,
        "fileName": "CloudSync_MSA_v3_final.pdf",
        "uploadedAt": "2026-02-24T10:00:00.000Z",
        "uploadedBy": "usr_legal_counsel",
        "isCurrent": true,
        "changeNotes": "Final version with agreed SLA modifications"
      },
      {
        "version": 2,
        "fileName": "CloudSync_MSA_v2_redline.pdf",
        "uploadedAt": "2026-02-18T10:00:00.000Z",
        "uploadedBy": "usr_legal_counsel",
        "isCurrent": false,
        "changeNotes": "Vendor redline with proposed SLA changes"
      },
      {
        "version": 1,
        "fileName": "CloudSync_MSA_v1_draft.pdf",
        "uploadedAt": "2026-02-10T10:00:00.000Z",
        "uploadedBy": "usr_procurement_lead",
        "isCurrent": false,
        "changeNotes": "Initial draft from template"
      }
    ],
    "clausesSummary": {
      "totalClauses": 42,
      "highRiskClauses": 2,
      "nonStandardClauses": 5,
      "lastAnalyzedAt": "2026-02-24T11:00:00.000Z"
    },
    "obligationsSummary": {
      "total": 8,
      "upcoming": 3,
      "overdue": 0,
      "completed": 2
    },
    "amendments": [],
    "linkedRequisitionId": "req_01H5K3M7N8P9Q2R4",
    "linkedPurchaseOrders": ["PO-2026-001234"],
    "tags": [
      { "key": "project", "value": "digital-transformation" }
    ],
    "renewalAlert": {
      "alertDate": "2028-12-01T00:00:00.000Z",
      "status": "scheduled",
      "assignee": "usr_it_director"
    },
    "createdBy": "usr_procurement_lead",
    "createdAt": "2026-02-08T14:30:00.000Z",
    "updatedAt": "2026-02-26T14:00:00.000Z",
    "currentVersion": 3,
    "version": 8
  },
  "timestamp": "2026-02-08T17:00:00.000Z",
  "requestId": "req_ctr_detail_01H8F5"
}
```

## Update Contract {#update-contract}

Update contract metadata. Document content is managed through version uploads.

```http
PATCH /api/v1/contracts/:id
Authorization: Bearer <token>
Content-Type: application/json
```

### Request Body

```json
{
  "title": "Enterprise SaaS Agreement - CloudSync Platform (Amended)",
  "value": {
    "amount": 475000.00,
    "code": "USD"
  },
  "owner": "usr_new_it_director",
  "tags": [
    { "key": "project", "value": "digital-transformation" },
    { "key": "priority", "value": "high" }
  ]
}
```

### Response (200 OK)

Returns the updated contract object.

## AI Contract Analysis {#analyze-contract}

Trigger AI-powered clause extraction and risk analysis on the current contract version. The Contract Analysis Agent (A8) extracts clauses, classifies risk levels, compares against the clause library, and generates redline suggestions.

```http
POST /api/v1/contracts/:id/analyze
Authorization: Bearer <token>
Content-Type: application/json
```

### Request Body (Optional)

```json
{
  "analysisType": "full",
  "compareToTemplate": "tmpl_standard_msa",
  "focusAreas": ["liability", "indemnification", "termination", "data_protection"]
}
```

### Analysis Types

| Type | Description | Processing Time |
|---|---|---|
| `full` | Complete clause extraction, risk analysis, and comparison | 30 -- 60 seconds |
| `risk_only` | Risk-focused scan without full clause extraction | 10 -- 20 seconds |
| `comparison` | Compare against template or previous version | 15 -- 30 seconds |
| `obligation_extract` | Extract contractual obligations and deadlines | 10 -- 20 seconds |

### Response (200 OK)

```json
{
  "success": true,
  "data": {
    "contractId": "ctr_01H8F5S3L0N4O6Q9",
    "analysisId": "anl_01H8F5S3L0N4O6QA",
    "analysisType": "full",
    "version": 3,
    "summary": {
      "totalClauses": 42,
      "riskDistribution": {
        "low": 32,
        "medium": 8,
        "high": 2,
        "critical": 0
      },
      "nonStandardClauses": 5,
      "missingRecommendedClauses": ["audit_rights", "force_majeure_pandemic"],
      "overallRiskScore": 35,
      "overallRiskLevel": "medium"
    },
    "highlightedClauses": [
      {
        "clauseId": "cls_01",
        "section": "Section 8.2",
        "title": "Limitation of Liability",
        "category": "liability",
        "riskLevel": "high",
        "text": "Supplier's total aggregate liability shall not exceed the fees paid in the twelve (12) months preceding the claim.",
        "analysis": "Liability cap is limited to 12 months of fees. Industry standard for contracts of this value is typically 24 months or the total contract value. This clause significantly favors the supplier.",
        "recommendation": "Negotiate liability cap to equal total contract value ($450,000) or at minimum 24 months of fees.",
        "comparedToTemplate": {
          "deviation": "below_standard",
          "templateText": "...shall not exceed the total fees paid under this Agreement.",
          "deviationSeverity": "significant"
        }
      },
      {
        "clauseId": "cls_02",
        "section": "Section 12.1",
        "title": "Indemnification",
        "category": "indemnification",
        "riskLevel": "high",
        "text": "Customer shall indemnify and hold harmless Supplier from any claims arising from Customer's use of the Platform.",
        "analysis": "One-sided indemnification favoring the supplier. Missing mutual indemnification for IP infringement and data breaches caused by supplier.",
        "recommendation": "Add mutual indemnification clause. Supplier should indemnify against: (1) IP infringement claims, (2) data breaches caused by supplier negligence, (3) supplier's violation of applicable laws.",
        "comparedToTemplate": {
          "deviation": "missing_mutual",
          "templateText": "Each party shall indemnify the other...",
          "deviationSeverity": "significant"
        }
      }
    ],
    "extractedObligations": [
      {
        "obligationId": "obl_01",
        "description": "Provide quarterly performance reports",
        "party": "supplier",
        "frequency": "quarterly",
        "nextDueDate": "2026-06-30T23:59:59.000Z",
        "section": "Section 5.3"
      },
      {
        "obligationId": "obl_02",
        "description": "Conduct annual security audit",
        "party": "supplier",
        "frequency": "annual",
        "nextDueDate": "2027-02-28T23:59:59.000Z",
        "section": "Section 9.1"
      },
      {
        "obligationId": "obl_03",
        "description": "Renewal notice deadline",
        "party": "customer",
        "frequency": "one_time",
        "nextDueDate": "2028-12-01T00:00:00.000Z",
        "section": "Section 14.2"
      }
    ],
    "suggestedRedlines": [
      {
        "section": "Section 8.2",
        "originalText": "...twelve (12) months preceding the claim.",
        "suggestedText": "...total fees paid under this Agreement during its entire term.",
        "rationale": "Increases liability cap to total contract value",
        "priority": "high"
      },
      {
        "section": "Section 12.1",
        "originalText": "Customer shall indemnify and hold harmless Supplier...",
        "suggestedText": "Each party shall indemnify, defend, and hold harmless the other party...",
        "rationale": "Establishes mutual indemnification",
        "priority": "high"
      }
    ],
    "agentId": "agent_contract_analysis",
    "confidence": 0.89,
    "processingTimeMs": 42500
  },
  "timestamp": "2026-02-08T17:01:00.000Z",
  "requestId": "req_ctr_analyze_01H8F5"
}
```

## List Extracted Clauses {#list-clauses}

List all clauses extracted from a contract via AI analysis.

```http
GET /api/v1/contracts/:id/clauses?filters[riskLevel]=high
Authorization: Bearer <token>
```

### Query Parameters

| Parameter | Type | Description |
|---|---|---|
| `page` | integer | Page number (default: 1) |
| `pageSize` | integer | Items per page (default: 50) |
| `filters[category]` | string | Filter by clause category (see table below) |
| `filters[riskLevel]` | string | Filter by risk level: `low`, `medium`, `high`, `critical` |
| `filters[isNonStandard]` | boolean | Filter non-standard clauses only |

### Clause Categories

| Category | Description |
|---|---|
| `payment` | Payment terms, invoicing, late fees |
| `liability` | Limitation of liability, damages caps |
| `indemnification` | Indemnification and hold harmless |
| `termination` | Termination rights, convenience, cause |
| `confidentiality` | NDA provisions, information handling |
| `data_protection` | GDPR, data processing, privacy |
| `ip_rights` | Intellectual property ownership and licenses |
| `warranty` | Warranties and representations |
| `sla` | Service level agreements, uptime, support |
| `insurance` | Insurance requirements |
| `compliance` | Regulatory compliance obligations |
| `dispute_resolution` | Governing law, arbitration, jurisdiction |
| `force_majeure` | Force majeure events and obligations |
| `assignment` | Assignment and subcontracting rights |
| `audit_rights` | Audit and inspection rights |

### Response (200 OK)

```json
{
  "success": true,
  "data": [
    {
      "id": "cls_01H8F5",
      "contractId": "ctr_01H8F5S3L0N4O6Q9",
      "section": "Section 8.2",
      "title": "Limitation of Liability",
      "category": "liability",
      "riskLevel": "high",
      "text": "Supplier's total aggregate liability shall not exceed the fees paid in the twelve (12) months preceding the claim.",
      "isNonStandard": true,
      "analysis": "Liability cap below industry standard for contract value.",
      "extractedAt": "2026-02-24T11:00:00.000Z",
      "extractedBy": "agent_contract_analysis"
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 50,
    "totalItems": 42,
    "totalPages": 1,
    "hasNextPage": false,
    "hasPreviousPage": false
  },
  "timestamp": "2026-02-08T17:00:00.000Z",
  "requestId": "req_ctr_clauses_01H8F5"
}
```

## List Obligations {#list-obligations}

List contractual obligations with tracking status and due dates.

```http
GET /api/v1/contracts/:id/obligations?filters[status]=upcoming
Authorization: Bearer <token>
```

### Query Parameters

| Parameter | Type | Description |
|---|---|---|
| `page` | integer | Page number (default: 1) |
| `pageSize` | integer | Items per page (default: 20) |
| `filters[status]` | string | `upcoming`, `overdue`, `completed`, `waived` |
| `filters[party]` | string | `customer`, `supplier`, `both` |
| `filters[dueDate_gte]` | ISO-8601 | Due after date |
| `filters[dueDate_lte]` | ISO-8601 | Due before date |
| `sort` | string | Sort field (e.g., `dueDate:asc`) |

### Response (200 OK)

```json
{
  "success": true,
  "data": [
    {
      "id": "obl_01H8F5",
      "contractId": "ctr_01H8F5S3L0N4O6Q9",
      "contractTitle": "Enterprise SaaS Agreement - CloudSync Platform",
      "description": "Provide quarterly performance reports",
      "party": "supplier",
      "status": "upcoming",
      "frequency": "quarterly",
      "dueDate": "2026-06-30T23:59:59.000Z",
      "daysUntilDue": 142,
      "section": "Section 5.3",
      "assignee": {
        "id": "usr_vendor_manager",
        "displayName": "Alex Rivera"
      },
      "reminderDays": [30, 14, 7],
      "completionHistory": [
        {
          "period": "2026-Q1",
          "completedAt": "2026-03-28T10:00:00.000Z",
          "completedBy": "supplier",
          "status": "completed_on_time"
        }
      ],
      "createdAt": "2026-02-24T11:00:00.000Z"
    },
    {
      "id": "obl_02H8F5",
      "contractId": "ctr_01H8F5S3L0N4O6Q9",
      "contractTitle": "Enterprise SaaS Agreement - CloudSync Platform",
      "description": "Conduct annual security audit",
      "party": "supplier",
      "status": "upcoming",
      "frequency": "annual",
      "dueDate": "2027-02-28T23:59:59.000Z",
      "daysUntilDue": 385,
      "section": "Section 9.1",
      "assignee": {
        "id": "usr_security_lead",
        "displayName": "Pat Morrison"
      },
      "reminderDays": [60, 30, 14],
      "completionHistory": [],
      "createdAt": "2026-02-24T11:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "totalItems": 6,
    "totalPages": 1,
    "hasNextPage": false,
    "hasPreviousPage": false
  },
  "timestamp": "2026-02-08T17:00:00.000Z",
  "requestId": "req_ctr_oblig_01H8F5"
}
```

## Create Amendment {#create-amendment}

Create an amendment to an existing contract. Amendments track changes to terms, values, dates, or scope.

```http
POST /api/v1/contracts/:id/amendments
Authorization: Bearer <token>
Content-Type: application/json
```

### Request Body

```json
{
  "title": "Amendment #1 - Scope Expansion",
  "description": "Add 50 additional user licenses and extend implementation support by 3 months.",
  "effectiveDate": "2026-06-01",
  "changes": [
    {
      "field": "value",
      "previousValue": "450000.00",
      "newValue": "475000.00",
      "description": "Increase contract value by $25,000 for additional licenses"
    },
    {
      "field": "scope",
      "previousValue": "100 user licenses",
      "newValue": "150 user licenses",
      "description": "Add 50 additional user licenses"
    },
    {
      "field": "implementation_end",
      "previousValue": "2026-06-30",
      "newValue": "2026-09-30",
      "description": "Extend implementation support by 3 months"
    }
  ],
  "justification": "Business expansion requires additional capacity. Negotiated favorable unit rate of $500/license vs. standard $600.",
  "attachments": ["file_amendment_01H8F5"]
}
```

### Response (201 Created)

```json
{
  "success": true,
  "data": {
    "id": "amd_01H8F5S3L0N4O6QB",
    "contractId": "ctr_01H8F5S3L0N4O6Q9",
    "amendmentNumber": "CTR-2026-002345-A1",
    "title": "Amendment #1 - Scope Expansion",
    "status": "pending_approval",
    "effectiveDate": "2026-06-01T00:00:00.000Z",
    "changes": [
      {
        "field": "value",
        "previousValue": "450000.00",
        "newValue": "475000.00",
        "description": "Increase contract value by $25,000 for additional licenses"
      },
      {
        "field": "scope",
        "previousValue": "100 user licenses",
        "newValue": "150 user licenses",
        "description": "Add 50 additional user licenses"
      },
      {
        "field": "implementation_end",
        "previousValue": "2026-06-30",
        "newValue": "2026-09-30",
        "description": "Extend implementation support by 3 months"
      }
    ],
    "workflowId": "wf_03H8F5",
    "createdBy": "usr_procurement_lead",
    "createdAt": "2026-02-08T17:30:00.000Z"
  },
  "timestamp": "2026-02-08T17:30:00.000Z",
  "requestId": "req_ctr_amend_01H8F5"
}
```

## List Expiring Contracts {#expiring}

List contracts approaching expiration within a specified time window. This endpoint powers the contract renewal dashboard and proactive renewal alerts.

```http
GET /api/v1/contracts/expiring?withinDays=90
Authorization: Bearer <token>
```

### Query Parameters

| Parameter | Type | Description |
|---|---|---|
| `withinDays` | integer | Days until expiration (default: 90, max: 365) |
| `page` | integer | Page number (default: 1) |
| `pageSize` | integer | Items per page (default: 20) |
| `filters[autoRenewal]` | boolean | Filter by auto-renewal status |
| `filters[department]` | string | Filter by department |
| `filters[value_gte]` | number | Minimum contract value |
| `sort` | string | Sort field (default: `endDate:asc`) |

### Response (200 OK)

```json
{
  "success": true,
  "data": [
    {
      "id": "ctr_03H8F5",
      "contractNumber": "CTR-2025-001234",
      "title": "Office Supplies Master Agreement",
      "type": "MSA",
      "status": "active",
      "supplierName": "Staples Business Advantage",
      "value": { "amount": 120000.00, "code": "USD" },
      "endDate": "2026-04-30T23:59:59.000Z",
      "daysToExpiry": 81,
      "autoRenewal": false,
      "renewalNoticeDays": 60,
      "renewalNoticeDeadline": "2026-03-01T23:59:59.000Z",
      "daysToNoticeDeadline": 21,
      "owner": {
        "id": "usr_procurement_lead",
        "displayName": "Maria Gonzalez"
      },
      "renewalRecommendation": {
        "action": "renew",
        "confidence": 0.88,
        "rationale": "Supplier performance is strong (4.1/5). Pricing is competitive with market. Recommend renewal with 3% cost reduction negotiation.",
        "suggestedBy": "agent_contract_analysis"
      },
      "spendLastYear": { "amount": 98000.00, "code": "USD" }
    },
    {
      "id": "ctr_04H8F5",
      "contractNumber": "CTR-2024-005678",
      "title": "Managed IT Services",
      "type": "MSA",
      "status": "active",
      "supplierName": "TechForce Inc.",
      "value": { "amount": 850000.00, "code": "USD" },
      "endDate": "2026-05-15T23:59:59.000Z",
      "daysToExpiry": 96,
      "autoRenewal": true,
      "renewalTermMonths": 12,
      "renewalNoticeDays": 90,
      "renewalNoticeDeadline": "2026-02-14T23:59:59.000Z",
      "daysToNoticeDeadline": 6,
      "owner": {
        "id": "usr_it_director",
        "displayName": "Jane Chen"
      },
      "renewalRecommendation": {
        "action": "renegotiate",
        "confidence": 0.82,
        "rationale": "Supplier performance has declined (3.4/5, down from 4.0). Market analysis shows competitive alternatives at 15% lower cost. Recommend competitive bid process.",
        "suggestedBy": "agent_contract_analysis"
      },
      "spendLastYear": { "amount": 820000.00, "code": "USD" }
    }
  ],
  "summary": {
    "totalExpiring": 12,
    "totalValue": { "amount": 3450000.00, "code": "USD" },
    "pastNoticeDeadline": 2,
    "renewalRecommended": 8,
    "renegotiationRecommended": 3,
    "terminationRecommended": 1
  },
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "totalItems": 12,
    "totalPages": 1,
    "hasNextPage": false,
    "hasPreviousPage": false
  },
  "timestamp": "2026-02-08T17:00:00.000Z",
  "requestId": "req_ctr_expiring_01H8F5"
}
```

## Error Responses

### 404 -- Contract Not Found

```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Contract ctr_nonexistent not found",
    "type": "NOT_FOUND",
    "requestId": "req_ctr_01H8F5",
    "timestamp": "2026-02-08T17:00:00.000Z"
  }
}
```

### 409 -- Version Conflict

```json
{
  "success": false,
  "error": {
    "code": "CONFLICT",
    "message": "Contract has been modified by another user. Please refresh and retry.",
    "type": "CONFLICT",
    "details": [
      {
        "field": "version",
        "message": "Expected version 7, but current version is 8",
        "code": "VERSION_MISMATCH"
      }
    ],
    "requestId": "req_ctr_conflict_01H8F5",
    "timestamp": "2026-02-08T17:00:00.000Z"
  }
}
```

### 422 -- Amendment Policy Violation

```json
{
  "success": false,
  "error": {
    "code": "POLICY_VIOLATION",
    "message": "Amendment exceeds authorized value change threshold",
    "type": "POLICY_VIOLATION",
    "details": [
      {
        "field": "value",
        "message": "Value increase of $25,000 (5.6%) exceeds the 5% threshold for standard amendments. VP approval required.",
        "code": "AMENDMENT_THRESHOLD_EXCEEDED"
      }
    ],
    "requestId": "req_ctr_policy_01H8F5",
    "timestamp": "2026-02-08T17:00:00.000Z"
  }
}
```
