# Intake API

> Endpoints for purchase request creation, AI analysis, document ingestion, and draft management.

## Create Request {#create-request}

Create a new purchase request.

```http
POST /api/v1/intake/requests
Authorization: Bearer <token>
Content-Type: application/json
```

### Request Body

```json
{
  "title": "Video Editing Software License",
  "description": "Need Adobe Premiere Pro license for the marketing team's Q2 campaign production.",
  "categoryCode": "43232300",
  "requestType": "software",
  "urgency": "standard",
  "items": [
    {
      "description": "Adobe Premiere Pro - Annual License",
      "quantity": 5,
      "unitPrice": {
        "amount": 359.88,
        "code": "USD"
      },
      "unit": "license",
      "deliveryDate": "2026-03-01"
    }
  ],
  "vendor": {
    "id": "vendor_adobe_01",
    "name": "Adobe Inc."
  },
  "costCenter": "MKT-2200",
  "glCode": "6400-SOFTWARE",
  "department": "Marketing",
  "justification": "Required for Q2 video campaign. Current licenses expiring March 15.",
  "attachments": ["file_quote_01H5K3"],
  "customFields": [
    {
      "fieldId": "data_classification",
      "fieldName": "Data Classification",
      "fieldType": "select",
      "value": "internal"
    }
  ],
  "tags": [
    { "key": "campaign", "value": "Q2-2026" }
  ]
}
```

### Response (201 Created)

```json
{
  "success": true,
  "data": {
    "id": "req_01H5K3M7N8P9Q2R4",
    "tenantId": "tenant_acme_corp",
    "title": "Video Editing Software License",
    "status": "draft",
    "requestNumber": "REQ-2026-001234",
    "totalAmount": {
      "amount": 1799.40,
      "code": "USD"
    },
    "items": [...],
    "createdBy": "usr_jane_smith",
    "createdAt": "2026-02-08T14:30:00.000Z",
    "updatedAt": "2026-02-08T14:30:00.000Z",
    "version": 1
  },
  "timestamp": "2026-02-08T14:30:00.000Z",
  "requestId": "req_01H5K3M7N8P9Q2R4"
}
```

## List Requests {#list-requests}

Retrieve a paginated list of purchase requests.

```http
GET /api/v1/intake/requests?page=1&pageSize=20&sort=createdAt:desc&filters[status]=pending
Authorization: Bearer <token>
```

### Query Parameters

| Parameter | Type | Description |
|---|---|---|
| `page` | integer | Page number (default: 1) |
| `pageSize` | integer | Items per page (default: 20, max: 100) |
| `sort` | string | Sort field and direction (e.g., `createdAt:desc`) |
| `search` | string | Full-text search across title and description |
| `filters[status]` | string | Filter by status: `draft`, `pending`, `approved`, `rejected`, `cancelled` |
| `filters[requestType]` | string | Filter by type: `software`, `hardware`, `services`, `supplies` |
| `filters[department]` | string | Filter by department |
| `filters[amount_gte]` | number | Minimum total amount |
| `filters[amount_lte]` | number | Maximum total amount |
| `filters[createdAt_gte]` | ISO-8601 | Created after date |
| `filters[createdAt_lte]` | ISO-8601 | Created before date |

### Response (200 OK)

```json
{
  "success": true,
  "data": [
    {
      "id": "req_01H5K3M7N8P9Q2R4",
      "requestNumber": "REQ-2026-001234",
      "title": "Video Editing Software License",
      "status": "pending",
      "requestType": "software",
      "totalAmount": { "amount": 1799.40, "code": "USD" },
      "department": "Marketing",
      "requester": {
        "id": "usr_jane_smith",
        "displayName": "Jane Smith",
        "email": "jane.smith@acme.com"
      },
      "createdAt": "2026-02-08T14:30:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "totalItems": 156,
    "totalPages": 8,
    "hasNextPage": true,
    "hasPreviousPage": false
  },
  "timestamp": "2026-02-08T14:30:00.000Z",
  "requestId": "req_list_01H5K3"
}
```

## Get Request {#get-request}

Retrieve detailed information about a single purchase request.

