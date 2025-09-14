package com.serezk4.config.cache

import com.serezk4.api.model.FormattedBookCreaturePage
import com.serezk4.config.jackson.redisJsonObjectMapper
import com.serezk4.config.redis.RedisCachesConfiguration
import org.springframework.cache.annotation.EnableCaching
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.data.redis.cache.RedisCacheConfiguration
import org.springframework.data.redis.cache.RedisCacheManager
import org.springframework.data.redis.connection.RedisConnectionFactory
import org.springframework.data.redis.serializer.Jackson2JsonRedisSerializer
import org.springframework.data.redis.serializer.RedisSerializationContext
import org.springframework.data.redis.serializer.StringRedisSerializer

@Configuration
@EnableCaching
class CacheConfiguration {

    @Bean
    fun redisCacheManagerWithCacheTypes(
        factory: RedisConnectionFactory,
        cacheConfigs: RedisCachesConfiguration
    ): RedisCacheManager {
        val mapper = redisJsonObjectMapper()
        val defaultConfig = RedisCacheConfiguration.defaultCacheConfig()
            .serializeKeysWith(
                RedisSerializationContext.SerializationPair.fromSerializer(StringRedisSerializer())
            )
            .serializeValuesWith(
                RedisSerializationContext.SerializationPair.fromSerializer(
                    Jackson2JsonRedisSerializer(mapper, Any::class.java)
                )
            )
            .serializeKeysWith(RedisSerializationContext.SerializationPair.fromSerializer(StringRedisSerializer()))

        val creaturesConfig = defaultConfig.serializeValuesWith(
            RedisSerializationContext.SerializationPair.fromSerializer(
                Jackson2JsonRedisSerializer(mapper, FormattedBookCreaturePage::class.java)
            )
        )

        val initialCacheConfigurations: Map<String, RedisCacheConfiguration> =
            mapOf(
                "creatures" to creaturesConfig
            ) + cacheConfigs.redisCacheTypesConfigs(defaultConfig, mapper)

        return RedisCacheManager.builder(factory)
            .withInitialCacheConfigurations(initialCacheConfigurations)
            .cacheDefaults(defaultConfig)
            .build()
    }
}
