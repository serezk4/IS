package com.serezk4

import org.springframework.boot.Banner
import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.builder.SpringApplicationBuilder
import org.springframework.boot.context.properties.ConfigurationPropertiesScan
import org.springframework.scheduling.annotation.EnableScheduling

@EnableScheduling
@SpringBootApplication
@ConfigurationPropertiesScan
class BackendApplication

@Suppress("SpreadOperator")
fun main(args: Array<String>) {
    SpringApplicationBuilder(BackendApplication::class.java)
        .bannerMode(Banner.Mode.OFF)
        .run(*args)
}
