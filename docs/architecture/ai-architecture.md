# AI & Agent Architecture

> LLM Gateway, RAG pipeline, 15-agent architecture, guardrails, and tenant isolation.

## 1. LLM Gateway Design

The LLM Gateway is middleware between application services and LLM providers. It provides a single interface for all AI interactions, enabling governance, cost control, and provider flexibility.

### Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                        APPLICATION SERVICES                       │
│  Intake Service │ Contract Service │ Intelligence Service │ ...   │
└────────┬─────────────────┬────────────────────┬──────────────────┘
         │                 │                    │
         ▼                 ▼                    ▼
┌──────────────────────────────────────────────────────────────────┐
│                         LLM GATEWAY                              │
│                                                                  │
│  ┌──────────────┐  ┌───────────────┐  ┌──────────────────────┐  │
│  │ Input        │  │ Semantic      │  │ Provider Router      │  │
│  │ Guardrails   │  │ Cache         │  │ (Claude/GPT/Llama)   │  │
│  │ - PII mask   │  │ - Embed query │  │ - Cost-based routing │  │
│  │ - Injection  │  │ - Similarity  │  │ - Fallback chains    │  │
│  │ - Jailbreak  │  │   search      │  │ - Model selection    │  │
│  └──────┬───────┘  │ - Cache hit?  │  └──────────┬───────────┘  │
│         │          └───────┬───────┘             │               │
│         ▼                  ▼                     ▼               │
│  ┌──────────────┐  ┌───────────────┐  ┌──────────────────────┐  │
│  │ Processing   │  │ Token         │  │ Output Guardrails    │  │
│  │ Guardrails   │  │ Accounting    │  │ - Hallucination det. │  │
│  │ - RAG safety │  │ - Per-tenant  │  │ - Schema validation  │  │
│  │ - Tool perms │  │ - Cost alloc  │  │ - Citation verify    │  │
│  └──────────────┘  └───────────────┘  └──────────────────────┘  │
└──────────────────────────────────────────────────────────────────┘
         │                 │                    │
         ▼                 ▼                    ▼
