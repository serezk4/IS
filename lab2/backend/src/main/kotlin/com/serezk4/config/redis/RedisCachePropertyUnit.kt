package com.serezk4.config.redis

data class RedisCachePropertyUnit(
    var name: String,
    var ttl: Long,
    var returnType: String,
    var nullable: Boolean = false
)
