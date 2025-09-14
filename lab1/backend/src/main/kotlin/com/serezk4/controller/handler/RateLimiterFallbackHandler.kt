package com.serezk4.controller.handler

import com.serezk4.exception.TooManyRequestsException
import io.github.oshai.kotlinlogging.KotlinLogging
import org.springframework.http.ResponseEntity
import org.springframework.stereotype.Component

@Component
class RateLimiterFallbackHandler {

    fun handle(ex: Throwable): ResponseEntity<Any> {
        logger.error { ex }
        throw TooManyRequestsException()
    }

    companion object {
        private val logger = KotlinLogging.logger {}
    }
}
