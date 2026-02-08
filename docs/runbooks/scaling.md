# Scaling Runbook

> Horizontal pod autoscaling, database scaling, Redis cluster scaling, CDN configuration, and capacity planning.

## 1. Scaling Overview

ProcGenie is designed to scale horizontally at the application layer and vertically at the data layer. The platform targets the following performance benchmarks:

| Metric | Target | Current Baseline |
|---|---|---|
| Concurrent users | 10,000 | 2,500 |
| API requests/second | 5,000 | 1,200 |
| P95 API latency | < 200 ms | 120 ms |
| Workflow transitions/second | 500 | 150 |
| Document processing/minute | 100 | 30 |
| AI agent tasks/minute | 200 | 60 |

## 2. Application Layer Scaling (Container Apps)

### Auto-Scaling Configuration

Azure Container Apps auto-scaling is configured with HTTP-based and CPU-based triggers:

**API Service (NestJS)**

| Parameter | Value | Notes |
|---|---|---|
| Minimum replicas | 2 | Always maintain 2 for high availability |
| Maximum replicas | 20 | Upper bound to prevent cost runaway |
| HTTP trigger | 50 concurrent requests per replica | Scale out when each replica handles > 50 concurrent |
| CPU trigger | 70% average CPU | Scale out when CPU exceeds 70% |
| Scale-in cooldown | 300 seconds | Wait 5 minutes before scaling down |
| Scale-out stabilization | 60 seconds | Wait 1 minute before scaling up further |

**Web Service (Next.js)**

| Parameter | Value | Notes |
|---|---|---|
| Minimum replicas | 2 | Always maintain 2 for high availability |
| Maximum replicas | 10 | Frontend is less resource-intensive |
| HTTP trigger | 100 concurrent requests per replica | Higher threshold due to static content |
| CPU trigger | 80% average CPU | Higher threshold for SSR workloads |

### Manual Scaling

```bash
# Scale API to specific replica count
az containerapp update \
  --resource-group rg-procgenie-prod \
  --name ca-procgenie-api \
  --min-replicas 4 \
  --max-replicas 30

# Scale web to specific replica count
az containerapp update \
  --resource-group rg-procgenie-prod \
  --name ca-procgenie-web \
  --min-replicas 3 \
  --max-replicas 15

# View current replica count
az containerapp show \
  --resource-group rg-procgenie-prod \
  --name ca-procgenie-api \
  --query "properties.template.scale"
```

### Scaling Events Dashboard

Monitor scaling events in Azure Portal or via CLI:

```bash
# View recent scaling events
az monitor activity-log list \
  --resource-group rg-procgenie-prod \
  --resource-id /subscriptions/<sub>/resourceGroups/rg-procgenie-prod/providers/Microsoft.App/containerApps/ca-procgenie-api \
  --query "[?contains(operationName.value, 'Scale')]" \
  --start-time $(date -u -d '24 hours ago' +%Y-%m-%dT%H:%M:%SZ)
```

### Scaling Decision Guide

| Symptom | Metric | Action |
|---|---|---|
| Slow API responses | P95 latency > 500ms | Scale out API replicas |
| Request timeouts | Error rate > 2% | Scale out + investigate root cause |
| High CPU | CPU > 80% sustained | Scale out or scale up (larger container) |
| High memory | Memory > 85% | Scale out or increase memory limit |
| Queue backlog | Bull queue depth > 1000 | Scale worker replicas or add dedicated workers |
| SSR slowness | Web P95 > 2s | Scale out web replicas |

## 3. Database Scaling

### Vertical Scaling (Scale Up)

Upgrade the PostgreSQL tier for more CPU, memory, and connections:

