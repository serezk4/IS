package com.serezk4.controller

import com.serezk4.api.api.ObjectsApi
import com.serezk4.api.model.CityDto
import com.serezk4.api.model.FormattedCityPage
import com.serezk4.mapper.toResponse
import com.serezk4.service.ObjectsService
import com.serezk4.util.parseSort
import io.github.resilience4j.ratelimiter.annotation.RateLimiter
import org.springframework.data.domain.PageRequest
import org.springframework.data.domain.Sort
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.RestController

@RestController
class ObjectsController(
    private val objectsService: ObjectsService
) : ObjectsApi {

    @RateLimiter(name = "default", fallbackMethod = "fallback")
    override fun createObject(cityDto: CityDto): ResponseEntity<CityDto> {
        val createdCity = objectsService.createObject(cityDto)
        return ResponseEntity.status(HttpStatus.CREATED).body(createdCity)
    }

    @RateLimiter(name = "default", fallbackMethod = "fallback")
    override fun deleteObjectById(id: Int): ResponseEntity<Unit> {
        objectsService.deleteObjectById(id)
        return ResponseEntity.noContent().build()
    }

    @RateLimiter(name = "default", fallbackMethod = "fallback")
    override fun getObjectById(id: Int): ResponseEntity<CityDto> {
        val city = objectsService.getObjectById(id)
        return ResponseEntity.ok(city)
    }

    @RateLimiter(name = "default", fallbackMethod = "fallback")
    override fun getObjects(page: Int, size: Int, sort: List<String>?): ResponseEntity<FormattedCityPage> {
        val pageable = PageRequest.of(page, size, sort?.let { parseSort(it) } ?: Sort.unsorted())
        val cities = objectsService.getObjects(pageable).toResponse()
        return ResponseEntity.ok().body(cities)
    }

    @RateLimiter(name = "default", fallbackMethod = "fallback")
    override fun patchObject(id: Int, cityDto: CityDto): ResponseEntity<CityDto> {
        val updatedCity = objectsService.patchObject(id, cityDto)
        return ResponseEntity.ok(updatedCity)
    }

    fun fallback(id: Int, ex: Throwable): ResponseEntity<String> {
        return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
            .body("Too many requests - please try again later.")
    }
}
