package com.serezk4.config.security

import com.serezk4.config.security.keycloak.KeycloakProperties
import com.serezk4.converter.CustomJwtAuthenticationConverter
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.security.config.annotation.web.builders.HttpSecurity
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity
import org.springframework.security.oauth2.jwt.JwtDecoder
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder
import org.springframework.security.web.SecurityFilterChain
import org.springframework.web.cors.CorsConfiguration
import org.springframework.web.cors.UrlBasedCorsConfigurationSource

@EnableWebSecurity
@Configuration
class SecurityConfiguration(
    private val customJwtAuthenticationConverter: CustomJwtAuthenticationConverter,
    private val keycloakProperties: KeycloakProperties
) {

    @Bean
    @Throws(Exception::class)
    fun securityFilterChain(http: HttpSecurity): SecurityFilterChain {
        http.authorizeHttpRequests {
            it.requestMatchers(
                "/actuator/**",
                "/v3/api-docs/**",
                "/swagger-ui/**",
                "/api.yml",
                "/swagger-ui.html",
                "/webjars/**",
                "/api/v1/users/signup",
                "/ws/**", "/ws"
            )
                .permitAll()
                .anyRequest()
                .authenticated()
        }
            .httpBasic { it.disable() }
            .formLogin { it.disable() }
            .oauth2ResourceServer {
                it.jwt { jwt ->
                    jwt.jwtAuthenticationConverter(customJwtAuthenticationConverter)
                }
            }
            .oauth2ResourceServer {
                it.jwt { jwt ->
                    jwt.jwkSetUri(keycloakProperties.jwkSetUri)
                    jwt.jwtAuthenticationConverter(customJwtAuthenticationConverter)
                }
            }
            .csrf { it.disable() }

        return http.build()
    }

    @Bean
    fun corsConfigurationSource() = UrlBasedCorsConfigurationSource().apply {
        registerCorsConfiguration("/**", CorsConfiguration().apply {
            allowedOriginPatterns = listOf("*")
            allowedMethods = listOf("*")
            allowedHeaders = listOf("*")
            allowCredentials = true
        })
    }

    @Bean
    fun jwtDecoder(): JwtDecoder = NimbusJwtDecoder.withJwkSetUri(keycloakProperties.jwkSetUri).build()
}