┌──────────────────────────────────────────────────────────────────┐
│                      LLM PROVIDERS                                │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────────┐ │
│  │ Anthropic│  │ OpenAI   │  │ Azure    │  │ Self-hosted      │ │
│  │ Claude   │  │ GPT-4    │  │ OpenAI   │  │ (Llama/Mistral)  │ │
│  └──────────┘  └──────────┘  └──────────┘  └──────────────────┘ │
└──────────────────────────────────────────────────────────────────┘
```

### Gateway Components

| Component | Technology | Purpose |
|---|---|---|
| Gateway | LiteLLM or TrueFoundry | Provider abstraction, routing, key management |
| Semantic Cache | pgvector + Redis | Embed prompts, similarity search before inference (threshold 0.85-0.95) |
| Input Guardrails | NeMo Guardrails + custom | Prompt injection detection, PII masking, jailbreak prevention |
| Processing Guardrails | Custom middleware | RAG safety enforcement, tool permission validation |
| Output Guardrails | Custom + LLM-as-judge | Hallucination detection, factual grounding, schema validation |

### Provider Configuration

```typescript
// LLM Gateway configuration
{
  providers: {
    anthropic: {
      model: 'claude-sonnet-4-20250514',
      maxTokens: 4096,
      temperature: 0.1,    // Low temperature for deterministic procurement tasks
      apiKey: '${ANTHROPIC_API_KEY}',
    },
    openai: {
      model: 'gpt-4-turbo',
      maxTokens: 4096,
      apiKey: '${OPENAI_API_KEY}',
    },
  },
  routing: {
    default: 'anthropic',
    fallback: ['openai'],
    costOptimized: true,     // Route simple tasks to cheaper models
  },
  tenantOverrides: {
    'tenant-premium': {
      model: 'claude-opus-4-20250514',  // Premium tenants get best model
    },
  },
}
```

## 2. RAG Pipeline

The Retrieval-Augmented Generation pipeline enables accurate answers grounded in enterprise data, eliminating hallucination for factual queries.

### Pipeline Stages

```
┌─────────────────────────────────────────────────────────────────┐
│ STAGE 1: INGEST                                                  │
│                                                                  │
│  Documents ──▶ Chunker ──▶ Metadata Extractor ──▶ Queue         │
│  (policies, contracts, SOPs)                                     │
│  - Chunk size: 512 tokens with 50-token overlap                  │
│  - Preserves section headers and document structure              │
│  - Extracts: title, date, author, category, tenant_id           │
└─────────────────────────────┬───────────────────────────────────┘
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ STAGE 2: EMBED                                                   │
│                                                                  │
│  Chunks ──▶ Embedding Model ──▶ Vectors (1536-dim)              │
│  - Model: OpenAI text-embedding-3 or equivalent                  │
│  - Tenant-namespaced collections (CRITICAL: never mix tenants)   │
│  - Batch processing for efficiency                               │
└─────────────────────────────┬───────────────────────────────────┘
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ STAGE 3: STORE                                                   │
│                                                                  │
│  Vectors ──▶ Vector DB (pgvector / Pinecone)                    │
│  - Metadata filters: tenant_id, document_type, date_range       │
│  - HNSW index for fast approximate nearest neighbor              │
│  - Periodic re-indexing for updated documents                    │
└─────────────────────────────┬───────────────────────────────────┘
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ STAGE 4: RETRIEVE                                                │
│                                                                  │
│  User Query ──▶ Hybrid Search ──▶ Top-K Chunks                  │
│  - Semantic search: cosine similarity on embeddings              │
│  - Keyword search: BM25 full-text search                         │
│  - Reranker: cross-encoder reranking of combined results         │
│  - Metadata filtering: tenant_id (MANDATORY), doc type, date    │
│  - Top-K: 5-10 chunks depending on context window               │
└─────────────────────────────┬───────────────────────────────────┘
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ STAGE 5: GENERATE                                                │
│                                                                  │
│  Prompt + Context Chunks ──▶ LLM ──▶ Grounded Response          │
│  - System prompt enforces citation requirements                  │
│  - Response includes source document references                  │
│  - Output validated: citations must reference retrieved chunks   │
│  - Confidence score calculated from retrieval similarity         │
└─────────────────────────────────────────────────────────────────┘
```

### RAG Configuration

| Parameter | Value | Notes |
|---|---|---|
| Chunk size | 512 tokens | Balanced between context and precision |
| Chunk overlap | 50 tokens | Prevents information loss at boundaries |
| Embedding model | text-embedding-3 | 1536 dimensions |
| Similarity threshold | 0.75 | Minimum relevance score |
| Top-K retrieval | 5-10 | Adjusted based on context window |
| Reranker | Cross-encoder | Post-retrieval relevance reranking |
| Cache TTL | 1 hour | Semantic cache for repeated queries |

## 3. 15-Agent Architecture

ProcGenie deploys 15 specialized AI agents coordinated by an Agent Orchestrator. Each agent follows the **ReAct (Reasoning + Acting)** pattern.

### Agent Inventory

| # | Agent Name | Domain | Autonomy | HITL Threshold | Key Tools |
|---|---|---|---|---|---|
| A1 | Intake Classifier Agent | Intake | L3 Full | Confidence < 80% | `classify_intent`, `match_category`, `suggest_channel` |
| A2 | Document Extraction Agent | Intake | L3 Full | Confidence < 85% | `ocr_extract`, `parse_document`, `map_fields` |
| A3 | Routing & Assignment Agent | Workflow | L3 Full | Non-standard routes | `get_org_chart`, `evaluate_rules`, `assign_approver` |
| A4 | Tail Spend Negotiation Agent | Sourcing | L2 Supervised | All awards > $5K | `send_email`, `parse_reply`, `compare_quotes`, `check_walkaway` |
| A5 | Strategic Sourcing Agent | Sourcing | L1 Human-Assisted | All RFP drafts | `generate_rfp`, `recommend_suppliers`, `design_criteria` |
| A6 | Supplier Discovery Agent | Suppliers | L2 Supervised | New supplier adds | `search_market`, `evaluate_fit`, `check_sanctions` |
| A7 | Risk Monitoring Agent | Risk | L3 Full | Critical risk alerts | `check_sanctions`, `monitor_financials`, `scan_news` |
| A8 | Contract Analysis Agent | Contracts | L2 Supervised | Non-standard clauses | `extract_clauses`, `classify_risk`, `suggest_redlines` |
| A9 | Contract Negotiation Agent | Contracts | L1 Human-Assisted | All counter-proposals | `draft_response`, `compare_positions`, `suggest_compromise` |
| A10 | Invoice Matching Agent | Finance | L3 Full | Variance > tolerance | `three_way_match`, `flag_exceptions`, `auto_approve` |
| A11 | Spend Analytics Agent | Analytics | L3 Full | Anomaly detection | `query_data`, `detect_patterns`, `generate_insights` |
| A12 | Compliance Checker Agent | Compliance | L3 Full | Policy violations | `check_policy`, `validate_sod`, `verify_approval` |
| A13 | ESG Scoring Agent | Sustainability | L2 Supervised | Score < threshold | `calculate_esg`, `estimate_carbon`, `find_alternatives` |
| A14 | Helpdesk / FAQ Agent | Support | L3 Full | Unresolved queries | `search_knowledge`, `guide_process`, `escalate_to_human` |
| A15 | Agent Orchestrator | Meta | L3 Full | Multi-agent conflicts | `delegate_task`, `resolve_conflict`, `optimize_routing` |

### ReAct Pattern Implementation

Each agent operates in a loop:

```
┌─────────────────────────────────────────────────────────┐
│                   AGENT EXECUTION LOOP                    │
│                                                          │
│  1. RECEIVE GOAL                                         │
│     "Negotiate renewal for Vendor X, budget < $4,500"    │
│                                                          │
│  2. THINK (Reasoning)                                    │
│     "I need to check the current contract price,         │
│      review vendor performance, and draft an email."     │
│                                                          │
│  3. ACT (Tool Call)                                      │
│     search_suppliers(vendor_id="X")                      │
│     → Returns: current_price=$4,800, last_renewal=...    │
│                                                          │
│  4. OBSERVE (Read Output)                                │
│     "Current price is $4,800. Performance score: 4.2/5"  │
│                                                          │
│  5. THINK (Next Step)                                    │
│     "Good performance. I'll request 6% discount to       │
│      reach $4,512, within walkaway of $4,700."           │
│                                                          │
│  6. ACT (Tool Call)                                      │
│     send_email(to=vendor, template="renewal_negotiation")│
│                                                          │
│  7. OBSERVE → ... (Loop until goal met or escalated)     │
└─────────────────────────────────────────────────────────┘
```

### Agent Tools (Secure API Access)

Agents are equipped with scoped, permission-controlled tools:

| Tool | Description | Used By Agents |
|---|---|---|
| `search_suppliers()` | Query vendor database with filters | A4, A5, A6, A7 |
| `send_rfq()` | Dispatch RFQ emails via integration service | A4, A5 |
| `send_email()` | Send email via integration service | A4, A9 |
| `check_budget()` | Validate against ERP budget data | A3, A4, A5 |
| `create_po()` | Initiate PO creation saga | A4 |
| `analyze_contract()` | Extract and classify contract clauses | A8, A9 |
| `get_market_data()` | Retrieve commodity pricing and benchmarks | A5, A11 |
| `check_sanctions()` | Screen against OFAC, EU, UN sanctions lists | A6, A7 |
| `query_data()` | Execute analytics queries | A11, A14 |
| `search_knowledge()` | RAG search against knowledge base | A14 |

## 4. Agent Autonomy Levels

Agents operate at three progressive autonomy levels, configurable per agent and adjustable based on accuracy metrics:

### L1: Human-Assisted

| Aspect | Details |
|---|---|
| **Description** | Agent provides recommendations; human executes all actions |
| **Human involvement** | Every action requires human confirmation |
| **Use cases** | Strategic RFP generation (A5), Contract negotiation (A9) |
| **Graduation criteria** | 95%+ accuracy over 100+ tasks, admin approval |

### L2: Supervised Autonomy

| Aspect | Details |
|---|---|
| **Description** | Agent executes within guardrails; human reviews before external actions |
| **Human involvement** | Review required for external-facing actions (emails, POs) |
| **Use cases** | Tail spend negotiation (A4), Contract analysis (A8), ESG scoring (A13), Supplier discovery (A6) |
| **Graduation criteria** | 98%+ accuracy over 500+ tasks, zero critical errors in 30 days |

### L3: Full Autonomy

| Aspect | Details |
|---|---|
| **Description** | Agent executes independently; human notified of outcomes |
| **Human involvement** | Exception-only (confidence below threshold, anomaly detected) |
| **Use cases** | Intake classification (A1), Document extraction (A2), Risk monitoring (A7), Invoice matching (A10), Compliance checking (A12) |
| **Safeguards** | Automatic demotion to L2 if error rate exceeds 2% in any 24h window |

### Progressive Autonomy Framework

```
┌──────────────┐     Accuracy > 95%      ┌──────────────┐     Accuracy > 98%      ┌──────────────┐
│ L1: Human-   │    over 100+ tasks      │ L2: Super-   │    over 500+ tasks      │ L3: Full     │
│ Assisted     │ ──────────────────────▶  │ vised        │ ──────────────────────▶  │ Autonomy     │
│              │     + Admin approval     │ Autonomy     │     + Zero critical     │              │
└──────────────┘                          └──────────────┘       errors 30d         └──────────────┘
       ▲                                         ▲                                         │
       │              Error rate > 5%            │              Error rate > 2%            │
       └─────────────────────────────────────────┴─────────────────────────────────────────┘
                                    Automatic demotion on safety violations
