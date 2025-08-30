package com.serezk4.service

import com.serezk4.exception.ObjectNotFoundException
import com.serezk4.repository.CityRepository
import jakarta.transaction.Transactional
import org.springframework.cache.annotation.CacheEvict
import org.springframework.stereotype.Service

@Service
@Transactional
class MigrateService(
    private val cityRepository: CityRepository,
    private val accessService: AccessService,
) {

    @CacheEvict(value = ["cities"], allEntries = true)
    fun migratePopulation(fromId: Int, toId: Int) {
        val cityFrom = cityRepository.findById(fromId)
            .orElseThrow { ObjectNotFoundException() }
            .also { accessService.checkAccess(it) }

        val cityTo = cityRepository.findById(toId)
            .orElseThrow { ObjectNotFoundException() }
            .also { accessService.checkAccess(it) }

        val updatedFrom = cityFrom.copy(population = 0)
        val updatedTo = cityTo.copy(population = cityFrom.population + cityTo.population)

        cityRepository.saveAll(listOf(updatedFrom, updatedTo))
    }

    @CacheEvict(value = ["cities"], allEntries = true)
    fun migrateHalfFromCapital() {
        val capital = (cityRepository.findFirstByOrderByPopulationDesc() ?: throw ObjectNotFoundException())
            .also { accessService.checkAccess(it) }

        val smallestCities = cityRepository.findTop3ByOrderByPopulationAsc()
            .onEach { accessService.checkAccess(it) }
        if (smallestCities.isEmpty()) return

        val halfPopulation = capital.population / 2
        val populationPerCity = halfPopulation / smallestCities.size

        cityRepository.saveAll(
            listOf(capital.copy(population = capital.population - halfPopulation)) +
                    smallestCities.map { it.copy(population = it.population + populationPerCity) }
        )
    }
}
