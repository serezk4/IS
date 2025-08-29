package com.serezk4.mapper

import com.serezk4.api.model.CityDto
import com.serezk4.api.model.CoordinatesDto
import com.serezk4.api.model.FormattedCityPage
import com.serezk4.api.model.HumanDto
import com.serezk4.entity.City
import com.serezk4.entity.Coordinates
import com.serezk4.entity.Human
import org.springframework.data.domain.Page

fun CityDto.toEntity() = City(
    name = this.name,
    coordinates = this.coordinates.toEntity(),
    area = this.area,
    population = this.population,
    establishmentDate = this.establishmentDate,
    capital = this.capital,
    metersAboveSeaLevel = this.metersAboveSeaLevel,
    timezone = this.timezone,
    climate = this.climate,
    government = this.government,
    governor = governor.toEntity(),
)

fun CoordinatesDto.toEntity() = Coordinates(
    x = this.x,
    y = this.y
)

fun HumanDto.toEntity() = Human(
    birthday = this.birthday
)

fun City.toDto() = CityDto(
    id = this.id,
    name = this.name,
    coordinates = this.coordinates.toDto(),
    creationDate = this.creationDate,
    area = this.area,
    population = this.population,
    establishmentDate = this.establishmentDate,
    capital = this.capital,
    metersAboveSeaLevel = this.metersAboveSeaLevel,
    timezone = this.timezone,
    climate = this.climate,
    government = this.government,
    governor = this.governor.toDto()
)

fun Coordinates.toDto() = CoordinatesDto(
    x = this.x,
    y = this.y
)

fun Human.toDto() = HumanDto(
    birthday = this.birthday
)

fun City.partialUpdate(cityDto: CityDto): City {
    cityDto.name.takeIf { it.isNotBlank() }?.let { this.name = it }
    cityDto.coordinates.let {
        this.coordinates.x = it.x
        this.coordinates.y = it.y
    }
    cityDto.population.let { this.population = it }
    cityDto.metersAboveSeaLevel.let { this.metersAboveSeaLevel = it }
    cityDto.timezone.let { this.timezone = it }
    cityDto.climate.let { this.climate = it }
    cityDto.government.let { this.government = it }
    cityDto.governor.let { this.governor.birthday = it.birthday }
    cityDto.area?.let { this.area = it }
    cityDto.establishmentDate?.let { this.establishmentDate = it }
    cityDto.capital?.let { this.capital = it }

    return this
}

fun Page<CityDto>.toResponse() = FormattedCityPage(
    content = this.content,
    page = this.number,
    propertySize = this.size,
    totalElements = this.totalElements.toInt(),
    totalPages = this.totalPages,
    last = this.isLast
)