| Tier | vCores | Memory | Storage | Max Connections | Monthly Cost | Use Case |
|---|---|---|---|---|---|---|
| Burstable B2ms | 2 | 8 GB | 128 GB | 200 | ~$50 | Development |
| General Purpose D2ds_v4 | 2 | 8 GB | 256 GB | 200 | ~$140 | Light production |
| General Purpose D4ds_v4 | 4 | 16 GB | 512 GB | 400 | ~$280 | Standard production |
| General Purpose D8ds_v4 | 8 | 32 GB | 1 TB | 800 | ~$560 | High traffic |
| General Purpose D16ds_v4 | 16 | 64 GB | 2 TB | 1,600 | ~$1,120 | Heavy workloads |
| Memory Optimized E4ds_v4 | 4 | 32 GB | 512 GB | 400 | ~$350 | Analytics-heavy |
| Memory Optimized E8ds_v4 | 8 | 64 GB | 1 TB | 800 | ~$700 | Large datasets |

```bash
# Scale up database tier
az postgres flexible-server update \
  --resource-group rg-procgenie-prod \
  --name psql-procgenie-prod \
  --sku-name Standard_D8ds_v4

# Increase storage (cannot be decreased)
az postgres flexible-server update \
  --resource-group rg-procgenie-prod \
  --name psql-procgenie-prod \
  --storage-size 1024
```

> **Note:** Vertical scaling causes a brief restart (10--30 seconds). Schedule during a maintenance window.

### Read Replicas

For read-heavy workloads, add read replicas to offload analytics queries:

```bash
# Create a read replica
az postgres flexible-server replica create \
  --resource-group rg-procgenie-prod \
  --name psql-procgenie-prod-replica-1 \
  --source-server psql-procgenie-prod \
  --location eastus
```

Configure the application to route read-only queries to replicas:

| Query Type | Target | Examples |
|---|---|---|
| Transactional reads/writes | Primary | Create requisition, approve workflow |
| Analytics queries | Read replica | Spend reports, dashboards, exports |
| Search queries | Read replica or OpenSearch | Full-text search, supplier directory |
| AI RAG queries | Read replica or vector DB | Semantic search, embeddings |

### Connection Pooling with PgBouncer

For environments with many application replicas, use PgBouncer:

```bash
# Enable built-in PgBouncer on Azure PostgreSQL
az postgres flexible-server parameter set \
  --resource-group rg-procgenie-prod \
  --server-name psql-procgenie-prod \
  --name pgbouncer.enabled \
  --value true

# Set pool mode to transaction (recommended)
az postgres flexible-server parameter set \
  --resource-group rg-procgenie-prod \
  --server-name psql-procgenie-prod \
  --name pgbouncer.default_pool_size \
  --value 50
```

### Database Scaling Decision Guide

| Symptom | Metric | Action |
|---|---|---|
| Slow queries | P95 query time > 500ms | Analyze with `pg_stat_statements`; add indexes |
| Connection exhaustion | Active connections > 80% of max | Increase `max_connections` or enable PgBouncer |
| CPU bottleneck | Database CPU > 80% | Scale up to more vCores |
| Memory pressure | Database memory > 85% | Scale up to more memory |
| Storage running low | Storage > 80% | Increase storage; archive old data |
| Read contention | Lock waits > 100/min | Add read replicas for analytics workloads |

## 4. Redis Scaling

### Tier Progression

| Tier | Size | Memory | Max Connections | Clustering | Monthly Cost | Use Case |
|---|---|---|---|---|---|---|
| Basic C0 | 250 MB | 250 MB | 256 | No | ~$15 | Development |
| Basic C1 | 1 GB | 1 GB | 1,000 | No | ~$25 | Light production |
| Standard C2 | 6 GB | 6 GB | 2,000 | No | ~$180 | Standard production |
| Standard C3 | 13 GB | 13 GB | 5,000 | No | ~$360 | High traffic |
| Premium P1 | 6 GB | 6 GB | 7,500 | Yes | ~$450 | HA + clustering |
| Premium P2 | 13 GB | 13 GB | 15,000 | Yes | ~$900 | Large-scale |
| Premium P3 | 26 GB | 26 GB | 20,000 | Yes | ~$1,800 | Enterprise |

