package com.serezk4.controller

import com.serezk4.api.api.UtilsApi
import com.serezk4.api.model.BookCreatureDto
import com.serezk4.api.model.CreateTestObjects200Response
import com.serezk4.api.model.GroupedByCreatureTypeDto
import com.serezk4.api.model.ObjectsPerUserStatsDto
import com.serezk4.exception.ObjectNotFoundException
import com.serezk4.service.ObjectsService
import io.github.resilience4j.ratelimiter.annotation.RateLimiter
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.RestController

@RestController
class UtilsController(
    private val objectsService: ObjectsService
) : UtilsApi {

    @RateLimiter(name = "test")
    override fun createTestObjects(): ResponseEntity<CreateTestObjects200Response> {
        objectsService.createTestObject()
        return ResponseEntity.ok(CreateTestObjects200Response(true))
    }

    @RateLimiter(name = "default")
    override fun deleteByAttackLevel(attackLevel: Long): ResponseEntity<BookCreatureDto> {
        val deleted = objectsService.deleteByAttackLevel(attackLevel)
            ?: throw ObjectNotFoundException()
        return ResponseEntity.ok(deleted)
    }

    @RateLimiter(name = "default")
    override fun distributeRings(): ResponseEntity<Unit> {
        objectsService.distributeRings()
        return ResponseEntity.status(HttpStatus.NO_CONTENT).build()
    }

    @RateLimiter(name = "default")
    override fun getObjectsPerUserStats(): ResponseEntity<List<ObjectsPerUserStatsDto>> {
        return ResponseEntity.ok(objectsService.getObjectsPerUserStats())
    }

    @RateLimiter(name = "default")
    override fun getUniqueDefenseLevels(): ResponseEntity<List<Float>> {
        return ResponseEntity.ok(objectsService.getUniqueDefenseLevels())
    }

    @RateLimiter(name = "default")
    override fun groupByCreatureType(): ResponseEntity<List<GroupedByCreatureTypeDto>> {
        return ResponseEntity.ok(objectsService.groupByCreatureType())
    }
}
