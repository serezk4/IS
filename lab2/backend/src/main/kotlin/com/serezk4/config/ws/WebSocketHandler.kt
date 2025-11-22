package com.serezk4.config.ws

import io.github.oshai.kotlinlogging.KotlinLogging
import org.springframework.stereotype.Component
import org.springframework.web.socket.CloseStatus
import org.springframework.web.socket.TextMessage
import org.springframework.web.socket.WebSocketSession
import org.springframework.web.socket.handler.TextWebSocketHandler

@Component
class WebSocketHandler : TextWebSocketHandler() {

    private val sessions = mutableSetOf<WebSocketSession>()

    override fun afterConnectionEstablished(session: WebSocketSession) {
        logger.info { "Session established: ${session.id}" }
        sessions.add(session)
    }

    override fun afterConnectionClosed(session: WebSocketSession, status: CloseStatus) {
        sessions.remove(session)
        logger.info { "Session closed: ${session.id}, status: $status" }
    }

    fun broadcast(message: String) {
        sessions.forEach {
            if (it.isOpen) {
                it.sendMessage(TextMessage(message))
            }
        }
    }

    companion object {
        private val logger = KotlinLogging.logger {}
    }
}
