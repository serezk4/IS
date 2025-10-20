package com.serezk4.config.redis

import com.fasterxml.jackson.databind.ObjectMapper
import io.github.oshai.kotlinlogging.KotlinLogging
import org.springframework.data.redis.cache.RedisCacheConfiguration
import org.springframework.data.redis.serializer.Jackson2JsonRedisSerializer
import org.springframework.data.redis.serializer.RedisSerializationContext
import org.springframework.stereotype.Component

@Component
class RedisCachesConfiguration(
    private val props: RedisConfigurationProperties
) {

    fun redisCacheTypesConfigs(
        defaultConfig: RedisCacheConfiguration,
        mapper: ObjectMapper
    ): Map<String, RedisCacheConfiguration> {
        return props.caches.associate { cache ->
            try {
                val javaType = mapper.typeFactory.constructFromCanonical(cache.returnType)

                val localConfig = defaultConfig
                    .serializeValuesWith(
                        RedisSerializationContext.SerializationPair
                            .fromSerializer(Jackson2JsonRedisSerializer<Any>(mapper, javaType))
                    )

                if (!cache.nullable) {
                    localConfig.apply {
                        disableCachingNullValues()
                    }
                }

                cache.name to localConfig
            } catch (e: ClassNotFoundException) {
                logger.error { "Class not found for ${cache.returnType}" }
                throw e
            }
        }
    }

    companion object {
        private val logger = KotlinLogging.logger {}
    }
}
