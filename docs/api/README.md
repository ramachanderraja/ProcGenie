# API Documentation

> ProcGenie S2P Orchestration Platform -- REST API Reference

## Base URL

| Environment | Base URL |
|---|---|
| Local Development | `http://localhost:3000/api/v1` |
| Production | `https://api.procgenie.io/api/v1` |

Interactive Swagger documentation is available at `/docs` in non-production environments.

## Authentication

All API requests (except `/auth/login` and `/auth/register`) require a JWT Bearer token in the `Authorization` header.

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Obtaining a Token

```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "user@company.com",
  "password": "your-password"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGci...",
    "refreshToken": "eyJhbGci...",
    "expiresIn": 3600,
    "tokenType": "Bearer"
  },
  "timestamp": "2026-02-08T14:30:00.000Z",
  "requestId": "req_01H5K3M7N8P9Q2R4"
}
```

### Token Refresh

```http
POST /api/v1/auth/refresh
Content-Type: application/json

{
  "refreshToken": "eyJhbGci..."
}
```

### SSO Authentication

```http
GET /api/v1/auth/azure/login
# Redirects to Azure AD login page
# Callback: GET /api/v1/auth/azure/callback
```

## Required Headers

| Header | Required | Description |
|---|---|---|
| `Authorization` | Yes | `Bearer <JWT token>` |
| `Content-Type` | Yes (POST/PUT/PATCH) | `application/json` |
| `X-Tenant-Id` | Conditional | Tenant identifier (for multi-tenant SuperAdmin access) |
| `X-Request-Id` | Optional | Client-generated correlation ID for distributed tracing |

## Rate Limiting

API requests are rate-limited per tenant to ensure fair usage.

| Tier | Requests / Minute | Burst Limit |
|---|---|---|
| Free / Trial | 60 | 10 |
| Standard | 600 | 100 |
| Enterprise | 6,000 | 1,000 |
| Premium | 60,000 | 10,000 |

Rate limit headers are returned on every response:

```http
X-RateLimit-Limit: 600
X-RateLimit-Remaining: 594
X-RateLimit-Reset: 1707400260
```

When rate limited, the API returns:

```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMITED",
    "message": "Rate limit exceeded. Please retry after 30 seconds.",
    "type": "RATE_LIMITED",
    "requestId": "req_01H5K3M7N8P9Q2R4",
    "timestamp": "2026-02-08T14:30:00.000Z"
  }
}
```

## Error Format

