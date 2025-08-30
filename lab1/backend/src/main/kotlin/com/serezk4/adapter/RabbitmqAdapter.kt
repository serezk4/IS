package com.serezk4.adapter

import com.serezk4.model.UpdateNotification
import org.springframework.amqp.rabbit.core.RabbitTemplate
import org.springframework.stereotype.Component

@Component
class RabbitmqAdapter(
    private val rabbitTemplate: RabbitTemplate
) {

    fun broadcast(notification: UpdateNotification) {
        rabbitTemplate.convertAndSend(
            "notifications.exchange",
            "broadcast",
            notification
        )
    }
}
