package com.serezk4.util

import java.util.*

fun generateId(): String {
    return UUID.randomUUID().toString().replace("-", "")
}
