package com.serezk4.service

import com.serezk4.adapter.WebSocketAdapter
import com.serezk4.api.model.CityDto
import com.serezk4.api.model.Climate
import com.serezk4.api.model.CoordinatesDto
import com.serezk4.api.model.Government
import com.serezk4.api.model.HumanDto
import com.serezk4.constants.ADMIN
import com.serezk4.constants.USER
import com.serezk4.entity.Coordinates
import com.serezk4.entity.Human
import com.serezk4.exception.ObjectNotFoundException
import com.serezk4.exception.ObjectNotOwnedException
import com.serezk4.exception.ValidationException
import com.serezk4.model.CustomUserDetails
import com.serezk4.model.RealmAccess
import com.serezk4.model.ResourceRoles
import io.kotest.matchers.shouldBe
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import org.mockito.Mockito.mock
import org.mockito.Mockito.never
import org.mockito.Mockito.spy
import org.mockito.Mockito.`when`
import org.mockito.kotlin.any
import org.mockito.kotlin.given
import org.mockito.kotlin.verify
import org.springframework.data.domain.PageImpl
import org.springframework.data.domain.PageRequest
import org.springframework.data.domain.Sort
import org.springframework.security.core.Authentication
import org.springframework.security.core.context.SecurityContext
import org.springframework.security.core.context.SecurityContextHolder
import java.time.Instant
import java.time.LocalDate
import java.time.OffsetDateTime
import java.time.ZoneOffset
import java.util.*

class ObjectsServiceTest {

    private val cityRepository: CityRepository = mock()
    private val accessService: AccessService = spy()
    private val timeService: TimeService = mock()
    private val websocketAdapter: WebSocketAdapter = mock()

    private val underTest = ObjectsService(
        cityRepository,
        accessService,
        timeService,
        websocketAdapter
    )

    @BeforeEach
    fun setUp() {
        val mockContext = mock(SecurityContext::class.java)
        val mockAuth = mock(Authentication::class.java)

        `when`(mockAuth.principal).thenReturn(sampleUser)
        `when`(mockContext.authentication).thenReturn(mockAuth)

        `when`(cityRepository.findById(sampleCityId))
            .thenReturn(Optional.of(sampleCreatedCity))

        `when`(websocketAdapter.broadcast(any()))
            .thenAnswer {}

        SecurityContextHolder.setContext(mockContext)

        given(timeService.now())
            .willReturn(sampleCreationDate)
    }

    @Test
    fun `createObject should create object if object correct`() {
        // Given
        `when`(cityRepository.save(any()))
            .thenReturn(sampleCreatedCity)

        // When
        val result = underTest.createObject(sampleCityDto)

        // Then
        verify(websocketAdapter).broadcast(any())
        result.id shouldBe sampleCityId
        result.creationDate shouldBe sampleCreationDate
    }

    @Test
    fun `createObject should throw error if object have validation failures`() {
        // Given
        val invalidCityDto = sampleCityDto.copy(name = "")

        // When
        val exception = assertThrows<ValidationException> {
            underTest.createObject(invalidCityDto)
        }

        // Then
        verify(websocketAdapter, never()).broadcast(any())
        exception.errorCode shouldBe "validation_failed"
    }

    @Test
    fun `deleteObjectById should delete object when own by user`() {
        // Given
        `when`(cityRepository.deleteById(sampleCityId))
            .thenAnswer {}

        // When
        underTest.deleteObjectById(sampleCityId)

        // Then
        verify(websocketAdapter).broadcast(any())
    }

    @Test
    fun `deleteObjectById should throw error if object not found`() {
        // Given
        val nonExistentId = 999
        `when`(cityRepository.findById(nonExistentId))
            .thenReturn(Optional.empty())

        // When
        val exception = assertThrows<ObjectNotFoundException> {
            underTest.deleteObjectById(nonExistentId)
        }

        // Then
        verify(websocketAdapter, never()).broadcast(any())
        exception.errorCode shouldBe "object_not_found"
    }

    @Test
    fun `deleteObjectById should delete object when user has role admin`() {
        // Given
        val adminUser = sampleUser.copy(
            resourceAccess = mapOf(USER to ResourceRoles(listOf(ADMIN)))
        )
        val mockContext = mock(SecurityContext::class.java)
        val mockAuth = mock(Authentication::class.java)

        `when`(mockAuth.principal).thenReturn(adminUser)
        `when`(mockContext.authentication).thenReturn(mockAuth)
        SecurityContextHolder.setContext(mockContext)

        `when`(cityRepository.deleteById(sampleCityId))
            .thenAnswer {}

        // When
        underTest.deleteObjectById(sampleCityId)

        // Then
        verify(websocketAdapter).broadcast(any())
    }

    @Test
    fun `deleteObjectById should throw error when object owned by another user`() {
        // Given
        val anotherUser = sampleUser.copy(sub = "another-user-sub")
        val mockContext = mock(SecurityContext::class.java)
        val mockAuth = mock(Authentication::class.java)

        `when`(mockAuth.principal).thenReturn(anotherUser)
        `when`(mockContext.authentication).thenReturn(mockAuth)
        SecurityContextHolder.setContext(mockContext)

        // When
        val exception = assertThrows<ObjectNotOwnedException> {
            underTest.deleteObjectById(sampleCityId)
        }

        // Then
        verify(websocketAdapter, never()).broadcast(any())
        exception.errorCode shouldBe "object_not_owned"
    }

