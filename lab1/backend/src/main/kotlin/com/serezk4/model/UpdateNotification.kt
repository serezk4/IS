package com.serezk4.model

import com.serezk4.entity.City

data class UpdateNotification(
    val city: City,
    val op: String
)