```http
GET /api/v1/intake/requests/:id
Authorization: Bearer <token>
```

### Response (200 OK)

Returns the full request object including items, vendor, workflow status, comments, and attachments.

## Update Request {#update-request}

Update a purchase request (only allowed in `draft` status).

```http
PATCH /api/v1/intake/requests/:id
Authorization: Bearer <token>
Content-Type: application/json
```

### Request Body

```json
{
  "title": "Updated Title",
  "items": [
    {
      "description": "Adobe Premiere Pro - Annual License",
      "quantity": 10,
      "unitPrice": { "amount": 359.88, "code": "USD" }
    }
  ],
  "justification": "Updated justification with additional context."
}
```

### Response (200 OK)

Returns the updated request object.

## Cancel Request {#cancel-request}

Cancel a purchase request.

```http
DELETE /api/v1/intake/requests/:id
Authorization: Bearer <token>
```

### Response (200 OK)

```json
{
  "success": true,
  "data": {
    "id": "req_01H5K3M7N8P9Q2R4",
    "status": "cancelled",
    "cancelledAt": "2026-02-08T15:00:00.000Z",
    "cancelledBy": "usr_jane_smith"
  },
  "timestamp": "2026-02-08T15:00:00.000Z",
  "requestId": "req_cancel_01H5K3"
}
```

## Submit Request {#submit-request}

Submit a draft request for approval. This triggers the workflow engine to create an approval workflow based on the request's category, amount, and configured rules.

```http
POST /api/v1/intake/requests/:id/submit
Authorization: Bearer <token>
```

### Response (200 OK)

```json
{
  "success": true,
  "data": {
    "id": "req_01H5K3M7N8P9Q2R4",
    "status": "pending",
    "workflowId": "wf_01H5K3M7N8P9Q2R4",
    "submittedAt": "2026-02-08T14:35:00.000Z",
    "estimatedCompletionDate": "2026-02-12T14:35:00.000Z",
    "currentStep": {
      "id": "step_01",
      "name": "Manager Approval",
      "assignee": {
        "id": "usr_john_manager",
        "displayName": "John Manager"
      },
      "sla": {
        "warningAt": "2026-02-10T14:35:00.000Z",
        "breachAt": "2026-02-11T14:35:00.000Z"
      }
    }
  },
  "timestamp": "2026-02-08T14:35:00.000Z",
  "requestId": "req_submit_01H5K3"
}
```

## AI Analysis {#ai-analyze}

Trigger AI analysis on a purchase request. The Intake Classifier Agent analyzes the request and provides recommendations for category, vendor, and compliance.

```http
POST /api/v1/intake/requests/:id/analyze
Authorization: Bearer <token>
```

### Response (200 OK)

```json
{
  "success": true,
  "data": {
    "requestId": "req_01H5K3M7N8P9Q2R4",
    "analysis": {
      "category": {
        "suggested": "43232300",
        "suggestedName": "Video Editing Software",
        "confidence": 0.94
      },
      "buyingChannel": {
        "suggested": "contract",
        "reason": "Existing master agreement with Adobe (Contract #C-2025-0045)",
        "confidence": 0.91
      },
      "duplicateCheck": {
        "hasPotentialDuplicates": false,
        "existingContracts": [
          {
            "contractId": "ctr_adobe_01",
            "title": "Adobe Creative Cloud Enterprise",
            "expiresAt": "2026-12-31",
            "utilizationPercent": 72
          }
        ]
      },
      "policyCompliance": {
        "isCompliant": true,
        "checks": [
          { "rule": "preferred_supplier", "status": "pass", "message": "Adobe is a preferred supplier" },
          { "rule": "budget_available", "status": "pass", "message": "Budget available in MKT-2200" },
          { "rule": "approval_threshold", "status": "info", "message": "Requires manager approval ($1K-$10K)" }
        ]
      },
      "riskAssessment": {
        "level": "low",
        "factors": []
      },
      "suggestions": [
        "Consider using existing Adobe Creative Cloud contract for volume discount",
        "5 additional licenses would increase utilization from 72% to 85%"
      ]
    },
    "agentId": "agent_intake_classifier",
    "confidence": 0.92,
    "processingTimeMs": 2340
  },
  "timestamp": "2026-02-08T14:31:00.000Z",
  "requestId": "req_analyze_01H5K3"
}
```

