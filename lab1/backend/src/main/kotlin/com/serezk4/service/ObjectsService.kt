package com.serezk4.service

import com.serezk4.adapter.WebSocketAdapter
import com.serezk4.api.model.BookCreatureDto
import com.serezk4.api.model.FormattedBookCreaturePage
import com.serezk4.api.model.GroupedByCreatureTypeDto
import com.serezk4.api.model.ObjectsPerUserStatsDto
import com.serezk4.config.security.util.sub
import com.serezk4.config.security.util.user
import com.serezk4.constants.CREATE
import com.serezk4.constants.DELETE
import com.serezk4.constants.UPDATE
import com.serezk4.exception.ObjectNotFoundException
import com.serezk4.mapper.partialUpdate
import com.serezk4.mapper.toDto
import com.serezk4.mapper.toEntity
import com.serezk4.mapper.toResponse
import com.serezk4.model.UpdateNotification
import com.serezk4.repository.BookCreatureRepository
import com.serezk4.util.generateBookCreature
import jakarta.transaction.Transactional
import org.springframework.cache.annotation.CacheEvict
import org.springframework.cache.annotation.Cacheable
import org.springframework.data.domain.Pageable
import org.springframework.stereotype.Service

@Transactional
@Service
class ObjectsService(
    private val bookCreatureRepository: BookCreatureRepository,
    private val accessService: AccessService,
    private val websocketAdapter: WebSocketAdapter,
    private val timeService: TimeService
) {

    @CacheEvict(value = ["creatures"], allEntries = true)
    fun createObject(dto: BookCreatureDto): BookCreatureDto =
        bookCreatureRepository.save(
            dto.toEntity().copy(
                ownerSub = sub,
                ownerEmail = user.email,
                creationDate = timeService.now(),
            )
        ).also { websocketAdapter.broadcast(UpdateNotification(it, CREATE)) }
            .toDto()

    @CacheEvict(value = ["creatures"], allEntries = true)
    fun deleteObjectById(id: Long) {
        val entity = bookCreatureRepository.findById(id).orElseThrow { ObjectNotFoundException() }
        accessService.checkAccess(entity)
        bookCreatureRepository.delete(entity)
        websocketAdapter.broadcast(UpdateNotification(entity, DELETE))
    }

    @CacheEvict(value = ["creatures"], allEntries = true)
    fun patchObject(id: Long, dto: BookCreatureDto): BookCreatureDto {
        val entity = bookCreatureRepository.findById(id).orElseThrow { ObjectNotFoundException() }
        accessService.checkAccess(entity)
        val updated = bookCreatureRepository.save(entity.partialUpdate(dto))
        websocketAdapter.broadcast(UpdateNotification(updated, UPDATE))
        return updated.toDto()
    }

    @Cacheable(
        value = ["creatures"],
        key = "{#pageable.pageNumber, #pageable.pageSize, #pageable.sort.toString()}"
    )
    fun getObjects(pageable: Pageable): FormattedBookCreaturePage =
        bookCreatureRepository.findAll(pageable)
            .map { it.toDto() }
            .toResponse()

    fun getObjectById(id: Long): BookCreatureDto =
        bookCreatureRepository.findById(id)
            .orElseThrow { ObjectNotFoundException() }
            .also { accessService.checkAccess(it) }
            .toDto()

    @CacheEvict(value = ["creatures"], allEntries = true)
    fun createTestObject(): List<BookCreatureDto> {
        val now = timeService.now()
        val entities = List(10) {
            generateBookCreature(
                ownerSub = sub,
                ownerEmail = user.email
            ).copy(creationDate = now)
        }
        val saved = bookCreatureRepository.saveAll(entities)
        saved.forEach { websocketAdapter.broadcast(UpdateNotification(it, CREATE)) }
        return saved.map { it.toDto() }
    }

    @CacheEvict(value = ["creatures"], allEntries = true)
    fun deleteByAttackLevel(attackLevel: Long): BookCreatureDto? =
        bookCreatureRepository.deleteTopByAttackLevelAndOwnerSub(attackLevel, sub)
            ?.also { if (accessService.isAdmin()) bookCreatureRepository.deleteTopByAttackLevel(attackLevel) }
            ?.toDto()

    @CacheEvict(value = ["creatures"], allEntries = true)
    fun distributeRings() {
        val creatures = if (accessService.isAdmin()) {
            bookCreatureRepository.findAll()
        } else {
            bookCreatureRepository.findAllByOwnerSub(sub)
        }
        if (creatures.isEmpty()) return

        val rings = creatures.mapNotNull { it.ring }.shuffled()
        if (rings.isEmpty()) return

        val shuffledCreatures = creatures.shuffled()

        var changed = false
        shuffledCreatures.forEachIndexed { i, c ->
            val newRing = rings.getOrNull(i)
            if ((c.ring?.id ?: 0L) != (newRing?.id ?: 0L)) {
                c.ring = newRing
                changed = true
            }
        }
        if (!changed) return

        bookCreatureRepository.saveAll(shuffledCreatures)
            .forEach { websocketAdapter.broadcast(UpdateNotification(it, UPDATE)) }
    }

    fun getObjectsPerUserStats(): List<ObjectsPerUserStatsDto> =
        bookCreatureRepository.findAll()
            .groupBy { it.ownerEmail ?: "unknown" }
            .map { ObjectsPerUserStatsDto(userEmail = it.key, count = it.value.size) }

    fun getUniqueDefenseLevels(): List<Float> =
        bookCreatureRepository.findDistinctDefenseLevels()

    fun groupByCreatureType(): List<GroupedByCreatureTypeDto> =
        bookCreatureRepository.findAll()
            .groupBy { it.creatureType }
            .map { GroupedByCreatureTypeDto(creatureType = it.key, count = it.value.size) }
}
