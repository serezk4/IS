package com.serezk4.entity

import com.serezk4.constants.MAX_X_VALUE
import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.GeneratedValue
import jakarta.persistence.GenerationType
import jakarta.persistence.Id
import jakarta.persistence.Table
import jakarta.validation.constraints.Max
import jakarta.validation.constraints.NotNull

@Entity
@Table(name = "coordinates")
data class Coordinates(

    @Id
    @Column(name = "id")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long? = null,

    @field:Max(MAX_X_VALUE)
    @Column(name = "x")
    var x: Long,

    @field:NotNull
    @Column(name = "y")
    var y: Double
)
