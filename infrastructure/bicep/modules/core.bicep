// =============================================================================
// ProcGenie - Core Infrastructure Module
// Managed Identity, Log Analytics, VNet, ACR, Key Vault
// =============================================================================

param location string
param tags object
param identityName string
param logAnalyticsName string
param vnetName string
param acrName string
param keyVaultName string

// =============================================================================
// Managed Identity
// =============================================================================

resource managedIdentity 'Microsoft.ManagedIdentity/userAssignedIdentities@2023-01-31' = {
  name: identityName
  location: location
  tags: tags
}

// =============================================================================
// Log Analytics Workspace
// =============================================================================

resource logAnalytics 'Microsoft.OperationalInsights/workspaces@2023-09-01' = {
  name: logAnalyticsName
  location: location
  tags: tags
  properties: {
    sku: {
      name: 'PerGB2018'
    }
    retentionInDays: 30
    features: {
      enableLogAccessUsingOnlyResourcePermissions: true
    }
    workspaceCapping: {
      dailyQuotaGb: 1
    }
  }
}

// =============================================================================
// Virtual Network
// =============================================================================

resource vnet 'Microsoft.Network/virtualNetworks@2024-01-01' = {
  name: vnetName
  location: location
  tags: tags
  properties: {
    addressSpace: {
      addressPrefixes: [
        '10.0.0.0/16'
      ]
    }
    subnets: [
      {
        name: 'snet-apps'
        properties: {
          addressPrefix: '10.0.0.0/21'
          delegations: [
            {
              name: 'Microsoft.App.environments'
              properties: {
                serviceName: 'Microsoft.App/environments'
              }
            }
          ]
        }
      }
      {
        name: 'snet-data'
        properties: {
          addressPrefix: '10.0.8.0/24'
          delegations: [
            {
              name: 'Microsoft.DBforPostgreSQL.flexibleServers'
              properties: {
                serviceName: 'Microsoft.DBforPostgreSQL/flexibleServers'
              }
            }
          ]
          serviceEndpoints: [
            {
              service: 'Microsoft.Storage'
            }
          ]
        }
      }
      {
        name: 'snet-private-endpoints'
        properties: {
          addressPrefix: '10.0.9.0/24'
          privateEndpointNetworkPolicies: 'Disabled'
        }
      }
    ]
  }
}

// =============================================================================
// Azure Container Registry
// =============================================================================

resource acr 'Microsoft.ContainerRegistry/registries@2023-11-01-preview' = {
  name: acrName
  location: location
  tags: tags
  sku: {
    name: 'Basic'
  }
  properties: {
    adminUserEnabled: true
    publicNetworkAccess: 'Enabled'
    policies: {
      retentionPolicy: {
        status: 'enabled'
        days: 30
      }
    }
  }
}

// Grant the managed identity AcrPull role on the container registry
resource acrPullRole 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
  name: guid(acr.id, managedIdentity.id, 'acrpull')
  scope: acr
  properties: {
    roleDefinitionId: subscriptionResourceId('Microsoft.Authorization/roleDefinitions', '7f951dda-4ed3-4680-a7ca-43fe172d538d') // AcrPull
    principalId: managedIdentity.properties.principalId
    principalType: 'ServicePrincipal'
  }
}

// =============================================================================
// Azure Key Vault
// =============================================================================

resource keyVault 'Microsoft.KeyVault/vaults@2023-07-01' = {
  name: keyVaultName
  location: location
  tags: tags
  properties: {
    tenantId: subscription().tenantId
    sku: {
      family: 'A'
      name: 'standard'
    }
    enableRbacAuthorization: true
    enableSoftDelete: true
    softDeleteRetentionInDays: 7
    enablePurgeProtection: false  // Set to true in production
    publicNetworkAccess: 'Enabled'
    networkAcls: {
      defaultAction: 'Allow'
      bypass: 'AzureServices'
    }
  }
}

// =============================================================================
// Outputs
// =============================================================================

output identityId string = managedIdentity.id
output identityClientId string = managedIdentity.properties.clientId
output identityPrincipalId string = managedIdentity.properties.principalId
output logAnalyticsId string = logAnalytics.id
output logAnalyticsCustomerId string = logAnalytics.properties.customerId
output logAnalyticsKey string = logAnalytics.listKeys().primarySharedKey
output vnetId string = vnet.id
output appsSubnetId string = vnet.properties.subnets[0].id
output dataSubnetId string = vnet.properties.subnets[1].id
output privateEndpointSubnetId string = vnet.properties.subnets[2].id
output acrLoginServer string = acr.properties.loginServer
output acrName string = acr.name
output keyVaultUri string = keyVault.properties.vaultUri
output keyVaultName string = keyVault.name
