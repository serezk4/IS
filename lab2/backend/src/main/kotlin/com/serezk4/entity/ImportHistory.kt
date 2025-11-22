package com.serezk4.entity

import com.serezk4.api.model.ImportStatus
import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.EnumType
import jakarta.persistence.Enumerated
import jakarta.persistence.GeneratedValue
import jakarta.persistence.GenerationType
import jakarta.persistence.Id
import jakarta.persistence.Table
import jakarta.validation.constraints.Min
import jakarta.validation.constraints.NotBlank
import java.time.LocalDate

@Entity
@Table(name = "import_history")
data class ImportHistory(

    @Id
    @Column(name = "id", updatable = false, nullable = false)
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    var id: Long? = null,

    @field:NotBlank
    @Column(name = "file_name", updatable = false, nullable = false)
    var fileName: String? = null,

    @field:Min(0)
    @Column(name = "file_size", updatable = false, nullable = false)
    var fileSize: Long? = null,

    @field:NotBlank
    @Column(name = "imported_by", updatable = false, nullable = false)
    var importedBy: String? = null,

    @Column(name = "import_date", updatable = false, nullable = false)
    var importDate: LocalDate? = null,

    @field:Min(0)
    @Column(name = "imported_count", updatable = false, nullable = false)
    var importedCount: Int? = null,

    @Column(name = "status", updatable = false, nullable = false)
    @Enumerated(EnumType.STRING)
    var status: ImportStatus? = null
)
