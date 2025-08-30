package com.serezk4.adapter

import com.serezk4.config.jackson.redisJsonObjectMapper
import com.serezk4.config.ws.WebSocketHandler
import com.serezk4.model.UpdateNotification
import io.github.oshai.kotlinlogging.KotlinLogging
import org.springframework.stereotype.Component

@Component
class WebSocketAdapter(
    private val webSocketHandler: WebSocketHandler
) {

    fun broadcast(notification: UpdateNotification) {
        webSocketHandler.broadcast(
            mapper.writeValueAsString(notification)
        ).also { logger.info { "Broadcasted notification: $notification" } }
    }

    companion object {
        private val mapper = redisJsonObjectMapper()
        private val logger = KotlinLogging.logger {}
    }
}
