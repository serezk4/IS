package com.serezk4.util

import org.springframework.data.domain.Sort

fun parseSort(sort: String): Sort =
    sort.let {
        val parts = it.split(",", limit = 2)
        val prop = parts[0]
        val dir = parts.getOrNull(1)?.let(Sort.Direction::fromString) ?: Sort.Direction.ASC
        Sort.by(Sort.Order(dir, prop))
    }
