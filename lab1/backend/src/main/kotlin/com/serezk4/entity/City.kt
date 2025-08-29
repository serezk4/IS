package com.serezk4.entity

import com.serezk4.api.model.Climate
import com.serezk4.api.model.Government
import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.EnumType
import jakarta.persistence.Enumerated
import jakarta.persistence.GeneratedValue
import jakarta.persistence.GenerationType
import jakarta.persistence.Id
import jakarta.persistence.JoinColumn
import jakarta.persistence.OneToOne
import jakarta.persistence.Table
import java.time.LocalDate
import java.time.OffsetDateTime

@Entity
@Table(name = "cities")
data class City(

    @Id
    @Column(name = "id")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Int? = null,

    @Column(name = "owner_sub")
    var ownerSub: String? = null,

    @Column(name = "name")
    var name: String,

    @OneToOne
    @JoinColumn(name = "coordinates_id")
    val coordinates: Coordinates,

    @Column(name = "creation_date")
    var creationDate: LocalDate? = null,

    @Column(name = "area")
    var area: Float? = null,

    @Column(name = "population")
    var population: Long,

    @Column(name = "establishment_date")
    var establishmentDate: OffsetDateTime? = null,

    @Column(name = "capital")
    var capital: Boolean? = null,

    @Column(name = "meters_above_sea_level")
    var metersAboveSeaLevel: Int,

    @Column(name = "timezone")
    var timezone: Int,

    @Column(name = "climate")
    @Enumerated(EnumType.STRING)
    var climate: Climate,

    @Column(name = "government")
    @Enumerated(EnumType.STRING)
    var government: Government,

    @OneToOne
    @JoinColumn(name = "governor_id")
    val governor: Human
)