### Scaling Redis

```bash
# Scale up Redis tier
az redis update \
  --resource-group rg-procgenie-prod \
  --name redis-procgenie-prod \
  --sku Standard \
  --vm-size C3

# Enable clustering (Premium tier required)
az redis create \
  --resource-group rg-procgenie-prod \
  --name redis-procgenie-prod-cluster \
  --sku Premium \
  --vm-size P1 \
  --shard-count 3
```

### Redis Usage Breakdown

| Use Case | Key Pattern | Estimated Memory | TTL |
|---|---|---|---|
| Session data | `session:{userId}` | 2 KB per session | 1 hour |
| API response cache | `cache:{endpoint}:{hash}` | 1--10 KB per entry | 5--60 min |
| Semantic cache | `semantic:{tenantId}:{hash}` | 5 KB per entry | 1--24 hours |
| Bull job queues | `bull:{queueName}:*` | Variable | Until processed |
| Rate limiting | `ratelimit:{tenantId}:{ip}` | 100 bytes per entry | 1 minute |
| Real-time presence | `presence:{userId}` | 200 bytes per entry | 5 minutes |

### Redis Scaling Decision Guide

| Symptom | Metric | Action |
|---|---|---|
| High memory usage | Used memory > 85% | Scale up tier or review TTL policies |
| Evictions occurring | Evicted keys > 0 | Scale up; review `maxmemory-policy` |
| High latency | Redis P95 > 5ms | Check for large keys; enable clustering |
| Connection limit | Connected clients > 80% of max | Scale up tier |
| Queue backlog | Bull queue depth growing | Scale application workers |

## 5. CDN and Front Door Scaling

### Azure Front Door Configuration

| Setting | Value | Purpose |
|---|---|---|
| Routing method | Lowest latency | Route to nearest healthy origin |
| Health probe interval | 30 seconds | Detect unhealthy origins |
| Health probe path | `/api/v1/health` | API health endpoint |
| Cache duration (static) | 7 days | CSS, JS, images |
| Cache duration (API) | Disabled | API responses are not cached at CDN |
| WAF policy | Prevention mode | Block malicious requests |
| DDoS protection | Standard | Network-level DDoS mitigation |

### Cache Optimization

```bash
# Purge CDN cache (after deployment)
az afd endpoint purge \
  --resource-group rg-procgenie-prod \
  --profile-name fd-procgenie-prod \
  --endpoint-name web-endpoint \
  --content-paths "/*"

# Purge specific path
az afd endpoint purge \
  --resource-group rg-procgenie-prod \
  --profile-name fd-procgenie-prod \
  --endpoint-name web-endpoint \
  --content-paths "/static/*" "/_next/*"
```

### CDN Cache Hit Rate Targets

| Content Type | Target Hit Rate | Strategy |
|---|---|---|
| Static assets (JS, CSS, images) | > 95% | Long cache TTL (7 days) + content hashing |
| Fonts | > 99% | Immutable cache headers |
| API responses | 0% (not cached) | Pass-through to origin |
| Server-rendered pages | 50--70% | Short TTL (60s) with stale-while-revalidate |

## 6. Capacity Planning

### Growth Projections

Plan capacity based on expected growth:

| Metric | Current | 6 Months | 12 Months | 24 Months |
|---|---|---|---|---|
| Tenants | 10 | 50 | 200 | 500 |
| Users | 2,500 | 12,500 | 50,000 | 125,000 |
| Daily requests | 100K | 500K | 2M | 5M |
| Database size | 50 GB | 250 GB | 1 TB | 2.5 TB |
| Redis memory | 500 MB | 2 GB | 6 GB | 13 GB |
| Document storage | 10 GB | 50 GB | 200 GB | 500 GB |

### Infrastructure Sizing Recommendations

