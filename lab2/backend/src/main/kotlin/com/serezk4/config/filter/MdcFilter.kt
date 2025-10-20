package com.serezk4.config.filter

import com.serezk4.config.security.util.userOpt
import com.serezk4.enums.MdcKeys
import com.serezk4.util.generateId
import io.github.oshai.kotlinlogging.KotlinLogging
import jakarta.servlet.FilterChain
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.slf4j.MDC
import org.springframework.core.Ordered
import org.springframework.core.annotation.Order
import org.springframework.stereotype.Component
import org.springframework.web.filter.OncePerRequestFilter
import org.springframework.web.util.ContentCachingRequestWrapper
import org.springframework.web.util.ContentCachingResponseWrapper
import java.nio.charset.Charset

@Component
@Order(Ordered.HIGHEST_PRECEDENCE + 1)
class MdcFilter : OncePerRequestFilter() {

    override fun doFilterInternal(
        request: HttpServletRequest,
        response: HttpServletResponse,
        filterChain: FilterChain
    ) {
        val wrappedResponse = ContentCachingResponseWrapper(response)
        val wrappedRequest = ContentCachingRequestWrapper(request)

        val requestId = wrappedRequest.getHeader("X-Request-ID") ?: generateId()
        val traceId = wrappedRequest.getHeader("X-Trace-ID") ?: generateId()
        val userAgent = wrappedRequest.getHeader("User-Agent") ?: "unknown"
        val userId = userOpt?.sub ?: "anonymous"

        MDC.put(MdcKeys.REQUEST_ID.getKey(), requestId)
        MDC.put(MdcKeys.TRACE_ID.getKey(), traceId)
        MDC.put(MdcKeys.USER_ID.getKey(), userAgent)
        MDC.put(MdcKeys.HOST.getKey(), request.localName)
        MDC.put(MdcKeys.SCHEME.getKey(), request.scheme)
        MDC.put(MdcKeys.METHOD.getKey(), request.method)
        MDC.put(MdcKeys.URI.getKey(), request.requestURI)
        MDC.put(MdcKeys.USER_ID.getKey(), userId)
        MDC.put(MdcKeys.REMOTE_ADDR.getKey(), request.remoteAddr)
        MDC.put(MdcKeys.REMOTE_HOST.getKey(), request.remoteHost)
        MDC.put(MdcKeys.REMOTE_PORT.getKey(), request.remotePort.toString())

        Companion.logger.info { "${request.method} Request ${request.requestURI}" }

        try {
            filterChain.doFilter(request, response)

            val responseBody = String(
                wrappedResponse.contentAsByteArray,
                Charset.forName(wrappedResponse.characterEncoding ?: "UTF-8")
            )

            val requestBody = String(
                wrappedRequest.contentAsByteArray,
                Charset.forName(wrappedRequest.characterEncoding)
            )

            MDC.put(MdcKeys.RETURNED_STATUS.getKey(), wrappedResponse.status.toString())
            MDC.put(MdcKeys.RETURNED_CONTENT_TYPE.getKey(), wrappedResponse.contentType ?: "unknown")
            MDC.put(MdcKeys.RETURNED_RESPONSE_BODY.getKey(), responseBody)

            MDC.put(MdcKeys.REQUEST_BODY.getKey(), requestBody)
            MDC.put(MdcKeys.REQUEST_CONTENT_TYPE.getKey(), wrappedRequest.contentType ?: "unknown")
            MDC.put(MdcKeys.REQUEST_CONTENT_LENGTH.getKey(), wrappedRequest.contentLength.toString())
            MDC.put(
                MdcKeys.REQUEST_HEADERS.getKey(),
                wrappedRequest.headerNames.toList().joinToString(", ") { headerName ->
                    "$headerName: ${wrappedRequest.getHeader(headerName)}"
                })

            Companion.logger.info { "HTTP Response for ${request.requestURI}" }

            wrappedResponse.copyBodyToResponse()
        } finally {
            MDC.clear()
        }
    }

    companion object {
        private val logger = KotlinLogging.logger {}
    }
}
