package com.serezk4.config.security.jwt

import org.springframework.beans.factory.annotation.Value
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.security.oauth2.jwt.JwtDecoder
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder

@Configuration
class JwtDecoderConfig(
    @Value("\${spring.security.oauth2.client.provider.keycloak.jwk-set-uri}")
    private val jwkSetUri: String
) {

    @Bean
    fun jwtDecoder(): JwtDecoder = NimbusJwtDecoder.withJwkSetUri(jwkSetUri).build()
}
