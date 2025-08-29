package com.serezk4.controller

import com.serezk4.api.api.UsersApi
import com.serezk4.api.model.UserSignupRequest
import com.serezk4.service.UserSignupService
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.RestController

@RestController
class UserController(
    private val userSignupService: UserSignupService
) : UsersApi {

    override fun signup(userSignupRequest: UserSignupRequest): ResponseEntity<Unit> {
        userSignupService.signup(userSignupRequest)
        return ResponseEntity.status(HttpStatus.CREATED).build()
    }
}
