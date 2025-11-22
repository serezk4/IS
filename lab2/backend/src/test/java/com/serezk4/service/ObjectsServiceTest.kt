package com.serezk4.service

import com.serezk4.adapter.WebSocketAdapter
import com.serezk4.api.model.BookCreatureType
import com.serezk4.constants.ADMIN
import com.serezk4.constants.USER
import com.serezk4.entity.BookCreature
import com.serezk4.entity.Coordinates
import com.serezk4.entity.Human
import com.serezk4.entity.MagicCity
import com.serezk4.entity.Ring
import com.serezk4.exception.ObjectNotFoundException
import com.serezk4.exception.ObjectNotOwnedException
import com.serezk4.exception.ValidationException
import com.serezk4.mapper.toDto
import com.serezk4.model.CustomUserDetails
import com.serezk4.model.RealmAccess
import com.serezk4.model.ResourceRoles
import com.serezk4.repository.BookCreatureRepository
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

    private val bookCreatureRepository: BookCreatureRepository = mock()
    private val accessService: AccessService = spy()
    private val timeService: TimeService = mock()
    private val websocketAdapter: WebSocketAdapter = mock()

    private val underTest = ObjectsService(
        bookCreatureRepository,
        accessService,
        websocketAdapter,
        timeService
    )

    @BeforeEach
    fun setUp() {
        val mockContext = mock(SecurityContext::class.java)
        val mockAuth = mock(Authentication::class.java)

        `when`(mockAuth.principal).thenReturn(sampleUser)
        `when`(mockContext.authentication).thenReturn(mockAuth)

        `when`(bookCreatureRepository.findById(sampleBookCreatureId))
            .thenReturn(Optional.of(sampleCreatedBookCreature))

        `when`(websocketAdapter.broadcast(any()))
            .thenAnswer {}

        SecurityContextHolder.setContext(mockContext)

        given(timeService.now())
            .willReturn(sampleOffsetDateTime)
    }

    @Test
    fun `createObject should create object if object correct`() {
        // Given
        `when`(bookCreatureRepository.save(any()))
            .thenReturn(sampleCreatedBookCreature)

        // When
        val result = underTest.createObject(sampleBookCreatureDto)

        // Then
        verify(websocketAdapter).broadcast(any())
        result.id shouldBe sampleBookCreatureId
        result.creationDate shouldBe sampleOffsetDateTime
    }

    @Test
    fun `deleteObjectById should delete object when own by user`() {
        // Given
        `when`(bookCreatureRepository.deleteById(sampleBookCreatureId))
            .thenAnswer {}

        // When
        underTest.deleteObjectById(sampleBookCreatureId)

        // Then
        verify(websocketAdapter).broadcast(any())
    }

    @Test
    fun `deleteObjectById should throw error if object not found`() {
        // Given
        val nonExistentId = 999L
        `when`(bookCreatureRepository.findById(nonExistentId))
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

        `when`(bookCreatureRepository.deleteById(sampleBookCreatureId))
            .thenAnswer {}

        // When
        underTest.deleteObjectById(sampleBookCreatureId)

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
            underTest.deleteObjectById(sampleBookCreatureId)
        }

        // Then
        verify(websocketAdapter, never()).broadcast(any())
        exception.errorCode shouldBe "object_not_owned"
    }

    @Test
    fun `patchObject should update object if own by user and data valid`() {
        // Given
        val updatedBookCreature = sampleBookCreatureDto.copy(name = "Updated City Name")
        val updatedCity = sampleCreatedBookCreature.copy(name = "Updated City Name")

        `when`(bookCreatureRepository.save(any()))
            .thenReturn(updatedCity)

        // When
        val result = underTest.patchObject(sampleBookCreatureId, updatedBookCreature)

        // Then
        verify(websocketAdapter).broadcast(any())
        result.name shouldBe "Updated City Name"
    }

    @Test
    fun `patchObject should not update id and creationDate`() {
        // Given
        val updatedBookCreatureDto = sampleBookCreatureDto.copy(
            name = "Updated City Name",
            id = 999
        )
        val updatedBookCreature = sampleCreatedBookCreature.copy(
            name = "Updated City Name",
        )

        `when`(bookCreatureRepository.save(any()))
            .thenReturn(updatedBookCreature)

        // When
        val result = underTest.patchObject(sampleBookCreatureId, updatedBookCreatureDto)

        // Then
        verify(websocketAdapter).broadcast(any())
        result.id shouldBe sampleBookCreatureId
        result.creationDate shouldBe sampleOffsetDateTime
        result.name shouldBe "Updated City Name"
    }

    @Test
    fun `patchObject should throw error if object not found`() {
        // Given
        val nonExistentId = 999L
        `when`(bookCreatureRepository.findById(nonExistentId))
            .thenReturn(Optional.empty())

        // When
        val exception = assertThrows<ObjectNotFoundException> {
            underTest.patchObject(nonExistentId, sampleBookCreatureDto)
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
            underTest.patchObject(sampleBookCreatureId, sampleBookCreatureDto)
        }

        // Then
        verify(websocketAdapter, never()).broadcast(any())
        exception.errorCode shouldBe "object_not_owned"
    }

    @Test
    fun `getObjects should return paged objects`() {
        // Given
        `when`(bookCreatureRepository.findAll(samplePageable))
            .thenReturn(samplePageResponse)

        // When
        val result = underTest.getObjects(samplePageable)

        // Then
        verify(websocketAdapter, never()).broadcast(any())
        result.totalElements shouldBe 1
        result.content.first().id shouldBe sampleBookCreatureId
    }

    @Test
    fun `getObjectById should return object if found`() {
        // Given

        // When
        val result = underTest.getObjectById(sampleBookCreatureId)

        // Then
        verify(websocketAdapter, never()).broadcast(any())
        result.id shouldBe sampleBookCreatureId
    }

    @Test
    fun `getObjectById should throw error if object not found`() {
        // Given
        val nonExistentId = 999L
        `when`(bookCreatureRepository.findById(nonExistentId))
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
        private const val sampleUserEmail = "aboba@mail.ru"

        private val sampleBookCreatureId = 123L
        private val sampleHumanId = 456L
        private val sampleCoordinatesId = 789L
        private val sampleMagicCityId = 342L
        private val sampleOffsetDateTime = OffsetDateTime.of(
            /* year = */ 1970,
            /* month = */ 1,
            /* dayOfMonth = */ 1,
            /* hour = */ 0,
            /* minute = */ 0,
            /* second = */ 0,
            /* nanoOfSecond = */ 0,
            /* offset = */ ZoneOffset.UTC
        )
        private val sampleLocalDate = sampleOffsetDateTime.toLocalDate()
        private val sampleBirthdayDate = LocalDate.of(1970, 1, 1)

        private val sampleCoordinates = Coordinates(
            id = sampleCoordinatesId,
            x = 100,
            y = 50.5
        )

        private val sampleCoordinatesDto = sampleCoordinates.toDto()

        private val sampleHuman = Human(
            id = sampleHumanId,
            birthday = sampleBirthdayDate
        )

        private val sampleHumanDto = sampleHuman.toDto()

        private val sampleMagicCity = MagicCity(
            id = sampleMagicCityId,
            name = "Sample City",
            area = 5000.0,
            population = 1_000_000,
            establishmentDate = sampleLocalDate,
            governor = sampleHuman,
            isCapital = true,
            populationDensity = 200.0
        )

        private val sampleMagicCityDto = sampleMagicCity.toDto()

        private val sampleRing = Ring(
            id = 1L,
            name = "Sample Ring",
            weight = 10.5f
        )

        private val sampleRingDto = sampleRing.toDto()

        private val sampleCreatedBookCreature = BookCreature(
            id = sampleBookCreatureId,
            ownerSub = sampleUserSub,
            ownerEmail = sampleUserEmail,
            name = "test",
            coordinates = sampleCoordinates,
            age = 10,
            creatureType = BookCreatureType.HUMAN,
            creatureLocation = sampleMagicCity,
            attackLevel = 5L,
            defenseLevel = 3.5f,
            ring = sampleRing,
            creationDate = sampleOffsetDateTime
        )

        private val sampleBookCreatureDto = sampleCreatedBookCreature.toDto()
            .copy(ownerEmail = null, ownerSub = "", creationDate = null)

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
            email = sampleUserEmail,
            exp = Instant.now().plusSeconds(3600),
            iat = Instant.now(),
            jti = "unique-jti"
        )

        private val samplePageResponse = PageImpl(
            listOf(sampleCreatedBookCreature)
        )

        private val samplePageable = PageRequest.of(0, 10, Sort.unsorted())
    }
}
