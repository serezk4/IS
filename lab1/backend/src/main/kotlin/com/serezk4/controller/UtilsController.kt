package com.serezk4.controller

import com.serezk4.api.api.UtilsApi
import com.serezk4.api.model.CreateTestObjects200Response
import com.serezk4.api.model.GroupedByCreatureTypeDto
import com.serezk4.api.model.ObjectsPerUserStatsDto
import com.serezk4.service.ObjectsService
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.RestController

@RestController
class UtilsController(
    private val objectsService: ObjectsService
) : UtilsApi {

    override fun createTestObjects(): ResponseEntity<CreateTestObjects200Response> {
        objectsService.getObjectById(2)
        return super.createTestObjects()
    }

    override fun deleteByAttackLevel(attackLevel: Long): ResponseEntity<Unit> {
        return super.deleteByAttackLevel(attackLevel)
    }

    override fun distributeRings(): ResponseEntity<Unit> {
        return super.distributeRings()
    }

    override fun getObjectsPerUserStats(): ResponseEntity<List<ObjectsPerUserStatsDto>> {
        return super.getObjectsPerUserStats()
    }

    override fun getUniqueDefenseLevels(): ResponseEntity<List<Float>> {
        return super.getUniqueDefenseLevels()
    }

    override fun groupByCreatureType(): ResponseEntity<List<GroupedByCreatureTypeDto>> {
        return super.groupByCreatureType()
    }
}
