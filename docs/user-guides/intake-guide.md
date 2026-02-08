# Intake Module Guide

> Submitting purchase requests, NLP-powered intake, document upload and extraction, templates, and status tracking.

## 1. Overview

The Intake module is the starting point for all procurement activity in ProcGenie. It provides a guided, intelligent experience for submitting purchase requests, with AI-powered classification, duplicate detection, and document extraction.

### Key Features

| Feature | Description |
|---|---|
| Smart request forms | Category-specific form templates with conditional fields |
| NLP intake | Type or speak your request in natural language |
| Document extraction | Upload vendor quotes or invoices for automatic data extraction |
| Duplicate detection | AI identifies similar or duplicate existing requests |
| Category classification | Automatic UNSPSC category assignment |
| Policy pre-check | Real-time policy compliance validation |
| Draft management | Save incomplete requests and resume later |
| Bulk requests | Upload CSV/Excel for batch request creation |

## 2. Submitting a Purchase Request

### Method 1: Guided Form

1. Navigate to **Requests > New Request**
2. Select a template or browse the category taxonomy
3. Fill in the required fields:
   - **Title** and **Description** -- Clearly describe what you need and why
   - **Line items** -- Add each item with quantity, unit price, unit of measure, and desired delivery date
   - **Vendor** -- Search for an existing supplier or leave blank for sourcing
   - **Cost center / GL code** -- Select from your authorized cost centers
   - **Urgency** -- Choose Standard (default 5-day SLA), Urgent (2-day SLA), or Critical (same-day SLA)
   - **Attachments** -- Upload supporting documents (quotes, specs, contracts)
4. Click **Analyze** for AI recommendations (optional but recommended)
5. Click **Submit** to start the approval workflow

*[Screenshot placeholder: New request form with filled fields, category selector, and line item table]*

### Method 2: NLP (Natural Language) Intake

1. Navigate to **Requests > New Request**
2. Click the **Describe Your Need** tab
3. Type a natural language description:

```
"I need to renew our Zoom Business licenses for 200 users.
Current contract expires March 31. Budget is under $40,000.
Please use the existing Zoom Video Communications vendor record."
```

4. The AI Intake Classifier will:
   - Extract the request type (software renewal)
   - Identify the vendor (Zoom Video Communications)
   - Estimate quantity (200 licenses) and approximate cost
   - Suggest the UNSPSC category
   - Check for existing contracts and preferred vendor status
   - Pre-fill the request form

5. Review the pre-filled form, make any corrections, and submit

*[Screenshot placeholder: NLP intake text area with AI analysis results panel]*

### Method 3: Document Upload

1. Navigate to **Requests > New Request**
2. Click the **Upload Document** tab
3. Drag and drop or browse to upload a vendor quote, invoice, or specification document
4. The Document Extraction Agent processes the file:
   - OCR for scanned documents
   - Structured data extraction for PDFs
   - Field mapping to the request form
5. Review extracted data -- fields with low confidence are highlighted in yellow for manual review
6. Complete any missing fields and submit

Supported file types: PDF, DOCX, XLSX, JPG, PNG (max 25 MB per file)

*[Screenshot placeholder: Document upload area with extraction results showing extracted vendor, line items, and confidence scores]*

## 3. Templates

### Using Templates

Templates provide pre-configured forms for common request types:

| Template | Use Case | Custom Fields |
|---|---|---|
| Software / SaaS Purchase | Software licenses, SaaS subscriptions | Data classification, number of users, integration required |
| IT Hardware Request | Computers, peripherals, equipment | Asset tag required, warranty terms, deployment location |
| Professional Services | Consulting, staffing, outsourcing | SOW attached, security clearance required, on-site/remote |
| Office Supplies | General office supplies and consumables | Delivery location, recurring order |
| Marketing Services | Agencies, events, promotional materials | Campaign name, brand guidelines review required |
| Facilities & Maintenance | Building services, repairs, renovations | Building/floor location, safety requirements |
| Travel & Events | Conference attendance, team travel | Event name, dates, number of attendees |

### Managing Templates (Admin)

ProcurementManagers and TenantAdmins can create and modify templates:

1. Navigate to **Settings > Intake Templates**
2. Click **Create Template** or edit an existing one
3. Configure:
   - Template name and description
   - Associated UNSPSC categories
   - Required and optional fields
   - Conditional logic (show/hide fields based on other field values)
   - Default values
   - Approval workflow override (if different from default)

