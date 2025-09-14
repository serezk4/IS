package com.serezk4.util

import com.serezk4.api.model.BookCreatureType
import com.serezk4.entity.BookCreature
import com.serezk4.entity.Coordinates
import com.serezk4.entity.Human
import com.serezk4.entity.MagicCity
import com.serezk4.entity.Ring
import java.time.LocalDate
import java.time.OffsetDateTime
import java.time.ZoneOffset
import kotlin.math.max
import kotlin.random.Random

private object GenDefaults {
    const val CORD_X_MIN = 0L
    const val CORD_X_MAX_EXCL = 373L
    const val CORD_Y_MIN = 0.0
    const val CORD_Y_MAX_EXCL = 289.0

    const val HUMAN_AGE_YEARS_MIN = 1L
    const val HUMAN_AGE_YEARS_MAX_INCL = 100L

    const val USER_ID_MIN = 1000
    const val USER_ID_MAX_EXCL = 10_000

    const val RING_WEIGHT_MIN = 0.5
    const val RING_WEIGHT_MAX = 5.0

    const val CITY_AREA_MIN = 50.0
    const val CITY_AREA_MAX = 15_000.0
    const val CITY_POP_MIN = 1_000L
    const val CITY_POP_MAX = 5_000_000L
    const val CITY_CAPITAL_PROB = 0.2

    const val ESTABLISH_MIN_YEARS_AGO = 50L
    const val ESTABLISH_MAX_YEARS_AGO = 1_500L
    const val DAYS_IN_YEAR = 365L

    const val CREATURE_AGE_MIN = 1L
    const val CREATURE_AGE_MAX_EXCL = 401L
    const val ATTACK_MIN = 1L
    const val ATTACK_MAX_EXCL = 501L
    const val DEFENSE_MIN = 1.0
    const val DEFENSE_MAX = 100.0

    const val WITH_RING_PROB = 0.35
}

private val CREATURE_NAMES = listOf(
    "Smaug", "Gandalf", "Legolas", "Gollum", "Azog", "Beorn", "Elrond", "Radagast", "Shelob", "Bard",
    "Saruman", "Thorin", "Kíli", "Fíli", "Bolg", "Dáin", "Glorfindel", "Lúthien", "Eärendil", "Gil-galad"
)

private val CITY_NAMES = listOf(
    "Avalon", "Mithlond", "Rivendell", "Gondolin", "Minas Tirith", "Dol Guldur", "Valfenda",
    "Khazad-dûm", "Numenor", "Beleriand", "Fornost", "Osgiliath", "Umbar", "Edoras", "Lorien"
)

fun generateCoordinates(): Coordinates = Coordinates(
    x = Random.nextLong(GenDefaults.CORD_X_MIN, GenDefaults.CORD_X_MAX_EXCL),
    y = Random.nextDouble(GenDefaults.CORD_Y_MIN, GenDefaults.CORD_Y_MAX_EXCL)
)

fun generateHuman(): Human = Human(
    birthday = LocalDate.now().minusYears(
        Random.nextLong(
            GenDefaults.HUMAN_AGE_YEARS_MIN,
            GenDefaults.HUMAN_AGE_YEARS_MAX_INCL + 1
        )
    )
)

private fun randomName(): String = CREATURE_NAMES.random()
private fun randomCity(): String = CITY_NAMES.random()
private fun randomSub(): String =
    "user-${Random.nextInt(GenDefaults.USER_ID_MIN, GenDefaults.USER_ID_MAX_EXCL)}"

private fun randomEmail(sub: String): String = "$sub@example.com"

private fun randomBool(probability: Double): Boolean = Random.nextDouble() < probability

private fun randomPastOffsetDateTime(
    minYearsAgo: Long,
    maxYearsAgo: Long
): OffsetDateTime {
    val years = Random.nextLong(minYearsAgo, maxYearsAgo + 1)
    val days = Random.nextLong(0, GenDefaults.DAYS_IN_YEAR + 1)
    return OffsetDateTime.now(ZoneOffset.UTC).minusYears(years).minusDays(days)
}

fun generateRing(
    name: String? = listOf("Ring of Power", "Narya", "Nenya", "Vilya", "One Ring", "Dwarf Ring", "Elven Band").random(),
    weight: Float? = Random.nextDouble(GenDefaults.RING_WEIGHT_MIN, GenDefaults.RING_WEIGHT_MAX).toFloat()
): Ring = Ring(name = name, weight = weight)

fun generateMagicCity(): MagicCity {
    val area = Random.nextDouble(GenDefaults.CITY_AREA_MIN, GenDefaults.CITY_AREA_MAX)
    val population = Random.nextLong(GenDefaults.CITY_POP_MIN, GenDefaults.CITY_POP_MAX + 1)
    val density = max(1.0, population.toDouble() / area)

    return MagicCity(
        name = randomCity(),
        area = area,
        population = population,
        establishmentDate = randomPastOffsetDateTime(
            GenDefaults.ESTABLISH_MIN_YEARS_AGO,
            GenDefaults.ESTABLISH_MAX_YEARS_AGO
        ),
        governor = generateHuman(),
        isCapital = randomBool(GenDefaults.CITY_CAPITAL_PROB),
        populationDensity = density
    )
}

fun generateBookCreature(
    ownerSub: String = randomSub(),
    ownerEmail: String = randomEmail(ownerSub),
    creatureType: BookCreatureType = BookCreatureType.values().random(),
    withRingProbability: Double = GenDefaults.WITH_RING_PROB
): BookCreature = BookCreature(
    id = null,
    ownerSub = ownerSub,
    ownerEmail = ownerEmail,
    name = randomName(),
    coordinates = generateCoordinates(),
    age = Random.nextLong(GenDefaults.CREATURE_AGE_MIN, GenDefaults.CREATURE_AGE_MAX_EXCL),
    creatureType = creatureType,
    creatureLocation = generateMagicCity(),
    attackLevel = Random.nextLong(GenDefaults.ATTACK_MIN, GenDefaults.ATTACK_MAX_EXCL),
    defenseLevel = Random.nextDouble(GenDefaults.DEFENSE_MIN, GenDefaults.DEFENSE_MAX).toFloat(),
    ring = if (randomBool(withRingProbability)) generateRing() else null,
    creationDate = OffsetDateTime.now(ZoneOffset.UTC)
)

fun generateBookCreatures(
    count: Int,
    ownerSub: String? = null,
    ownerEmail: String? = null,
    withRingProbability: Double = GenDefaults.WITH_RING_PROB
): List<BookCreature> = List(count) {
    val sub = ownerSub ?: randomSub()
    val email = ownerEmail ?: randomEmail(sub)
    generateBookCreature(
        ownerSub = sub,
        ownerEmail = email,
        withRingProbability = withRingProbability
    )
}
