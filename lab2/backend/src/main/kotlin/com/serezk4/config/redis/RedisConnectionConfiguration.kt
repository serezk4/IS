package com.serezk4.config.redis

import io.lettuce.core.ClientOptions
import io.lettuce.core.SocketOptions
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.data.redis.connection.RedisConnectionFactory
import org.springframework.data.redis.connection.RedisPassword
import org.springframework.data.redis.connection.RedisStandaloneConfiguration
import org.springframework.data.redis.connection.lettuce.LettuceClientConfiguration
import org.springframework.data.redis.connection.lettuce.LettuceConnectionFactory
import java.time.Duration

@Configuration
class RedisConnectionConfiguration(
    private val props: RedisConfigurationProperties
) {

    @Bean
    fun redisConnectionFactory(): RedisConnectionFactory {

        require(props.host != null) { "Redis host must be provided" }
        require(props.port != null) { "Redis port must be provided" }

        val clientOptions = ClientOptions.builder()
            .autoReconnect(true)
            .socketOptions(
                SocketOptions.builder()
                    .connectTimeout(Duration.ofMillis(props.connectionTimeout.toLong()))
                    .build()
            )
            .build()

        val lettuceClientConfiguration = LettuceClientConfiguration.builder()
            .commandTimeout(Duration.ofMillis(props.timeout.toLong()))
            .shutdownTimeout(Duration.ofMillis(props.shutdownTimeout.toLong()))
            .clientOptions(clientOptions)
            .build()

        val redisConfiguration = RedisStandaloneConfiguration().apply {
            hostName = props.host!!
            port = props.port!!
            username = props.username
            password = props.password?.let { RedisPassword.of(it) } ?: RedisPassword.none()
        }

        return LettuceConnectionFactory(redisConfiguration, lettuceClientConfiguration).also {
            it.afterPropertiesSet()
        }
    }
}
