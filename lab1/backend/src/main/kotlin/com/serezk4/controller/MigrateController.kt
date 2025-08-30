package com.serezk4.controller

import com.serezk4.api.api.MigrateApi
import io.github.resilience4j.ratelimiter.annotation.RateLimiter
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.RestController

@RestController
class MigrateController(

) : MigrateApi {

    @RateLimiter(name = "default", fallbackMethod = "fallback")
    override fun migrateHalfFromCapital(): ResponseEntity<Unit> {

        return ResponseEntity.status(HttpStatus.NO_CONTENT).build()
    }

    @RateLimiter(name = "default", fallbackMethod = "fallback")
    override fun migratePopulation(fromId: Int, toId: Int): ResponseEntity<Unit> {

        return ResponseEntity.status(HttpStatus.NO_CONTENT).build()
    }

    fun fallback(id: Int, ex: Throwable): ResponseEntity<String> {
        return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
            .body("Too many requests - please try again later.")
    }
}
