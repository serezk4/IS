package com.serezk4.service

import com.serezk4.adapter.WebSocketAdapter
import com.serezk4.api.model.BookCreatureDto
import com.serezk4.api.model.FormattedBookCreaturePage
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
    private val websocketAdapter: WebSocketAdapter
) {

    @CacheEvict(value = ["cities"], allEntries = true)
    fun createObject(bookCreatureDto: BookCreatureDto): BookCreatureDto {
        return bookCreatureRepository.save(
            bookCreatureDto.toEntity()
                .copy(
                    ownerSub = sub,
                    ownerEmail = user.email
                )
        )
            .also { websocketAdapter.broadcast(UpdateNotification(it, CREATE)) }
            .toDto()
    }

    @CacheEvict(value = ["cities"], allEntries = true)
    fun deleteObjectById(id: Long) {
        bookCreatureRepository.findById(id).orElseThrow { ObjectNotFoundException() }
            .also { accessService.checkAccess(it) }
            .also { bookCreatureRepository.deleteById(id) }
            .also { websocketAdapter.broadcast(UpdateNotification(it, DELETE)) }
    }

    @CacheEvict(value = ["cities"], allEntries = true)
    fun patchObject(id: Long, bookCreatureDto: BookCreatureDto): BookCreatureDto {
        val city = bookCreatureRepository.findById(id).orElseThrow { ObjectNotFoundException() }
            .also { accessService.checkAccess(it) }

        return bookCreatureRepository.save(city.partialUpdate(bookCreatureDto))
            .also { websocketAdapter.broadcast(UpdateNotification(it, UPDATE)) }
            .toDto()
    }

    @Cacheable(
        value = ["cities"],
        key = "{#pageable.pageNumber, #pageable.pageSize, #pageable.sort.toString()}"
    )
    fun getObjects(pageable: Pageable): FormattedBookCreaturePage {
        return bookCreatureRepository.findAll(pageable)
            .map { it.toDto() }
            .toResponse()
    }

    fun getObjectById(id: Long): BookCreatureDto {
        return bookCreatureRepository.findById(id)
            .orElseThrow { ObjectNotFoundException() }
            .toDto()
    }

//    todo
//    @CacheEvict(value = ["cities"], allEntries = true)
//    fun createTestObject(): List<CityDto> {
//        return (0..10)
//            .map { generateCity() }
//            .map { createObject(it.toDto()) }
//    }
}
