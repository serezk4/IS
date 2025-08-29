package com.serezk4.util

import org.springframework.data.domain.Sort

fun parseSort(sortParams: List<String>) = Sort.by(
    sortParams.map {
        val (prop, dir) = it.split(",").let { p -> p[0] to p.getOrNull(1) }
        Sort.Order(if (dir.equals("desc", true)) Sort.Direction.DESC else Sort.Direction.ASC, prop)
    }
)
