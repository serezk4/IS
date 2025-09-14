package com.serezk4.model

import com.serezk4.entity.BookCreature

data class UpdateNotification(
    val bookCreature: BookCreature,
    val op: String
)
