package com.serezk4.exception

import org.springframework.http.HttpStatus

class KeycloakException(error: String) : ApiException(
    "keycloak_error",
    HttpStatus.INTERNAL_SERVER_ERROR,
    "Произошла ошибка при взаимодействии с keycloak: $error. Попробуйте повторить операцию позже."
)
