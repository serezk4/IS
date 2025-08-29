package com.serezk4.util

fun generateId(): String {
    return java.util.UUID.randomUUID().toString().replace("-", "")
}
