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
        area = (10..1000).random().toFloat(),
        population = (10000..1000000).random().toLong(),
        establishmentDate = OffsetDateTime.now(),
        capital = false,
        metersAboveSeaLevel = (0..3000).random(),
        timezone = (-12..14).random(),
        climate = Climate.entries.toTypedArray().random(),
        government = Government.entries.toTypedArray().random(),
        governor = generateHuman()
    )
}

fun generateCoordinates(): Coordinates {
    return Coordinates(
        x = (1..1000).random(),
        y = (1..1000).random().toFloat()
    )
}

fun generateHuman(): Human {
    return Human(
        birthday = LocalDate.now().minusYears((1..100).random().toLong()),
    )
}
