package com.serezk4.service

import com.serezk4.api.model.UserSignupRequest
import com.serezk4.exception.KeycloakException
import jakarta.ws.rs.core.Response
import org.keycloak.admin.client.CreatedResponseUtil
import org.keycloak.admin.client.resource.UsersResource
import org.keycloak.representations.idm.CredentialRepresentation
import org.keycloak.representations.idm.UserRepresentation
import org.springframework.stereotype.Service

@Service
class UserSignupService(
    private val users: UsersResource,
) {

    fun signup(request: UserSignupRequest) {
        val userRepresentation = UserRepresentation().apply {
            email = request.email
            isEnabled = true
            isEmailVerified = true
//            requiredActions = listOf("VERIFY_EMAIL")
        }

        val response = users.create(userRepresentation)
            ?: throw KeycloakException("No response from Keycloak when creating user: ${request.email}")

        require(response.status == Response.Status.CREATED.statusCode) {
            throw KeycloakException("Failed to create user: ${request.email}, status: ${response.status}")
        }

        val userId = CreatedResponseUtil.getCreatedId(response)
            ?: throw KeycloakException("No ID returned for user: ${request.email}")

        users.get(userId).apply {
            resetPassword(
                CredentialRepresentation().apply {
                    type = CredentialRepresentation.PASSWORD
                    value = request.password
                    isTemporary = false
                }
            )
            executeActionsEmail(listOf("VERIFY_EMAIL"))
            toRepresentation()
        }
    }
}
