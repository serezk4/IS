package com.serezk4.config.ws

import org.springframework.context.annotation.Configuration
import org.springframework.web.socket.config.annotation.EnableWebSocket
import org.springframework.web.socket.config.annotation.WebSocketConfigurer
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry

@Configuration
@EnableWebSocket
class WebSocketConfiguration(
    private val webSocketHandler: WebSocketHandler
) : WebSocketConfigurer {
    override fun registerWebSocketHandlers(
        registry: WebSocketHandlerRegistry,
    ) {
        registry.addHandler(webSocketHandler, "/ws")
            .setAllowedOriginPatterns("*")
    }
}
