package com.serezk4.mapper

import com.serezk4.api.model.BookCreatureDto
import com.serezk4.api.model.CoordinatesDto
import com.serezk4.api.model.CustomUserDetailsDto
import com.serezk4.api.model.FormattedBookCreaturePage
import com.serezk4.api.model.HumanDto
import com.serezk4.api.model.MagicCityDto
import com.serezk4.api.model.RealmAccessDto
import com.serezk4.api.model.ResourceRolesDto
import com.serezk4.api.model.RingDto
import com.serezk4.entity.BookCreature
import com.serezk4.entity.Coordinates
import com.serezk4.entity.Human
import com.serezk4.entity.MagicCity
import com.serezk4.entity.Ring
import com.serezk4.model.CustomUserDetails
import com.serezk4.model.RealmAccess
import com.serezk4.model.ResourceRoles
import com.serezk4.util.toOffsetDateTime
import org.springframework.data.domain.Page

fun BookCreatureDto.toEntity() = BookCreature(
    ownerSub = this.ownerSub,
    ownerEmail = this.ownerEmail,
    name = this.name,
    coordinates = this.coordinates.toEntity(),
    age = this.age,
    creatureType = this.creatureType,
    creatureLocation = this.creatureLocation.toEntity(),
    attackLevel = this.attackLevel,
    defenseLevel = this.defenseLevel,
    ring = this.ring?.toEntity()
)

fun BookCreature.toDto() = BookCreatureDto(
    ownerSub = this.ownerSub!!,
    ownerEmail = this.ownerEmail!!,
    name = this.name!!,
    coordinates = this.coordinates.toDto(),
    age = this.age,
    creatureType = this.creatureType,
    creatureLocation = this.creatureLocation.toDto(),
    attackLevel = this.attackLevel,
    defenseLevel = this.defenseLevel,
    id = this.id,
    ring = this.ring?.toDto(),
    creationDate = this.creationDate,
)

fun MagicCity.toDto() = MagicCityDto(
    name = this.name,
    area = this.area,
    population = this.population,
    establishmentDate = this.establishmentDate,
    governor = this.governor.toDto(),
    isCapital = this.isCapital,
    populationDensity = this.populationDensity
)

fun Ring.toDto() = RingDto(
    id = this.id,
    name = this.name!!,
    weight = this.weight!!
)

fun RingDto.toEntity() = Ring(
    id = this.id,
    name = this.name
)

fun MagicCityDto.toEntity() = MagicCity(
    name = this.name,
    area = this.area,
    population = this.population,
    establishmentDate = this.establishmentDate,
    governor = this.governor.toEntity(),
    isCapital = this.isCapital,
    populationDensity = this.populationDensity
)

fun CoordinatesDto.toEntity() = Coordinates(
    x = this.x,
    y = this.y.toDouble()
)

fun HumanDto.toEntity() = Human(
    birthday = this.birthday
)

fun Coordinates.toDto() = CoordinatesDto(
    x = this.x,
    y = this.y.toFloat()
)

fun Human.toDto() = HumanDto(
    birthday = this.birthday
)

private inline fun <T> setIfChanged(
    current: () -> T?,
    newValue: T?,
    crossinline accept: (T) -> Boolean = { true },
    crossinline setter: (T) -> Unit
) {
    if (newValue != null && accept(newValue) && current() != newValue) {
        setter(newValue)
    }
}

fun BookCreature.partialUpdate(dto: BookCreatureDto): BookCreature = apply {
    setIfChanged({ name }, dto.name, { it.isNotBlank() }) { name = it }

    setIfChanged({ coordinates.x }, dto.coordinates.x) { coordinates.x = it }
    setIfChanged({ coordinates.y }, dto.coordinates.y.toDouble()) { coordinates.y = it }

    setIfChanged({ age }, dto.age, { it > 0 }) { age = it }
    setIfChanged({ creatureType }, dto.creatureType) { creatureType = it }

    dto.creatureLocation.let { loc ->
        setIfChanged({ creatureLocation.name }, loc.name, { it.isNotBlank() }) { creatureLocation.name = it }
        setIfChanged({ creatureLocation.area }, loc.area, { it > 0 }) { creatureLocation.area = it }
        setIfChanged({ creatureLocation.population }, loc.population, { it > 0 }) { creatureLocation.population = it }
        setIfChanged(
            { creatureLocation.establishmentDate },
            loc.establishmentDate
        ) { creatureLocation.establishmentDate = it }
        setIfChanged(
            { creatureLocation.governor.birthday },
            loc.governor.birthday
        ) { creatureLocation.governor.birthday = it }
        setIfChanged({ creatureLocation.isCapital }, loc.isCapital) { creatureLocation.isCapital = it }
        setIfChanged(
            { creatureLocation.populationDensity },
            loc.populationDensity,
            { it > 0 }) { creatureLocation.populationDensity = it }
    }

    setIfChanged({ attackLevel }, dto.attackLevel, { it >= 1 }) { attackLevel = it }
    setIfChanged({ defenseLevel }, dto.defenseLevel, { it > 0f }) { defenseLevel = it }

    dto.ring?.let { r ->
        if (ring == null) {
            if (r.name.isNotBlank() || (r.weight > 0f)) {
                ring = Ring(
                    name = r.name.takeIf { it.isNotBlank() },
                    weight = r.weight.takeIf { it > 0f }
                )
            }
        } else {
            setIfChanged({ ring!!.name }, r.name, { it.isNotBlank() }) { ring!!.name = it }
            setIfChanged({ ring!!.weight }, r.weight, { it > 0f }) { ring!!.weight = it }
        }
    }
}

fun Page<BookCreatureDto>.toResponse() = FormattedBookCreaturePage(
    content = this.content,
    page = this.number,
    propertySize = this.size,
    totalElements = this.totalElements.toInt(),
    totalPages = this.totalPages,
    last = this.isLast
)

fun CustomUserDetails.toDto() = CustomUserDetailsDto(
    sub = this.sub,
    emailVerified = this.emailVerified,
    allowedOrigins = this.allowedOrigins.toMutableList(),
    realmAccess = this.realmAccess.toDto(),
    resourceAccess = this.resourceAccess.mapValues { it.value.toDto() }.toMutableMap(),
    iss = this.issuer,
    preferredUsername = this.preferredUsername,
    givenName = this.givenName ?: "unknown",
    familyName = this.familyName,
    sid = this.sid,
    acr = this.acr,
    scope = this.scope,
    name = this.name ?: "unknown",
    email = this.email,
    exp = this.exp.toOffsetDateTime(),
    iat = this.iat.toOffsetDateTime(),
    jti = this.jti,
    azp = this.azp
)

fun RealmAccess.toDto() = RealmAccessDto(
    roles = this.roles.toMutableList()
)

fun ResourceRoles.toDto() = ResourceRolesDto(
    roles = this.roles.toMutableList()
)
