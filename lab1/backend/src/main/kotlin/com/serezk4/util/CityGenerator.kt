package com.serezk4.util

import com.serezk4.api.model.Climate
import com.serezk4.api.model.Government
import com.serezk4.entity.City
import com.serezk4.entity.Coordinates
import com.serezk4.entity.Human
import java.time.LocalDate
import java.time.OffsetDateTime

fun generateCity(): City {
    return City(
        name = "TestCity${(1..100000).random()}",
        coordinates = generateCoordinates(),
        area = (1..1000).random().toFloat(),
        population = (1..1_000_000).random().toLong(),
        establishmentDate = OffsetDateTime.now(),
        capital = false,
        metersAboveSeaLevel = (0..3000).random(),
        timezone = (-13..15).random(),
        climate = Climate.entries.random(),
        government = Government.entries.random(),
        governor = generateHuman()
    )
}

fun generateCoordinates(): Coordinates {
    return Coordinates(
        x = (0 until 373).random(),
        y = (0 until 289).random().toFloat()
    )
}

fun generateHuman(): Human {
    return Human(
        birthday = LocalDate.now().minusYears((1..100).random().toLong())
    )
}
