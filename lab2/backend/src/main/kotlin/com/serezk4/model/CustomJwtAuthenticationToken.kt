package com.serezk4.model

import org.springframework.security.core.GrantedAuthority
import org.springframework.security.oauth2.jwt.Jwt
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken

class CustomJwtAuthenticationToken(
    jwt: Jwt,
    authorities: Collection<GrantedAuthority>,
    private val user: CustomUserDetails
) : JwtAuthenticationToken(jwt, authorities, user.preferredUsername) {

    override fun getPrincipal() = user
}
