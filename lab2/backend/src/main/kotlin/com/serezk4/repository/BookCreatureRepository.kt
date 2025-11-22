package com.serezk4.repository

import com.serezk4.entity.BookCreature
import io.lettuce.core.dynamic.annotation.Param
import jakarta.transaction.Transactional
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Modifying
import org.springframework.data.jpa.repository.Query
import org.springframework.stereotype.Repository

@Repository
interface BookCreatureRepository : JpaRepository<BookCreature, Long> {

    fun findByAttackLevelAndOwnerSub(attackLevel: Long, ownerSub: String): BookCreature?
    fun findByAttackLevel(attackLevel: Long): BookCreature?

    fun findAllByOwnerSub(ownerSub: String): List<BookCreature>

    @Query("select distinct b.defenseLevel from BookCreature b where b.defenseLevel is not null")
    fun findDistinctDefenseLevels(): List<Float>

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query(
        """
        update BookCreature bc 
        set bc.ring = null 
        where bc.id in :ids
    """
    )
    fun bulkClearRings(@Param("ids") ids: Collection<Long>): Int

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query(
        value = """
            update book_creatures
            set ring_id = :ringId
            where id = :creatureId
        """,
        nativeQuery = true
    )
    fun assignRing(
        @Param("creatureId") creatureId: Long,
        @Param("ringId") ringId: Long?
    ): Int
}
