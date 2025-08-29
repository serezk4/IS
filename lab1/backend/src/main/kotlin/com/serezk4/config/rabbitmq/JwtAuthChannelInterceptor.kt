package com.serezk4.config.rabbitmq

import com.serezk4.converter.CustomJwtAuthenticationConverter
import org.springframework.messaging.Message
import org.springframework.messaging.MessageChannel
import org.springframework.messaging.simp.stomp.StompHeaderAccessor
import org.springframework.messaging.support.ChannelInterceptor
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.security.oauth2.jwt.JwtDecoder
import org.springframework.stereotype.Component

@Component
class JwtAuthChannelInterceptor(
    private val jwtDecoder: JwtDecoder,
    private val customJwtAuthenticationConverter: CustomJwtAuthenticationConverter
) : ChannelInterceptor {

    override fun preSend(message: Message<*>, channel: MessageChannel): Message<*>? {
        val accessor = StompHeaderAccessor.wrap(message)

        if (accessor.command?.name == "CONNECT") {
            val authHeader = accessor.getFirstNativeHeader("Authorization")
                ?: error("Missing Authorization header")

            if (!authHeader.startsWith("Bearer ")) {
                error("Invalid Authorization header")
            }

            val token = authHeader.removePrefix("Bearer ").trim()
            val jwt = jwtDecoder.decode(token)
            val authentication = customJwtAuthenticationConverter.convert(jwt)

            SecurityContextHolder.getContext().authentication = authentication
        }

        return message
    }
}
