package com.serezk4.entity

import jakarta.persistence.CascadeType
import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.GeneratedValue
import jakarta.persistence.GenerationType
import jakarta.persistence.Id
import jakarta.persistence.JoinColumn
import jakarta.persistence.OneToOne
import jakarta.persistence.Table
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.NotNull
import jakarta.validation.constraints.Positive
import java.time.LocalDate
import java.time.OffsetDateTime

@Entity
@Table(name = "magic_cities")
data class MagicCity(
    @Id
    @Column(name = "id", updatable = false, nullable = false)
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long? = null,

    @field:NotBlank
    @Column(name = "name", nullable = false, length = 200)
    var name: String,

    @field:NotNull @field:Positive
    @Column(name = "area", nullable = false)
    var area: Double,

    @field:NotNull @field:Positive
    @Column(name = "population", nullable = false)
    var population: Long,

    @Column(name = "establishment_date", columnDefinition = "timestamptz")
    var establishmentDate: LocalDate? = null,

    @OneToOne(cascade = [CascadeType.ALL], orphanRemoval = true)
    @JoinColumn(name = "governor_id")
    val governor: Human, // В варианте governor является BookCreatureType, шиза? Украл с другого варианта.

    @Column(name = "is_capital")
    var isCapital: Boolean? = null,

    @field:Positive
    @Column(name = "population_density")
    var populationDensity: Double
)
