# Contract Management Guide

> Contract creation, AI clause analysis, version management, obligation tracking, amendments, and renewal management.

## 1. Overview

The Contract Management module provides end-to-end contract lifecycle management, from creation through execution, monitoring, and renewal. AI-powered clause analysis helps legal and procurement teams identify risks, ensure compliance, and negotiate better terms.

### Key Capabilities

| Capability | Description |
|---|---|
| Contract repository | Centralized, searchable repository for all agreements |
| AI clause analysis | Automated extraction, classification, and risk scoring of contract clauses |
| Clause library | Pre-approved clause templates for standardized contracting |
| Version control | Full version history with diff comparison |
| Obligation tracking | Automated monitoring of contractual obligations and deadlines |
| Amendment management | Structured amendment process with approval workflows |
| Renewal management | Proactive renewal alerts with AI-powered recommendations |
| E-signature integration | Digital signature workflow for contract execution |

## 2. Contract Repository

### Accessing Contracts

Navigate to **Contracts > All Contracts** to view the contract repository.

*[Screenshot placeholder: Contract list with columns for contract number, title, supplier, type, status, value, end date, and risk level]*

### Search and Filters

| Filter | Options |
|---|---|
| Status | Draft, Pending Approval, Pending Signature, Active, Expired, Terminated, Renewed |
| Type | MSA, SOW, PO Contract, NDA, Amendment, SLA |
| Supplier | Search by supplier name |
| Department | Filter by owning department |
| Owner | Filter by contract owner |
| Value range | Minimum and maximum contract value |
| Expiry window | Contracts expiring within N days |
| Risk level | Low, Medium, High, Critical |
| Auto-renewal | Yes / No |

### Contract Views

- **List view** -- Traditional table with sortable columns
- **Calendar view** -- Visualize contracts on a timeline showing start/end dates and key milestones
- **Kanban view** -- Organize by status (Draft, Active, Expiring, Expired)

## 3. Creating a Contract

### Method 1: From Scratch

1. Navigate to **Contracts > New Contract**
2. Fill in contract details:

| Field | Description | Required |
|---|---|---|
| Title | Descriptive contract title | Yes |
| Type | MSA, SOW, NDA, PO Contract, SLA | Yes |
| Supplier | Select from supplier directory | Yes |
| Value | Total contract value and currency | Yes |
| Start date / End date | Contract effective period | Yes |
| Payment terms | Net 30, Net 60, etc. | Yes |
| Auto-renewal | Enable/disable automatic renewal | No |
| Renewal term | Duration of auto-renewal period | If auto-renewal |
| Notice period | Days before expiry for termination/renewal notice | Recommended |
| Owner | Person responsible for managing this contract | Yes |
| Department / Cost center | Budget allocation | Yes |
| Signatories | Internal and supplier signatories | Yes |
| Linked requisition | Associated purchase request | No |

3. Upload the contract document (PDF, DOCX)
4. Click **Save as Draft** or **Submit for Review**

### Method 2: From a Template

1. Navigate to **Contracts > New Contract**
2. Click **Use Template**
3. Select from available contract templates (Standard MSA, Standard NDA, SOW Template, etc.)
4. The template pre-fills standard clauses and structure
5. Customize the template with deal-specific terms
6. Upload the finalized document

### Method 3: From an Approved Requisition

When a purchase request is approved, a contract can be automatically initiated:

1. Open the approved requisition
2. Click **Create Contract**
3. Request details (supplier, value, line items) are pre-populated
4. Complete remaining contract fields and upload the document

## 4. AI Clause Analysis

### Running an Analysis

1. Open a contract with an uploaded document
2. Click **Analyze with AI**
3. Select the analysis type:

| Type | Duration | What You Get |
|---|---|---|
| Full Analysis | 30--60 seconds | Clause extraction, risk scoring, template comparison, redline suggestions |
| Risk Scan | 10--20 seconds | Risk-focused analysis of liability, indemnification, and termination clauses |
| Comparison | 15--30 seconds | Side-by-side comparison against a standard template or previous version |
| Obligation Extraction | 10--20 seconds | Extract all deadlines, deliverables, and recurring obligations |

4. Review the analysis results

### Understanding Analysis Results

**Risk Summary**

The analysis provides an overall risk score (0--100) with a breakdown by category:

| Risk Level | Score | Meaning |
|---|---|---|
| Low | 0 -- 25 | Standard terms, minor deviations from template |
| Medium | 26 -- 50 | Some non-standard clauses requiring attention |
| High | 51 -- 75 | Significant deviations; legal review recommended |
| Critical | 76 -- 100 | Major risk factors; do not sign without remediation |

**Highlighted Clauses**

The AI highlights clauses that require attention:

- **High-risk clauses** (red) -- Significantly unfavorable terms that should be renegotiated
- **Non-standard clauses** (yellow) -- Deviations from your organization's standard templates
- **Missing clauses** (blue) -- Recommended clauses that are absent from the contract

*[Screenshot placeholder: AI analysis results showing risk distribution chart, highlighted clauses with color coding, and suggested redlines]*

**Suggested Redlines**

For each flagged clause, the AI provides:
- The original clause text
- A suggested alternative
- Rationale for the change
- Priority level (high, medium, low)

### Using the Clause Library

The clause library contains pre-approved language for common contract provisions:

1. Navigate to **Contracts > Clause Library**
2. Browse by category (liability, indemnification, termination, data protection, etc.)
3. Each clause includes:
   - Standard language (approved by legal)
   - Fallback positions (acceptable alternatives)
   - Walk-away positions (minimum acceptable terms)
   - Guidance notes for negotiators

When the AI analysis identifies a non-standard clause, it suggests the corresponding standard clause from your library.