## 4. Request Statuses

| Status | Description | Actions Available |
|---|---|---|
| **Draft** | Request saved but not submitted | Edit, Delete, Submit |
| **Pending** | Submitted and awaiting approval | View, Comment, Cancel |
| **Returned** | Sent back by an approver for revision | Edit, Resubmit, Cancel |
| **Approved** | All approvals completed | View, Track PO |
| **Rejected** | Request rejected by an approver | View, Clone (resubmit as new) |
| **Cancelled** | Cancelled by the requester | View |
| **PO Created** | Purchase order generated from approved request | View PO |
| **Fulfilled** | Goods/services received and confirmed | View, Rate Supplier |

### Status Flow

```
Draft ──▶ Pending ──▶ Approved ──▶ PO Created ──▶ Fulfilled
              │            │
              ▼            ▼
          Returned     Rejected
              │
              ▼
          Resubmit ──▶ Pending

Any status ──▶ Cancelled (by requester, before PO creation)
```

## 5. Tracking Your Requests

### My Requests View

Navigate to **Requests > My Requests** to see all your purchase requests in a filterable, sortable table:

- **Filter** by status, date range, amount, or category
- **Search** by title, request number, or vendor name
- **Sort** by date, amount, status, or urgency
- **Export** to CSV or Excel

*[Screenshot placeholder: My Requests table with filters, status badges, and SLA indicators]*

### Pizza Tracker

Each request has a visual "pizza tracker" showing its progress through the approval workflow:

```
[Submitted] ──── [Manager Review] ──── [Finance Review] ──── [PO Generation]
   Done              In Progress           Waiting              Waiting
   Feb 8              Feb 8                  ---                  ---
   2:30 PM           3:15 PM
```

- **Completed steps** show the decision (approved/rejected), who decided, and when
- **Current step** shows the assigned approver, SLA countdown, and any comments
- **Waiting steps** show the expected sequence

### Notifications

You receive notifications when:

| Event | Notification Channel |
|---|---|
| Request submitted confirmation | In-app, Email |
| Approval step completed | In-app, Email |
| Request returned for revision | In-app, Email, Push |
| Request approved (all steps) | In-app, Email |
| Request rejected | In-app, Email, Push |
| PO created from your request | In-app, Email |
| SLA at risk (for your pending requests) | In-app |

Configure notification preferences at **Settings > Notifications**.

## 6. Drafts

### Saving Drafts

Your work is automatically saved every 30 seconds. You can also click **Save Draft** manually. Drafts are:

- Visible only to you (unless explicitly shared)
- Accessible from **Requests > Drafts**
- Retained for 90 days (configurable by admin)

### Sharing Drafts

To share a draft with a colleague for review before submission:

1. Open the draft
2. Click **Share Draft**
3. Enter the colleague's email
4. They receive an edit or view-only link

## 7. Bulk Request Import

For batch purchases, you can import multiple requests from a spreadsheet:

1. Navigate to **Requests > Import**
2. Download the CSV/Excel template
3. Fill in one row per request with required fields
4. Upload the completed file
5. Review the import preview -- errors are highlighted per row
6. Click **Import** to create all requests as drafts
7. Review and submit each request individually or use **Submit All**

### Import Template Columns

| Column | Required | Description |
|---|---|---|
| `title` | Yes | Request title |
| `description` | Yes | Request description |
| `category_code` | Yes | UNSPSC category code |
| `item_description` | Yes | Line item description |
| `quantity` | Yes | Item quantity |
| `unit_price` | Yes | Price per unit |
| `currency` | Yes | Currency code (e.g., USD) |
| `vendor_name` | No | Supplier name |
| `cost_center` | Yes | Cost center code |
| `urgency` | No | standard, urgent, critical |
| `delivery_date` | No | Desired delivery date |
| `justification` | No | Business justification |

## 8. Tips for Faster Approvals

1. **Provide clear justification** -- Explain why this purchase is needed and the business impact of not proceeding
2. **Attach vendor quotes** -- Requests with supporting documentation are approved 40% faster on average
3. **Use preferred vendors** -- Requests using preferred or strategic suppliers often follow expedited workflows
4. **Select the right category** -- Accurate categorization ensures the request is routed to the correct approvers
5. **Include delivery dates** -- Realistic delivery dates help approvers assess urgency
6. **Leverage AI analysis** -- Run AI analysis before submitting to catch policy issues early
