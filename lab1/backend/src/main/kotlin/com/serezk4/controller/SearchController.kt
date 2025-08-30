package com.serezk4.controller

import com.serezk4.api.api.SearchApi
import com.serezk4.api.model.FormattedCityPage
import com.serezk4.service.ObjectsService
import io.github.resilience4j.ratelimiter.annotation.RateLimiter
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.RestController

@RestController
class SearchController(
    private val objectsService: ObjectsService
) : SearchApi {

    @RateLimiter(name = "default", fallbackMethod = "fallback")
    override fun searchObjectsByName(name: String): ResponseEntity<FormattedCityPage> {
//        val cities = objectsService.searchObjectsByName(name).toResponse()
        return ResponseEntity.ok().body(/*cities*/null)
    }

    fun fallback(id: Int, ex: Throwable): ResponseEntity<String> {
        return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
            .body("Too many requests - please try again later.")
    }
}
