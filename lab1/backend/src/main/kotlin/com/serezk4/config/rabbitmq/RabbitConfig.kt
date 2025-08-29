package com.serezk4.config.rabbitmq

import org.springframework.amqp.core.AnonymousQueue
import org.springframework.amqp.core.Binding
import org.springframework.amqp.core.BindingBuilder
import org.springframework.amqp.core.DirectExchange
import org.springframework.amqp.core.FanoutExchange
import org.springframework.amqp.core.Queue
import org.springframework.amqp.rabbit.annotation.EnableRabbit
import org.springframework.amqp.rabbit.connection.CachingConnectionFactory
import org.springframework.amqp.rabbit.connection.ConnectionFactory
import org.springframework.amqp.rabbit.core.RabbitAdmin
import org.springframework.amqp.rabbit.core.RabbitTemplate
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration

@Configuration
@EnableRabbit
class RabbitConfig(
    private val props: RabbitmqConfigurationProperties
) {

    companion object {
        const val FANOUT = "notifications.fanout"
        const val DIRECT = "notifications.direct"
    }

    @Bean
    fun connectionFactory(): ConnectionFactory =
        CachingConnectionFactory(props.host, props.port!!).apply {
            username = props.username!!; setPassword(props.password!!);
            virtualHost = props.virtualHost!!
            cacheMode = CachingConnectionFactory.CacheMode.CHANNEL
        }

    @Bean
    fun rabbitTemplate(cf: ConnectionFactory) = RabbitTemplate(cf)

    @Bean
    fun rabbitAdmin(cf: ConnectionFactory) = RabbitAdmin(cf)

    // Exchanges
    @Bean
    fun fanoutExchange(): FanoutExchange = FanoutExchange(FANOUT, true, false)

    @Bean
    fun directExchange(): DirectExchange = DirectExchange(DIRECT, true, false)

    @Bean
    fun instanceQueue(): AnonymousQueue = AnonymousQueue()

    @Bean
    fun fanoutBinding(fanout: FanoutExchange, instanceQueue: AnonymousQueue): Binding =
        BindingBuilder.bind(instanceQueue).to(fanout)

    @Bean
    fun userQueue(): Queue = Queue(
        "notifications.user", true, false, false, mapOf(
            "x-single-active-consumer" to true
        )
    )

    @Bean
    fun userBinding(direct: DirectExchange, userQueue: Queue): Binding =
        BindingBuilder.bind(userQueue).to(direct).with("user.*")
}
