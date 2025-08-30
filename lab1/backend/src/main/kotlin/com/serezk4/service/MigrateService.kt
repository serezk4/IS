package com.serezk4.service

import com.serezk4.repository.CityRepository
import jakarta.transaction.Transactional
import org.springframework.stereotype.Service

@Service
@Transactional
class MigrateService(
    private val cityRepository: CityRepository,
    private val accessService: AccessService,
) {


}
