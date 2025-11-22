package com.serezk4.config.cache

import io.github.oshai.kotlinlogging.KLogger
import io.github.oshai.kotlinlogging.KotlinLogging
import org.springframework.cache.Cache
import java.util.concurrent.Callable

class CacheWrapper(private val delegate: Cache) : Cache by delegate {

    fun getWrapper(key: Any): Result<Cache.ValueWrapper?> =
        runCatching { delegate[key] }.logFailure(key)

    fun <T : Any?> getWrapper(key: Any, valueLoader: Callable<T>): Result<T?> =
        runCatching { delegate[key, valueLoader] }.logFailure(key, loader = true)

    fun <T : Any?> getWrapper(key: Any, type: Class<T>): Result<T?> =
        runCatching { delegate[key, type] }.logFailure(key, type = type)

    private fun <T> Result<T>.logFailure(key: Any, loader: Boolean = false, type: Class<*>? = null): Result<T> {
        this.onFailure {
            val typeInfo = type?.simpleName?.let { " with type $it" } ?: ""
            val loaderInfo = if (loader) " with loader" else ""
            logger.error { "Error getting cache key $key from cache $name$loaderInfo$typeInfo: ${it.message}" }
        }
        return this
    }

    companion object {
        private val logger: KLogger = KotlinLogging.logger {}
    }
}
