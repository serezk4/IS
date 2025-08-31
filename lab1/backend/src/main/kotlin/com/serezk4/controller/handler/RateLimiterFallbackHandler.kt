package com.serezk4.controller.handler

import com.serezk4.exception.TooManyRequestsException
import org.springframework.http.ResponseEntity
import org.springframework.stereotype.Component

@Component
class RateLimiterFallbackHandler {

    fun handle(ex: Throwable): ResponseEntity<Any> {
        throw TooManyRequestsException()
    }
}
