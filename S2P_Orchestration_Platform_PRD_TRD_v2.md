# NEXT-GENERATION SOURCE-TO-PAY ORCHESTRATION PLATFORM

### Comprehensive Product & Technical Requirements Document

---

**AI Strategy Team | February 2026 | Version 2.0**

**CONFIDENTIAL**

*Prepared for engineering implementation via Claude Code*

*Contains: 10 Modules | 120+ Features | 80+ User Stories | 12 Personas | Full Technical Architecture*

---

## Document Control

| Version | Date | Author       | Changes                                                                                                                                                                                                                                          |
|-------------|----------|------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| 1.0         | Jan 2026 | AI Strategy Team | Initial PRD/TRD from research synthesis                                                                                                                                                                                                              |
| 2.0         | Feb 2026 | AI Strategy Team | Comprehensive expansion: agentic AI architecture, 12 personas, 10 modules, 120+ features, competitive refresh (Zip $355B spend, Gartner 2025 Hype Cycle updates), MCP integration patterns, sustainability module, autonomous negotiation framework |
**Table of Contents**

## 1. Executive Summary & Strategic Vision

### 1.1 The Orchestration Imperative

Enterprise procurement is undergoing its most significant architectural transformation in two decades. The era of monolithic ERP-centric procurement—characterized by rigid workflows, poor user adoption, and operational opacity—is giving way to an intelligent orchestration paradigm. Gartner formally added Procurement Orchestration Platforms to the 2025 Hype Cycle with a “Transformational Benefit” rating, and the IDC MarketScape for Spend Orchestration identified the category’s first Leaders. According to the latest Gartner research, 93% of procurement organizations cite efficiency as their top digital goal, yet 85% still rely on disconnected systems.

This document defines the complete Product Requirements (PRD) and Technical Requirements (TRD) for a next-generation S2P Orchestration Platform designed to be built with Claude Code. The platform is not a replacement for underlying ERPs; it is an intelligent Experience Layer that sits above fragmented technology stacks, unifying people, processes, and systems through Agentic AI.

### 1.2 Market Context & Urgency

The convergence of several forces creates an unprecedented market window:

- **AI agent-driven procurement:** Gartner forecasts that 90% of all B2B purchases will be handled by AI agents by 2028, channeling over $15 trillion in spending through automated exchanges. McKinsey’s February 2026 research confirms procurement is shifting from “Show me the data” to “Do it for me.”

- **Market validation:** ZipHQ processed $355 billion in spend across 7 million suppliers in 2025, delivering $6 billion in customer savings with 50+ purpose-built agents. The procurement orchestration market reached $535M in 2025, growing at 8.9% CAGR through 2033.

- **Adoption gap:** While 94% of procurement executives use GenAI weekly, only 36% have meaningful implementations—representing the key competitive battleground for differentiated AI capabilities.

- **Implementation speed:** Modern orchestration platforms achieve 8-week implementations versus 6+ months for legacy suites, creating compelling time-to-value advantages.

### 1.3 Strategic Pillars

The platform is built on four foundational pillars:

1.  Unified Intake (“The Single Front Door”): Abstract backend complexity behind a consumer-grade, intent-driven interface that captures 100% of spend across all channels.

2.  Agentic Execution: Deploy a 15-agent architecture where specialized AI agents autonomously perform tasks—negotiating tail spend, analyzing contracts, validating compliance—within defined guardrails and human-in-the-loop oversight.

3.  Resilient Orchestration: Implement a Saga Pattern-based workflow engine managing long-running distributed transactions across heterogeneous ERP ecosystems without data loss.

4.  Composable Intelligence: Provide an extensible platform architecture with MCP (Model Context Protocol) integration, enabling customers to connect their own AI models and data sources.

### 1.4 Differentiation Strategy

While competitors emphasize specific capabilities—ZipHQ on intake UX, Tonkean on no-code orchestration, Oro Labs on regulated industries, Globality on autonomous sourcing—our platform differentiates through three dimensions:

- **Deep Agentic Capability:** A multi-agent system with 15 specialized agents collaborating via an Agent Orchestrator, operating across the full S2P lifecycle rather than isolated point capabilities.

- **Architectural Resilience:** Event-sourced architecture providing immutable audit trails, time-travel debugging, and saga-pattern compensation for enterprise compliance.

- **Sustainability-Native Design:** Embedded ESG scoring, carbon tracking, and Scope 3 emissions analysis as first-class capabilities, not bolted-on features.

## 2. Competitive Landscape Analysis

### 2.1 Market Tier Overview

The procurement orchestration market divides into four distinct tiers, each presenting different competitive dynamics.

| Tier                | Key Players                            | Funding / Scale          | Primary Strength                          | Key Weakness                  |
|-------------------------|--------------------------------------------|------------------------------|-----------------------------------------------|-----------------------------------|
| Pure-Play Orchestration | ZipHQ, Tonkean, Oro Labs, Omnea, Levelpath | Zip: $371M / $355B spend   | Intake UX, rapid deployment                   | Limited native CLM/sourcing depth |
| AI-First Sourcing       | Globality, Fairmarkit, Keelvar, Arkestro   | Globality: $356M            | Autonomous negotiation, sourcing optimization | Narrow S2P coverage               |
| Legacy S2P Suites       | Coupa, SAP Ariba, Ivalua, Jaggaer          | Coupa: $8T+ community spend | End-to-end coverage, ERP integration          | Rigid UX, slow implementation     |
| Emerging Disruptors     | Opstream, SCH, Flowie, Focal Point         | Early-stage                  | Niche specialization, modern architecture     | Limited enterprise validation     |
### 2.2 Detailed Competitive Profiles

**ZipHQ — Category Leader**

- $2.2B valuation, $371M funding, $355B spend processed across 7M suppliers in 2025

- 50+ purpose-built AI agents covering intake, routing, negotiation, compliance, and risk

- Key customers: Snowflake, AMD, Mars, OpenAI, T-Mobile, Canva, Wiz

- 8-week average implementation; Gartner Hype Cycle and IDC MarketScape Leader

- Launched Zip for Risk Orchestration (April 2025), invoice-to-contract compliance agent, universal AI agent

- **Gap opportunity:** Limited native CLM, no sustainability-native module, complex initial setup

**Tonkean — No-Code Orchestration**

- $84M funding, “no rip and replace” approach wrapping existing systems

- AI Front Door for plain-language intake via Slack, Teams, or email

- New contracts solution announced for obligation lifecycle management (2025)

- **Gap opportunity:** Smaller scale ($16.2M revenue), limited autonomous sourcing depth

**Oro Labs — Regulated Industries**

- $60M funding, world’s first ISO 42001 certification for AI systems management

- Deep SAP Ariba expertise, flexible LLM approach (customer BYOM support)

- Key customers: Roche, BASF, Novartis; strong pharma/life sciences focus

- **Gap opportunity:** Narrower industry focus, less consumer-grade UX for general enterprise

**Globality — Autonomous Sourcing**

- $356M funding, “Glo” AI agent conducting autonomous multi-round negotiations

- 23 minutes to market, 64% of projects completed in under a day

- Guarantees 15x first-year ROI or money back

- **Gap opportunity:** Sourcing-only focus, no intake/orchestration capabilities

### 2.3 Feature Gap Matrix

| Capability              | Our Platform | ZipHQ     | Tonkean | Oro Labs | Globality  |
|-----------------------------|------------------|---------------|-------------|--------------|----------------|
| Intelligent Intake (NLP)    | ✓ Full           | ✓ Full        | ✓ Partial   | ✓ Full       | ✗              |
| Omni-Channel Intake         | ✓ Full           | ✓ Partial     | ✓ Full      | ✓ Partial    | ✗              |
| Multi-Agent Architecture    | ✓ 15 agents      | ✓ 50+ agents  | ✓ Partial   | ✓ Partial    | ✓ Single agent |
| Autonomous Negotiation      | ✓ Full           | ✓ Price agent | ✗           | ✗            | ✓ Full         |
| Saga Pattern Orchestration  | ✓ Full           | ○ Partial     | ○ Partial   | ○ Partial    | ✗              |
| Event Sourcing / Audit      | ✓ Full           | ○ Partial     | ○ Partial   | ✓ Full       | ✗              |
| Sustainability / ESG Native | ✓ Full           | ✗             | ✗           | ○ Partial    | ✗              |
| CLM Integration             | ✓ Deep           | ○ Moderate    | ✓ Deep      | ○ Moderate   | ✗              |
| ERP Bi-Directional Sync     | ✓ Full           | ✓ Full        | ✓ Full      | ✓ Full       | ○ Partial      |
| MCP/BYOM Support            | ✓ Full           | ✗             | ✗           | ✓ Full       | ✗              |
## 3. Comprehensive User Personas

Twelve distinct personas represent the complete stakeholder ecosystem. Each persona drives specific functional requirements and user stories throughout this document.

