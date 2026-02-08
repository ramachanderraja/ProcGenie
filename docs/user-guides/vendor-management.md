# Vendor Management Guide

> Supplier onboarding, golden record management, performance scorecards, risk profiles, segmentation, and the supplier portal.

## 1. Overview

The Vendor Management module provides a unified view of all supplier relationships. It serves as the "golden record" for supplier data, consolidating information from your ERP, procurement activities, risk monitoring, and the supplier portal.

### Key Capabilities

| Capability | Description |
|---|---|
| Supplier golden record | Single source of truth for all supplier data |
| Self-service onboarding | Suppliers complete registration and upload documents via the portal |
| Risk monitoring | Continuous screening for financial, compliance, and reputational risks |
| Performance scorecards | Structured evaluations across quality, delivery, and responsiveness |
| Segmentation | Classify suppliers as Strategic, Preferred, Approved, Transactional, or Restricted |
| Diversity tracking | Track and report on diversity certifications (MBE, WBE, SDVOB, HUBZone) |
| Qualification management | Track insurance, certifications, and compliance documents with expiry alerts |
| ESG scoring | Environmental, social, and governance assessments per supplier |

## 2. Supplier Directory

### Accessing the Directory

Navigate to **Suppliers > Directory** to view all active suppliers.

*[Screenshot placeholder: Supplier directory with search, filters, and list view showing supplier cards with key metrics]*

### Directory Features

- **Search** -- Find suppliers by name, supplier number, contact, or category
- **Filters** -- Filter by status, segment, risk level, industry, country, or diversity certification
- **Views** -- Toggle between list view, card view, and map view
- **Export** -- Download supplier list as CSV or Excel
- **Bulk actions** -- Update segments or tags for multiple suppliers at once

### Supplier Card Information

Each supplier card displays:

| Field | Description |
|---|---|
| Legal name and trading name | Official and common supplier names |
| Supplier number | Internal identifier (e.g., SUP-2026-004521) |
| Segment badge | Strategic / Preferred / Approved / Transactional / Restricted |
| Risk level | Low / Medium / High / Critical with color indicator |
| Performance score | Overall score (1.0 -- 5.0 stars) |
| Active contracts | Number of active contracts |
| Spend YTD | Year-to-date spending total |
| Diversity certifications | Applicable certifications |
| Status | Active / Suspended / Pending Verification |

## 3. Supplier Onboarding

### Initiating Onboarding

1. Navigate to **Suppliers > Onboard New Supplier**
2. Enter the supplier's basic information:
   - Legal name and Tax ID
   - Primary contact name, email, and phone
   - Industry and procurement category
   - Business justification for adding this supplier
3. Select required qualification documents (W-9, insurance, SOC 2, etc.)
4. Click **Start Onboarding**

### Onboarding Workflow

The onboarding process follows an automated workflow:

```
Step 1: Sanctions Screening (Automated)
    │   Risk Monitoring Agent screens OFAC, EU, UN, UK lists
    │   Duration: 1-5 minutes
    ▼
Step 2: Portal Invitation (Automated)
    │   Supplier receives email invitation to register
    │   Duration: Instant
    ▼
Step 3: Supplier Registration (Supplier Action)
    │   Supplier completes profile and uploads documents
    │   Duration: 1-5 business days (configurable SLA)
    ▼
Step 4: Document Review (Approval)
    │   Procurement team reviews submitted documents
    │   Duration: 1-2 business days
    ▼
Step 5: Internal Approval (Approval)
    │   Category manager or procurement lead approves
    │   Duration: 1-2 business days
    ▼
Step 6: ERP Synchronization (Automated)
    │   Supplier record synced to ERP via integration service
    │   Duration: 5-30 minutes
    ▼
Supplier Active
```

### Tracking Onboarding Progress

View all in-progress onboarding workflows at **Suppliers > Onboarding Dashboard**:

| Column | Description |
|---|---|
| Supplier name | Name of the supplier being onboarded |
| Requested by | Employee who initiated onboarding |
| Current step | Active step in the workflow |
| Status | Overall status (in_progress, awaiting_supplier, completed, etc.) |
| Submitted date | When onboarding was initiated |
| SLA status | On track / At risk / Breached |
| Days elapsed | Total days since initiation |

## 4. Supplier Profile (Golden Record)

### Profile Sections

The supplier profile page consolidates all data into organized tabs:

**Overview Tab**
- Company information (legal name, Tax ID, DUNS, website)
- Primary and additional contacts
- Address and billing information
- Segment classification
- Tags and custom fields

**Qualifications Tab**
- Uploaded documents with status indicators
- Expiry tracking with countdown badges
- Upload new documents
- AI-extracted document data

**Risk Tab**
- Overall risk score and level
- Five-dimensional risk breakdown (financial, operational, compliance, reputational, concentration)
- Risk alerts and acknowledged items
- Sanctions screening status and history
- Risk trend chart (12-month history)

**Performance Tab**
- Current and historical performance scores
- Dimension breakdown (quality, delivery, responsiveness, cost, innovation)
- Benchmark comparison against category average
- KPI dashboard (on-time delivery %, defect rate, etc.)

**Contracts Tab**
- Active and expired contracts
- Contract value and renewal dates
- Linked purchase orders

