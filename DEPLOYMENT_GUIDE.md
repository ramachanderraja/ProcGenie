# ProcGenie Azure Deployment Guide

## Quick Start

This guide deploys ProcGenie S2P Orchestration Platform to Azure Container Apps. Estimated time: 30-45 minutes.

---

## Prerequisites

### 1. Install Required Tools

```bash
az --version          # Azure CLI 2.55+
docker --version      # Docker 24+
node --version        # Node.js 20+
jq --version          # jq 1.6+
git --version         # Git 2.40+
```

### 2. Azure Setup

```bash
# Login to Azure
az login

# Set your subscription (GEPRnD)
az account set --subscription "6cfdb802-f41a-41fe-b648-e1806b6adee9"

# Register required providers
az provider register --namespace Microsoft.App
az provider register --namespace Microsoft.ContainerRegistry
az provider register --namespace Microsoft.DBforPostgreSQL
az provider register --namespace Microsoft.Cache
az provider register --namespace Microsoft.Cdn
az provider register --namespace Microsoft.KeyVault
```

### 3. Prepare Environment Variables

Create a `.env.deploy` file in the project root:

```bash
cat > .env.deploy << 'EOF'
# Required Secrets
export POSTGRES_ADMIN_PASSWORD="$(openssl rand -base64 24)"
export JWT_SECRET="$(openssl rand -base64 32)"
export JWT_REFRESH_SECRET="$(openssl rand -base64 32)"

# Azure OpenAI (retrieve from sourceai-dev-rg)
export AZURE_OPENAI_API_KEY="$(az cognitiveservices account keys list \
  --name sourceai-dev-oai-k8nq50 \
  --resource-group sourceai-dev-rg \
  --query key1 -o tsv)"
export AZURE_OPENAI_ENDPOINT="https://westus.api.cognitive.microsoft.com/"
export AZURE_OPENAI_DEPLOYMENT_NAME="gpt-4o"

# Configuration
export ENVIRONMENT="dev"
export LOCATION="westus2"            # IMPORTANT: eastus is restricted by GEP policy
export PROJECT_NAME="procgenie"
EOF

source .env.deploy
```

> **GEP Policy Note**: The `eastus` region is restricted. Always use `westus2`.

---

## Automated Deployment (Recommended)

### Step 1: Run the Deployment Script

```bash
cd infrastructure/scripts
chmod +x deploy.sh
./deploy.sh --env dev --location westus2
```

### Step 2: Monitor Deployment

The script will:
1. Validate prerequisites and secrets
2. Create resource group with required GEP tags (`documentTeam`, `projectName`)
3. Deploy Azure infrastructure via Bicep (15-20 minutes)
4. Build Docker images (web + API)
5. Push images to Azure Container Registry
6. Update Container Apps with new images
7. Run database migrations
8. Verify health endpoints

### Step 3: Access Your Deployment

```
Deployment Summary
==================
  Environment:       dev
  Resource Group:    rg-procgenie-dev
  Image Tag:         abc123f

  Service URLs:
    Web App:   https://ca-procgenie-dev-web.happypond-9a781889.westus2.azurecontainerapps.io
    API App:   https://ca-procgenie-dev-api.happypond-9a781889.westus2.azurecontainerapps.io
    ACR:       acrprocgeniedev.azurecr.io
```

---

## CI/CD (Automatic Deployments via GitHub Actions)

Once deployed, every push to `main` automatically:
1. Builds Docker images for web and API
2. Pushes to ACR with commit SHA + `latest` tags
3. Runs smoke tests against live Container Apps
4. Posts deployment summary

### GitHub Secrets Required

| Secret | Description | How to Get |
|--------|-------------|------------|
| `ACR_USERNAME` | ACR admin username | `az acr credential show --name acrprocgeniedev --query username -o tsv` |
| `ACR_PASSWORD` | ACR admin password | `az acr credential show --name acrprocgeniedev --query 'passwords[0].value' -o tsv` |

> **Note**: The deploy workflow does NOT require `AZURE_CREDENTIALS`. It uses only ACR admin credentials for image push and hardcoded Container App FQDNs for smoke tests. This avoids the need for a service principal with Azure role assignments (which requires Owner access we don't have under GEP's Contributor-only policy).

### Triggering Manual Deployment

```bash
# Via GitHub CLI
gh workflow run deploy.yml --field environment=dev

# Or push to main branch
git push origin main
```

---

## Manual Step-by-Step Deployment

### Step 1: Create Resource Group

```bash
RESOURCE_GROUP="rg-procgenie-dev"
LOCATION="westus2"

az group create \
  --name $RESOURCE_GROUP \
  --location $LOCATION \
  --tags project=procgenie environment=dev managedBy=bicep \
    documentTeam=Architecture projectName=IT \
    Owner=RRamachander Department=R-and-D CostCenter=GEPRnD
```

### Step 2: Deploy Infrastructure

```bash
# IMPORTANT: Use subscription-level deployment (not resource group level)
az deployment sub create \
  --name "procgenie-dev-$(date +%Y%m%d%H%M%S)" \
  --location $LOCATION \
  --template-file infrastructure/bicep/main.bicep \
  --parameters \
    projectName="procgenie" \
    environment="dev" \
    location="$LOCATION" \
    postgresAdminPassword="$POSTGRES_ADMIN_PASSWORD" \
    jwtSecret="$JWT_SECRET" \
    jwtRefreshSecret="$JWT_REFRESH_SECRET" \
    azureOpenAiApiKey="$AZURE_OPENAI_API_KEY" \
    azureOpenAiEndpoint="$AZURE_OPENAI_ENDPOINT" \
    azureOpenAiDeploymentName="$AZURE_OPENAI_DEPLOYMENT_NAME"
```

