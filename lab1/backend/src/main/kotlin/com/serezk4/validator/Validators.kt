package com.serezk4.validator

import com.serezk4.api.model.CityDto
import com.serezk4.api.model.CoordinatesDto
import com.serezk4.exception.ValidationException

fun CoordinatesDto.validate() {
    val errors = mutableMapOf<String, String>()

    with(CoordinatesValidationConstants) {
        x.takeIf { it >= COORDINATES_MAX_X }?.let { errors[X_FIELD] = X_INVALID }
        y.takeIf { it >= COORDINATES_MAX_Y }?.let { errors[Y_FIELD] = Y_INVALID }
    }

    if (errors.isNotEmpty()) throw ValidationException(errors)
}

fun CityDto.validate() {
    val errors = mutableMapOf<String, String>()

    with(CityValidationConstants) {
        coordinates.validate()

        name.takeIf { it.isBlank() }?.let { errors[NAME_FIELD] = NAME_EMPTY }
        area?.takeIf { it <= MIN_AREA }?.let { errors[AREA_FIELD] = AREA_INVALID }
        population.takeIf { it <= MIN_POPULATION }?.let { errors[POPULATION_FIELD] = POPULATION_INVALID }

        timezone.takeIf { it < MIN_TIMEZONE || it > MAX_TIMEZONE }
            ?.let { errors[TIMEZONE_FIELD] = TIMEZONE_INVALID }
    }

    if (errors.isNotEmpty()) throw ValidationException(errors)
}

object CoordinatesValidationConstants {
    const val COORDINATES_MAX_X = 373
    const val COORDINATES_MAX_Y = 289

    const val X_FIELD = "x"
    const val Y_FIELD = "y"

    const val X_INVALID = "X должно быть меньше $COORDINATES_MAX_X"
    const val Y_INVALID = "Y должно быть меньше $COORDINATES_MAX_Y"
}

object CityValidationConstants {
    const val MIN_AREA = 0.0
    const val MIN_POPULATION = 0L
    const val MIN_TIMEZONE = -13
    const val MAX_TIMEZONE = 15

    const val NAME_FIELD = "name"
    const val AREA_FIELD = "area"
    const val POPULATION_FIELD = "population"
    const val TIMEZONE_FIELD = "timezone"

    const val NAME_EMPTY = "Имя не может быть пустым"
    const val AREA_INVALID = "Площадь должна быть больше 0"
    const val POPULATION_INVALID = "Население должно быть больше 0"
    const val TIMEZONE_INVALID = "Часовой пояс должен быть в диапазоне от $MIN_TIMEZONE до $MAX_TIMEZONE"
}
