// =============================================================================
// ProcGenie - Container Apps Module
// Azure Container Apps Environment + Web + API Container Apps
// =============================================================================

param location string
param tags object
param containerEnvName string
param webAppName string
param apiAppName string
param logAnalyticsId string
param appsSubnetId string
param acrLoginServer string
param identityId string
param identityClientId string

// Data service connection params
param postgresHost string
param postgresDatabase string
param postgresAdminLogin string
@secure()
param postgresAdminPassword string
param redisHost string
param redisPort int
@secure()
param redisAccessKey string

// Application secrets
@secure()
param jwtSecret string
@secure()
param jwtRefreshSecret string
@secure()
param anthropicApiKey string
param environment string

// =============================================================================
// Container Apps Environment
// =============================================================================

resource containerEnv 'Microsoft.App/managedEnvironments@2024-03-01' = {
  name: containerEnvName
  location: location
  tags: tags
  properties: {
    appLogsConfiguration: {
      destination: 'log-analytics'
      logAnalyticsConfiguration: {
        customerId: reference(logAnalyticsId, '2023-09-01').customerId
        sharedKey: listKeys(logAnalyticsId, '2023-09-01').primarySharedKey
      }
    }
    vnetConfiguration: {
      infrastructureSubnetId: appsSubnetId
      internal: false
    }
    zoneRedundant: false
    workloadProfiles: [
      {
        name: 'Consumption'
        workloadProfileType: 'Consumption'
      }
    ]
  }
}

// =============================================================================
// Container App: Web (Next.js Frontend)
// =============================================================================

resource webApp 'Microsoft.App/containerApps@2024-03-01' = {
  name: webAppName
  location: location
  tags: union(tags, { service: 'web' })
  identity: {
    type: 'UserAssigned'
    userAssignedIdentities: {
      '${identityId}': {}
    }
  }
  properties: {
    managedEnvironmentId: containerEnv.id
    workloadProfileName: 'Consumption'
    configuration: {
      activeRevisionsMode: 'Single'
      ingress: {
        external: true
        targetPort: 3000
        transport: 'http'
        allowInsecure: false
        corsPolicy: {
          allowedOrigins: ['*']
          allowedMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
          allowedHeaders: ['*']
          maxAge: 3600
        }
      }
      registries: [
        {
          server: acrLoginServer
          identity: identityId
        }
      ]
      secrets: [
        {
          name: 'nextauth-secret'
          value: jwtSecret
        }
      ]
    }
    template: {
      containers: [
        {
          name: 'web'
          image: '${acrLoginServer}/procgenie-web:latest'
          resources: {
            cpu: json('0.5')
            memory: '1Gi'
          }
          env: [
            { name: 'NODE_ENV', value: 'production' }
            { name: 'NEXT_TELEMETRY_DISABLED', value: '1' }
            { name: 'HOSTNAME', value: '0.0.0.0' }
            { name: 'PORT', value: '3000' }
            { name: 'NEXT_PUBLIC_API_URL', value: 'https://${apiAppName}.${containerEnv.properties.defaultDomain}/api/v1' }
            { name: 'NEXT_PUBLIC_WS_URL', value: 'wss://${apiAppName}.${containerEnv.properties.defaultDomain}' }
            { name: 'NEXT_PUBLIC_APP_NAME', value: 'ProcGenie' }
            { name: 'NEXTAUTH_URL', value: 'https://${webAppName}.${containerEnv.properties.defaultDomain}' }
            { name: 'NEXTAUTH_SECRET', secretRef: 'nextauth-secret' }
          ]
          probes: [
            {
              type: 'Liveness'
              httpGet: {
                path: '/'
                port: 3000
              }
              initialDelaySeconds: 30
              periodSeconds: 30
              failureThreshold: 3
            }
            {
              type: 'Readiness'
              httpGet: {
                path: '/'
                port: 3000
              }
              initialDelaySeconds: 10
              periodSeconds: 10
              failureThreshold: 3
            }
            {
              type: 'Startup'
              httpGet: {
                path: '/'
                port: 3000
              }
              initialDelaySeconds: 5
              periodSeconds: 5
              failureThreshold: 10
            }
          ]
        }
      ]
      scale: {
        minReplicas: 1
        maxReplicas: 10
        rules: [
          {
            name: 'http-scaling'
            http: {
              metadata: {
                concurrentRequests: '100'
              }
            }
          }
        ]
      }
    }
  }
}

// =============================================================================
// Container App: API (NestJS Backend)
// =============================================================================