| \# | Persona           | Role                    | Primary Need                                           | Success Metric         |
|--------|-----------------------|-----------------------------|------------------------------------------------------------|----------------------------|
| 1      | Restless Riley        | Business Requester          | Intent-based intake (type “I need a video editing tool”)   | \<5 min requisition        |
| 2      | Prudent Pat           | Category Manager            | Autonomous tail spend agent                                | 70% strategic time         |
| 3      | Compliance Casey      | Risk & Legal Officer        | Contextual review (contract + vendor risk + justification) | Zero unvetted suppliers    |
| 4      | Ledger Larry          | Accounts Payable Manager    | Perfect ERP sync (no re-keying)                            | 98% first-time match       |
| 5      | Operator Olivia       | Procurement Operations Lead | Queue management with AI-powered assignment                | 3.8hr PO cycle time        |
| 6      | Strategic Sam         | Chief Procurement Officer   | Executive dashboard with savings waterfall                 | Board-ready dashboards     |
| 7      | Supplier Samir        | Supplier Representative     | Self-service portal (PO view                               | 24hr onboarding            |
| 8      | Builder Blake         | Workflow Administrator      | No-code visual workflow builder                            | Zero IT tickets for config |
| 9      | Auditor Ava           | Internal Audit / Compliance | Immutable event-sourced audit log                          | 100% audit coverage        |
| 10     | Sustainability Sophie | ESG & Sustainability Lead   | Embedded ESG scoring in supplier evaluation                | Scope 3 tracking           |
| 11     | Data-Driven Dana      | Procurement Analytics Lead  | Natural language reporting                                 | Real-time analytics        |
| 12     | Integration Ivan      | Enterprise Architect        | OpenAPI 3.1 specs                                          | API-first integration      |
### 3.1 “Restless Riley” — The Business Requester

**Title:** Marketing Manager / Engineering Lead

**Psychographics:** Value-driven, impatient, tech-savvy. Views procurement as a bureaucratic hurdle slowing innovation.

**Operational Context:** Needs to buy a $15K SaaS tool for next week’s campaign. Doesn’t know GL codes from cost centers. Doesn’t know if the vendor requires a DPA.

**Current Friction:** Sends email to legal, waits 3 days. Logs into ERP, selects wrong commodity code. Request rejected 5 days later.

**System Requirements:** Intent-based intake (type “I need a video editing tool”), Pizza Tracker status view, mobile-first approvals via Slack, sub-5-minute requisition completion.

### 3.2 “Prudent Pat” — The Category Manager

**Title:** Senior Strategic Sourcing Manager

**Psychographics:** Analytical, risk-averse, relationship-focused. Buried in tactical noise when wanting to drive strategy.

**Operational Context:** Manages $50M in IT spend. Spends 60% of day chasing approvals and fixing PO errors. Lacks visibility into tail spend.

**Current Friction:** Manually copying data from emails to spreadsheets. Difficulty enforcing preferred suppliers across fragmented channels.

**System Requirements:** Autonomous tail spend agent, unified spend analytics, no-code threshold configuration, supplier scorecards with AI-powered insights.

### 3.3 “Compliance Casey” — The Risk & Legal Officer

**Title:** Corporate Counsel / GRC Lead

**Psychographics:** Detail-oriented, protective, thorough. Fears shadow IT and unvetted suppliers entering the supply chain.

**Operational Context:** Reviews 20 contracts/week. Often brought in at the last minute when business is desperate to sign.

**Current Friction:** Reviewing contracts without context (total value, data sensitivity). Chasing suppliers for missing SOC2 reports.

**System Requirements:** Contextual review (contract + vendor risk + justification), parallel Legal/Security workflows, AI pre-screening of non-standard clauses.

### 3.4 “Ledger Larry” — The Accounts Payable Manager

**Title:** AP Manager / Finance Controller

**Psychographics:** Accuracy-obsessed, efficiency-driven. Hates variance and reconciliation discrepancies.

**Operational Context:** Ensures suppliers are paid and books close on time. Deals with zombie POs and vendor payment inquiries.

**Current Friction:** Mismatches between invoice and PO amounts. Manual three-way matching. Vendors calling about payment status.

**System Requirements:** Perfect ERP sync (no re-keying), automated three-way match, supplier self-service portal, exception dashboards.

### 3.5 “Operator Olivia” — The Procurement Operations Lead

**Title:** Procurement Operations Manager

**Psychographics:** Process-oriented, metrics-driven, thrives on throughput optimization.

**Operational Context:** Processes 10,000+ POs annually. Manages team of 15 procurement specialists. Responsible for compliance rates.

**Current Friction:** Bottlenecked approvals, manual exception handling, lack of workload visibility across team.

**System Requirements:** Queue management with AI-powered assignment, SLA monitoring dashboards, workload balancing, batch processing capabilities.

### 3.6 “Strategic Sam” — The Chief Procurement Officer

**Title:** CPO / VP Procurement

**Psychographics:** Strategic thinker, board-facing, ROI-obsessed. Needs to demonstrate procurement as value creator, not cost center.

**Operational Context:** Reports to CFO. Responsible for $500M+ in addressable spend. Juggling cost savings targets with risk/ESG mandates.

**Current Friction:** No single view of procurement performance. Manual consolidation of reports. Can’t demonstrate AI ROI to board.

**System Requirements:** Executive dashboard with savings waterfall, AI agent performance metrics, benchmarking against industry, ESG compliance scorecards.

### 3.7 “Supplier Samir” — The Supplier Representative

**Title:** Key Account Manager / Sales Rep

**Psychographics:** Relationship-driven, wants predictability. Frustrated by opaque buyer processes.

**Operational Context:** Manages 50+ enterprise accounts. Responds to RFQs across multiple platforms. Chases payment status.

**Current Friction:** Different portal for each customer. No visibility into PO status. Late payments with no explanation.

**System Requirements:** Self-service portal (PO view, invoice submission, payment tracking), RFx participation, performance scorecard access.

### 3.8 “Builder Blake” — The Workflow Administrator

**Title:** Procurement Systems Admin / IT Business Partner

**Psychographics:** Technical, solution-oriented. Bridge between business and IT. Values configurability over customization.

**Operational Context:** Maintains procurement system configurations. Handles 50+ workflow change requests per quarter.

**Current Friction:** Every workflow change requires IT ticket. No visual builder. Testing workflows requires production data.

**System Requirements:** No-code visual workflow builder, drag-and-drop parallel/conditional routing, sandbox testing, version control.

### 3.9 “Auditor Ava” — The Internal Audit / Compliance

**Title:** Senior Internal Auditor

**Psychographics:** Evidence-driven, skeptical, methodical. Needs comprehensive audit trails for SOX/SOC2 compliance.

**Operational Context:** Conducts quarterly procurement audits. Reviews segregation of duties. Tests AI decision rationale.

**Current Friction:** Audit trails scattered across systems. Cannot verify AI agent decisions. SoD conflicts hard to detect.

**System Requirements:** Immutable event-sourced audit log, AI decision explainability reports, SoD conflict detection, time-travel query capability.

### 3.10 “Sustainability Sophie” — The ESG & Sustainability Lead

**Title:** Chief Sustainability Officer / ESG Manager

**Psychographics:** Mission-driven, data-hungry. Needs to embed sustainability into every procurement decision.

**Operational Context:** Responsible for Scope 3 emissions reporting. Tracks 2,500+ global ESG regulations. Reports to board ESG committee.

**Current Friction:** No sustainability data in procurement workflows. Manual supplier ESG surveys. Cannot calculate procurement carbon footprint.

**System Requirements:** Embedded ESG scoring in supplier evaluation, carbon footprint tracking per PO, sustainability dashboard, regulatory compliance alerts.

### 3.11 “Data-Driven Dana” — The Procurement Analytics Lead

**Title:** Senior Procurement Analyst

**Psychographics:** Quantitative, insights-focused. Wants to move from descriptive to predictive analytics.

**Operational Context:** Produces monthly spend reports, savings tracking, and compliance metrics for leadership.

**Current Friction:** Data scattered across 5+ systems. Manual Excel consolidation. Reports are always backward-looking.

**System Requirements:** Natural language reporting, cross-system analytics, predictive spend forecasting, automated report subscriptions.

### 3.12 “Integration Ivan” — The Enterprise Architect

**Title:** Solutions Architect / Integration Lead

**Psychographics:** Architecture-focused, standards-driven. Evaluates platforms on API quality and extensibility.

**Operational Context:** Manages enterprise integration landscape. Responsible for data governance across 50+ systems.

**Current Friction:** Point-to-point integrations creating spaghetti architecture. No standard data model across procurement tools.

**System Requirements:** OpenAPI 3.1 specs, webhook support, MCP server integration, canonical data model (OCDS), CDC support, rate-limiting governance.

## 4. Functional Requirements (PRD)

The platform comprises ten core modules, each containing detailed functional requirements mapped to user personas, acceptance criteria, and priority classifications.

### 4.1 Module 1: Intelligent Intake Management

**Objective:** Capture 100% of spend intent through a dynamic, AI-powered “Single Front Door” that abstracts backend complexity.

**Primary Personas:** Restless Riley, Builder Blake, Operator Olivia

| ID  | Requirement                   | Description                                                                                                                                                                                                           | Priority |
|---------|-----------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------------|
| FR-1.1  | Intent-Based Intake               | NLP chatbot interface where users describe needs in natural language (e.g., “I need a video editing tool”). System determines request type, buying channel, workflow, and required approvals automatically.               | P0           |
| FR-1.2  | Dynamic Persona Adaptation        | Intake experience adapts based on user’s role, department, past activity, and authority limits. Frequent IT hardware buyers see Hardware Catalog prioritized. Authority limits auto-checked against profile.              | P0           |
| FR-1.3  | Omni-Channel Ingestion            | Support request submission via: Web Portal, Slack/Teams app, Email forwarding (parsing unstructured email into structured fields), Mobile app, and API for programmatic submission.                                       | P0           |
| FR-1.4  | Smart Document Ingestion          | OCR + LLM extraction from uploaded vendor quotes, contracts, or invoices. Auto-fills form fields (Vendor Name, Amount, Currency, Line Items). Low-confidence fields highlighted for user review. Target: \<5 sec latency. | P0           |
| FR-1.5  | No-Request Buying                 | For catalog items (e.g., mouse, keyboard), enable “few clicks” checkout bypassing complex forms. Pre-approved catalog with auto-created PO, direct supplier submission.                                                   | P1           |
| FR-1.6  | Intelligent Field Completion      | AI auto-fills accounting codes, GL codes, cost centers, commodity codes based on request context and user history. UNSPSC taxonomy (3,600+ codes) abstracted from user.                                                   | P0           |
| FR-1.7  | Duplicate Detection               | AI identifies potential duplicate requests, existing contracts, or active POs for the same supplier/category. Warns user before submission with link to existing item.                                                    | P1           |
| FR-1.8  | Policy Compliance Gate            | Real-time validation against procurement policies before submission: preferred supplier enforcement, budget availability, contract utilization, approval thresholds.                                                      | P0           |
| FR-1.9  | Request Templates                 | Library of pre-configured templates for common request types (SaaS renewal, marketing agency, hardware, professional services) with category-specific required fields.                                                    | P1           |
| FR-1.10 | Draft Persistence & Collaboration | Auto-save drafts. Allow sharing draft requests with colleagues for input before formal submission. Track draft completion percentage.                                                                                     | P2           |
### 4.2 Module 2: Orchestration & Workflow Engine

**Objective:** Coordinate complex, multi-stakeholder processes with dynamic routing, full transparency, and resilient distributed transaction management.

**Primary Personas:** Builder Blake, Operator Olivia, Compliance Casey

| ID  | Requirement                   | Description                                                                                                                                                                                                    | Priority |
|---------|-----------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------------|
| FR-2.1  | Parallel & Dynamic Routing        | Support non-linear workflows: route to Legal, Security, and Finance simultaneously. Main workflow waits in “In Review – Parallel” until all branches are satisfied. If any branch rejects, workflow terminates.    | P0           |
| FR-2.2  | Context-Based Logic               | Routing rules configurable on metadata: Category, Spend Threshold, Location, Risk Score, Supplier Type, Contract Value. Example: “If Category=Software AND Spend\>$50k AND Vendor Risk=High, THEN route to CISO.” | P0           |
| FR-2.3  | SLA Management & Escalation       | Configurable SLA per workflow step. Automated nudges at warning threshold (e.g., 48h). Auto-escalation to manager at breach threshold (e.g., 72h). Approver lookup via Org Chart integration.                      | P0           |
| FR-2.4  | Visual Status Tracker             | “Pizza Tracker” visualization showing request stage, current assignee, estimated completion time, and SLA status for each step. Real-time updates via WebSocket.                                                   | P0           |
| FR-2.5  | Integrated Collaboration          | Threaded comments and @mentions within request context. Bidirectional sync with Slack/Teams channels. File attachments on comments. Audit trail of all interactions.                                               | P1           |
| FR-2.6  | No-Code Workflow Builder          | Visual drag-and-drop builder with: sequential nodes, parallel branches, conditional gates, timer nodes, human-in-the-loop checkpoints, and agent task nodes. Version control with rollback.                        | P0           |
| FR-2.7  | Delegation & Out-of-Office        | Configurable delegation rules with time limits, scope restrictions, and audit trail showing delegated actions. Automatic detection of out-of-office status from calendar integration.                              | P1           |
| FR-2.8  | Cross-System Orchestration        | System-agnostic execution: route tasks to external systems (ERP, CLM, GRC) and track completion. Saga pattern compensation on failure.                                                                             | P0           |
| FR-2.9  | Approval from Orchestration Layer | Enable approve/reject actions directly within the orchestration dashboard without navigating to source systems.                                                                                                    | P1           |
| FR-2.10 | Workflow Analytics                | Dashboard showing: average cycle time by step, bottleneck identification, SLA compliance rates, approval patterns, and workflow optimization recommendations.                                                      | P1           |
### 4.3 Module 3: Buying & Execution

**Objective:** Facilitate seamless transactional execution across catalog, contract-based, and spot-buy channels.

**Primary Personas:** Restless Riley, Prudent Pat, Ledger Larry

| ID | Requirement            | Description                                                                                                                                                                    | Priority |
|--------|----------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------------|
| FR-3.1 | Catalog Integration        | Internal marketplace of approved goods/services. Compare prices across approved suppliers. Recommend best option based on delivery performance, TCO, and contract terms.           | P0           |
| FR-3.2 | Automated SOW Generation   | For contract-based services, intelligently identify master contract and auto-generate Statement of Work using templates and prior SOWs. Inject T&M rates from contract into draft. | P1           |
| FR-3.3 | Quick Quote (Tail Spend)   | For non-catalog items: recommend 3 approved suppliers, send automated RFQ emails, present response comparison by Price/TCO/Need-By-Date, and create req/order on confirmation.     | P0           |
| FR-3.4 | Budget Validation          | Real-time budget check against ERP. Display remaining budget, committed spend, and projected impact. Block submission if budget exceeded or route for exception approval.          | P0           |
| FR-3.5 | Three-Way Matching         | Automated PO-GoodsReceipt-Invoice matching with configurable tolerance (1-5%). Auto-approve within tolerance. Route exceptions for manual review with variance details.            | P0           |
| FR-3.6 | Goods Receipt Confirmation | Mobile-friendly goods receipt with barcode/QR scanning, quantity verification, quality notes, and photo evidence upload.                                                           | P1           |
| FR-3.7 | Order Tracking             | End-to-end visibility: requisition \> PO \> acknowledgment \> shipment \> receipt \> invoice \> payment. Integration with carrier tracking APIs.                                   | P1           |
| FR-3.8 | Punchout Catalog Support   | cXML/OCI punchout integration with major supplier catalogs (Amazon Business, CDW, Staples, Dell). Round-trip cart transfer with line-item mapping.                                 | P1           |
### 4.4 Module 4: Agentic AI & Autonomous Operations

**Objective:** Deploy 15 specialized AI agents operating across the S2P lifecycle with progressive autonomy, human-in-the-loop oversight, and measurable ROI.

**Primary Personas:** All personas (each agent maps to specific persona needs)

#### 4.4.1 Agent Architecture Overview

The platform implements a multi-agent system coordinated by an Agent Orchestrator. Each agent follows the ReAct (Reasoning + Acting) pattern: receive goal, plan steps, execute tool calls, observe results, and iterate until the goal is achieved. All agents operate within configurable guardrails with mandatory human-in-the-loop checkpoints for high-value or high-risk actions.

| Agent \# | Agent Name               | Domain     | Autonomy Level  | HITL Threshold    |
|--------------|------------------------------|----------------|---------------------|-----------------------|
| A1           | Intake Classifier Agent      | Intake         | Full Autonomy       | Confidence \< 80%     |
| A2           | Document Extraction Agent    | Intake         | Full Autonomy       | Confidence \< 85%     |
| A3           | Routing & Assignment Agent   | Workflow       | Full Autonomy       | Non-standard routes   |
| A4           | Tail Spend Negotiation Agent | Sourcing       | Supervised Autonomy | All awards \> $5K    |
| A5           | Strategic Sourcing Agent     | Sourcing       | Human-Assisted      | All RFP drafts        |
| A6           | Supplier Discovery Agent     | Suppliers      | Supervised Autonomy | New supplier adds     |
| A7           | Risk Monitoring Agent        | Risk           | Full Autonomy       | Critical risk alerts  |
| A8           | Contract Analysis Agent      | Contracts      | Supervised Autonomy | Non-standard clauses  |
| A9           | Contract Negotiation Agent   | Contracts      | Human-Assisted      | All counter-proposals |
| A10          | Invoice Matching Agent       | Finance        | Full Autonomy       | Variance \> tolerance |
| A11          | Spend Analytics Agent        | Analytics      | Full Autonomy       | Anomaly detection     |
| A12          | Compliance Checker Agent     | Compliance     | Full Autonomy       | Policy violations     |
| A13          | ESG Scoring Agent            | Sustainability | Supervised Autonomy | Score \< threshold    |
| A14          | Helpdesk / FAQ Agent         | Support        | Full Autonomy       | Unresolved queries    |
| A15          | Agent Orchestrator           | Meta           | Full Autonomy       | Multi-agent conflicts |
#### 4.4.2 Agent Functional Requirements

| ID  | Requirement                   | Description                                                                                                                                                                                                           | Priority |
|---------|-----------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------------|
| FR-4.1  | Autonomous Tail Spend Negotiation | Agent generates negotiation emails to suppliers for renewals \< $5K, ingests replies, compares against walk-away price, and either auto-approves or escalates to human. Operating within pre-defined pricing guardrails. | P0           |
| FR-4.2  | Strategic Sourcing RFP Generation | Agent drafts complete RFP using company templates, recommends supplier invite list based on incumbents/performance/market data, suggests timelines with milestones, and designs weighted evaluation criteria.             | P0           |
| FR-4.3  | Continuous Risk Monitoring        | Agent subscribes to external risk APIs (RapidRatings, D&B, sanctions lists). Daily checks against active vendors. On match: triggers Critical Risk Workflow, locks vendor, sends high-priority alert.                     | P0           |
| FR-4.4  | Contract Clause Analysis          | Agent extracts key terms (parties, dates, payment terms, termination, liability caps). Identifies dealbreaker clauses with auto-redlining suggestions. Highlights non-standard language for human review.                 | P0           |
| FR-4.5  | Spend Pattern Analysis            | Agent analyzes historical spend to identify savings opportunities: maverick spend, contract leakage, supplier consolidation candidates, price variance trends.                                                            | P1           |
| FR-4.6  | Supplier Performance Scoring      | Agent aggregates delivery performance, quality metrics, responsiveness, and compliance data into weighted performance scores. Triggers review workflows for underperformers.                                              | P1           |
| FR-4.7  | Natural Language Reporting        | Users query data in natural language. Agent translates to structured queries, executes against analytics store, and returns visualized results with narrative explanations.                                               | P1           |
| FR-4.8  | Agent Confidence & Explainability | All agent actions include confidence scores. Actions below configurable threshold pause for human confirmation. Decision reasoning logged to immutable audit trail.                                                       | P0           |
| FR-4.9  | Agent Performance Dashboard       | Track agent metrics: tasks completed, accuracy rate, time saved, cost savings generated, human escalation rate, and error rate. Compare against human baseline.                                                           | P1           |
| FR-4.10 | Progressive Autonomy Framework    | Agents start with supervised autonomy and graduate to higher autonomy based on accuracy metrics and admin approval. Three levels: Human-Assisted, Supervised, Full Autonomy.                                              | P0           |
### 4.5 Module 5: Supplier Management & Portal

**Objective:** Centralize supplier lifecycle management with self-service capabilities, automated compliance, and continuous performance monitoring.

| ID | Requirement                | Description                                                                                                                                                               | Priority |
|--------|--------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------------|
| FR-5.1 | Self-Service Onboarding Portal | Suppliers upload required documentation (tax forms, insurance certs, SOC2, banking info). Guided wizard with progress tracking. Target: 24-48 hour onboarding completion.     | P0           |
| FR-5.2 | Automated Verification         | Real-time validation of Tax IDs, IBAN/bank account formats, sanctions lists (OFAC, EU, UN). Integration with verification APIs for business registration and D&B data.        | P0           |
| FR-5.3 | Supplier Golden Record         | Single source of truth for each supplier aggregating data across contracts, POs, invoices, risk assessments, and performance metrics. Deduplication and merge capabilities.   | P0           |
| FR-5.4 | Performance Scorecards         | Weighted scoring across delivery, quality, responsiveness, compliance, and innovation. Configurable by category. Historical trending with peer benchmarking.                  | P1           |
| FR-5.5 | Risk Profile Dashboard         | Multi-dimensional risk view: financial health, geopolitical exposure, ESG compliance, cyber risk, concentration risk. Predictive indicators for early warning.                | P1           |
| FR-5.6 | Supplier Segmentation          | Automated classification into strategic, preferred, approved, and restricted tiers based on spend volume, criticality, and performance. Different workflow rules per segment. | P1           |
| FR-5.7 | Diversity & Inclusion Tracking | Track and report on supplier diversity metrics (minority-owned, women-owned, veteran-owned, small business). Support diversity spend targets and certification verification.  | P2           |
| FR-5.8 | Supplier Communication Hub     | Centralized messaging between buyer and supplier with history, attachments, and integration with email. Eliminates scattered communication across personal inboxes.           | P2           |
### 4.6 Module 6: Contract Lifecycle Management

**Objective:** Provide AI-augmented contract creation, analysis, negotiation support, and obligation management.

| ID | Requirement                | Description                                                                                                                                                                                 | Priority |
|--------|--------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------------|
| FR-6.1 | Contract Creation from Intake  | Seamless flow from intake request to contract draft using company templates and AI-populated fields from request context.                                                                       | P0           |
| FR-6.2 | AI Clause Library              | Searchable library of pre-approved clauses organized by type (indemnification, limitation of liability, IP, termination). AI suggests relevant clauses based on contract type and risk profile. | P1           |
| FR-6.3 | Third-Party Paper Digitization | OCR and LLM extraction to digitize third-party paper contracts into structured data. Extract key metadata, obligations, and clause-level classification.                                        | P0           |
| FR-6.4 | Mass Amendments                | Bulk amendment capability for contract portfolio changes (e.g., rate increases, term extensions). Apply changes across selected contracts with approval workflow.                               | P1           |
| FR-6.5 | Obligation Tracking            | Extract and track contractual obligations (payment milestones, delivery dates, renewal notices, compliance requirements). Automated reminders before due dates.                                 | P1           |
| FR-6.6 | Renewal Management             | Automated alerts for upcoming renewals (30/60/90 day). AI-generated renewal recommendations based on utilization, performance, and market alternatives.                                         | P0           |
| FR-6.7 | Cross-Contract Analytics       | Query metadata and clauses across entire repository: liability exposure analysis, payment terms distribution, expiration clustering, non-standard clause prevalence.                            | P1           |
| FR-6.8 | Redline & Version Control      | Track all changes with full version history. Side-by-side comparison between versions. Merge conflict resolution for parallel edits.                                                            | P1           |
### 4.7 Module 7: Search & Analytics

**Objective:** Provide actionable, AI-powered insights through natural language interaction and automated reporting.

| ID | Requirement              | Description                                                                                                                                                     | Priority |
|--------|------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------------|
| FR-7.1 | Prompt-Based Reporting       | Natural language queries: “Show me all software contracts expiring in Q3 with value \> $50K.” Agent translates to structured query, returns table + visualization. | P0           |
| FR-7.2 | Unified Spend Dashboard      | Single view of spend by category, supplier, region, department. Aggregate data from orchestration layer and backend ERP. Drill-down to transaction level.           | P0           |
| FR-7.3 | Cross-Document Analytics     | Index all contract metadata and clauses for portfolio analysis: “What % of contracts have unlimited liability?” Cross-supplier comparisons on key terms.            | P1           |
| FR-7.4 | Custom Dashboard Builder     | Drag-and-drop dashboard creation with configurable widgets: charts, KPI cards, tables, trend lines. Save, share, and subscribe to automated delivery.               | P1           |
| FR-7.5 | Savings Waterfall            | Track and visualize savings attribution: negotiation savings, compliance savings, process efficiency gains, demand management. Compare against targets.             | P0           |
| FR-7.6 | Predictive Analytics         | Forecast spend trends, predict supplier risk changes, identify upcoming contract expirations requiring action, and flag anomalous spending patterns.                | P2           |
| FR-7.7 | Procurement Helpdesk (FAQ)   | AI-powered answers to procurement policy questions, process guidance, and system help. Intent detection to route complex questions to human specialists.            | P1           |
| FR-7.8 | Report Subscription & Export | Schedule automated report generation and distribution via email. Export in PDF, Excel, PowerPoint formats. API access for BI tool integration.                      | P1           |
### 4.8 Module 8: Sustainability & ESG

**Objective:** Embed sustainability into every procurement decision with carbon tracking, ESG scoring, and regulatory compliance. Gartner predicts 70% of procurement leaders will have sustainability-aligned performance objectives by 2026.

| ID | Requirement                | Description                                                                                                                                                                | Priority |
|--------|--------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------------|
| FR-8.1 | Supplier ESG Scoring           | Multi-dimensional ESG assessment integrating third-party data (EcoVadis, CDP, Sustainalytics), supplier self-assessments, and AI-analyzed public data. Weighted scoring model. | P1           |
| FR-8.2 | Carbon Footprint per PO        | Calculate estimated Scope 3 emissions for each purchase order based on supplier emissions data, product category emission factors, and transportation estimates.               | P1           |
| FR-8.3 | Sustainability Dashboard       | Executive view of procurement carbon footprint, ESG score trends, diversity spend, circular economy metrics, and progress against sustainability targets.                      | P1           |
| FR-8.4 | ESG in Sourcing Evaluation     | Embed sustainability criteria as weighted evaluation factors in sourcing events alongside price, quality, and delivery. Configurable weight by category.                       | P1           |
| FR-8.5 | Regulatory Compliance Alerts   | Monitor 2,500+ global ESG regulations. Alert when new regulations impact supplier base or procurement practices. Track compliance status.                                      | P2           |
| FR-8.6 | Sustainable Supplier Discovery | AI agent identifies suppliers with superior ESG profiles as alternatives when existing suppliers score below thresholds.                                                       | P2           |
### 4.9 Module 9: Integration & Connectivity

**Objective:** Provide robust, bidirectional integration with all major enterprise systems through a resilient, standards-based integration framework.

| ID | Requirement           | Description                                                                                                                                                   | Priority |
|--------|---------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------------|
| FR-9.1 | ERP Connectors (Prebuilt) | Native bidirectional connectors for: SAP S/4HANA (OData), SAP Ariba (REST/cXML), Oracle Fusion (REST), NetSuite (REST), Workday (REST), Dynamics 365 (OData).     | P0           |
| FR-9.2 | CLM Integration           | Bidirectional sync with CLM systems: Ironclad, DocuSign CLM, Icertis, Agiloft. Contract data flows into procurement context.                                      | P1           |
| FR-9.3 | ITSM / GRC Integration    | Connect to ServiceNow, OneTrust, Archer for IT service requests, security assessments, and compliance workflows.                                                  | P1           |
| FR-9.4 | Identity Provider SSO     | SAML 2.0 SSO with Microsoft Entra ID, Okta, Ping Identity, OneLogin. SCIM 2.0 for automated user provisioning and deprovisioning.                                 | P0           |
| FR-9.5 | Webhook & Event Streaming | Configurable outbound webhooks for all state changes. Kafka-compatible event streaming for real-time integration with data lakes and analytics platforms.         | P1           |
| FR-9.6 | MCP Server Support        | Model Context Protocol integration allowing customers to connect their own AI models, custom agents, and external data sources to the platform’s agent framework. | P1           |
| FR-9.7 | iPaaS Compatibility       | Pre-built connectors for MuleSoft, Boomi, Workato. REST API with OpenAPI 3.1 spec for custom integration development.                                             | P1           |
| FR-9.8 | Rate Limiting Governor    | Distributed rate limiter (Redis-backed) to respect ERP API concurrency limits. Queue outbound requests. Prevent 429 errors. Configurable per integration.         | P0           |
### 4.10 Module 10: Security, Compliance & Administration

**Objective:** Meet Fortune 500 security requirements with comprehensive access control, audit capabilities, and regulatory compliance.

| ID  | Requirement           | Description                                                                                                                                                        | Priority |
|---------|---------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------------|
| FR-10.1 | Role-Based Access Control | Granular RBAC with segregation of duties enforcement. SoD conflict detection: prevent requisitioner from self-approving, vendor editor from processing payments, etc.  | P0           |
| FR-10.2 | Immutable Audit Trail     | Event-sourced audit log capturing every state change, approval, agent action, and data modification. Time-travel query capability for any point in history.            | P0           |
| FR-10.3 | SOC 2 Type II Compliance  | Architecture and operational controls satisfying Trust Services Criteria: security, availability, processing integrity, confidentiality, and privacy.                  | P0           |
| FR-10.4 | GDPR / CCPA Compliance    | Data subject rights (access, rectification, erasure, portability). 72-hour breach notification capability. Consent management. Data retention policies.                | P0           |
| FR-10.5 | Data Residency            | Multi-region deployment supporting EU, US, APAC data residency requirements. Tenant-level configuration for data location restrictions.                                | P0           |
| FR-10.6 | Encryption                | AES-256 at rest, TLS 1.3 in transit. Application-level encryption for PII (Tax IDs, bank accounts) via KMS. BYOK support for premium tenants.                          | P0           |
| FR-10.7 | AI Governance Dashboard   | Monitor all AI agent actions: decisions made, confidence scores, human overrides, error rates. Bias detection on supplier recommendations. Model performance tracking. | P1           |
| FR-10.8 | Multi-Tenant Isolation    | Tiered isolation: shared DB with RLS (SMB), dedicated schema (Enterprise), dedicated DB with BYOK (Premium/Regulated). Never mix tenant data in AI context windows.    | P0           |
## 5. User Stories & Engineering Specifications

The following user stories translate functional requirements into actionable engineering tasks. Each story includes acceptance criteria suitable for direct implementation in Claude Code.

### 5.1 Intelligent Intake Stories

#### US-1.1: Business Requester – Restless Riley

*As a **Business Requester**, I want to upload a PDF vendor quote and have the system auto-populate the intake form, so that I save time and reduce data entry errors.*

**Acceptance Criteria:**

- User drags & drops PDF. System displays “Processing...” spinner.

- Backend uses AWS Textract / Google Document AI for OCR.

- LLM parses raw text into structured JSON matching the intake form schema.

- Form fields populated. Low-confidence fields (\<85%) highlighted in yellow for review.

- End-to-end latency \< 5 seconds for documents up to 10 pages.

- Supported formats: PDF, DOCX, images (JPG/PNG). Error message for unsupported formats.

#### US-1.2: Business Requester – Restless Riley

*As a **Business Requester**, I want to type a natural language request like “I need a MacBook Pro” and be automatically routed to the right buying channel, so that I don’t need to understand procurement categories or forms.*

**Acceptance Criteria:**

- NLP intent classifier identifies category “IT Hardware” and channel “Catalog.”

- System displays modal: “You can buy laptops directly from our IT Catalog. Taking you there now...”

- User redirected to internal marketplace with pre-filtered results.

- If no catalog match, system initiates Quick Quote workflow with explanation.

- Intent classification accuracy target: \>90% on trained categories.

#### US-1.3: Business Requester – Restless Riley

*As a **Business Requester**, I want to submit a procurement request via Slack by typing a message, so that I don’t have to leave my primary work tool.*

**Acceptance Criteria:**

- Slack app command /procure or @ProcureBot triggers intake flow.

- Bot asks clarifying questions in thread (item, urgency, budget).

- Structured request created in platform with link back to Slack thread.

- Approval notifications sent as Slack DMs with approve/reject buttons.

- Full audit trail maintained linking Slack messages to platform records.

#### US-1.4: Procurement Admin – Builder Blake

*As a **Procurement Admin**, I want to configure intake form fields that dynamically change based on category selection, so that the form only shows relevant fields and reduces user confusion.*

**Acceptance Criteria:**

- Visual form builder with conditional logic: IF Category = Software THEN show “Data Classification” field.

- Field types: text, number, date, dropdown, file upload, user picker, multi-select.

- Required/optional flags configurable per field per category.

- Preview mode to test form behavior before publishing.

- Version history with rollback capability.

### 5.2 Orchestration Engine Stories

#### US-2.1: Workflow Admin – Builder Blake

*As a **Workflow Admin**, I want to configure a workflow where Legal and Security review a request simultaneously, so that total cycle time is reduced from sequential to parallel processing.*

**Acceptance Criteria:**

- Visual builder supports “Parallel Branch” node with drag-and-drop.

- Execution engine spawns child threads for Legal and Security.

- Main workflow status shows “In Review – Parallel” with branch status indicators.

- Join condition: proceeds only when ALL branches return “Approved.”

- If any branch returns “Rejected,” main workflow terminates with consolidated rejection reason.

- SLA timers run independently per branch.

#### US-2.2: Process Owner – Operator Olivia

*As a **Process Owner**, I want to set up automatic nudges and escalations for stuck approvals, so that requests don’t get bottlenecked by unresponsive approvers.*

**Acceptance Criteria:**

- Admin configures SLA Warning = 48h, SLA Breach = 72h per workflow step.

- Timer starts when task enters approver’s queue.

- At 48h: System sends Slack DM: “Reminder: You have a pending approval for \[Request Title\].”

- At 72h: System emails Approver’s Manager (lookup via Org Chart integration) and flags request as “At Risk.”

- Dashboard widget shows all “At Risk” items for Operations Lead.

- Configurable per workflow step (some steps may have shorter SLAs).

#### US-2.3: Business Requester – Restless Riley

*As a **Business Requester**, I want to see a real-time visual tracker showing exactly where my request is, so that I have full transparency and don’t need to chase people for updates.*

**Acceptance Criteria:**

- Pizza Tracker UI with: completed steps (green), current step (blue pulse), pending steps (gray).

- Each step shows: assignee name/avatar, time in step, SLA countdown.

- Real-time updates via WebSocket (no page refresh needed).

- Click on step to see details: comments, attachments, approval history.

- Mobile-responsive design for checking status on phone.

### 5.3 Agentic AI Stories

#### US-3.1: Category Manager – Prudent Pat

*As a **Category Manager**, I want to have an AI agent automatically negotiate renewals under $5K, so that I can focus on high-value strategic deals instead of tail spend.*

**Acceptance Criteria:**

- Trigger: Renewal Request \< $5K AND Vendor in “Tail Spend” segment.

- Agent generates personalized email: “Given our 3-year relationship, can you match last year’s price of $X?”

- Agent monitors inbox for supplier reply (via email integration).

- If supplier agrees: Agent updates quote, routes for final sign-off with savings amount highlighted.

- If supplier declines: Agent checks “walk-away price” parameter. If within range, accept. If not, escalate to human with negotiation history summary.

- All negotiation steps logged to audit trail with agent confidence scores.

- Guardrail: Agent NEVER offers above pre-approved maximum price.

#### US-3.2: Risk Manager – Compliance Casey

*As a **Risk Manager**, I want to be notified immediately if an active supplier appears on a sanctions list, so that I can freeze payments and investigate before regulatory exposure.*

**Acceptance Criteria:**

- System subscribes to external Risk Data APIs (OFAC, EU sanctions, D&B, RapidRatings).

- Daily batch job + real-time webhook checks all active vendors against watchlists.

- On match: (1) Trigger “Critical Risk Workflow,” (2) Lock vendor in platform (prevent new POs), (3) Send high-priority alert to Risk Team via Teams/Slack with one-click action buttons.

- Alert includes: match confidence score, matched list, vendor details, active POs/contracts affected.

- Audit log records: detection time, alert time, response time, resolution.

#### US-3.3: Category Manager – Prudent Pat

*As a **Category Manager**, I want to use a comprehensive prompt to generate a strategic sourcing RFP, so that I can launch sourcing events 10x faster than manual RFP creation.*

**Acceptance Criteria:**

- User provides prompt: “Create an RFP for MRO supplies, $2M annual spend, targeting 10% savings.”

- Agent generates: (1) Complete RFP document using company template, (2) Recommended supplier invite list with rationale, (3) Suggested timeline with milestones, (4) Weighted evaluation criteria with scoring guide.

- All outputs are editable drafts, not final documents.

- Agent explains reasoning for each recommendation (explainability).

- One-click “Launch Event” to move from draft to active sourcing.

#### US-3.4: CPO – Strategic Sam

*As a **CPO**, I want to view a dashboard showing AI agent performance and ROI, so that I can demonstrate AI value to the board and optimize agent deployment.*

**Acceptance Criteria:**

- Dashboard shows per-agent metrics: tasks completed, accuracy rate, time saved vs. manual baseline, cost savings generated, human escalation rate.

- Aggregate ROI calculation: total hours saved × blended rate + negotiation savings + compliance savings.

- Trend charts showing agent performance over time.

- Comparison against industry benchmarks where available.

- Export to PowerPoint for board presentations.

### 5.4 Supplier Management Stories

#### US-4.1: Supplier – Supplier Samir

*As a **Supplier**, I want to complete onboarding through a self-service portal without needing to call the buyer, so that I can start doing business faster with less friction.*

**Acceptance Criteria:**

- Guided wizard: Company Info \> Banking Details \> Tax Forms \> Certifications \> Insurance \> Review & Submit.

- Progress bar showing completion percentage.

- Document upload with format validation (PDF, DOCX for certs; specific forms for tax docs).

- Real-time validation: Tax ID format check, IBAN verification, sanctions screening.

- Status notifications at each review stage.

- Target: 24-48 hour end-to-end onboarding completion.

#### US-4.2: Finance User – Ledger Larry

*As a **Finance User**, I want to have approved vendors automatically created in NetSuite, so that I don’t have to manually key them in and risk data entry errors.*

**Acceptance Criteria:**

- Trigger: Vendor Status changes to “Approved” in platform.

- Saga Step 1: Lock Vendor record in Platform DB.

- Saga Step 2: Push JSON payload to NetSuite Vendor RESTlet.

- Success: Store NetSuite internal_id in Platform vendor record. Unlock record. Status = “Synced.”

- Failure (Timeout): Retry 3x with exponential backoff (1s, 2s, 4s).

- Failure (Validation): Mark as “Sync Error” with NetSuite error details. Notify Admin. Do NOT unlock until resolved.

- Compensating transaction: If Step 2 succeeds but post-processing fails, mark for manual reconciliation.

### 5.5 Contract Stories

#### US-5.1: Legal Officer – Compliance Casey

*As a **Legal Officer**, I want to have AI pre-screen a vendor contract and highlight non-standard clauses before I begin review, so that I can prioritize my attention on the clauses that actually matter.*

**Acceptance Criteria:**

- User uploads third-party contract (PDF or DOCX).

- Contract Analysis Agent extracts all clauses and classifies by type.

- Non-standard clauses flagged with: (1) Clause text highlighted, (2) Company standard comparison, (3) Risk assessment (Low/Medium/High), (4) Suggested alternative language.

- Summary report generated with “Review Priority” ranking.

- Agent confidence displayed per clause. Below 85%: marked as “Needs Human Review.”

### 5.6 Analytics & Reporting Stories

#### US-6.1: Analytics Lead – Data-Driven Dana

*As a **Analytics Lead**, I want to ask natural language questions about procurement data and get instant answers, so that I eliminate hours of manual report building and Excel consolidation.*

**Acceptance Criteria:**

- Prompt: “Show me top 10 suppliers by spend in Q4, excluding one-time purchases.”

- Agent translates to structured query against analytics datastore.

- Results displayed as: interactive table + auto-selected chart type (bar chart for rankings).

- Follow-up queries maintain context: “Now filter to just IT category.”

- Export results to Excel, PDF, or add to custom dashboard.

### 5.7 Integration Stories

#### US-7.1: Enterprise Architect – Integration Ivan

*As a **Enterprise Architect**, I want to configure a new ERP connector without writing custom code, so that I can integrate new systems rapidly as our ERP landscape evolves.*

**Acceptance Criteria:**

- Admin UI with connector library showing pre-built ERP adapters.

- Configuration wizard: (1) Select ERP type, (2) Enter credentials/OAuth setup, (3) Map data fields to canonical model, (4) Configure sync frequency and direction, (5) Test connection with sample data.

- Field mapping supports transformations: date format conversion, code lookups, concatenation.

- Monitoring dashboard: sync status, error rates, latency, last successful sync.

- Alert on sync failures with error details and suggested remediation.

### 5.8 Sustainability Stories

#### US-8.1: ESG Manager – Sustainability Sophie

*As a **ESG Manager**, I want to see the estimated carbon footprint of a purchase order before it’s approved, so that I can make informed decisions about the environmental impact of our procurement.*

**Acceptance Criteria:**

- PO detail view includes “Environmental Impact” section.

- Estimated CO2e calculated from: supplier emission factors, product category data, transportation distance/mode.

- Visual indicator: green/yellow/red based on category benchmarks.

- Alternative supplier suggestions with lower carbon impact shown when available.

- Aggregate dashboard showing procurement carbon footprint trends over time.

## 6. Technical Architecture (TRD)

The technical architecture is designed for cloud-native, multi-tenant operation at Fortune 500 scale. Every architectural decision prioritizes resilience, auditability, and extensibility.

### 6.1 High-Level Architecture

#### 6.1.1 Microservices Decomposition

The platform decomposes into seven core services aligned with domain-driven design bounded contexts:

| Service           | Responsibility                                                                  | Primary Data Store     | Key Aggregates                          |
|-----------------------|-------------------------------------------------------------------------------------|----------------------------|---------------------------------------------|
| Intake Service        | UI/UX for request submission, form rendering, draft persistence, NLP classification | PostgreSQL + Redis         | Requisition, RequestItem, Catalog, Draft    |
| Orchestration Service | Stateful workflow engine, saga coordination, SLA timers, approval routing           | PostgreSQL + Temporal.io   | Workflow, WorkflowStep, SLA, Approval       |
| Vendor Service        | Supplier golden record, sync logic, onboarding portal, performance scoring          | PostgreSQL + Elasticsearch | Vendor, Qualification, PerformanceScore     |
| Contract Service      | Contract lifecycle, clause extraction, obligation tracking, version control         | PostgreSQL + Vector DB     | Contract, Amendment, Clause, Obligation     |
| Intelligence Service  | RAG pipelines, LLM gateway, agent framework, guardrails                             | Vector DB + Redis          | Agent, AgentTask, Conversation, Embedding   |
| Integration Service   | ERP connectors, adapter management, rate limiting, data transformation              | PostgreSQL + Redis         | Connector, SyncJob, Mapping, ErrorLog       |
| Notification Service  | Multi-channel alerts (email, Slack, Teams, push), preference management             | PostgreSQL + Redis         | Notification, Preference, Template, Channel |
#### 6.1.2 Event-Driven Architecture

Apache Kafka (MSK) serves as the central event bus. All services communicate asynchronously via domain events. Event partitioning by tenant_id guarantees ordering within a tenant while enabling cross-tenant parallelism.

Key event flows:

- RequestCreated → Orchestration Service starts workflow; Intelligence Service runs risk checks; Notification Service emails manager.

- VendorApproved → Integration Service syncs to ERP; Notification Service alerts supplier.

- InvoiceReceived → Intelligence Service performs three-way match; Exception events trigger manual review workflow.

- AgentActionCompleted → Audit Service logs immutably; Dashboard Service updates real-time metrics.

#### 6.1.3 CQRS Pattern

Command-Query Responsibility Segregation separates write operations (PostgreSQL with event sourcing) from read-optimized stores:

- Elasticsearch / OpenSearch: Full-text search across contracts, suppliers, requests.

- ClickHouse: Columnar analytics for spend dashboards, trend analysis, and reporting.

- Redis: Real-time dashboards, caching, session management.

- Vector DB (Pinecone / pgvector): Semantic search for RAG, supplier matching, and contract similarity.

### 6.2 Saga Pattern for Distributed Transactions

The Orchestration Service implements orchestration-based Sagas using Temporal.io for all cross-system transactions.

#### 6.2.1 Example Saga: PO Creation

5.  Step 1: Validate PO data in Platform DB. State: PO_Validated.

6.  Step 2: Reserve budget in Platform DB. State: Budget_Reserved. Compensation: Release budget.

7.  Step 3: Create PO in ERP via API. Compensation: Void PO in ERP.

8.  Step 4: Notify supplier via email/portal. Compensation: Send cancellation notice.

9.  Step 5: Update Platform status to PO_Created. Log completion event.

On failure at any step, the orchestrator executes compensation transactions in reverse order. Temporal.io’s durable execution ensures workflows survive infrastructure restarts and can sleep for days/weeks (e.g., waiting for legal approval) without losing state.

#### 6.2.2 Transactional Outbox Pattern

For ERP synchronization, the platform uses the Transactional Outbox pattern: when a business object is finalized, the event is written to an Outbox table in the same database transaction. A separate Publisher process picks events from the Outbox and pushes them to the target system. This ensures zero data loss even if the message broker is temporarily unavailable.

### 6.3 Agentic AI Architecture

#### 6.3.1 LLM Gateway

The LLM Gateway is middleware between application services and multiple LLM providers, providing: unified API interface (OpenAI-compatible format), provider abstraction (swap GPT-4/Claude/Llama without code changes), centralized governance with RBAC, semantic caching (20-50% cache hit rate, up to 90% cost reduction), and tenant-level model selection.

| Component           | Technology            | Purpose                                                             |
|-------------------------|---------------------------|-------------------------------------------------------------------------|
| Gateway                 | LiteLLM or TrueFoundry    | Provider abstraction, routing, key management                           |
| Semantic Cache          | Pinecone/pgvector + Redis | Embed prompts, similarity search before inference (threshold 0.85-0.95) |
| Guardrails (Input)      | NeMo Guardrails + custom  | Prompt injection detection, PII masking, jailbreak prevention           |
| Guardrails (Processing) | Custom middleware         | RAG safety enforcement, tool permission validation                      |
| Guardrails (Output)     | Custom + LLM-as-judge     | Hallucination detection, factual grounding, schema validation           |
#### 6.3.2 RAG Pipeline

The Retrieval-Augmented Generation pipeline enables accurate answers grounded in enterprise data:

10. Ingest: Documents (policies, contracts, SOPs) chunked with overlap.

11. Embed: OpenAI text-embedding-3 or equivalent model. Tenant-namespaced collections.

12. Store: Vector DB with metadata filtering (tenant_id, document_type, date_range).

13. Retrieve: Hybrid search (keyword + semantic) returning top-K relevant chunks.

14. Generate: LLM produces response grounded in retrieved context. Citations linked to source documents.

Critical: RAG namespace separation ensures tenant data is NEVER mixed in the same context window.

#### 6.3.3 Agent Framework (ReAct Pattern)

Each agent operates in a loop: Receive Goal → Think (plan steps) → Act (call tool/API) → Observe (read output) → Repeat until goal is met or escalated.

Agents are equipped with secure, scoped access to internal APIs:

- search_suppliers(): Query vendor database with filters.

- send_rfq(): Dispatch RFQ emails via integration service.

- check_budget(): Validate against ERP budget data.

- create_po(): Initiate PO creation saga.

- analyze_contract(): Extract and classify contract clauses.

- get_market_data(): Retrieve commodity pricing and benchmarks.

### 6.4 Multi-Tenant Data Architecture

#### 6.4.1 Tiered Isolation Strategy

| Tier          | Isolation Level | Database Strategy                | AI Isolation                                 | Use Case                               |
|-------------------|---------------------|--------------------------------------|--------------------------------------------------|--------------------------------------------|
| SMB               | Shared              | PostgreSQL Row-Level Security (RLS)  | Shared inference, tenant_id filtering            | Small/mid-market customers                 |
| Enterprise        | Schema-isolated     | Dedicated schema per tenant          | Dedicated RAG namespaces                         | Fortune 1000 customers                     |
| Premium/Regulated | Fully isolated      | Dedicated database + BYOK encryption | Dedicated model instances, customer-managed keys | Financial services, healthcare, government |
#### 6.4.2 Data Synchronization Strategy

- **Inbound (ERP → Platform):** Change Data Capture (CDC) or webhooks for near-real-time updates (e.g., “Invoice Paid”).

- **Outbound (Platform → ERP):** Transactional Outbox Pattern ensuring zero data loss.

- **Conflict Resolution:** Master Data (GL codes, cost centers) mastered in ERP. Request data and approvals mastered in Platform. Vendor data hybrid: risk/docs in Platform, payment details in ERP.

- **Canonical Data Model:** Open Contracting Data Standard (OCDS) format for cross-system consistency.

### 6.5 Security Architecture

- Encryption: AES-256 at rest, TLS 1.3 in transit, application-level encryption for PII via KMS.

- Identity: SAML 2.0 SSO, SCIM 2.0 provisioning, MFA mandatory for admin, FIDO2/WebAuthn for privileged access.

- RBAC + SoD: Granular roles with segregation of duties conflict detection and quarterly matrix reviews.

- Auditability: Every state change in saga orchestration and every AI agent action logged to immutable append-only ledger (event sourcing) for SOC 2 Type II.

- Data Residency: Multi-region deployment (AWS Frankfurt for EU, us-east-1 for US). Tenant-level configuration.

- AI-Specific: Tenant data never mixed in context windows. Response validation ensures citations belong to requesting tenant only.

### 6.6 Recommended Technology Stack

| Component           | Recommended Technology       | Rationale                                        |
|-------------------------|----------------------------------|------------------------------------------------------|
| Service Communication   | gRPC (internal), REST (external) | Performance + interoperability                       |
| API Gateway             | Kong or AWS API Gateway          | Auth, rate limiting, request routing                 |
| Service Mesh            | Istio Ambient (\>10 services)    | mTLS, observability, traffic management              |
| Workflow Orchestration  | Temporal.io                      | Durable execution, saga support, workflow visibility |
| Event Bus               | Apache Kafka (MSK)               | Event streaming, tenant-partitioned topics           |
| LLM Gateway             | LiteLLM or TrueFoundry           | Provider abstraction, caching, governance            |
| Primary Database        | PostgreSQL with RLS              | ACID compliance, row-level security                  |
| Document Store          | MongoDB                          | Dynamic intake form schemas                          |
| Vector Database         | Pinecone (managed) or pgvector   | RAG embeddings, semantic search                      |
| Caching                 | Redis Cluster (ElastiCache)      | Session, dashboard, semantic cache                   |
| Search                  | OpenSearch                       | Full-text search across all entities                 |
| Analytics               | ClickHouse or Redshift           | Columnar analytics, spend dashboards                 |
| Observability           | OpenTelemetry + Grafana Stack    | Distributed tracing, metrics, logs                   |
| Container Orchestration | Kubernetes (EKS/GKE/AKS)         | Auto-scaling, multi-AZ deployment                    |
| CI/CD                   | GitHub Actions + ArgoCD          | GitOps deployment pipeline                           |
| Feature Flags           | LaunchDarkly or Unleash          | Progressive rollout, A/B testing                     |
### 6.7 Non-Functional Requirements

| Category        | Requirement                         | Target                                         |
|---------------------|-----------------------------------------|----------------------------------------------------|
| Throughput          | Concurrent requests without degradation | 10,000 concurrent requests                         |
| API Latency         | 95th percentile response time           | \< 200ms                                           |
| Workflow Transition | State change execution time             | \< 500ms                                           |
| Search Latency      | Vector + keyword search                 | \< 1 second                                        |
| AI Agent Response   | End-to-end agent task completion        | \< 10 seconds (simple), \< 60 seconds (complex)    |
| Availability        | Uptime SLA                              | 99.99%                                             |
| RPO                 | Recovery Point Objective                | \< 15 minutes                                      |
| RTO                 | Recovery Time Objective                 | \< 1 hour                                          |
| Deployment          | Multi-AZ configuration                  | Active-active across 2+ AZs                        |
| Scalability         | Horizontal Pod Autoscaling              | CPU/Memory/Queue-depth based                       |
| Accessibility       | WCAG compliance level                   | 2.1 AA                                             |
| Localization        | i18n support                            | Multi-currency, multi-language, local date formats |
## 7. Implementation Roadmap

The platform is delivered in four phases, each building on the previous with clear value delivery milestones.

### Phase 1: Foundation (Months 1–4)

**Theme:** “Single Front Door” & Basic Routing

- Intake module with dynamic forms and NLP intent classification

- SSO integration (SAML 2.0) and RBAC

- Linear workflow engine with approval routing

- Slack/Teams integration for notifications and approvals

- Basic catalog buying flow

- PostgreSQL with RLS multi-tenancy

**Goal:** Eliminate email-based requests. Gain visibility into 100% of spend pipeline. Target: 8-week deployment for first customer.

### Phase 2: Connected Ecosystem (Months 5–8)

**Theme:** ERP Sync & Supplier Portal

- Bidirectional ERP connectors: SAP S/4HANA, NetSuite, Oracle Fusion

- Saga pattern implementation for distributed transactions (Temporal.io)

- Self-service Supplier Onboarding Portal

- Automated document collection and verification (W-9, SOC2, sanctions)

- Three-way matching engine

- Event sourcing and immutable audit trail

**Goal:** Zero manual data entry for Finance/AP. Supplier onboarding in 24-48 hours vs. 1-2 weeks.

### Phase 3: Intelligent Enterprise (Months 9–12)

**Theme:** Agentic AI & Advanced Analytics

- Deploy first 8 agents: Intake Classifier, Document Extraction, Routing, Tail Spend Negotiation, Risk Monitoring, Contract Analysis, Spend Analytics, Helpdesk

- RAG-based Contract Copilot

- Parallel/complex orchestration workflows

- Natural language reporting and custom dashboards

- Savings waterfall and KPI tracking

- Progressive autonomy framework with HITL controls

**Goal:** 2-5x ROI through automated sourcing and process optimization. 70%+ reduction in manual reporting effort.

### Phase 4: Autonomous Operations (Months 13–18)

**Theme:** Full Agent Suite & Sustainability

- Deploy remaining 7 agents including Strategic Sourcing, Contract Negotiation, ESG Scoring

- Sustainability module: ESG scoring, carbon footprint tracking, regulatory compliance

- MCP server integration for customer BYOM support

- Predictive analytics and demand forecasting

- Cross-contract and cross-supplier portfolio analytics

- FedRAMP readiness (for government customers)

**Goal:** Fully autonomous tail spend operations. Board-ready ESG reporting. Platform extensibility for customer-specific AI models.

## 8. Appendices

### 8.1 ERP Integration Reference

| ERP         | Primary API  | Auth      | Key Consideration                            | Rate Limits    |
|-----------------|------------------|---------------|--------------------------------------------------|--------------------|
| SAP S/4HANA     | OData REST       | OAuth 2.0     | Use SAP API Business Hub catalog                 | Varies by instance |
| SAP Ariba       | REST + cXML      | OAuth 2.0     | CIG simplifies integration; REST strong for pull | Throttled          |
| Oracle Fusion   | REST             | JWT           | 500 record limit per call; exponential backoff   | Strict             |
| Oracle NetSuite | REST (SuiteTalk) | OAuth 2.0     | SOAP deprecated; migrate by 2028.2               | 10 concurrent      |
| Workday         | REST             | OAuth 2.0/ISU | Bi-annual updates require regression testing     | Moderate           |
| Dynamics 365    | OData            | Azure AD      | Data Management Package for high-volume          | Standard           |
### 8.2 Approval Threshold Reference

| Threshold        | Approver                   | SLA Target   | Escalation |
|----------------------|--------------------------------|------------------|----------------|
| \< $1,000           | Auto-approve or single manager | Immediate / 24h  | Manager +24h   |
| $1,000 – $10,000   | Department Head                | 48 hours         | VP +48h        |
| $10,000 – $50,000  | Director + Finance             | 72 hours         | SVP +72h       |
| $50,000 – $250,000 | VP + Finance Director          | 5 business days  | CPO +5d        |
| \> $250,000         | CPO / Executive Committee      | 10 business days | CEO +10d       |
### 8.3 Agent Autonomy Levels

| Level | Name            | Description                                                         | Human Involvement   | Example                            |
|-----------|---------------------|-------------------------------------------------------------------------|-------------------------|----------------------------------------|
| L1        | Human-Assisted      | Agent provides recommendations; human executes all actions              | Every action            | Strategic RFP generation               |
| L2        | Supervised Autonomy | Agent executes within guardrails; human reviews before external actions | Review external actions | Tail spend negotiation                 |
| L3        | Full Autonomy       | Agent executes independently; human notified of outcomes                | Exception-only          | Intake classification, risk monitoring |
### 8.4 Certification Requirements

| Certification | Timeline  | Key Requirements                                                            | Investment   |
|-------------------|---------------|---------------------------------------------------------------------------------|------------------|
| SOC 2 Type II     | 3–12 months   | Security, availability, processing integrity, confidentiality, privacy controls | $100K–$500K    |
| ISO 27001         | 6–18 months   | 93 controls across organizational, people, physical, technological domains      | $150K–$500K    |
| ISO 42001         | 6–12 months   | AI management system certification (responsible AI)                             | $100K–$300K    |
| FedRAMP Moderate  | 12–24+ months | NIST SP 800-53 (323 controls), US data residency, FIPS 140-2 encryption         | $2M+            |
| GDPR              | Ongoing       | Lawful basis, 72h breach notification, DPO, data subject rights within 30 days  | Operational cost |
### 8.5 Glossary

| Term     | Definition                                                                                                 |
|--------------|----------------------------------------------------------------------------------------------------------------|
| S2P          | Source-to-Pay: the end-to-end procurement lifecycle from sourcing through payment                              |
| Saga Pattern | A distributed transaction pattern using compensating transactions instead of ACID transactions across services |
| CQRS         | Command Query Responsibility Segregation: separating read and write data models                                |
| RAG          | Retrieval-Augmented Generation: grounding LLM responses in retrieved enterprise data                           |
| ReAct        | Reasoning + Acting: agent pattern where LLM alternates between thinking and tool use                           |
| HITL         | Human-in-the-Loop: requiring human confirmation for AI actions below confidence thresholds                     |
| MCP          | Model Context Protocol: standard for connecting AI models to external data and tools                           |
| RLS          | Row-Level Security: PostgreSQL feature enforcing tenant isolation at the database level                        |
| SoD          | Segregation of Duties: preventing conflicts of interest in approval and execution                              |
| BYOK         | Bring Your Own Key: customer-managed encryption keys for premium data isolation                                |
| OCDS         | Open Contracting Data Standard: canonical format for procurement data interchange                              |
| UNSPSC       | United Nations Standard Products and Services Code: 3,600+ category taxonomy for procurement                   |
### 8.6 Feature Count Summary

| Module                     | Feature Count   | P0 (Must Have) | P1 (Should Have) | P2 (Nice to Have) |
|--------------------------------|---------------------|--------------------|----------------------|-----------------------|
| 1. Intelligent Intake         | 10                  | 6                  | 3                    | 1                     |
| 2. Orchestration Engine       | 10                  | 5                  | 5                    | 0                     |
| 3. Buying & Execution         | 8                   | 4                  | 4                    | 0                     |
| 4. Agentic AI                 | 10                  | 5                  | 5                    | 0                     |
| 5. Supplier Management        | 8                   | 3                  | 3                    | 2                     |
| 6. Contract Management        | 8                   | 3                  | 5                    | 0                     |
| 7. Search & Analytics         | 8                   | 2                  | 5                    | 1                     |
| 8. Sustainability & ESG       | 6                   | 0                  | 4                    | 2                     |
| 9. Integration & Connectivity | 8                   | 3                  | 5                    | 0                     |
| 10. Security & Compliance     | 8                   | 6                  | 2                    | 0                     |
| TOTAL                          | 84 FRs + 36 Stories | 37                 | 41                   | 6                     |