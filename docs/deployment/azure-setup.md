# Azure Deployment Guide

> Step-by-step guide for deploying ProcGenie to Azure using Bicep templates, Container Apps, and managed services.

## GEP-Specific Policy Requirements

> **IMPORTANT**: GEP Azure subscription has strict policies. These must be followed or deployments will fail.

| Policy | Requirement |
|--------|------------|
| **Region** | `eastus` is restricted. Use **`westus2`** |
| **RG Tags** | Must include `documentTeam` (e.g. `Architecture`) and `projectName` (e.g. `IT`) |
| **Key Vault** | `publicNetworkAccess` must be `Disabled`, `networkAcls.defaultAction` must be `Deny` |
| **ACR SKU** | Only `Basic` and `Standard` allowed. Basic does NOT support `retentionPolicy` |
| **Role Assignments** | User has `Contributor` only (not Owner). Cannot create RBAC role assignments. Use ACR admin credentials + Key Vault access policies instead |
| **AI Provider** | Azure OpenAI (resource: `sourceai-dev-oai-k8nq50` in `sourceai-dev-rg`), deployment: `gpt-4o` |

## 1. Prerequisites

### Required Tools

| Tool | Version | Purpose |
|---|---|---|
| Azure CLI | 2.55+ | Azure resource management |
| Bicep CLI | 0.24+ | Infrastructure as Code compilation |
| Docker | 24+ | Container image builds |
| Node.js | 20+ | Build toolchain |
| Git | 2.40+ | Source control |
| jq | 1.6+ | JSON processing |

### Required Azure Permissions

- **Contributor** role on the target subscription or resource group
- **Microsoft.App** resource provider registered on the subscription
- Note: **Owner** role is NOT available under GEP policy. Use ACR admin credentials and KV access policies instead of RBAC

### Azure Services Used

| Service | SKU / Tier | Purpose |
|---|---|---|
| Azure Container Apps | Consumption | Application hosting (web + API) |
| Azure Container Registry | Basic | Private Docker image registry |
| Azure Database for PostgreSQL | Flexible Server, Burstable B1ms | Primary database |
| Azure Cache for Redis | Basic C0 | Caching, session store, Bull queues |
| Azure Front Door | Standard | CDN, WAF, TLS termination, global routing |
| Azure Key Vault | Standard | Secrets and certificate management |
| Azure Log Analytics Workspace | Pay-as-you-go | Centralized log aggregation |
| Managed Identity | User-assigned | Service authentication |

### Pre-Deployment Checklist

- [ ] Azure subscription with sufficient quota (`GEPRnD` subscription)
- [ ] Azure OpenAI access (resource `sourceai-dev-oai-k8nq50` in `sourceai-dev-rg`)
- [ ] Docker Desktop running locally
- [ ] Git Bash or WSL (on Windows, use `MSYS_NO_PATHCONV=1` for Azure CLI path args)

## 2. Bicep Template Walkthrough

The infrastructure is defined in `/infrastructure/bicep/` with a modular structure:

```
infrastructure/bicep/
├── main.bicep              # Root orchestration template
├── parameters/
│   ├── dev.bicepparam      # Development parameters
│   ├── staging.bicepparam  # Staging parameters
│   └── prod.bicepparam     # Production parameters
├── modules/
│   ├── container-apps.bicep    # Container Apps environment + apps
│   ├── container-registry.bicep # ACR for Docker images
│   ├── database.bicep          # PostgreSQL Flexible Server
│   ├── redis.bicep             # Azure Cache for Redis
│   ├── front-door.bicep        # Azure Front Door + WAF
│   ├── key-vault.bicep         # Key Vault + secrets
│   ├── storage.bicep           # Blob Storage for documents
│   ├── monitoring.bicep        # App Insights + Log Analytics
│   └── networking.bicep        # VNet, subnets, NSGs
└── scripts/
    ├── deploy.sh               # Deployment automation script
    └── teardown.sh             # Resource cleanup script
```

### Module Dependencies

```
networking.bicep
    ├── database.bicep
    ├── redis.bicep
    ├── key-vault.bicep
    │       └── container-apps.bicep
    ├── storage.bicep
    ├── container-registry.bicep
    │       └── container-apps.bicep
    └── monitoring.bicep
            └── container-apps.bicep

front-door.bicep ← container-apps.bicep (needs app FQDN)
```