```

## 5. Human-in-the-Loop (HITL) Checkpoint Design

### Checkpoint Triggers

| Trigger | Condition | Action |
|---|---|---|
| Low confidence | Agent confidence < configured threshold (80-85%) | Pause execution, present recommendation to human |
| High value | Transaction value exceeds threshold ($5K-$50K depending on agent) | Require human approval before proceeding |
| External action | Agent wants to send email, create PO, or modify vendor record | Queue for human review (L2 agents) |
| Non-standard input | Input doesn't match known patterns | Escalate with explanation |
| Policy violation | Proposed action would violate a procurement policy | Block and alert compliance team |
| Multi-agent conflict | Two agents produce conflicting recommendations | Present both to human for resolution |

### HITL User Experience

```
┌────────────────────────────────────────────────────────────┐
│  HUMAN REVIEW REQUIRED                                      │
│                                                             │
│  Agent: Tail Spend Negotiation (A4)                        │
│  Task: Renew contract with Vendor X                        │
│  Confidence: 72% (below 80% threshold)                     │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ AGENT RECOMMENDATION                                 │   │
│  │                                                      │   │
│  │ "Based on the vendor's counter-offer of $4,950,     │   │
│  │  I recommend accepting. This is 3% below current    │   │
│  │  price ($5,100) and within the walkaway threshold   │   │
│  │  of $5,000. However, market data suggests similar   │   │
│  │  services are available at $4,500."                  │   │
│  │                                                      │   │
│  │ Reasoning steps: [View full trace]                   │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  [Approve]  [Reject]  [Modify & Approve]  [Reassign]      │
└────────────────────────────────────────────────────────────┘
```

## 6. Guardrails

### Input Guardrails

| Guardrail | Implementation | Purpose |
|---|---|---|
| Prompt injection detection | NeMo Guardrails pattern matching + classifier | Prevent malicious prompt manipulation |
| PII masking | Regex + NER model | Remove sensitive data before sending to LLM |
| Jailbreak prevention | Custom classifier + deny-list | Block attempts to bypass agent constraints |
| Input sanitization | Schema validation (Zod) | Ensure inputs conform to expected format |
| Tenant context validation | JWT claim verification | Ensure agent operates within correct tenant |

### Processing Guardrails

| Guardrail | Implementation | Purpose |
|---|---|---|
| RAG namespace enforcement | Mandatory tenant_id filter on all vector queries | Prevent cross-tenant data leakage |
| Tool permission validation | RBAC check before every tool call | Ensure agent has permission for the action |
| Budget ceiling enforcement | Hard-coded maximum values per agent | Prevent agents from exceeding financial limits |
| Rate limiting | Per-agent, per-tenant request limits | Prevent runaway agent loops |
| Timeout enforcement | Maximum execution time per task (60s simple, 300s complex) | Prevent infinite loops |

### Output Guardrails

| Guardrail | Implementation | Purpose |
|---|---|---|
| Hallucination detection | LLM-as-judge cross-validation | Verify factual claims against source data |
| Citation verification | Check citations reference retrieved chunks | Ensure responses are grounded |
| Schema validation | Zod/JSON schema validation | Ensure structured outputs match expected format |
| Sensitive data check | Post-processing PII scan | Catch any PII that leaked through |
| Confidence scoring | Calibrated probability from agent | Flag low-confidence responses |
| Bias detection | Statistical analysis of recommendations | Detect systematic bias in supplier recommendations |

## 7. Semantic Caching Strategy

Semantic caching reduces LLM API costs by 20-50% and improves latency by serving cached responses for semantically similar queries.

### How It Works

```
User Query: "What is our preferred supplier for laptops?"
                    │
                    ▼
         ┌──────────────────┐
         │ Embed Query      │
         │ (text-embedding) │
         └────────┬─────────┘
                  │
                  ▼
         ┌──────────────────┐     Similarity > 0.92
         │ Search Cache     │ ──────────────────────▶ Return cached response
         │ (pgvector)       │
         └────────┬─────────┘
                  │ No cache hit (similarity < 0.92)
                  ▼
         ┌──────────────────┐
         │ Call LLM         │
         │ (Claude API)     │
         └────────┬─────────┘
                  │
                  ▼
         ┌──────────────────┐
         │ Store in Cache   │
         │ (query embed +   │
         │  response + TTL) │
         └──────────────────┘
