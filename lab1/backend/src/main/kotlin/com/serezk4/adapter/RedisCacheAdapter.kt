package com.serezk4.adapter

import com.serezk4.config.cache.CacheWrapper
import org.springframework.beans.factory.annotation.Qualifier
import org.springframework.cache.CacheManager
import org.springframework.stereotype.Service

@Service
class RedisCacheAdapter(
    @Qualifier("redisCacheManagerWithCacheTypes")
    private val redisCacheManager: CacheManager
) {

    private fun getCache(cacheName: String): CacheWrapper {
        val cache = redisCacheManager.getCache(cacheName)
            ?: error("Cache with name $cacheName not found")
        return CacheWrapper(cache)
    }
}
