package com.serezk4.config.rabbitmq

import org.springframework.boot.context.properties.ConfigurationProperties
import org.springframework.context.annotation.Configuration

@Configuration
@ConfigurationProperties(prefix = "rabbitmq")
class RabbitmqConfigurationProperties {
    var host: String? = null
    var port: Int? = null
    var username: String? = null
    var password: String? = null
    var virtualHost: String? = null
    var connectionTimeout = CONNECTION_TIMEOUT

    companion object {
        private const val CONNECTION_TIMEOUT = 4000
    }
}
