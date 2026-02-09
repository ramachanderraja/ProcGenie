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
// Secrets (access policies configured in core.bicep)
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
