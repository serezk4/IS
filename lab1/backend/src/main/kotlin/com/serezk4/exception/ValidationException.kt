package com.serezk4.exception

import org.springframework.http.HttpStatus

class ValidationException(errors: Map<String, String>) : ApiException(
    "validation_failed",
    HttpStatus.BAD_REQUEST,
    "Некоторые поля не прошли валидацию: " + errors.entries.joinToString("\n") { "${it.key} (${it.value})" }
)
