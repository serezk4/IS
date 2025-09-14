package com.serezk4.entity

import com.serezk4.api.model.BookCreatureType
import jakarta.persistence.CascadeType
import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.EnumType
import jakarta.persistence.Enumerated
import jakarta.persistence.FetchType
import jakarta.persistence.GeneratedValue
import jakarta.persistence.GenerationType
import jakarta.persistence.Id
import jakarta.persistence.JoinColumn
import jakarta.persistence.ManyToOne
import jakarta.persistence.OneToOne
import jakarta.persistence.Table
import jakarta.validation.constraints.Min
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.NotNull
import jakarta.validation.constraints.Positive
import java.time.OffsetDateTime

@Entity
@Table(name = "book_creatures")
data class BookCreature(

    @Id
    @Column(name = "id", updatable = false, nullable = false)
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    var id: Long? = null,

    @field:NotBlank
    @Column(name = "owner_sub", nullable = false, length = 128)
    var ownerSub: String? = null,

    @Column(name = "owner_email", nullable = false, length = 256)
    var ownerEmail: String? = null,

    @field:NotBlank
    @Column(name = "name", nullable = false, length = 200)
    var name: String? = null,

    @field:NotNull
    @OneToOne(
        fetch = FetchType.LAZY,
        cascade = [CascadeType.PERSIST, CascadeType.MERGE],
        orphanRemoval = true,
        optional = false
    )
    @JoinColumn(name = "coordinates_id", nullable = false)
    var coordinates: Coordinates,

    @field:Positive
    @Column(name = "age")
    var age: Long? = null,

    @field:NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "creature_type", nullable = false, length = 32)
    var creatureType: BookCreatureType,

    @field:NotNull
    @ManyToOne(
        fetch = FetchType.LAZY,
        cascade = [CascadeType.PERSIST, CascadeType.MERGE],
        optional = false
    )
    @JoinColumn(name = "creature_location_id", nullable = false)
    var creatureLocation: MagicCity,

    @field:Min(1)
    @Column(name = "attack_level", nullable = false)
    var attackLevel: Long,

    @field:NotNull @field:Positive
    @Column(name = "defense_level", nullable = false)
    var defenseLevel: Float,

    @OneToOne(
        fetch = FetchType.LAZY,
        cascade = [CascadeType.PERSIST, CascadeType.MERGE],
        optional = true
    )
    @JoinColumn(name = "ring_id")
    var ring: Ring? = null,

    @Column(name = "creation_date", nullable = false, updatable = false, columnDefinition = "timestamptz")
    var creationDate: OffsetDateTime ?= null,
)