### Key Parameters

| Parameter | Type | Default | Description |
|---|---|---|---|
| `environmentName` | string | `dev` | Deployment environment (`dev`, `staging`, `prod`) |
| `location` | string | `eastus` | Azure region |
| `projectName` | string | `procgenie` | Base name for all resources |
| `dbAdminPassword` | secureString | -- | PostgreSQL admin password |
| `redisPassword` | secureString | -- | Redis auth password |
| `jwtSecret` | secureString | -- | JWT signing key |
| `azureOpenAiApiKey` | secureString | -- | Azure OpenAI API key |
| `azureOpenAiEndpoint` | string | -- | Azure OpenAI endpoint URL |
| `azureOpenAiDeploymentName` | string | `gpt-4o` | Azure OpenAI model deployment name |
| `customDomainApi` | string | `api.procgenie.io` | Custom domain for API |
| `customDomainWeb` | string | `app.procgenie.io` | Custom domain for frontend |
| `alertEmailAddress` | string | -- | Email for monitoring alerts |
| `dbSkuName` | string | `Standard_B2ms` | PostgreSQL compute tier |
| `dbStorageSizeGB` | int | `128` | PostgreSQL storage size |
| `redisSkuName` | string | `Basic` | Redis tier |
| `redisCacheSize` | int | `1` | Redis cache size (C1 = 1GB) |

## 3. Step-by-Step Deployment

### Step 1: Clone the Repository

```bash
git clone https://github.com/procgenie/procgenie.git
cd procgenie
```

### Step 2: Authenticate with Azure

```bash
az login
az account set --subscription "<your-subscription-id>"
```

### Step 3: Register Required Providers

```bash
az provider register --namespace Microsoft.App
az provider register --namespace Microsoft.ContainerRegistry
az provider register --namespace Microsoft.DBforPostgreSQL
az provider register --namespace Microsoft.Cache
az provider register --namespace Microsoft.Cdn
az provider register --namespace Microsoft.KeyVault
az provider register --namespace Microsoft.Storage
az provider register --namespace Microsoft.Insights
```

### Step 4: Create Resource Group

```bash
RESOURCE_GROUP="rg-procgenie-prod"
LOCATION="eastus"

az group create \
  --name $RESOURCE_GROUP \
  --location $LOCATION \
  --tags project=procgenie environment=production
```

### Step 5: Deploy Infrastructure with Bicep

```bash
az deployment group create \
  --resource-group $RESOURCE_GROUP \
  --template-file infrastructure/bicep/main.bicep \
  --parameters infrastructure/bicep/parameters/prod.bicepparam \
  --parameters \
    dbAdminPassword="<strong-password>" \
    redisPassword="<strong-password>" \
    jwtSecret="<random-256-bit-key>" \
    azureOpenAiApiKey="<your-azure-openai-key>" \
    azureOpenAiEndpoint="https://westus.api.cognitive.microsoft.com/" \
    azureOpenAiDeploymentName="gpt-4o" \
    alertEmailAddress="ops@yourcompany.com"
```

Deployment takes approximately 15--25 minutes. Monitor progress:

```bash
az deployment group show \
  --resource-group $RESOURCE_GROUP \
  --name main \
  --query properties.provisioningState
```

### Step 6: Build and Push Docker Images

```bash
# Get ACR login server
ACR_NAME=$(az acr list -g $RESOURCE_GROUP --query "[0].name" -o tsv)
ACR_LOGIN=$(az acr show -n $ACR_NAME --query loginServer -o tsv)

# Authenticate Docker with ACR
az acr login --name $ACR_NAME

# Build and push API image
docker build -t $ACR_LOGIN/procgenie-api:latest \
  --target runner \
  -f apps/api/Dockerfile .
docker push $ACR_LOGIN/procgenie-api:latest

# Build and push Web image
docker build -t $ACR_LOGIN/procgenie-web:latest \
  --target runner \
  -f apps/web/Dockerfile .
docker push $ACR_LOGIN/procgenie-web:latest
```

### Step 7: Run Database Migrations

```bash
# Get database connection string from Key Vault
DB_URL=$(az keyvault secret show \
  --vault-name "kv-procgenie-prod" \
  --name "database-url" \
  --query value -o tsv)

# Run migrations
DATABASE_URL=$DB_URL npm run db:migrate
```

### Step 8: Verify Deployment

