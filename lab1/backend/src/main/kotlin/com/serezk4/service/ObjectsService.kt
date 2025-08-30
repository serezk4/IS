package com.serezk4.service

import com.serezk4.adapter.WebSocketAdapter
import com.serezk4.api.model.CityDto
import com.serezk4.api.model.Government
import com.serezk4.config.security.util.user
import com.serezk4.constants.CREATE
import com.serezk4.constants.DELETE
import com.serezk4.constants.UPDATE
import com.serezk4.exception.ObjectNotFoundException
import com.serezk4.mapper.partialUpdate
import com.serezk4.mapper.toDto
import com.serezk4.mapper.toEntity
import com.serezk4.model.UpdateNotification
import com.serezk4.repository.CityRepository
import com.serezk4.util.generateCity
import com.serezk4.validator.validate
import jakarta.transaction.Transactional
import org.springframework.cache.annotation.CacheEvict
import org.springframework.cache.annotation.Cacheable
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.stereotype.Service

@Transactional
@Service
class ObjectsService(
    private val cityRepository: CityRepository,
    private val accessService: AccessService,
    private val timeService: TimeService,
    private val websocketAdapter: WebSocketAdapter
) {

    @CacheEvict(value = ["cities"], allEntries = true)
    fun createObject(cityDto: CityDto): CityDto {
        return cityRepository.save(
            cityDto.also { it.validate() }.toEntity()
                .copy(ownerSub = user.sub, creationDate = timeService.now())
        )
            .also { websocketAdapter.broadcast(UpdateNotification(it, CREATE)) }
            .toDto()
    }

    @CacheEvict(value = ["cities"], allEntries = true)
    fun deleteObjectById(id: Int) {
        cityRepository.findById(id).orElseThrow { ObjectNotFoundException() }
            .also { accessService.checkAccess(it) }
            .also { cityRepository.deleteById(id) }
            .also { websocketAdapter.broadcast(UpdateNotification(it, DELETE)) }
    }

    @CacheEvict(value = ["cities"], allEntries = true)
    fun patchObject(id: Int, cityDto: CityDto): CityDto {
        val city = cityRepository.findById(id).orElseThrow { ObjectNotFoundException() }
            .also { accessService.checkAccess(it) }

        return cityRepository.save(city.partialUpdate(cityDto.also { it.validate() }))
            .also { websocketAdapter.broadcast(UpdateNotification(it, UPDATE)) }
            .toDto()
    }

    @Cacheable("cities")
    fun getObjects(pageable: Pageable): Page<CityDto> {
        return cityRepository.findAll(pageable).map { it.toDto() }
    }

    fun getByName(name: String): CityDto {
        val city = cityRepository.findAll().firstOrNull { it.name == name }
            ?: throw ObjectNotFoundException()
        accessService.checkAccess(city)
        return city.toDto()
    }

    @Cacheable("cities", key = "#id")
    fun getObjectById(id: Int): CityDto {
        return cityRepository.findById(id)
            .orElseThrow { ObjectNotFoundException() }
            .toDto()
    }

    @CacheEvict(value = ["cities"], allEntries = true)
    fun createTestObject(): List<CityDto> {
        return (0..10)
            .map { generateCity() }
            .map { createObject(it.toDto()) }
    }

    @CacheEvict(value = ["cities"], allEntries = true)
    fun deleteObjectsByTimezone(timezone: Int) {
        cityRepository.findAllByTimezoneAndOwnerSub(timezone, user.sub)
            .also { cityRepository.deleteAll(it) }
            .forEach { websocketAdapter.broadcast(UpdateNotification(it, DELETE)) }
    }

    @CacheEvict(value = ["cities"], allEntries = true)
    fun deleteOneByGovernment(governmentString: String) {
        val government = Government.forValue(governmentString)
        val city = cityRepository.findFirstByGovernmentAndOwnerSub(government, user.sub)
            ?: throw ObjectNotFoundException()
        cityRepository.delete(city)
        websocketAdapter.broadcast(UpdateNotification(city, DELETE))
    }
}
