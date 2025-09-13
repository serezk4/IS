package com.serezk4.repository

import com.serezk4.entity.BookCreature
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface BookCreatureRepository : JpaRepository<BookCreature, Long>
