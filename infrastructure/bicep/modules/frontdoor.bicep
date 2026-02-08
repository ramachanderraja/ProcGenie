// =============================================================================
// ProcGenie - Azure Front Door Module
// CDN + WAF with Standard SKU
// =============================================================================

param location string
param tags object
param frontDoorName string
param webAppFqdn string
param apiAppFqdn string

// =============================================================================
// Front Door Profile (Standard SKU)
// =============================================================================

resource frontDoorProfile 'Microsoft.Cdn/profiles@2024-02-01' = {
  name: frontDoorName
  location: location
  tags: tags
  sku: {
    name: 'Standard_AzureFrontDoor'
  }
  properties: {
    originResponseTimeoutSeconds: 60
  }
}

// =============================================================================
// Endpoint
// =============================================================================

resource frontDoorEndpoint 'Microsoft.Cdn/profiles/afdEndpoints@2024-02-01' = {
  parent: frontDoorProfile
  name: '${frontDoorName}-endpoint'
  location: location
  tags: tags
  properties: {
    enabledState: 'Enabled'
  }
}

// =============================================================================
// Origin Groups
// =============================================================================

resource webOriginGroup 'Microsoft.Cdn/profiles/originGroups@2024-02-01' = {
  parent: frontDoorProfile
  name: 'web-origin-group'
  properties: {
    loadBalancingSettings: {
      sampleSize: 4
      successfulSamplesRequired: 3
      additionalLatencyInMilliseconds: 50
    }
    healthProbeSettings: {
      probePath: '/'
      probeRequestType: 'HEAD'
      probeProtocol: 'Https'
      probeIntervalInSeconds: 30
    }
    sessionAffinityState: 'Disabled'
  }
}

resource apiOriginGroup 'Microsoft.Cdn/profiles/originGroups@2024-02-01' = {
  parent: frontDoorProfile
  name: 'api-origin-group'
  properties: {
    loadBalancingSettings: {
      sampleSize: 4
      successfulSamplesRequired: 3
      additionalLatencyInMilliseconds: 50
    }
    healthProbeSettings: {
      probePath: '/api/v1/health'
      probeRequestType: 'GET'
      probeProtocol: 'Https'
      probeIntervalInSeconds: 30
    }
    sessionAffinityState: 'Disabled'
  }
}

// =============================================================================
// Origins
// =============================================================================

resource webOrigin 'Microsoft.Cdn/profiles/originGroups/origins@2024-02-01' = {
  parent: webOriginGroup
  name: 'web-origin'
  properties: {
    hostName: webAppFqdn
    httpPort: 80
    httpsPort: 443
    originHostHeader: webAppFqdn
    priority: 1
    weight: 1000
    enabledState: 'Enabled'
    enforceCertificateNameCheck: true
  }
}

resource apiOrigin 'Microsoft.Cdn/profiles/originGroups/origins@2024-02-01' = {
  parent: apiOriginGroup
  name: 'api-origin'
  properties: {
    hostName: apiAppFqdn
    httpPort: 80
    httpsPort: 443
    originHostHeader: apiAppFqdn
    priority: 1
    weight: 1000
    enabledState: 'Enabled'
    enforceCertificateNameCheck: true
  }
}

// =============================================================================
// Routes
// =============================================================================

resource webRoute 'Microsoft.Cdn/profiles/afdEndpoints/routes@2024-02-01' = {
  parent: frontDoorEndpoint
  name: 'web-route'
  properties: {
    originGroup: {
      id: webOriginGroup.id
    }
    supportedProtocols: ['Http', 'Https']
    patternsToMatch: ['/*']
    forwardingProtocol: 'HttpsOnly'
    linkToDefaultDomain: 'Enabled'
    httpsRedirect: 'Enabled'
    cacheConfiguration: {
      queryStringCachingBehavior: 'IgnoreQueryString'
      compressionSettings: {
        isCompressionEnabled: true
        contentTypesToCompress: [
          'text/html'
          'text/css'
          'text/javascript'
          'application/javascript'
          'application/json'
          'application/xml'
          'image/svg+xml'
          'font/woff'
          'font/woff2'
        ]
      }
    }
  }
  dependsOn: [webOrigin]
}

resource apiRoute 'Microsoft.Cdn/profiles/afdEndpoints/routes@2024-02-01' = {
  parent: frontDoorEndpoint
  name: 'api-route'
  properties: {
    originGroup: {
      id: apiOriginGroup.id
    }
    supportedProtocols: ['Http', 'Https']
    patternsToMatch: ['/api/*']
    forwardingProtocol: 'HttpsOnly'
    linkToDefaultDomain: 'Enabled'
    httpsRedirect: 'Enabled'
  }
  dependsOn: [apiOrigin, webRoute]
}

// =============================================================================
// Outputs
// =============================================================================

output frontDoorId string = frontDoorProfile.id
output frontDoorEndpoint string = 'https://${frontDoorEndpoint.properties.hostName}'
output frontDoorEndpointHostName string = frontDoorEndpoint.properties.hostName
