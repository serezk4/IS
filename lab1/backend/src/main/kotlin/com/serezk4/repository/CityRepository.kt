package com.serezk4.repository

import com.serezk4.api.model.Government
import com.serezk4.entity.City
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface CityRepository : JpaRepository<City, Int> {

    fun findAllByTimezoneAndOwnerSub(timezone: Int, ownerSub: String): List<City>
    fun findFirstByGovernmentAndOwnerSub(government: Government, ownerSub: String): City?
    fun findFirstByOrderByPopulationDesc(): City?
    fun findTop3ByOrderByPopulationAsc(): List<City>
}