```bash
# Check Container App status
az containerapp show \
  --resource-group $RESOURCE_GROUP \
  --name "ca-procgenie-api" \
  --query "properties.runningStatus"

# Test health endpoint
API_URL=$(az containerapp show \
  --resource-group $RESOURCE_GROUP \
  --name "ca-procgenie-api" \
  --query "properties.configuration.ingress.fqdn" -o tsv)

curl https://$API_URL/api/v1/health
```

## 4. SSL and Custom Domain Setup

### Option A: Azure-Managed Certificate (Recommended)

```bash
# Add custom domain to Front Door
az afd custom-domain create \
  --resource-group $RESOURCE_GROUP \
  --profile-name "fd-procgenie-prod" \
  --custom-domain-name "api-domain" \
  --host-name "api.procgenie.io" \
  --certificate-type "ManagedCertificate"

az afd custom-domain create \
  --resource-group $RESOURCE_GROUP \
  --profile-name "fd-procgenie-prod" \
  --custom-domain-name "app-domain" \
  --host-name "app.procgenie.io" \
  --certificate-type "ManagedCertificate"
```

### Option B: Bring Your Own Certificate

```bash
# Upload certificate to Key Vault
az keyvault certificate import \
  --vault-name "kv-procgenie-prod" \
  --name "procgenie-tls" \
  --file ./certs/procgenie.pfx \
  --password "<cert-password>"

# Reference in Front Door
az afd custom-domain create \
  --resource-group $RESOURCE_GROUP \
  --profile-name "fd-procgenie-prod" \
  --custom-domain-name "api-domain" \
  --host-name "api.procgenie.io" \
  --certificate-type "CustomerCertificate" \
  --secret "procgenie-tls"
```

### DNS Configuration

Add the following DNS records at your domain registrar:

| Record Type | Host | Value | TTL |
|---|---|---|---|
| CNAME | `api.procgenie.io` | `fd-procgenie-prod.azurefd.net` | 3600 |
| CNAME | `app.procgenie.io` | `fd-procgenie-prod.azurefd.net` | 3600 |
| TXT | `_dnsauth.api.procgenie.io` | `<validation-token>` | 3600 |
| TXT | `_dnsauth.app.procgenie.io` | `<validation-token>` | 3600 |

## 5. Monitoring Setup

### Application Insights

Application Insights is automatically configured by the Bicep deployment. Key dashboards:

| Dashboard | Purpose |
|---|---|
| Application Map | Service dependency visualization |
| Live Metrics | Real-time request rate, failures, performance |
| Failures | Exception tracking and failure analysis |
| Performance | Response time percentiles, slow operations |
| Users | Active sessions, user flow analysis |

### Alert Rules (Pre-Configured)

| Alert | Condition | Severity | Action |
|---|---|---|---|
| High Error Rate | Error rate > 5% over 5 min | Sev 1 (Critical) | Email + PagerDuty |
| Slow API Response | P95 latency > 2s over 5 min | Sev 2 (Warning) | Email |
| Database CPU | CPU > 80% over 10 min | Sev 2 (Warning) | Email |
| Redis Memory | Memory > 85% of limit | Sev 2 (Warning) | Email |
| Container Restart | Container restart count > 3 in 10 min | Sev 1 (Critical) | Email + PagerDuty |
| SSL Cert Expiry | Certificate expires within 30 days | Sev 3 (Info) | Email |
| Disk Usage | Storage > 85% capacity | Sev 2 (Warning) | Email |

### Log Queries (KQL)

**Recent API errors:**
```kql
AppRequests
| where Success == false
| where TimeGenerated > ago(1h)
| summarize ErrorCount=count() by OperationName, ResultCode
| order by ErrorCount desc
```

**Slow queries:**
```kql
AppDependencies
| where DependencyType == "SQL"
| where DurationMs > 1000
| project TimeGenerated, Name, DurationMs, Data
| order by DurationMs desc
```

## 6. Scaling Configuration

### Container Apps Auto-Scaling

The Bicep templates configure HTTP-based and CPU-based auto-scaling:

| Service | Min Replicas | Max Replicas | Scale Trigger |
|---|---|---|---|
| Web (Next.js) | 2 | 10 | HTTP: 100 concurrent requests |
| API (NestJS) | 2 | 20 | HTTP: 50 concurrent requests; CPU > 70% |

### Database Scaling