**Spend Tab**
- Spend by period (monthly, quarterly, annual)
- Spend by category breakdown
- Invoice history and payment status

**ESG Tab**
- Environmental, social, and governance scores
- Carbon footprint estimates
- Diversity certifications
- ESG improvement recommendations

## 5. Performance Scorecards

### Creating an Evaluation

1. Navigate to the supplier's profile > **Performance** tab
2. Click **New Evaluation**
3. Rate the supplier on each dimension (1 -- 5 scale):

| Dimension | Description | Weight |
|---|---|---|
| Quality | Product/service quality, defect rate, specifications adherence | 25% |
| Delivery | On-time delivery, lead time accuracy, flexibility | 25% |
| Responsiveness | Communication speed, issue resolution, account management | 20% |
| Cost Competitiveness | Pricing vs. market, value for money, cost reduction efforts | 20% |
| Innovation | Proactive suggestions, new capabilities, continuous improvement | 10% |

4. Associate relevant purchase orders with this evaluation
5. Add comments and specific examples
6. Click **Submit Evaluation**

### Score Interpretation

| Score Range | Rating | Meaning |
|---|---|---|
| 4.5 -- 5.0 | Exceptional | Consistently exceeds expectations |
| 3.5 -- 4.4 | Good | Meets and occasionally exceeds expectations |
| 2.5 -- 3.4 | Satisfactory | Meets minimum requirements |
| 1.5 -- 2.4 | Below expectations | Improvement plan required |
| 1.0 -- 1.4 | Unsatisfactory | Consider termination or suspension |

### Automated KPI Tracking

In addition to manual evaluations, ProcGenie automatically tracks operational KPIs from transactional data:

| KPI | Data Source | Update Frequency |
|---|---|---|
| On-time delivery rate | Goods receipt vs. PO delivery date | Per delivery |
| Quality defect rate | Quality inspection records | Per inspection |
| Invoice accuracy rate | Three-way matching results | Per invoice |
| Response time SLA met | Communication timestamps | Real-time |
| Average lead time | PO date to delivery date | Per delivery |

## 6. Risk Monitoring

### Continuous Monitoring

The Risk Monitoring Agent (A7) continuously assesses suppliers across five risk dimensions:

1. **Financial risk** -- Credit ratings, financial statements, revenue trends, bankruptcy indicators
2. **Operational risk** -- Delivery performance, quality metrics, capacity constraints
3. **Compliance risk** -- Sanctions screening, certifications, regulatory compliance
4. **Reputational risk** -- News sentiment analysis, legal proceedings, ESG controversies
5. **Concentration risk** -- Spend concentration, single-source dependencies, geographic risk

### Risk Alerts

When a risk factor changes, you receive an alert:

| Alert Severity | Trigger Examples | Action Required |
|---|---|---|
| **Critical** | Sanctions list match, bankruptcy filing, data breach | Immediate review; supplier may be auto-suspended |
| **High** | Credit downgrade, major lawsuit, compliance lapse | Review within 24 hours |
| **Medium** | Insurance expiring, performance decline | Review within 7 days |
| **Low** | Minor news mention, industry trend | Informational; no action needed |

### Managing Alerts

1. Navigate to **Suppliers > Risk Alerts**
2. Filter by severity, supplier, or category
3. For each alert:
   - **Acknowledge** -- Mark as reviewed with a note
   - **Create action** -- Open a remediation task
   - **Dismiss** -- Remove from active alerts (with required reason)
   - **Escalate** -- Forward to management for high-impact decisions

## 7. Supplier Segmentation

### Segment Definitions

| Segment | Criteria | Relationship Level |
|---|---|---|
| **Strategic** | Top 5% by spend or critical to operations; long-term partnership | Executive sponsor; quarterly business reviews |
| **Preferred** | Established relationship; competitive pricing; good performance | Category manager; annual reviews |
| **Approved** | Qualified and vetted; available for general use | Standard management; periodic reviews |
| **Transactional** | Low-value, infrequent purchases; spot buys | Minimal management; automated processes |
| **Restricted** | Under review, performance issues, or compliance concerns | Active monitoring; restricted to existing contracts only |

### Changing Segment

1. Open the supplier profile
2. Click the segment badge
3. Select the new segment
4. Provide justification (required for upgrades and downgrades)
5. Changes to Strategic segment require ProcurementManager or TenantAdmin approval

## 8. Supplier Portal

### What Suppliers Can Do

Suppliers access ProcGenie via the supplier portal at `https://portal.procgenie.io`:

| Capability | Description |
|---|---|
| Complete registration | Fill in company profile, banking details, and contacts |
| Upload documents | Submit qualifications, certifications, and insurance certificates |
| View RFQs | See and respond to requests for quotation |
| Submit invoices | Upload invoices for processing |
| Track payments | View payment status and history |
| Update profile | Maintain current contact and banking information |
| View scorecards | See their performance evaluations |
| Respond to surveys | Complete satisfaction and capability surveys |

### Supplier Communication

Communicate with suppliers directly through ProcGenie:

- **Messaging** -- Send messages through the platform (tracked in audit trail)
- **Document requests** -- Request specific documents with a deadline
- **RFQ responses** -- Review and compare supplier quotations
- **Performance feedback** -- Share scorecard results and improvement plans