This deploys:
- Azure Container Apps Environment + 2 Container Apps (web, API)
- Azure Container Registry (Basic SKU)
- PostgreSQL Flexible Server (Burstable B1ms) with VNet integration
- Azure Cache for Redis (Basic C0)
- Azure Key Vault (private network access)
- Azure Front Door
- Virtual Network with subnets
- Managed Identity
- Log Analytics Workspace

### Step 3: Build and Push Docker Images

```bash
ACR_NAME="acrprocgeniedev"
ACR_LOGIN_SERVER="${ACR_NAME}.azurecr.io"

# Login to ACR
az acr login --name $ACR_NAME

# Build and push web image (from project root)
docker build -t $ACR_LOGIN_SERVER/procgenie-web:latest -f apps/web/Dockerfile .
docker push $ACR_LOGIN_SERVER/procgenie-web:latest

# Build and push API image
docker build -t $ACR_LOGIN_SERVER/procgenie-api:latest -f apps/api/Dockerfile .
docker push $ACR_LOGIN_SERVER/procgenie-api:latest
```

### Step 4: Update Container Apps

```bash
az containerapp update \
  --name "ca-procgenie-dev-web" \
  --resource-group $RESOURCE_GROUP \
  --image $ACR_LOGIN_SERVER/procgenie-web:latest

az containerapp update \
  --name "ca-procgenie-dev-api" \
  --resource-group $RESOURCE_GROUP \
  --image $ACR_LOGIN_SERVER/procgenie-api:latest
```

### Step 5: Verify Deployment

```bash
WEB_URL=$(az containerapp show \
  --name "ca-procgenie-dev-web" \
  --resource-group $RESOURCE_GROUP \
  --query "properties.configuration.ingress.fqdn" -o tsv)

API_URL=$(az containerapp show \
  --name "ca-procgenie-dev-api" \
  --resource-group $RESOURCE_GROUP \
  --query "properties.configuration.ingress.fqdn" -o tsv)

curl https://$API_URL/api/v1/health
curl https://$WEB_URL

echo "Web: https://$WEB_URL"
echo "API: https://$API_URL"
```

---

## Troubleshooting

### Key Vault Already Exists (Soft-Deleted)

If you deleted and are redeploying, the Key Vault may be soft-deleted:

```bash
az keyvault purge --name kv-procgenie-dev
```

### Container App Not Starting

```bash
# Check container logs
az containerapp logs show \
  --name "ca-procgenie-dev-api" \
  --resource-group rg-procgenie-dev \
  --tail 100

# Check revision status
az containerapp revision list \
  --name "ca-procgenie-dev-api" \
  --resource-group rg-procgenie-dev \
  -o table
```

### Docker Build Fails

Common issues:
- **npm workspace hoisting**: Dependencies are in root `node_modules`, not per-workspace. Dockerfiles must copy from root.
- **TypeScript strict errors**: API Dockerfile uses `npx tsc --noCheck` to bypass strict mode errors.
- **`@azure/openai` version**: Use `^2.0.0`, not `^2.1.0`.

### Git Bash Path Mangling (Windows)

Azure CLI paths starting with `/subscriptions/` get converted to Windows paths:
```bash
# Wrong (Git Bash mangles the path):
az role assignment create --scope /subscriptions/...

# Correct:
MSYS_NO_PATHCONV=1 az role assignment create --scope /subscriptions/...
```

### PostgreSQL Firewall Rule Conflicts

VNet-integrated PostgreSQL does NOT support firewall rules. If you see errors, remove any `firewallRules` resources from Bicep templates.

### ESLint 9 + Legacy Config

The project uses `.eslintrc.json` (legacy format) with ESLint 9. Set `ESLINT_USE_FLAT_CONFIG=false` in CI.

---

## Cleanup

```bash
# Delete entire resource group (takes 5-10 minutes)
az group delete --name rg-procgenie-dev --yes --no-wait

# IMPORTANT: Also purge the soft-deleted Key Vault if you plan to redeploy
az keyvault purge --name kv-procgenie-dev
```

---

## Azure Resources (Current Dev Environment)

| Resource | Name | Type |
|----------|------|------|
| Resource Group | `rg-procgenie-dev` | Microsoft.Resources/resourceGroups |
| Container Registry | `acrprocgeniedev` | Microsoft.ContainerRegistry/registries |
| Container App Env | `cae-procgenie-dev` | Microsoft.App/managedEnvironments |
| Web Container App | `ca-procgenie-dev-web` | Microsoft.App/containerApps |
| API Container App | `ca-procgenie-dev-api` | Microsoft.App/containerApps |
| PostgreSQL | `psql-procgenie-dev` | Microsoft.DBforPostgreSQL/flexibleServers |
| Redis | `redis-procgenie-dev` | Microsoft.Cache/Redis |
| Key Vault | `kv-procgenie-dev` | Microsoft.KeyVault/vaults |
| VNet | `vnet-procgenie-dev` | Microsoft.Network/virtualNetworks |
| Front Door | `fd-procgenie-dev` | Microsoft.Cdn/profiles |
| Managed Identity | `id-procgenie-dev` | Microsoft.ManagedIdentity/userAssignedIdentities |
| Log Analytics | `log-procgenie-dev` | Microsoft.OperationalInsights/workspaces |