All errors follow a consistent structure:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request validation failed",
    "type": "VALIDATION_ERROR",
    "details": [
      {
        "field": "amount",
        "message": "Amount must be a positive number",
        "code": "INVALID_VALUE"
      }
    ],
    "requestId": "req_01H5K3M7N8P9Q2R4",
    "timestamp": "2026-02-08T14:30:00.000Z"
  }
}
```

### Error Types

| Type | HTTP Status | Description |
|---|---|---|
| `VALIDATION_ERROR` | 400 | Request body or query parameters invalid |
| `AUTHENTICATION_ERROR` | 401 | Missing or invalid JWT token |
| `AUTHORIZATION_ERROR` | 403 | Insufficient permissions for this action |
| `NOT_FOUND` | 404 | Requested resource does not exist |
| `CONFLICT` | 409 | Resource conflict (duplicate, version mismatch) |
| `RATE_LIMITED` | 429 | Rate limit exceeded |
| `POLICY_VIOLATION` | 422 | Action violates procurement policy or SoD rules |
| `INTERNAL_ERROR` | 500 | Unexpected server error |
| `SERVICE_UNAVAILABLE` | 503 | Service temporarily unavailable |
| `INTEGRATION_ERROR` | 502 | External system integration failure |

## Pagination

All list endpoints support cursor-based pagination:

```http
GET /api/v1/requisitions?page=1&pageSize=20&sort=createdAt:desc
```

### Pagination Parameters

| Parameter | Type | Default | Description |
|---|---|---|---|
| `page` | integer | 1 | Page number (1-indexed) |
| `pageSize` | integer | 20 | Items per page (max: 100) |
| `sort` | string | `createdAt:desc` | Sort field and direction |
| `search` | string | - | Full-text search query |
| `filters` | object | - | Field-level filters |

### Pagination Response

```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "totalItems": 156,
    "totalPages": 8,
    "hasNextPage": true,
    "hasPreviousPage": false
  },
  "timestamp": "2026-02-08T14:30:00.000Z",
  "requestId": "req_01H5K3M7N8P9Q2R4"
}
```

### Filtering

Filters are passed as query parameters:

```http
GET /api/v1/requisitions?filters[status]=pending&filters[amount_gte]=1000&filters[category]=software
```

Supported operators:

| Operator | Example | Description |
|---|---|---|
| `eq` (default) | `filters[status]=pending` | Equals |
| `neq` | `filters[status_neq]=cancelled` | Not equals |
| `gt` | `filters[amount_gt]=1000` | Greater than |
| `gte` | `filters[amount_gte]=1000` | Greater than or equal |
| `lt` | `filters[amount_lt]=5000` | Less than |
| `lte` | `filters[amount_lte]=5000` | Less than or equal |
| `in` | `filters[status_in]=pending,approved` | In list |
| `contains` | `filters[title_contains]=laptop` | String contains |
| `between` | `filters[amount_between]=1000,5000` | Range |

## Endpoint Index

### Authentication

| Method | Path | Description |
|---|---|---|
| `POST` | `/auth/login` | Email/password login |
| `POST` | `/auth/register` | User registration |
| `POST` | `/auth/refresh` | Refresh JWT token |
| `POST` | `/auth/logout` | Invalidate session |
| `GET` | `/auth/azure/login` | Azure AD SSO login |
| `GET` | `/auth/azure/callback` | Azure AD SSO callback |
| `GET` | `/auth/me` | Get current user profile |

### Intake (Purchase Requests)

| Method | Path | Description | Docs |
|---|---|---|---|
| `POST` | `/intake/requests` | Create a purchase request | [Details](./intake-api.md#create-request) |
| `GET` | `/intake/requests` | List purchase requests | [Details](./intake-api.md#list-requests) |
| `GET` | `/intake/requests/:id` | Get request details | [Details](./intake-api.md#get-request) |
| `PATCH` | `/intake/requests/:id` | Update a request | [Details](./intake-api.md#update-request) |
| `DELETE` | `/intake/requests/:id` | Cancel a request | [Details](./intake-api.md#cancel-request) |
| `POST` | `/intake/requests/:id/submit` | Submit for approval | [Details](./intake-api.md#submit-request) |
| `POST` | `/intake/requests/:id/analyze` | AI analysis of request | [Details](./intake-api.md#ai-analyze) |
| `POST` | `/intake/documents/extract` | Extract data from document | [Details](./intake-api.md#document-extract) |
| `GET` | `/intake/drafts` | List draft requests | [Details](./intake-api.md#list-drafts) |
| `GET` | `/intake/templates` | List intake templates | [Details](./intake-api.md#list-templates) |
| `GET` | `/intake/categories` | Browse category taxonomy | [Details](./intake-api.md#list-categories) |

### Workflow & Approvals

| Method | Path | Description | Docs |
|---|---|---|---|
| `GET` | `/workflows` | List workflow instances | [Details](./workflow-api.md#list-workflows) |
| `GET` | `/workflows/:id` | Get workflow details | [Details](./workflow-api.md#get-workflow) |
| `GET` | `/workflows/:id/steps` | Get workflow steps | [Details](./workflow-api.md#get-steps) |
| `POST` | `/workflows/:id/steps/:stepId/approve` | Approve a step | [Details](./workflow-api.md#approve-step) |
| `POST` | `/workflows/:id/steps/:stepId/reject` | Reject a step | [Details](./workflow-api.md#reject-step) |
| `GET` | `/workflows/approvals/pending` | List pending approvals | [Details](./workflow-api.md#pending-approvals) |
| `GET` | `/workflows/templates` | List workflow templates | [Details](./workflow-api.md#list-templates) |
| `POST` | `/workflows/templates` | Create workflow template | [Details](./workflow-api.md#create-template) |

### Suppliers

| Method | Path | Description | Docs |
|---|---|---|---|
| `POST` | `/suppliers` | Create a supplier | [Details](./supplier-api.md#create-supplier) |
| `GET` | `/suppliers` | List suppliers | [Details](./supplier-api.md#list-suppliers) |
| `GET` | `/suppliers/:id` | Get supplier details | [Details](./supplier-api.md#get-supplier) |
| `PATCH` | `/suppliers/:id` | Update a supplier | [Details](./supplier-api.md#update-supplier) |
| `GET` | `/suppliers/:id/risk` | Get supplier risk profile | [Details](./supplier-api.md#get-risk) |
| `GET` | `/suppliers/:id/performance` | Get performance scores | [Details](./supplier-api.md#get-performance) |
| `POST` | `/suppliers/:id/qualifications` | Upload qualification docs | [Details](./supplier-api.md#upload-qualification) |
| `GET` | `/suppliers/:id/contracts` | List supplier contracts | [Details](./supplier-api.md#list-supplier-contracts) |
| `POST` | `/suppliers/onboard` | Initiate supplier onboarding | [Details](./supplier-api.md#onboard) |

### Contracts

| Method | Path | Description | Docs |
|---|---|---|---|
| `POST` | `/contracts` | Create a contract | [Details](./contract-api.md#create-contract) |
| `GET` | `/contracts` | List contracts | [Details](./contract-api.md#list-contracts) |
| `GET` | `/contracts/:id` | Get contract details | [Details](./contract-api.md#get-contract) |
| `PATCH` | `/contracts/:id` | Update a contract | [Details](./contract-api.md#update-contract) |
| `POST` | `/contracts/:id/analyze` | AI clause analysis | [Details](./contract-api.md#analyze-contract) |
| `GET` | `/contracts/:id/clauses` | List extracted clauses | [Details](./contract-api.md#list-clauses) |
| `GET` | `/contracts/:id/obligations` | List obligations | [Details](./contract-api.md#list-obligations) |
| `POST` | `/contracts/:id/amendments` | Create amendment | [Details](./contract-api.md#create-amendment) |
| `GET` | `/contracts/expiring` | List expiring contracts | [Details](./contract-api.md#expiring) |

### Buying & Purchase Orders

| Method | Path | Description |
|---|---|---|
| `POST` | `/purchase-orders` | Create a purchase order |
| `GET` | `/purchase-orders` | List purchase orders |
| `GET` | `/purchase-orders/:id` | Get PO details |
| `POST` | `/purchase-orders/:id/goods-receipt` | Confirm goods receipt |
| `GET` | `/catalog` | Browse approved catalog |
| `GET` | `/catalog/search` | Search catalog items |

### Invoices

| Method | Path | Description |
|---|---|---|
| `POST` | `/invoices` | Submit an invoice |
| `GET` | `/invoices` | List invoices |
| `GET` | `/invoices/:id` | Get invoice details |
| `POST` | `/invoices/:id/match` | Trigger three-way matching |
| `GET` | `/invoices/exceptions` | List matching exceptions |

### Analytics

| Method | Path | Description |
|---|---|---|
| `GET` | `/analytics/spend` | Spend analytics summary |
| `GET` | `/analytics/spend/by-category` | Spend by category |
| `GET` | `/analytics/spend/by-supplier` | Spend by supplier |
| `GET` | `/analytics/savings` | Savings waterfall data |
| `POST` | `/analytics/query` | Natural language query |
| `GET` | `/analytics/dashboards` | List custom dashboards |

### Sustainability

| Method | Path | Description |
|---|---|---|
| `GET` | `/sustainability/scores` | Supplier ESG scores |
| `GET` | `/sustainability/carbon` | Carbon footprint summary |
| `GET` | `/sustainability/dashboard` | ESG dashboard data |

### AI Agents

| Method | Path | Description |
|---|---|---|
| `GET` | `/agents` | List available agents |
| `GET` | `/agents/:id/tasks` | List agent tasks |
| `GET` | `/agents/:id/metrics` | Get agent performance metrics |
| `POST` | `/agents/:id/tasks` | Assign task to agent |
| `POST` | `/agents/chat` | Chat with AI assistant |

### Notifications

| Method | Path | Description |
|---|---|---|
| `GET` | `/notifications` | List notifications |
| `PATCH` | `/notifications/:id/read` | Mark as read |
| `GET` | `/notifications/preferences` | Get notification preferences |
| `PUT` | `/notifications/preferences` | Update notification preferences |

### Integrations

| Method | Path | Description |
|---|---|---|
| `GET` | `/integrations/connectors` | List configured connectors |
| `POST` | `/integrations/connectors` | Configure a new connector |
| `GET` | `/integrations/connectors/:id/status` | Get connector sync status |
| `POST` | `/integrations/connectors/:id/sync` | Trigger manual sync |
| `GET` | `/integrations/connectors/:id/logs` | Get sync logs |

## WebSocket Events

Real-time events are delivered via Socket.IO on the `/notifications` namespace:

```typescript
import { io } from 'socket.io-client';

const socket = io('ws://localhost:3002/notifications', {
  auth: { token: 'your-jwt-token' },
});

socket.on('notification', (data) => {
  console.log('New notification:', data);
});

socket.on('workflow:update', (data) => {
  console.log('Workflow status changed:', data);
});

socket.on('agent:action', (data) => {
  console.log('Agent completed action:', data);
});
```

### Event Types

| Event | Description |
|---|---|
| `notification` | General notification (approval required, status change, etc.) |
| `workflow:update` | Workflow step status change |
| `workflow:sla:warning` | SLA warning threshold reached |
| `agent:action` | AI agent completed a task |
| `agent:escalation` | AI agent escalated to human |
| `sync:completed` | Integration sync completed |
| `sync:error` | Integration sync error |
