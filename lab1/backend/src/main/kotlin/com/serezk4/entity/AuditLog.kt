package com.serezk4.entity

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.GeneratedValue
import jakarta.persistence.GenerationType
import jakarta.persistence.Id
import jakarta.persistence.Table
import org.springframework.data.annotation.CreatedDate

@Entity
@Table(name = "audit_logs")
data class AuditLog(

    @Id
    @Column(name = "id")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    var id: Long? = null,

    @Column(name = "timestamp")
    @CreatedDate
    var timestamp: String,

    @Column(name = "action")
    var action: String? = null,

    @Column(name = "performed_by")
    var performedBy: String? = null,

    @Column(name = "details", columnDefinition = "TEXT")
    var details: String? = null
)
