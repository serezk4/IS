package com.serezk4.controller

import com.serezk4.api.api.ObjectsApi
import com.serezk4.api.model.BookCreatureDto
import com.serezk4.api.model.FormattedBookCreaturePage
import com.serezk4.service.ObjectsService
import com.serezk4.util.parseSort
import io.github.oshai.kotlinlogging.KotlinLogging
import io.github.resilience4j.ratelimiter.annotation.RateLimiter
import org.springframework.data.domain.PageRequest
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.RestController

@RestController
class ObjectsController(
    private val objectsService: ObjectsService
) : ObjectsApi {

    @RateLimiter(name = "default")
    override fun createObject(bookCreatureDto: BookCreatureDto): ResponseEntity<BookCreatureDto> {
        logger.info { "Received request to create object: $bookCreatureDto" }
        val createdCity = objectsService.createObject(bookCreatureDto)
        return ResponseEntity.status(HttpStatus.CREATED).body(createdCity)
    }

    @RateLimiter(name = "default")
    override fun deleteObjectById(id: Long): ResponseEntity<Unit> {
        objectsService.deleteObjectById(id)
        return ResponseEntity.noContent().build()
    }

    @RateLimiter(name = "default")
    override fun getObjectById(id: Long): ResponseEntity<BookCreatureDto> {
        val city = objectsService.getObjectById(id)
        return ResponseEntity.ok(city)
    }

    @RateLimiter(name = "default")
    override fun getObjects(page: Int, size: Int, sort: String): ResponseEntity<FormattedBookCreaturePage> {
        val pageable = PageRequest.of(page, size, parseSort(sort))
        val cities = objectsService.getObjects(pageable)
        return ResponseEntity.ok().body(cities)
    }

    @RateLimiter(name = "default")
    override fun patchObject(id: Long, bookCreatureDto: BookCreatureDto): ResponseEntity<BookCreatureDto> {
        val updatedCity = objectsService.patchObject(id, bookCreatureDto)
        return ResponseEntity.ok(updatedCity)
    }

    companion object {
        private val logger = KotlinLogging.logger {}
    }
}
