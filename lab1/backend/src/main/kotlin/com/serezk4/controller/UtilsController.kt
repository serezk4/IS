package com.serezk4.controller

import com.serezk4.api.api.UtilsApi
import com.serezk4.api.model.CreateTestObjects200Response
import com.serezk4.service.ObjectsService
import io.github.resilience4j.ratelimiter.annotation.RateLimiter
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.RestController

@RestController
class UtilsController(
    private val objectsService: ObjectsService
) : UtilsApi {

    @RateLimiter(name = "default", fallbackMethod = "fallback")
    override fun deleteObjectsByTimezone(timezone: Int): ResponseEntity<Unit> {
        objectsService.deleteObjectsByTimezone(timezone)
        return ResponseEntity.noContent().build()
    }

    @RateLimiter(name = "default", fallbackMethod = "fallback")
    override fun deleteOneByGovernment(government: String): ResponseEntity<Unit> {
        objectsService.deleteOneByGovernment(government)
        return ResponseEntity.noContent().build()
    }

    @RateLimiter(name = "test", fallbackMethod = "fallback")
    override fun createTestObjects(): ResponseEntity<CreateTestObjects200Response> {
        objectsService.createTestObject()
        return ResponseEntity.ok().body(CreateTestObjects200Response(true))
    }

    fun fallback(id: Int, ex: Throwable): ResponseEntity<String> {
        return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
            .body("Too many requests - please try again later.")
    }
}
