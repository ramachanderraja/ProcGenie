// =============================================================================
// ProcGenie S2P Platform - Azure Infrastructure (Bicep)
// =============================================================================
// Deploys: ACR, Container Apps, PostgreSQL, Redis, Key Vault, Front Door
// Usage:  az deployment sub create --location eastus --template-file main.bicep
// =============================================================================

targetScope = 'subscription'

// =============================================================================
// Parameters
// =============================================================================

@description('Name of the project')
param projectName string = 'procgenie'

@description('Environment name (dev, staging, prod)')
@allowed(['dev', 'staging', 'prod'])
param environment string = 'dev'

@description('Primary Azure region for all resources')
param location string = 'eastus'

@description('PostgreSQL administrator login')
param postgresAdminLogin string = 'pgadmin'

@description('PostgreSQL administrator password')
@secure()
param postgresAdminPassword string

@description('JWT secret for API authentication')
@secure()
param jwtSecret string

@description('JWT refresh secret for API authentication')
@secure()
param jwtRefreshSecret string

@description('Anthropic API key for Claude AI integration')
@secure()
param anthropicApiKey string

@description('Tags applied to all resources')
param tags object = {
  project: 'procgenie'
  managedBy: 'bicep'
}

// =============================================================================
// Variables
// =============================================================================

var resourcePrefix = '${projectName}-${environment}'
var resourceGroupName = 'rg-${resourcePrefix}'
var acrName = replace('acr${resourcePrefix}', '-', '')
var logAnalyticsName = 'log-${resourcePrefix}'
var containerEnvName = 'cae-${resourcePrefix}'
var webAppName = 'ca-${resourcePrefix}-web'
var apiAppName = 'ca-${resourcePrefix}-api'
var postgresServerName = 'psql-${resourcePrefix}'
var redisName = 'redis-${resourcePrefix}'
var keyVaultName = 'kv-${resourcePrefix}'
var frontDoorName = 'fd-${resourcePrefix}'
var identityName = 'id-${resourcePrefix}'
var vnetName = 'vnet-${resourcePrefix}'

var allTags = union(tags, {
  environment: environment
})

// =============================================================================
// Resource Group
// =============================================================================

resource resourceGroup 'Microsoft.Resources/resourceGroups@2024-03-01' = {
  name: resourceGroupName
  location: location
  tags: allTags
}

// =============================================================================
// Module: Core Infrastructure
// =============================================================================

module coreInfra 'modules/core.bicep' = {
  name: 'core-infrastructure'
  scope: resourceGroup
  params: {
    location: location
    tags: allTags
    identityName: identityName
    logAnalyticsName: logAnalyticsName
    vnetName: vnetName
    acrName: acrName
    keyVaultName: keyVaultName
  }
}

// =============================================================================
// Module: Data Services (PostgreSQL + Redis)
// =============================================================================

module dataServices 'modules/data.bicep' = {
  name: 'data-services'
  scope: resourceGroup
  params: {
    location: location
    tags: allTags
    postgresServerName: postgresServerName
    postgresAdminLogin: postgresAdminLogin
    postgresAdminPassword: postgresAdminPassword
    redisName: redisName
    vnetId: coreInfra.outputs.vnetId
    dataSubnetId: coreInfra.outputs.dataSubnetId
    keyVaultName: keyVaultName
    projectName: projectName
    environment: environment
  }
  dependsOn: [coreInfra]
}

// =============================================================================
// Module: Container Apps (Web + API)
// =============================================================================

module containerApps 'modules/containers.bicep' = {
  name: 'container-apps'
  scope: resourceGroup
  params: {
    location: location
    tags: allTags
    containerEnvName: containerEnvName
    webAppName: webAppName
    apiAppName: apiAppName
    logAnalyticsId: coreInfra.outputs.logAnalyticsId
    appsSubnetId: coreInfra.outputs.appsSubnetId
    acrLoginServer: coreInfra.outputs.acrLoginServer
    identityId: coreInfra.outputs.identityId
    identityClientId: coreInfra.outputs.identityClientId
    postgresHost: dataServices.outputs.postgresHost
    postgresDatabase: '${projectName}_${environment}'
    postgresAdminLogin: postgresAdminLogin
    postgresAdminPassword: postgresAdminPassword
    redisHost: dataServices.outputs.redisHost
    redisPort: dataServices.outputs.redisPort
    redisAccessKey: dataServices.outputs.redisAccessKey
    jwtSecret: jwtSecret
    jwtRefreshSecret: jwtRefreshSecret
    anthropicApiKey: anthropicApiKey
    environment: environment
  }
  dependsOn: [coreInfra, dataServices]
}

// =============================================================================
// Module: Front Door (CDN + WAF)
// =============================================================================

module frontDoor 'modules/frontdoor.bicep' = {
  name: 'front-door'
  scope: resourceGroup
  params: {
    location: 'global'
    tags: allTags
    frontDoorName: frontDoorName
    webAppFqdn: containerApps.outputs.webFqdn
    apiAppFqdn: containerApps.outputs.apiFqdn
  }
  dependsOn: [containerApps]
}

// =============================================================================
// Key Vault Secrets
// =============================================================================

module secrets 'modules/secrets.bicep' = {
  name: 'key-vault-secrets'
  scope: resourceGroup
  params: {
    keyVaultName: keyVaultName
    secrets: {
      'postgres-connection-string': dataServices.outputs.postgresConnectionString
      'redis-connection-string': dataServices.outputs.redisConnectionString
      'jwt-secret': jwtSecret
      'jwt-refresh-secret': jwtRefreshSecret
      'anthropic-api-key': anthropicApiKey
    }
    identityPrincipalId: coreInfra.outputs.identityPrincipalId
  }
  dependsOn: [coreInfra, dataServices]
}

// =============================================================================
// Outputs
// =============================================================================

output resourceGroupName string = resourceGroupName
output webUrl string = 'https://${containerApps.outputs.webFqdn}'
output apiUrl string = 'https://${containerApps.outputs.apiFqdn}'
output acrLoginServer string = coreInfra.outputs.acrLoginServer
output frontDoorEndpoint string = frontDoor.outputs.frontDoorEndpoint
output keyVaultUri string = coreInfra.outputs.keyVaultUri
output postgresHost string = dataServices.outputs.postgresHost
output redisHost string = dataServices.outputs.redisHost
