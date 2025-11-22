package com.serezk4.repository

import com.serezk4.entity.AuditLog
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface AuditRepository : JpaRepository<AuditLog, Long> {
    fun findAllByAction(action: String, pageable: Pageable): Page<AuditLog>
}