| Tier | vCores | Memory | Storage | Max Connections | Use Case |
|---|---|---|---|---|---|
| Burstable B2ms | 2 | 8 GB | 128 GB | 200 | Development, low traffic |
| General Purpose D4ds_v4 | 4 | 16 GB | 512 GB | 400 | Standard production |
| General Purpose D8ds_v4 | 8 | 32 GB | 1 TB | 800 | High traffic |
| Memory Optimized E4ds_v4 | 4 | 32 GB | 512 GB | 400 | Analytics-heavy workloads |

Scale database tier:
```bash
az postgres flexible-server update \
  --resource-group $RESOURCE_GROUP \
  --name "psql-procgenie-prod" \
  --sku-name "Standard_D4ds_v4" \
  --storage-size 512
```

### Redis Scaling

| Tier | Size | Memory | Connections | Use Case |
|---|---|---|---|---|
| Basic C1 | 1 GB | 1 GB | 256 | Development |
| Standard C2 | 6 GB | 6 GB | 2,000 | Standard production |
| Premium P1 | 6 GB | 6 GB | 7,500 | High availability (clustering) |
| Premium P3 | 26 GB | 26 GB | 20,000 | Large-scale production |

## 7. Cost Estimates

### Development Environment

| Resource | SKU | Monthly Cost (USD) |
|---|---|---|
| Container Apps (2 apps, low traffic) | Consumption | ~$15 |
| Container Registry | Basic | ~$5 |
| PostgreSQL Flexible Server | Burstable B2ms | ~$50 |
| Azure Cache for Redis | Basic C1 | ~$25 |
| Key Vault | Standard (low operations) | ~$1 |
| Blob Storage | Standard LRS (10 GB) | ~$1 |
| Application Insights | 1 GB/day ingest | ~$5 |
| Log Analytics | 1 GB/day ingest | ~$5 |
| **Total (Development)** | | **~$107/month** |

### Production Environment

| Resource | SKU | Monthly Cost (USD) |
|---|---|---|
| Container Apps (4 apps, moderate traffic) | Consumption | ~$120 |
| Container Registry | Standard | ~$20 |
| PostgreSQL Flexible Server | General Purpose D4ds_v4 | ~$280 |
| Azure Cache for Redis | Standard C2 | ~$180 |
| Azure Front Door | Standard | ~$35 + traffic |
| Key Vault | Standard | ~$5 |
| Blob Storage | Standard LRS (100 GB) | ~$5 |
| Application Insights | 5 GB/day ingest | ~$15 |
| Log Analytics | 5 GB/day ingest | ~$15 |
| **Total (Production)** | | **~$675/month** |

### Enterprise Production Environment

| Resource | SKU | Monthly Cost (USD) |
|---|---|---|
| Container Apps (8 apps, high traffic) | Consumption | ~$500 |
| Container Registry | Premium (geo-replicated) | ~$170 |
| PostgreSQL Flexible Server | GP D8ds_v4 + HA | ~$850 |
| Azure Cache for Redis | Premium P1 (clustered) | ~$450 |
| Azure Front Door | Premium (WAF + bot protection) | ~$330 + traffic |
| Key Vault | Premium (HSM-backed) | ~$50 |
| Blob Storage | Standard GRS (500 GB) | ~$25 |
| Application Insights | 20 GB/day ingest | ~$60 |
| Log Analytics | 20 GB/day ingest | ~$60 |
| **Total (Enterprise)** | | **~$2,495/month** |

> **Note:** Costs are estimates based on Azure pricing as of February 2026. Actual costs vary based on usage, region, and reserved instance commitments. Reserved instances for PostgreSQL and Redis can reduce costs by 30--50%.

## 8. Post-Deployment Tasks

1. **Run database seed data** -- Load initial categories, templates, and default tenant configuration
2. **Configure SSO** -- Set up Azure AD application registration and redirect URIs
3. **Import clause library** -- Load standard contract clause templates
4. **Set up backup schedule** -- Configure PostgreSQL automated backups (7-day retention minimum)
5. **Configure monitoring alerts** -- Verify alert destinations (email, PagerDuty, Slack webhook)
6. **Load test** -- Run load tests against the staging environment before production launch
7. **Security scan** -- Run OWASP ZAP or similar tool against the deployed application
8. **DNS propagation** -- Verify custom domain DNS propagation (can take up to 48 hours)
