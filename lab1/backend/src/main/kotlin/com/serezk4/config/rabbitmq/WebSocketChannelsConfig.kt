package com.serezk4.config.rabbitmq

import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.messaging.simp.config.ChannelRegistration
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer

@Configuration
class WebSocketChannelsConfig : WebSocketMessageBrokerConfigurer {

    override fun configureClientInboundChannel(registration: ChannelRegistration) {
        registration.taskExecutor(inboundPool())
    }

    override fun configureClientOutboundChannel(registration: ChannelRegistration) {
        registration.taskExecutor(outboundPool())
    }

    @Bean
    fun inboundPool() = ThreadPoolTaskExecutor().apply {
        corePoolSize = CORE_POOL_SIZE; maxPoolSize = MAX_POOL_SIZE; queueCapacity = QUEUE_CAPACITY
        setThreadNamePrefix("ws-in-"); initialize()
    }

    @Bean
    fun outboundPool() = ThreadPoolTaskExecutor().apply {
        corePoolSize = CORE_POOL_SIZE; maxPoolSize = MAX_POOL_SIZE; queueCapacity = QUEUE_CAPACITY
        setThreadNamePrefix("ws-out-"); initialize()
    }

    companion object {
        private const val MAX_POOL_SIZE = 64
        private const val CORE_POOL_SIZE = 8
        private const val QUEUE_CAPACITY = 2000
    }
}
