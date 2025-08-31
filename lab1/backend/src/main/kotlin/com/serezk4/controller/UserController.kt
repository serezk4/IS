package com.serezk4.controller

import com.serezk4.api.api.UsersApi
import com.serezk4.api.model.CustomUserDetailsDto
import com.serezk4.api.model.UserSignupRequest
import com.serezk4.config.security.util.user
import com.serezk4.exception.TooManyRequestsException
import com.serezk4.mapper.toDto
import com.serezk4.service.UserSignupService
import io.github.resilience4j.ratelimiter.annotation.RateLimiter
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.RestController

@RestController
class UserController(
    private val userSignupService: UserSignupService
) : UsersApi {

    @RateLimiter(name = "signup", fallbackMethod = "fallback")
    override fun signup(userSignupRequest: UserSignupRequest): ResponseEntity<Unit> {
        userSignupService.signup(userSignupRequest)
        return ResponseEntity.status(HttpStatus.CREATED).build()
    }

    @RateLimiter(name = "default", fallbackMethod = "fallback")
    override fun getCurrentUser(): ResponseEntity<CustomUserDetailsDto> {
        return user.toDto().let { ResponseEntity.ok(it) }
    }

    fun fallback(ex: Throwable): ResponseEntity<Any> = throw TooManyRequestsException()
}
