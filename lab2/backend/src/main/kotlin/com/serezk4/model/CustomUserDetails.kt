package com.serezk4.model

import com.fasterxml.jackson.annotation.JsonProperty
import java.time.Instant

data class CustomUserDetails(
    @JsonProperty("sub") val sub: String,
    @JsonProperty("email_verified") val emailVerified: Boolean,
    @JsonProperty("allowed-origins") val allowedOrigins: List<String>,
    @JsonProperty("realm_access") val realmAccess: RealmAccess,
    @JsonProperty("resource_access") val resourceAccess: Map<String, ResourceRoles>,
    @JsonProperty("iss") val issuer: String,
    @JsonProperty("preferred_username") val preferredUsername: String,
    @JsonProperty("given_name") val givenName: String? = null,
    @JsonProperty("family_name") val familyName: String? = null,
    @JsonProperty("sid") val sid: String,
    @JsonProperty("acr") val acr: String,
    @JsonProperty("azp") val azp: String,
    @JsonProperty("scope") val scope: String,
    @JsonProperty("name") val name: String? = null,
    @JsonProperty("email") val email: String,
    @JsonProperty("exp") val exp: Instant,
    @JsonProperty("iat") val iat: Instant,
    @JsonProperty("jti") val jti: String
)
