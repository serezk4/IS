package com.serezk4.util

import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity

fun <T> tooManyRequests(body: T? = null): ResponseEntity<T> =
    if (body != null) ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS).body(body)
    else ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS).build()
