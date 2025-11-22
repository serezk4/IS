package com.serezk4.config.security.util

import com.serezk4.exception.ApiException
import com.serezk4.model.CustomUserDetails
import org.springframework.http.HttpStatus
import org.springframework.security.core.Authentication
import org.springframework.security.core.context.SecurityContextHolder

inline val Authentication.currentUser: CustomUserDetails?
    get() = principal as? CustomUserDetails

inline val userOpt: CustomUserDetails?
    get() = SecurityContextHolder
        .getContext()
        .authentication
        ?.currentUser

inline val sub: String
    get() = user.sub

inline val subOpt: String?
    get() = userOpt?.sub

inline val user: CustomUserDetails
    get() = userOpt ?: throw ApiException(
        "user_not_authenticated",
        HttpStatus.UNAUTHORIZED,
        "Кажется, вы не авторизованы. Пожалуйста, войдите в систему и повторите попытку."
    )
