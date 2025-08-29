package com.serezk4.service

import org.springframework.stereotype.Service
import java.time.LocalDate

@Service
class TimeService {

    fun currentTimeMillis() = System.currentTimeMillis()

    fun now(): LocalDate = LocalDate.now()
}