```

### Cache Configuration

| Parameter | Value | Notes |
|---|---|---|
| Similarity threshold | 0.85-0.95 | Higher = more exact matches, lower cache hit rate |
| Default TTL | 1 hour | Queries involving dynamic data (spend reports) |
| Extended TTL | 24 hours | Queries against policies, procedures (static data) |
| Cache scope | Per-tenant | Cache entries are tenant-isolated |
| Invalidation | On document update | When source documents change, related cache entries are purged |
| Estimated hit rate | 20-50% | Up to 90% cost reduction for FAQ-type queries |

## 8. Tenant Isolation in AI Contexts

Tenant isolation in AI is critical to prevent data leakage. The following controls are enforced:

| Control | Implementation | Enforcement Point |
|---|---|---|
| RAG namespace separation | Separate vector collections or mandatory `tenant_id` filter | Vector DB query layer |
| Context window isolation | Never include data from multiple tenants in a single LLM call | LLM Gateway |
| Citation tenant verification | Verify all citations belong to the requesting tenant | Output guardrails |
| Agent tool scoping | Tools automatically filter by `tenant_id` from JWT claims | Tool execution layer |
| Semantic cache partitioning | Cache entries keyed by `tenant_id` + query embedding | Cache layer |
| Model instance isolation | Premium tenants get dedicated model deployments | LLM Gateway routing |
| Audit logging | Every AI interaction logged with tenant context | Audit service |

### Isolation Verification

A nightly automated test suite verifies tenant isolation by:

1. Creating test data in Tenant A and Tenant B
2. Querying RAG pipeline as Tenant A and verifying zero Tenant B results
3. Querying semantic cache as Tenant A and verifying no Tenant B cache hits
4. Running agent tasks as Tenant A and verifying tool calls are scoped
5. Verifying audit logs correctly attribute actions to the correct tenant
