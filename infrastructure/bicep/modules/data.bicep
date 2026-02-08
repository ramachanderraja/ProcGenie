// =============================================================================
// ProcGenie - Data Services Module
// Azure Database for PostgreSQL Flexible Server + Azure Cache for Redis
// =============================================================================

param location string
param tags object
param postgresServerName string
param postgresAdminLogin string
@secure()
param postgresAdminPassword string
param redisName string
param vnetId string
param dataSubnetId string
param keyVaultName string
param projectName string
param environment string

// =============================================================================
// Private DNS Zone for PostgreSQL
// =============================================================================

resource postgresDnsZone 'Microsoft.Network/privateDnsZones@2020-06-01' = {
  name: '${postgresServerName}.private.postgres.database.azure.com'
  location: 'global'
  tags: tags

  resource vnetLink 'virtualNetworkLinks' = {
    name: '${postgresServerName}-vnet-link'
    location: 'global'
    properties: {
      registrationEnabled: false
      virtualNetwork: {
        id: vnetId
      }
    }
  }
}

// =============================================================================
// Azure Database for PostgreSQL Flexible Server
// =============================================================================

resource postgresServer 'Microsoft.DBforPostgreSQL/flexibleServers@2023-12-01-preview' = {
  name: postgresServerName
  location: location
  tags: tags
  sku: {
    name: 'Standard_B1ms'
    tier: 'Burstable'
  }
  properties: {
    version: '16'
    administratorLogin: postgresAdminLogin
    administratorLoginPassword: postgresAdminPassword
    storage: {
      storageSizeGB: 32
      autoGrow: 'Enabled'
    }
    backup: {
      backupRetentionDays: 7
      geoRedundantBackup: 'Disabled'
    }
    network: {
      delegatedSubnetResourceId: dataSubnetId
      privateDnsZoneArmResourceId: postgresDnsZone.id
    }
    highAvailability: {
      mode: 'Disabled'
    }
    maintenanceWindow: {
      customWindow: 'Enabled'
      dayOfWeek: 0
      startHour: 2
      startMinute: 0
    }
  }
}

// PostgreSQL database
resource postgresDatabase 'Microsoft.DBforPostgreSQL/flexibleServers/databases@2023-12-01-preview' = {
  parent: postgresServer
  name: '${projectName}_${environment}'
  properties: {
    charset: 'UTF8'
    collation: 'en_US.utf8'
  }
}

// PostgreSQL configuration - enable extensions
resource pgExtensions 'Microsoft.DBforPostgreSQL/flexibleServers/configurations@2023-12-01-preview' = {
  parent: postgresServer
  name: 'azure.extensions'
  properties: {
    value: 'UUID-OSSP,PGCRYPTO'
    source: 'user-override'
  }
}

// PostgreSQL firewall rule - allow Azure services
resource pgFirewallAzure 'Microsoft.DBforPostgreSQL/flexibleServers/firewallRules@2023-12-01-preview' = {
  parent: postgresServer
  name: 'AllowAzureServices'
  properties: {
    startIpAddress: '0.0.0.0'
    endIpAddress: '0.0.0.0'
  }
}

// =============================================================================
// Azure Cache for Redis
// =============================================================================

resource redisCache 'Microsoft.Cache/redis@2024-03-01' = {
  name: redisName
  location: location
  tags: tags
  properties: {
    sku: {
      name: 'Basic'
      family: 'C'
      capacity: 0
    }
    enableNonSslPort: false
    minimumTlsVersion: '1.2'
    redisConfiguration: {
      'maxmemory-policy': 'allkeys-lru'
      'maxmemory-reserved': '50'
    }
    publicNetworkAccess: 'Enabled'
  }
}

// =============================================================================
// Outputs
// =============================================================================

output postgresHost string = postgresServer.properties.fullyQualifiedDomainName
output postgresDatabase string = '${projectName}_${environment}'
output postgresConnectionString string = 'postgresql://${postgresAdminLogin}:${postgresAdminPassword}@${postgresServer.properties.fullyQualifiedDomainName}:5432/${projectName}_${environment}?sslmode=require'
output redisHost string = redisCache.properties.hostName
output redisPort int = redisCache.properties.sslPort
output redisAccessKey string = redisCache.listKeys().primaryKey
output redisConnectionString string = '${redisCache.properties.hostName}:${redisCache.properties.sslPort},password=${redisCache.listKeys().primaryKey},ssl=True,abortConnect=False'
