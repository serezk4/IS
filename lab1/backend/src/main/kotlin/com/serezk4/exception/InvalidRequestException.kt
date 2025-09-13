package com.serezk4.exception

import org.springframework.http.HttpStatus

class InvalidRequestException(
    fieldName: String? = null,
    causeMessage: String
) : ApiException(
    "invalid_request",
    HttpStatus.BAD_REQUEST,
    "Поле $fieldName содержит некорректное значение: $causeMessage",
)

