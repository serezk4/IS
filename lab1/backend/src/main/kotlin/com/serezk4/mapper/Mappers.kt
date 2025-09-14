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
    lastModifiedDate = this.lastModifiedDate
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

fun BookCreature.partialUpdate(bookCreatureDto: BookCreatureDto): BookCreature {
    bookCreatureDto.name.takeIf { it.isNotBlank() }?.let { this.name = it }
    bookCreatureDto.coordinates.let {
        this.coordinates.x = it.x
        this.coordinates.y = it.y.toDouble()
    }
    bookCreatureDto.age.let { this.age = it }
    bookCreatureDto.creatureType.let { this.creatureType = it }
    bookCreatureDto.creatureLocation.let {
        this.creatureLocation.name = it.name
        this.creatureLocation.area = it.area
        this.creatureLocation.population = it.population
        it.establishmentDate?.let { date -> this.creatureLocation.establishmentDate = date }
        it.governor.let { governorDto ->
            governorDto.birthday?.let { date -> this.creatureLocation.governor.birthday = date }
        }
        it.isCapital?.let { capital -> this.creatureLocation.isCapital = capital }
        this.creatureLocation.populationDensity = it.populationDensity
    }
    bookCreatureDto.attackLevel.let { this.attackLevel = it }
    bookCreatureDto.defenseLevel.let { this.defenseLevel = it }
    bookCreatureDto.ring?.let {
        if (this.ring == null) {
            this.ring = Ring(
                name = it.name
            )
        } else {
            it.name.takeIf { name -> name.isNotBlank() }?.let { name -> this.ring!!.name = name }
        }
    }

    return this
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
