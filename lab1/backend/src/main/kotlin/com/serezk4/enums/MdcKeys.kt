package com.serezk4.enums

enum class MdcKeys(private val key: String) {
    RETURNED_STATUS("returnedStatus"),
    RETURNED_CONTENT_TYPE("returnedContentType"),
    RETURNED_RESPONSE_BODY("returnedResponseBody"),
    REQUEST_BODY("requestBody"),
    REQUEST_CONTENT_TYPE("requestContentType"),
    REQUEST_CONTENT_LENGTH("requestContentLength"),
    REQUEST_HEADERS("requestHeaders"),
    REQUEST_ID("requestId"),
    TRACE_ID("traceId"),
    USER_AGENT("userAgent"),
    HOST("host"),
    SCHEME("scheme"),
    METHOD("method"),
    URI("uri"),
    USER_ID("userId"),
    REMOTE_ADDR("remoteAddr"),
    REMOTE_HOST("remoteHost"),
    REMOTE_PORT("remotePort");

    fun getKey(): String = key
}
