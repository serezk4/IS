package com.serezk4.config.security.keycloak

import org.springframework.boot.context.properties.ConfigurationProperties
import org.springframework.stereotype.Component

@Component
@ConfigurationProperties(prefix = "keycloak")
data class KeycloakProperties(
    var serverUrl: String = "",
    var realm: String = "",
    var clientId: String = "",
    var clientSecret: String = "",
    var adminUsername: String = "",
    var adminPassword: String = "",
    var maxPooledPerRoute: Int = 50,
    var connectTimeout: Long = 3000L,
    var readTimeout: Long = 5000L
)
