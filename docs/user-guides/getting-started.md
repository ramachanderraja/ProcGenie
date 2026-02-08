# Getting Started

> Your first steps with ProcGenie: logging in, navigating the dashboard, creating your first purchase request, understanding the approval workflow, and using the AI assistant.

## 1. First Login

### Accessing ProcGenie

Open your browser and navigate to your organization's ProcGenie instance:

- **Production:** `https://app.procgenie.io`
- **Staging:** `https://staging.procgenie.io`

### SSO Login

If your organization uses Single Sign-On (SSO):

1. Click **Sign in with SSO** on the login page
2. You will be redirected to your identity provider (Azure AD, Okta, etc.)
3. Enter your corporate credentials
4. After authentication, you will be redirected back to ProcGenie

### Email/Password Login

If SSO is not configured:

1. Enter your email address and password
2. If multi-factor authentication (MFA) is enabled, enter the code from your authenticator app
3. Click **Sign In**

### First-Time Setup

On your first login, you will be guided through a brief setup wizard:

1. **Verify your profile** -- Confirm your name, department, and contact details
2. **Set notification preferences** -- Choose how you want to receive alerts (email, in-app, Slack/Teams)
3. **Review delegation settings** -- Optionally configure an approval delegate for when you are out of office
4. **Quick tour** -- A 2-minute interactive tour highlights key features

## 2. Dashboard Tour

After login, you land on the **Home Dashboard**. The dashboard is personalized based on your role.

### Dashboard Layout

```
┌─────────────────────────────────────────────────────────────────────────┐
│  [Logo] ProcGenie          [Search...]        [Bell] [?] [Profile]     │
├──────────┬──────────────────────────────────────────────────────────────┤
│          │                                                              │
│  NAV     │  WELCOME BANNER                                             │
│          │  "Good morning, Jane. You have 3 pending approvals."        │
│  Home    │                                                              │
│  Requests│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  Approvals│ │ My Requests  │  │ Pending      │  │ Spend YTD    │      │
│  Suppliers│ │    12        │  │ Approvals    │  │ $1.2M        │      │
│  Contracts│ │              │  │    3         │  │ ↑ 8%         │      │
│  Analytics│ └──────────────┘  └──────────────┘  └──────────────┘      │
│  Settings │                                                             │
│          │  RECENT ACTIVITY                                             │
│          │  ┌──────────────────────────────────────────────────────┐   │
│          │  │ REQ-2026-001234 approved by John Manager (2h ago)    │   │
│          │  │ REQ-2026-001230 submitted for approval (1d ago)      │   │
│          │  │ SUP-2026-004521 onboarding completed (2d ago)        │   │
│          │  └──────────────────────────────────────────────────────┘   │
│          │                                                              │
│          │  AI INSIGHTS                                                 │
│          │  ┌──────────────────────────────────────────────────────┐   │
│          │  │ "3 contracts expire within 90 days. Review the       │   │
│          │  │  renewal dashboard for recommendations."             │   │
│          │  └──────────────────────────────────────────────────────┘   │
└──────────┴──────────────────────────────────────────────────────────────┘
```

### Key Dashboard Elements

| Element | Description |
|---|---|
| **Navigation sidebar** | Links to all modules. Collapses on smaller screens. |
| **Global search** | Search across requests, suppliers, contracts, and catalog. Supports natural language queries. |
| **Notification bell** | Real-time notifications for approvals, status changes, and AI agent actions. |
| **Help button (?)** | Context-sensitive help, FAQ, and support contact. |
| **Summary cards** | Quick statistics: your requests, pending approvals, spend data. |
| **Recent activity** | Timeline of recent actions relevant to you. |
| **AI insights** | Proactive recommendations from ProcGenie's AI agents. |

### Role-Specific Views

| Role | Dashboard Focus |
|---|---|
| Requester | My requests, draft requests, recent submissions |
| Approver | Pending approvals (prioritized by SLA), approved/rejected history |
| Procurement Manager | Spend analytics, supplier performance, contract renewals |
| Supplier | Active contracts, open RFQs, document requirements |
| Auditor | Audit activity stream, compliance metrics, policy violations |

## 3. Creating Your First Purchase Request

### Step 1: Start a New Request

Click **+ New Request** in the navigation sidebar or the dashboard quick action button.

### Step 2: Choose a Category or Template

You can start a request in three ways:

1. **Select a template** -- Choose from pre-configured templates (e.g., "Software / SaaS Purchase", "IT Hardware Request", "Professional Services")
2. **Browse categories** -- Navigate the UNSPSC category tree to find the right category
3. **Describe your need** -- Type a natural language description and let the AI Intake Classifier suggest the best category and template

> **AI Feature:** Type something like "I need 5 Adobe Premiere Pro licenses for the marketing team" and the AI will auto-populate the category, suggest a vendor, and fill in template fields.

### Step 3: Fill in Request Details

Complete the request form:

