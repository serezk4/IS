package com.serezk4.converter

import com.fasterxml.jackson.databind.ObjectMapper
import com.serezk4.model.CustomJwtAuthenticationToken
import com.serezk4.model.CustomUserDetails
import org.springframework.core.convert.converter.Converter
import org.springframework.security.authentication.AbstractAuthenticationToken
import org.springframework.security.core.authority.SimpleGrantedAuthority
import org.springframework.security.oauth2.jwt.Jwt
import org.springframework.stereotype.Component

@Component
class CustomJwtAuthenticationConverter(
    private val objectMapper: ObjectMapper
) : Converter<Jwt, AbstractAuthenticationToken> {

    override fun convert(jwt: Jwt): AbstractAuthenticationToken {
        val roles = (jwt.claims["realm_access"] as? Map<*, *>)?.get("roles")
            .let { it as? Collection<*> }.orEmpty()
        val user = objectMapper.convertValue(jwt.claims, CustomUserDetails::class.java)

        return CustomJwtAuthenticationToken(
            jwt = jwt,
            authorities = roles.map { SimpleGrantedAuthority("ROLE_$it") },
            user = user
        )
    }
}