    @Test
    fun `patchObject should update object if own by user and data valid`() {
        // Given
        val updatedCityDto = sampleCityDto.copy(name = "Updated City Name")
        val updatedCity = sampleCreatedCity.copy(name = "Updated City Name")

        `when`(cityRepository.save(any()))
            .thenReturn(updatedCity)

        // When
        val result = underTest.patchObject(sampleCityId, updatedCityDto)

        // Then
        verify(websocketAdapter).broadcast(any())
        result.name shouldBe "Updated City Name"
    }

    @Test
    fun `patchObject should not update id and creationDate`() {
        // Given
        val updatedCityDto = sampleCityDto.copy(
            name = "Updated City Name",
            id = 999,
            creationDate = LocalDate.of(2000, 1, 1)
        )
        val updatedCity = sampleCreatedCity.copy(
            name = "Updated City Name",
        )

        `when`(cityRepository.save(any()))
            .thenReturn(updatedCity)

        // When
        val result = underTest.patchObject(sampleCityId, updatedCityDto)

        // Then
        verify(websocketAdapter).broadcast(any())
        result.id shouldBe sampleCityId
        result.creationDate shouldBe sampleCreationDate
        result.name shouldBe "Updated City Name"
    }

    @Test
    fun `patchObject should throw error if object not found`() {
        // Given
        val nonExistentId = 999
        `when`(cityRepository.findById(nonExistentId))
            .thenReturn(Optional.empty())

        // When
        val exception = assertThrows<ObjectNotFoundException> {
            underTest.patchObject(nonExistentId, sampleCityDto)
        }

        // Then
        verify(websocketAdapter, never()).broadcast(any())
        exception.errorCode shouldBe "object_not_found"
    }

    @Test
    fun `patchObject should throw error if object owned by another user`() {
        // Given
        val anotherUser = sampleUser.copy(sub = "another-user-sub")
        val mockContext = mock(SecurityContext::class.java)
        val mockAuth = mock(Authentication::class.java)

        `when`(mockAuth.principal).thenReturn(anotherUser)
        `when`(mockContext.authentication).thenReturn(mockAuth)
        SecurityContextHolder.setContext(mockContext)

        // When
        val exception = assertThrows<ObjectNotOwnedException> {
            underTest.patchObject(sampleCityId, sampleCityDto)
        }

        // Then
        verify(websocketAdapter, never()).broadcast(any())
        exception.errorCode shouldBe "object_not_owned"
    }

    @Test
    fun `getObjects should return paged objects`() {
        // Given
        `when`(cityRepository.findAll(samplePageable))
            .thenReturn(samplePageResponse)

        // When
        val result = underTest.getObjects(samplePageable)

        // Then
        verify(websocketAdapter, never()).broadcast(any())
        result.totalElements shouldBe 1
        result.content.first().id shouldBe sampleCityId
        result.number shouldBe 0
    }

    @Test
    fun `getObjectById should return object if found`() {
        // Given

        // When
        val result = underTest.getObjectById(sampleCityId)

        // Then
        verify(websocketAdapter, never()).broadcast(any())
        result.id shouldBe sampleCityId
    }

    @Test
    fun `getObjectById should throw error if object not found`() {
        // Given
        val nonExistentId = 999
        `when`(cityRepository.findById(nonExistentId))
            .thenReturn(Optional.empty())

        // When
        val exception = assertThrows<ObjectNotFoundException> {
            underTest.getObjectById(nonExistentId)
        }

        // Then
        verify(websocketAdapter, never()).broadcast(any())
        exception.errorCode shouldBe "object_not_found"
    }

    companion object {

        private const val sampleUserSub = "57068298-32d2-4649-8d81-5f491c330631"

        private val sampleCreationDate = LocalDate.of(2024, 6, 1)
        private val sampleCityId = 123
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

        private val sampleCoordinatesDto = CoordinatesDto(
            x = 100,
            y = 50.5f
        )

        private val sampleCoordinates = Coordinates(
            id = sampleCoordinatesId,
            x = 100,
            y = 50.5f
        )

        private val sampleHumanDto = HumanDto(
            birthday = sampleBirthdayDate
        )

        private val sampleHuman = Human(
            id = sampleHumanId,
            birthday = sampleBirthdayDate
        )

        private val sampleCityDto = CityDto(
            name = "Sample City",
            coordinates = sampleCoordinatesDto,
            area = 123.45f,
            population = 500000,
            establishmentDate = sampleEstablishmentDate,
            capital = true,
            metersAboveSeaLevel = 200,
            timezone = 3,
            climate = Climate.HUMIDSUBTROPICAL,
            government = Government.THALASSOCRACY,
            governor = sampleHumanDto
        )

        private val sampleCreatedCity = City(
            id = sampleCityId,
            name = "Sample City",
            coordinates = sampleCoordinates,
            ownerSub = sampleUserSub,
            area = 123.45f,
            population = 500000,
            establishmentDate = sampleEstablishmentDate,
            creationDate = sampleCreationDate,
            capital = true,
            metersAboveSeaLevel = 200,
            timezone = 3,
            climate = Climate.HUMIDSUBTROPICAL,
            government = Government.THALASSOCRACY,
            governor = sampleHuman
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

        private val samplePageResponse = PageImpl(
            listOf(sampleCreatedCity)
        )

        private val samplePageable = PageRequest.of(0, 10, Sort.unsorted())
    }
}