## 5. Version Control

### Uploading New Versions

1. Open the contract
2. Click **Upload New Version**
3. Select the updated document
4. Add change notes describing what changed in this version
5. The new version becomes the current version; previous versions are preserved

### Comparing Versions

1. Open the contract > **Versions** tab
2. Select two versions to compare
3. A diff view shows:
   - Added text (highlighted green)
   - Removed text (highlighted red)
   - Modified sections (highlighted yellow)
   - Clause-level change summary

*[Screenshot placeholder: Version comparison view with diff highlighting]*

### Version History

| Column | Description |
|---|---|
| Version number | Sequential version (v1, v2, v3...) |
| File name | Document file name |
| Uploaded by | User who uploaded this version |
| Upload date | When the version was uploaded |
| Change notes | Description of changes |
| Status | Draft, Under Review, Final, Signed |

## 6. Obligation Tracking

### What Are Obligations?

Obligations are contractual commitments that must be fulfilled by either party. The AI extracts these automatically during analysis, and they can also be added manually.

### Obligation Dashboard

Navigate to **Contracts > Obligations** for a consolidated view:

*[Screenshot placeholder: Obligation dashboard with calendar view and upcoming deadlines]*

| Column | Description |
|---|---|
| Description | What needs to be done |
| Contract | Associated contract |
| Party | Who is responsible (customer or supplier) |
| Due date | When it must be completed |
| Frequency | One-time, monthly, quarterly, annual |
| Status | Upcoming, Due Soon, Overdue, Completed, Waived |
| Assignee | Person responsible for tracking |

### Obligation Reminders

ProcGenie sends reminders before obligation due dates:

| Reminder | Timing | Channel |
|---|---|---|
| Early reminder | 30 days before due date | Email |
| Standard reminder | 14 days before due date | Email + in-app |
| Urgent reminder | 7 days before due date | Email + in-app + push |
| Overdue alert | On due date | Email + in-app + push + Slack |
| Escalation | 3 days after due date | Manager notification |

### Completing an Obligation

1. Navigate to the obligation
2. Click **Mark Complete**
3. Attach evidence (if applicable) -- e.g., audit report, performance report
4. Add a completion note
5. The obligation is recorded as completed in the audit trail

## 7. Amendments

### Creating an Amendment

1. Open the contract
2. Click **Create Amendment**
3. Fill in the amendment details:
   - Title (e.g., "Amendment #1 - Scope Expansion")
   - Effective date
   - Description of changes
   - Specific field changes (value, scope, dates, terms)
   - Justification
   - Upload the amendment document
4. Submit for approval

### Amendment Approval Workflow

Amendments follow an approval workflow based on the scope of changes:

| Change Type | Approval Required |
|---|---|
| Administrative (contacts, addresses) | Contract owner |
| Value increase < 5% | Contract owner + procurement manager |
| Value increase 5--15% | VP approval required |
| Value increase > 15% | New contract process recommended |
| Term extension | Contract owner + procurement manager |
| Scope change | Legal review + category manager |

### Amendment History

All amendments are tracked on the contract's **Amendments** tab:

- Amendment number (CTR-2026-002345-A1, A2, etc.)
- Effective date
- Summary of changes
- Approval status and history
- Net impact on contract value

## 8. Renewal Management

### Renewal Dashboard

Navigate to **Contracts > Renewals** for contracts approaching expiration:

*[Screenshot placeholder: Renewal dashboard showing contracts sorted by days to expiry with AI recommendations]*

### Renewal Alerts Timeline

| Alert | Timing | Description |
|---|---|---|
| Early planning | 180 days before expiry | Notification to contract owner to begin renewal planning |
| Evaluation period | 120 days before expiry | Performance review and market analysis by AI |
| Notice deadline warning | 30 days before notice deadline | Urgent: last chance to provide non-renewal notice |
| Auto-renewal alert | 7 days before auto-renewal | Final warning before contract automatically renews |

### AI Renewal Recommendations

For each expiring contract, the AI provides a recommendation:

| Recommendation | When It Applies |
|---|---|
| **Renew** | Good supplier performance, competitive pricing, no market alternatives |
| **Renegotiate** | Acceptable performance but opportunity for better terms |
| **Competitive bid** | Declining performance or significant market alternatives at lower cost |
| **Terminate** | Poor performance, compliance issues, or need no longer exists |

Each recommendation includes:
- Confidence score
- Supporting data points
- Suggested negotiation targets (if renegotiating)
- Alternative suppliers (if competitive bidding)

### Renewal Process

1. Review the AI recommendation on the renewal dashboard
2. Decide on the course of action (renew, renegotiate, bid, terminate)
3. If renewing or renegotiating:
   - Initiate a renewal workflow
   - Engage the supplier through the portal
   - Negotiate new terms
   - Upload the renewed contract
   - Execute approval workflow
4. If terminating:
   - Send non-renewal notice before the notice deadline
   - Plan transition to alternative supplier
   - Manage remaining obligations

## 9. Reporting

### Standard Contract Reports

| Report | Description | Frequency |
|---|---|---|
| Contract inventory | All active contracts with key details | On-demand |
| Expiring contracts | Contracts expiring within configurable window | Weekly |
| Obligation compliance | Obligation completion rates by contract and supplier | Monthly |
| Amendment activity | All amendments with value impact | Monthly |
| Risk exposure | Contracts by risk level with trending | Monthly |
| Spend under contract | Percentage of spend covered by active contracts | Quarterly |

### Custom Reports

ProcurementManagers can create custom reports:

1. Navigate to **Contracts > Reports**
2. Click **New Report**
3. Select data fields, filters, and groupings
4. Choose visualization (table, chart, or both)
5. Schedule for automatic generation and distribution (optional)
