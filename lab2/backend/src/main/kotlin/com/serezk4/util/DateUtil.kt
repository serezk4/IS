package com.serezk4.util

import java.sql.Timestamp
import java.time.Instant
import java.time.LocalDate
import java.time.OffsetDateTime
import java.time.ZoneOffset

fun toOffsetDateTime(timestamp: Timestamp?): OffsetDateTime? =
    timestamp?.toInstant()?.atOffset(ZoneOffset.UTC)

fun Instant.toOffsetDateTime(): OffsetDateTime =
    this.atOffset(ZoneOffset.UTC)

fun String.toLocalDate(): LocalDate =
    LocalDate.parse(this.take(10))
