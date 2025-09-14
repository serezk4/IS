package com.serezk4.repository

import com.serezk4.entity.BookCreature
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface BookCreatureRepository : JpaRepository<BookCreature, Long> {

    fun deleteTopByAttackLevelAndOwnerSub(attackLevel: Long, ownerSub: String): BookCreature?
    fun deleteTopByAttackLevel(attackLevel: Long): BookCreature?
    fun findAllByOwnerSub(ownerSub: String): List<BookCreature>
    fun findDistinctDefenseLevels(): List<Float>
}
