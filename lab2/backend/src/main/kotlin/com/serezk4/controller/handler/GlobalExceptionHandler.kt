package com.serezk4.controller.handler

import com.serezk4.api.model.FormattedApiException
import com.serezk4.exception.ApiException
import io.github.oshai.kotlinlogging.KLogger
import io.github.oshai.kotlinlogging.KotlinLogging
import jakarta.validation.ConstraintViolationException
import org.springframework.core.Ordered
import org.springframework.core.annotation.Order
import org.springframework.dao.DuplicateKeyException
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.MethodArgumentNotValidException
import org.springframework.web.bind.annotation.ControllerAdvice
import org.springframework.web.bind.annotation.ExceptionHandler
import org.springframework.web.bind.annotation.ResponseStatus
import org.springframework.web.bind.support.WebExchangeBindException

@ControllerAdvice
@Order(Ordered.HIGHEST_PRECEDENCE)
class GlobalExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException::class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    fun handleValidationExceptions(ex: MethodArgumentNotValidException):
            ResponseEntity<Any> {
        logger.error { "Validation error: ${ex.message}" }
        val errors = ex.bindingResult.fieldErrors
            .associate { it.field to (it.defaultMessage ?: "unknown") }
        return ResponseEntity.badRequest().body(
            FormattedApiException(
                "method_argument_not_valid_exception",
                "Кажется, вы ввели некорректные данные в полях " + errors.keys.joinToString(", ")
            )
        )
    }

    @ExceptionHandler(ConstraintViolationException::class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    fun handleConstraintViolationException(ex: ConstraintViolationException):
            ResponseEntity<Any> {
        logger.error { "Constraint violation: ${ex.message}" }
        val errors = ex.constraintViolations
            .associate { it.propertyPath.toString() to it.message }
        return ResponseEntity.badRequest().body(
            FormattedApiException(
                "constraint_violation_exception",
                "Кажется, вы ввели некорректные данные в полях " + errors.keys.joinToString(", ")
            )
        )
    }

    @ExceptionHandler(WebExchangeBindException::class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    fun handleWebExchangeBindException(ex: WebExchangeBindException):
            ResponseEntity<Any> {
        logger.error { "Validation error: ${ex.message}" }
        val errors = ex.fieldErrors
            .associate { it.field to (it.defaultMessage ?: "unknown") }
        return ResponseEntity.badRequest().body(
            FormattedApiException(
                "web_exchange_bind_exception",
                "Кажется, вы ввели некорректные данные в полях " + errors.keys.joinToString(", ")
            )
        )
    }

    @ExceptionHandler(DuplicateKeyException::class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    fun handleDuplicateKeyException(ex: DuplicateKeyException): ResponseEntity<Any> {
        logger.error { "Duplicate key error: ${ex.message}" }
        return ResponseEntity.badRequest().body(
            FormattedApiException(
                "duplicate_key_exception",
                "Кажется, вы пытаетесь создать объект с уже существующим уникальным ключом"
            )
        )
    }

    @ExceptionHandler(Exception::class)
    @Order(Ordered.LOWEST_PRECEDENCE)
    @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
    fun handleAllUncaughtException(ex: Exception): ResponseEntity<Any> {
        logger.error { "Uncaught exception ${ex.message}" }
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
            FormattedApiException(
                "internal_server_error",
                "Произошла непредвиденная ошибка. Пожалуйста, попробуйте позже."
            )
        )
    }

    @ExceptionHandler(ApiException::class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    @Order(Ordered.HIGHEST_PRECEDENCE)
    fun handleApiException(ex: ApiException): ResponseEntity<Any> {
        logger.error { "API exception: ${ex.errorCode} - ${ex.message}" }
        return ResponseEntity.status(ex.status ?: HttpStatus.BAD_REQUEST).body(
            FormattedApiException(
                ex.errorCode,
                ex.message
            )
        )
    }

    companion object KLogging {
        private val logger: KLogger = KotlinLogging.logger {}
    }
}