**Phase 1: Launch (0--6 months, 10--50 tenants)**

| Service | Configuration | Monthly Cost |
|---|---|---|
| API | 2--5 replicas, 1 vCPU / 2 GB each | ~$80 |
| Web | 2--3 replicas, 0.5 vCPU / 1 GB each | ~$40 |
| PostgreSQL | D4ds_v4 (4 vCPU, 16 GB, 512 GB) | ~$280 |
| Redis | Standard C2 (6 GB) | ~$180 |
| Front Door | Standard | ~$35 |
| **Total** | | **~$615/month** |

**Phase 2: Growth (6--12 months, 50--200 tenants)**

| Service | Configuration | Monthly Cost |
|---|---|---|
| API | 4--10 replicas, 2 vCPU / 4 GB each | ~$250 |
| Web | 3--6 replicas, 1 vCPU / 2 GB each | ~$120 |
| PostgreSQL | D8ds_v4 (8 vCPU, 32 GB, 1 TB) + 1 read replica | ~$1,120 |
| Redis | Standard C3 (13 GB) | ~$360 |
| Front Door | Standard | ~$70 |
| OpenSearch | 2-node cluster | ~$300 |
| **Total** | | **~$2,220/month** |

**Phase 3: Scale (12--24 months, 200--500 tenants)**

| Service | Configuration | Monthly Cost |
|---|---|---|
| API | 8--20 replicas, 2 vCPU / 4 GB each | ~$600 |
| Web | 4--10 replicas, 1 vCPU / 2 GB each | ~$200 |
| PostgreSQL | D16ds_v4 (16 vCPU, 64 GB, 2 TB) + 2 read replicas | ~$3,400 |
| Redis | Premium P2 (13 GB, clustered) | ~$900 |
| Front Door | Premium (WAF + bot protection) | ~$330 |
| OpenSearch | 3-node cluster | ~$500 |
| Kafka (Event Hubs) | Standard, 10 TUs | ~$400 |
| **Total** | | **~$6,330/month** |

## 7. Load Testing

### Pre-Scaling Load Test Procedure

Before any scaling event, validate with load tests:

```bash
# Install k6 load testing tool
brew install k6  # macOS
# or
sudo apt install k6  # Linux

# Run load test
k6 run infrastructure/scripts/load-test.js \
  --env API_URL=https://staging-api.procgenie.io \
  --env TOKEN=<test-token>
```

### Load Test Scenarios

| Scenario | Virtual Users | Duration | Target |
|---|---|---|---|
| Baseline | 100 | 5 minutes | Establish normal metrics |
| Standard load | 500 | 15 minutes | Validate normal operation |
| Peak load | 2,000 | 10 minutes | Validate auto-scaling triggers |
| Stress test | 5,000 | 5 minutes | Find breaking point |
| Soak test | 500 | 2 hours | Identify memory leaks |

### Load Test Acceptance Criteria

| Metric | Threshold | Action if Failed |
|---|---|---|
| P95 latency | < 500ms | Investigate bottleneck; scale resources |
| Error rate | < 1% | Fix errors before scaling further |
| Throughput | > 1,000 req/s | Add replicas or optimize code |
| Memory growth | < 5% per hour | Investigate memory leaks |
| Connection pool | < 80% utilization | Increase pool size or add PgBouncer |

## 8. Scaling Checklist

Use this checklist when preparing for a scaling event:

- [ ] Run load tests to establish current baseline
- [ ] Identify the bottleneck (application, database, Redis, network)
- [ ] Calculate required resources based on target metrics
- [ ] Schedule the scaling window (if downtime expected)
- [ ] Notify the team via `#infrastructure` Slack channel
- [ ] Execute the scaling changes
- [ ] Run load tests against the scaled environment
- [ ] Verify auto-scaling policies are updated
- [ ] Monitor for 24 hours for anomalies
- [ ] Update capacity planning documentation
- [ ] Review cost impact and update budget projections
