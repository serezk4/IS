package com.serezk4.service

import org.springframework.stereotype.Service
import java.time.LocalDate
import java.time.OffsetDateTime

@Service
class TimeService {

    fun currentTimeMillis() = System.currentTimeMillis()

    fun now(): OffsetDateTime = OffsetDateTime.now()
}