## Document Extraction {#document-extract}

Upload a document (vendor quote, invoice, contract) and extract structured data using AI (OCR + LLM).

```http
POST /api/v1/intake/documents/extract
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

### Request

| Field | Type | Required | Description |
|---|---|---|---|
| `file` | File | Yes | PDF, DOCX, JPG, or PNG document |
| `documentType` | string | No | Hint: `quote`, `invoice`, `contract` |

### Response (200 OK)

```json
{
  "success": true,
  "data": {
    "documentId": "doc_01H5K3M7N8P9Q2R4",
    "documentType": "quote",
    "extractedFields": {
      "vendorName": { "value": "Adobe Inc.", "confidence": 0.98 },
      "vendorAddress": { "value": "345 Park Avenue, San Jose, CA 95110", "confidence": 0.95 },
      "quoteNumber": { "value": "Q-2026-78901", "confidence": 0.97 },
      "quoteDate": { "value": "2026-01-25", "confidence": 0.96 },
      "validUntil": { "value": "2026-03-25", "confidence": 0.93 },
      "currency": { "value": "USD", "confidence": 0.99 },
      "totalAmount": { "value": 1799.40, "confidence": 0.97 },
      "lineItems": [
        {
          "description": { "value": "Adobe Premiere Pro - Annual License", "confidence": 0.95 },
          "quantity": { "value": 5, "confidence": 0.98 },
          "unitPrice": { "value": 359.88, "confidence": 0.97 }
        }
      ]
    },
    "lowConfidenceFields": ["validUntil"],
    "rawText": "...",
    "processingTimeMs": 3200
  },
  "timestamp": "2026-02-08T14:30:05.000Z",
  "requestId": "req_extract_01H5K3"
}
```

Fields with confidence below 85% are included in the `lowConfidenceFields` array and should be highlighted in the UI for user review.

## List Drafts {#list-drafts}

List the current user's draft requests.

```http
GET /api/v1/intake/drafts
Authorization: Bearer <token>
```

### Response (200 OK)

Returns a paginated list of draft requests belonging to the authenticated user.

## List Templates {#list-templates}

List available intake form templates.

```http
GET /api/v1/intake/templates
Authorization: Bearer <token>
```

### Response (200 OK)

```json
{
  "success": true,
  "data": [
    {
      "id": "tmpl_software",
      "name": "Software / SaaS Purchase",
      "description": "Template for software licenses and SaaS subscriptions",
      "category": "software",
      "fields": [
        { "fieldId": "data_classification", "fieldName": "Data Classification", "fieldType": "select", "required": true },
        { "fieldId": "users_count", "fieldName": "Number of Users", "fieldType": "number", "required": true },
        { "fieldId": "integration_required", "fieldName": "Integration Required", "fieldType": "boolean", "required": false }
      ]
    },
    {
      "id": "tmpl_hardware",
      "name": "IT Hardware Request",
      "description": "Template for computer hardware and peripherals",
      "category": "hardware",
      "fields": [...]
    }
  ],
  "timestamp": "2026-02-08T14:30:00.000Z",
  "requestId": "req_templates_01H5K3"
}
```

## List Categories {#list-categories}

Browse the UNSPSC-based category taxonomy.

```http
GET /api/v1/intake/categories?parentId=43230000&search=video
Authorization: Bearer <token>
```

### Query Parameters

| Parameter | Type | Description |
|---|---|---|
| `parentId` | string | Parent category code for hierarchical browsing |
| `search` | string | Search categories by name |
| `level` | integer | Category level (1-4) |

### Response (200 OK)

```json
{
  "success": true,
  "data": [
    {
      "code": "43232300",
      "name": "Video Editing Software",
      "parentCode": "43230000",
      "level": 3,
      "hasChildren": false
    }
  ],
  "timestamp": "2026-02-08T14:30:00.000Z",
  "requestId": "req_categories_01H5K3"
}
```
