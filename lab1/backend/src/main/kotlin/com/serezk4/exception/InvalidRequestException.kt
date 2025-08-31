package com.serezk4.exception

import org.springframework.http.HttpStatus

class InvalidRequestException(
    private val fieldName: String? = null,
    private val causeMessage: String
) : ApiException(
    "invalid_request",
    HttpStatus.BAD_REQUEST,
    "Поле $fieldName содержит некорректное значение: $causeMessage",
)