| Field | Description | Required |
|---|---|---|
| **Title** | Brief description of what you need | Yes |
| **Description** | Detailed justification and context | Yes |
| **Line items** | Individual items with quantity, unit price, and delivery date | Yes |
| **Vendor** | Preferred supplier (can search by name) | No |
| **Cost center** | Budget allocation code | Yes |
| **Department** | Your department | Auto-filled |
| **Urgency** | Standard, Urgent, or Critical | Yes |
| **Attachments** | Vendor quotes, specifications, or supporting documents | No |
| **Custom fields** | Category-specific fields (e.g., data classification for software) | Varies |

### Step 4: AI Analysis (Optional)

Before submitting, click **Analyze with AI** to get:

- **Category suggestion** -- AI confirms or suggests a better category
- **Vendor recommendation** -- AI checks for existing contracts and preferred suppliers
- **Duplicate detection** -- AI identifies similar recent or pending requests
- **Policy compliance** -- AI verifies the request complies with procurement policies
- **Cost savings suggestions** -- AI identifies potential savings opportunities

### Step 5: Save or Submit

- **Save as Draft** -- Save your work and return later. Drafts are visible only to you.
- **Submit for Approval** -- Send the request into the approval workflow. You will see the workflow steps and estimated completion time.

### Step 6: Track Progress

After submission, track your request:

1. View the **pizza tracker** -- A visual progress indicator showing each approval step
2. Monitor **SLA timers** -- See how long each approver has to respond
3. Receive **notifications** -- Get alerts when your request moves to the next step
4. Add **comments** -- Communicate with approvers directly on the request

## 4. Approval Workflow

### How Approvals Work

When you submit a request, ProcGenie's workflow engine automatically determines the approval path based on:

- **Request amount** -- Higher values require additional approval levels
- **Category** -- Some categories require specialized reviewers (e.g., IT Security for software)
- **Department** -- Department-specific approval chains
- **Vendor segment** -- New or restricted vendors may require additional scrutiny

### Approval Workflow Example

```
Your Request ($1,799.40 - Software)
    │
    ▼
Step 1: Manager Approval (John Manager)
    │   SLA: 72 hours
    │   Status: Approved (after 70 minutes)
    ▼
Step 2: Finance Review (Sarah Finance)
    │   SLA: 72 hours
    │   Status: Pending (47 hours remaining)
    ▼
Step 3: PO Generation (Automatic)
    │   Triggered when all approvals complete
    ▼
Purchase Order Created → Supplier Notified
```

### SLA Indicators

| Status | Indicator | Meaning |
|---|---|---|
| On track | Green | Well within SLA deadline |
| At risk | Yellow | Within 20% of SLA deadline |
| Breached | Red | Past SLA deadline; auto-escalation triggered |

### If Your Request is Returned

An approver may return your request for revision:

1. You will receive a notification with the reason
2. Open the request and review the approver's comments
3. Make the requested changes
4. Resubmit the request -- it re-enters the workflow at the step it was returned from

## 5. AI Assistant

### Accessing the AI Assistant

Click the **AI Assistant** icon (bottom-right chat bubble) from any page to open the conversational AI interface.

### What the AI Assistant Can Do

| Capability | Example Prompts |
|---|---|
| **Answer questions** | "What is our policy for software purchases over $10,000?" |
| **Create requests** | "Create a request for 10 Dell laptops for the engineering team" |
| **Check status** | "What is the status of my laptop request?" |
| **Find suppliers** | "Who are our approved IT consulting vendors?" |
| **Explain policies** | "Why was my request routed to the VP for approval?" |
| **Analyze spending** | "How much have we spent on software this quarter?" |
| **Contract questions** | "When does our Adobe contract expire?" |

### AI Assistant Guidelines

- The AI assistant can only access data you have permission to view
- For sensitive actions (creating POs, modifying contracts), the AI will ask for your confirmation
- Responses include source references so you can verify the information
- If the AI cannot help, it will connect you to the procurement team

### Example Conversation

```
You: I need to buy 5 monitors for the new hires starting in March.

AI: I can help with that. Based on your organization's catalog, here are the
    approved monitor options:

    1. Dell U2723QE 27" 4K - $549.99/unit (Preferred vendor, in stock)
    2. LG 27UK850-W 27" 4K - $496.99/unit (Approved vendor, 2-week lead time)

    Would you like me to create a purchase request for either of these?

You: Let's go with the Dell monitors.

AI: I've created a draft request:
    - Title: "Dell U2723QE Monitors for New Hires"
    - Quantity: 5 x Dell U2723QE @ $549.99 = $2,749.95
    - Delivery: February 28, 2026 (to arrive before March start dates)
    - Cost Center: Your default (ENG-1100)

    This will require Manager approval (estimated 1-2 business days).
    Shall I submit this request for approval?

You: Yes, please submit it.

AI: Done! Your request REQ-2026-001567 has been submitted. Your manager
    (John Manager) has been notified. I'll alert you when it's approved.
```
