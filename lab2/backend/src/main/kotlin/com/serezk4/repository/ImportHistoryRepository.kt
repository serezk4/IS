package com.serezk4.repository

import com.serezk4.entity.ImportHistory
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface ImportHistoryRepository : JpaRepository<ImportHistory, Long>
