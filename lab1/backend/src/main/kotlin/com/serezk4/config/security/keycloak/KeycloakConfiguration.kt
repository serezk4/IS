package com.serezk4.config.security.keycloak

import io.github.oshai.kotlinlogging.KotlinLogging
import org.jboss.resteasy.client.jaxrs.ResteasyClientBuilder
import org.keycloak.OAuth2Constants
import org.keycloak.admin.client.Keycloak
import org.keycloak.admin.client.KeycloakBuilder
import org.keycloak.admin.client.resource.RealmResource
import org.keycloak.admin.client.resource.UsersResource
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import java.util.concurrent.TimeUnit

@Configuration
class KeycloakConfiguration(
    private val keycloakProperties: KeycloakProperties
) {

    @Bean
    fun keycloak(): Keycloak {
        val resteasyClient = (ResteasyClientBuilder.newBuilder() as ResteasyClientBuilder)
            .maxPooledPerRoute(keycloakProperties.maxPooledPerRoute)
            .connectTimeout(keycloakProperties.connectTimeout, TimeUnit.MILLISECONDS)
            .readTimeout(keycloakProperties.readTimeout, TimeUnit.MILLISECONDS)
            .build()

        logger.info {
            "Initialized resteasy client with properties:" +
                    "maxPooledPerRoute=${keycloakProperties.maxPooledPerRoute}, " +
                    "connectTimeout=${keycloakProperties.connectTimeout}ms, " +
                    "readTimeout=${keycloakProperties.readTimeout}ms"
        }

        return KeycloakBuilder.builder()
            .serverUrl(keycloakProperties.serverUrl)
            .realm(keycloakProperties.realm)
            .grantType(OAuth2Constants.CLIENT_CREDENTIALS)
            .clientId(keycloakProperties.clientId)
            .clientSecret(keycloakProperties.clientSecret)
            .username(keycloakProperties.adminUsername)
            .password(keycloakProperties.adminPassword)
            .resteasyClient(resteasyClient)
            .build().also {
                logger.info { "Keycloak client initialized for realm: ${keycloakProperties.realm}" }
            }
    }

    @Bean
    fun realmResource(
        keycloak: Keycloak
    ): RealmResource {
        return keycloak.realm(keycloakProperties.realm)
            ?: error("Realm ${keycloakProperties.realm} not found")
    }

    @Bean
    fun userResource(
        realmResource: RealmResource
    ): UsersResource {
        return realmResource.users()
            ?: error("Users resource not found for realm ${keycloakProperties.realm}")
    }

    companion object {
        private val logger = KotlinLogging.logger {}
    }
}
