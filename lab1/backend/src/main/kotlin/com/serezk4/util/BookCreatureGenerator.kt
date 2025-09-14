package com.serezk4.util

import com.serezk4.entity.Coordinates
import com.serezk4.entity.Human
import java.time.LocalDate

fun generateCoordinates(): Coordinates {
    return Coordinates(
        x = (0 until 373).random().toLong(),
        y = (0 until 289).random().toDouble()
    )
}

fun generateHuman(): Human {
    return Human(
        birthday = LocalDate.now().minusYears((1..100).random().toLong())
    )
}
