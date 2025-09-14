package com.serezk4.exception

import org.springframework.http.HttpStatus

class ObjectNotFoundException : ApiException(
    "object_not_found",
    HttpStatus.NOT_FOUND,
    "Подходящий объект не найден."
)
