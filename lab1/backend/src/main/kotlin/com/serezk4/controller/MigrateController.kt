package com.serezk4.controller

import com.serezk4.api.api.MigrateApi
import com.serezk4.exception.TooManyRequestsException
import com.serezk4.service.MigrateService
import io.github.resilience4j.ratelimiter.annotation.RateLimiter
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.RestController

@RestController
class MigrateController(
    private val migrateService: MigrateService
) : MigrateApi {

    @RateLimiter(name = "default")
    override fun migrateHalfFromCapital(): ResponseEntity<Unit> {
        migrateService.migrateHalfFromCapital()
        return ResponseEntity.noContent().build()
    }

    @RateLimiter(name = "default")
    override fun migratePopulation(fromId: Int, toId: Int): ResponseEntity<Unit> {
        migrateService.migratePopulation(fromId = fromId, toId = toId)
        return ResponseEntity.noContent().build()
    }
}
