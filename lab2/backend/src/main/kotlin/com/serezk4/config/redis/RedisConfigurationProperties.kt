package com.serezk4.config.redis

import org.springframework.boot.context.properties.ConfigurationProperties
import org.springframework.context.annotation.Configuration

@Configuration
@ConfigurationProperties(prefix = "redis")
class RedisConfigurationProperties {

    var host: String? = null
    var port: Int? = null
    var username: String? = null
    var password: String? = null
    var shutdownTimeout = SHUTDOWN_TIMEOUT
    var timeout = TIMEOUT
    var connectionTimeout = CONNECTION_TIMEOUT
    val caches: MutableList<RedisCachePropertyUnit> = mutableListOf()

    companion object {
        private const val SHUTDOWN_TIMEOUT = 300
        private const val TIMEOUT = 4000
        private const val CONNECTION_TIMEOUT = 4000
    }
}
