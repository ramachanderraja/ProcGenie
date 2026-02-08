// =============================================================================
// ProcGenie - Key Vault Secrets Module
// =============================================================================

param keyVaultName string
param secrets object
param identityPrincipalId string

// =============================================================================
// Reference existing Key Vault
// =============================================================================

resource keyVault 'Microsoft.KeyVault/vaults@2023-07-01' existing = {
  name: keyVaultName
}

// =============================================================================
// RBAC: Grant managed identity Key Vault Secrets User role
// =============================================================================

resource kvSecretsUserRole 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
  name: guid(keyVault.id, identityPrincipalId, 'kv-secrets-user')
  scope: keyVault
  properties: {
    roleDefinitionId: subscriptionResourceId('Microsoft.Authorization/roleDefinitions', '4633458b-17de-408a-b874-0445c86b69e6') // Key Vault Secrets User
    principalId: identityPrincipalId
    principalType: 'ServicePrincipal'
  }
}

// =============================================================================
// Secrets
// =============================================================================

resource kvSecrets 'Microsoft.KeyVault/vaults/secrets@2023-07-01' = [
  for secret in items(secrets): {
    parent: keyVault
    name: secret.key
    properties: {
      value: secret.value
      attributes: {
        enabled: true
      }
    }
  }
]