resource apiApp 'Microsoft.App/containerApps@2024-03-01' = {
  name: apiAppName
  location: location
  tags: union(tags, { service: 'api' })
  identity: {
    type: 'UserAssigned'
    userAssignedIdentities: {
      '${identityId}': {}
    }
  }
  properties: {
    managedEnvironmentId: containerEnv.id
    workloadProfileName: 'Consumption'
    configuration: {
      activeRevisionsMode: 'Single'
      ingress: {
        external: true
        targetPort: 4000
        transport: 'http'
        allowInsecure: false
        corsPolicy: {
          allowedOrigins: [
            'https://${webAppName}.${containerEnv.properties.defaultDomain}'
          ]
          allowedMethods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS']
          allowedHeaders: ['*']
          exposeHeaders: ['X-Total-Count', 'X-Request-Id']
          maxAge: 3600
          allowCredentials: true
        }
      }
      registries: [
        {
          server: acrLoginServer
          identity: identityId
        }
      ]
      secrets: [
        { name: 'db-password', value: postgresAdminPassword }
        { name: 'redis-password', value: redisAccessKey }
        { name: 'jwt-secret', value: jwtSecret }
        { name: 'jwt-refresh-secret', value: jwtRefreshSecret }
        { name: 'anthropic-api-key', value: anthropicApiKey }
      ]
    }
    template: {
      containers: [
        {
          name: 'api'
          image: '${acrLoginServer}/procgenie-api:latest'
          resources: {
            cpu: json('0.5')
            memory: '1Gi'
          }
          env: [
            // Application
            { name: 'NODE_ENV', value: 'production' }
            { name: 'PORT', value: '4000' }
            { name: 'API_PREFIX', value: 'api/v1' }
            { name: 'APP_NAME', value: 'ProcGenie' }
            { name: 'CORS_ORIGINS', value: 'https://${webAppName}.${containerEnv.properties.defaultDomain}' }
            // Database
            { name: 'DB_HOST', value: postgresHost }
            { name: 'DB_PORT', value: '5432' }
            { name: 'DB_USERNAME', value: postgresAdminLogin }
            { name: 'DB_PASSWORD', secretRef: 'db-password' }
            { name: 'DB_DATABASE', value: postgresDatabase }
            { name: 'DB_SSL', value: 'true' }
            { name: 'DB_SYNCHRONIZE', value: 'false' }
            { name: 'DB_LOGGING', value: 'false' }
            { name: 'DB_MAX_CONNECTIONS', value: '50' }
            // Redis
            { name: 'REDIS_HOST', value: redisHost }
            { name: 'REDIS_PORT', value: string(redisPort) }
            { name: 'REDIS_PASSWORD', secretRef: 'redis-password' }
            { name: 'REDIS_DB', value: '0' }
            { name: 'REDIS_TTL', value: '3600' }
            // JWT
            { name: 'JWT_SECRET', secretRef: 'jwt-secret' }
            { name: 'JWT_EXPIRES_IN', value: '1h' }
            { name: 'JWT_REFRESH_SECRET', secretRef: 'jwt-refresh-secret' }
            { name: 'JWT_REFRESH_EXPIRES_IN', value: '7d' }
            // AI
            { name: 'ANTHROPIC_API_KEY', secretRef: 'anthropic-api-key' }
            { name: 'ANTHROPIC_MODEL', value: 'claude-sonnet-4-20250514' }
            { name: 'ANTHROPIC_MAX_TOKENS', value: '4096' }
            // Queue
            { name: 'BULL_QUEUE_PREFIX', value: 'procgenie' }
            { name: 'BULL_QUEUE_DEFAULT_ATTEMPTS', value: '3' }
            { name: 'BULL_QUEUE_DEFAULT_BACKOFF', value: '5000' }
            // Logging
            { name: 'LOG_LEVEL', value: environment == 'prod' ? 'warn' : 'info' }
            { name: 'LOG_FORMAT', value: 'json' }
            // Rate Limiting
            { name: 'THROTTLE_TTL', value: '60' }
            { name: 'THROTTLE_LIMIT', value: environment == 'prod' ? '200' : '100' }
            // Feature Flags
            { name: 'FEATURE_AI_ANALYSIS', value: 'true' }
            { name: 'FEATURE_ESG_SCORING', value: 'true' }
            { name: 'FEATURE_PREDICTIVE_ANALYTICS', value: 'true' }
            { name: 'FEATURE_AUTO_APPROVAL', value: 'false' }
            // Multi-tenancy
            { name: 'DEFAULT_TENANT_ID', value: 'default' }
          ]
          probes: [
            {
              type: 'Liveness'
              httpGet: {
                path: '/api/v1/health'
                port: 4000
              }
              initialDelaySeconds: 30
              periodSeconds: 30
              failureThreshold: 3
            }
            {
              type: 'Readiness'
              httpGet: {
                path: '/api/v1/health'
                port: 4000
              }
              initialDelaySeconds: 15
              periodSeconds: 10
              failureThreshold: 3
            }
            {
              type: 'Startup'
              httpGet: {
                path: '/api/v1/health'
                port: 4000
              }
              initialDelaySeconds: 10
              periodSeconds: 5
              failureThreshold: 12
            }
          ]
        }
      ]
      scale: {
        minReplicas: 1
        maxReplicas: 10
        rules: [
          {
            name: 'http-scaling'
            http: {
              metadata: {
                concurrentRequests: '50'
              }
            }
          }
        ]
      }
    }
  }
}

// =============================================================================
// Outputs
// =============================================================================

output containerEnvId string = containerEnv.id
output containerEnvDomain string = containerEnv.properties.defaultDomain
output webFqdn string = webApp.properties.configuration.ingress.fqdn
output apiFqdn string = apiApp.properties.configuration.ingress.fqdn
output webAppId string = webApp.id
output apiAppId string = apiApp.id
