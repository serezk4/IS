package com.serezk4.exception

import org.springframework.http.HttpStatus

class TooManyRequestsException : ApiException(
    "too_many_requests",
    HttpStatus.TOO_MANY_REQUESTS,
    "Слишком много запросов, попробуйте позже"
)
