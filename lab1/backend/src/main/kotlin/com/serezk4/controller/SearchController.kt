package com.serezk4.controller

import com.serezk4.api.api.SearchApi
import com.serezk4.api.model.CityDto
import com.serezk4.exception.TooManyRequestsException
import com.serezk4.service.ObjectsService
import io.github.resilience4j.ratelimiter.annotation.RateLimiter
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.RestController

@RestController
class SearchController(
    private val objectsService: ObjectsService
) : SearchApi {

    @RateLimiter(name = "default", fallbackMethod = "fallback")
    override fun searchObjectsByName(name: String): ResponseEntity<List<CityDto>> {
        return ResponseEntity.ok().body(objectsService.findByName(name))
    }

    fun fallback(ex: Throwable): ResponseEntity<Any> = throw TooManyRequestsException()
}
