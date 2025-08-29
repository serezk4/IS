package com.serezk4.exception

import org.springframework.http.HttpStatus

class UnknownException : ApiException(
    "unknown_error",
    HttpStatus.INTERNAL_SERVER_ERROR,
    "Произошла неизвестная ошибка, попробуйте повторить операцию позже или напишите нам в поддержку"
)
