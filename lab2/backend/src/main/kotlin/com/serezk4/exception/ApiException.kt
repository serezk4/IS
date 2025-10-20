package com.serezk4.exception

import org.springframework.http.HttpStatus

open class ApiException(
    val errorCode: String,
    val status: HttpStatus? = HttpStatus.BAD_REQUEST,
    override val message: String
) : RuntimeException()
