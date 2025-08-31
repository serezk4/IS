package com.serezk4.service

import com.serezk4.adapter.WebSocketAdapter
import com.serezk4.api.model.Climate
import com.serezk4.api.model.Government
import com.serezk4.entity.City
import com.serezk4.entity.Coordinates
import com.serezk4.entity.Human
import com.serezk4.model.CustomUserDetails
import com.serezk4.model.RealmAccess
import com.serezk4.model.ResourceRoles
import com.serezk4.repository.CityRepository
import io.kotest.matchers.shouldBe
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.mockito.Mockito.mock
import org.mockito.Mockito.spy
import org.mockito.Mockito.`when`
import org.mockito.kotlin.any
import org.springframework.security.core.Authentication
import org.springframework.security.core.context.SecurityContext
import org.springframework.security.core.context.SecurityContextHolder
import java.time.Instant
import java.time.LocalDate
import java.time.OffsetDateTime
import java.time.ZoneOffset
import java.util.*

class MigrateServiceTest {

    private val cityRepository: CityRepository = mock()
    private val accessService: AccessService = spy()
    private val websocketAdapter: WebSocketAdapter = mock()

    private val underTest = MigrateService(
        cityRepository,
        accessService,
        websocketAdapter
    )

    @BeforeEach
    fun setUp() {
        val mockContext = mock(SecurityContext::class.java)
        val mockAuth = mock(Authentication::class.java)

        `when`(mockAuth.principal).thenReturn(sampleUser)
        `when`(mockContext.authentication).thenReturn(mockAuth)

        `when`(cityRepository.findById(sampleCityId1))
            .thenReturn(Optional.of(sampleCreatedCity1))

        `when`(cityRepository.findById(sampleCityId2))
            .thenReturn(Optional.of(sampleCreatedCity2))

        `when`(cityRepository.save(any()))
            .thenAnswer { invocation -> invocation.arguments[0] }

        `when`(websocketAdapter.broadcast(any()))
            .thenAnswer {}

        SecurityContextHolder.setContext(mockContext)
    }

    @Test
    fun `migratePopulation should migrate population from one city to another`() {
//        // Given
//        val cityFrom = sampleCreatedCity1
//        val cityTo = sampleCreatedCity2
//
//        // When
//        underTest.migratePopulation(fromId = cityFrom.id!!, toId = cityTo.id!!)
//
//        // Then // todo
//        cityFrom.population shouldBe 0
//        cityTo.population shouldBe (samplePopulation1 + samplePopulation2)
    }

    companion object {

        private const val sampleUserSub = "57068298-32d2-4649-8d81-5f491c330631"

        private const val samplePopulation2 = 300000.toLong()
        private const val samplePopulation1 = 500000.toLong()

        private val sampleCreationDate = LocalDate.of(2024, 6, 1)
        private val sampleCityId1 = 123
        private val sampleCityId2 = 124
        private val sampleHumanId = 456
        private val sampleCoordinatesId = 789
        private val sampleEstablishmentDate = OffsetDateTime.of(
            /* year = */ 1970,
            /* month = */ 1,
            /* dayOfMonth = */ 1,
            /* hour = */ 0,
            /* minute = */ 0,
            /* second = */ 0,
            /* nanoOfSecond = */ 0,
            /* offset = */ ZoneOffset.UTC
        )
        private val sampleBirthdayDate = LocalDate.of(1970, 1, 1)

        private val sampleCoordinates = Coordinates(
            id = sampleCoordinatesId,
            x = 100,
            y = 50.5f
        )

        private val sampleHuman = Human(
            id = sampleHumanId,
            birthday = sampleBirthdayDate
        )

        private val sampleCreatedCity1 = City(
            id = sampleCityId1,
            name = "Sample City",
            coordinates = sampleCoordinates,
            ownerSub = sampleUserSub,
            area = 123.45f,
            population = samplePopulation1,
            establishmentDate = sampleEstablishmentDate,
            creationDate = sampleCreationDate,
            capital = true,
            metersAboveSeaLevel = 200,
            timezone = 3,
            climate = Climate.HUMIDSUBTROPICAL,
            government = Government.THALASSOCRACY,
            governor = sampleHuman
        )

        private val sampleCreatedCity2 = sampleCreatedCity1.copy(
            id = sampleCityId2,
            name = "Another City",
            population = samplePopulation2
        )

        private val sampleUser = CustomUserDetails(
            sub = sampleUserSub,
            emailVerified = true,
            allowedOrigins = listOf("https://example.com"),
            resourceAccess = mapOf("roles" to ResourceRoles(listOf("user"))),
            realmAccess = RealmAccess(listOf("hz")),
            issuer = "https://auth.example.com/",
            preferredUsername = "sampleUser",
            givenName = "Иван",
            familyName = "Иванов",
            sid = "some-session-id",
            acr = "1",
            azp = "client-id",
            scope = "openid profile email",
            name = "Иван Иванов",
            email = "ivan.ivanov@example.com",
            exp = Instant.now().plusSeconds(3600),
            iat = Instant.now(),
            jti = "unique-jti"
        )
    }
}