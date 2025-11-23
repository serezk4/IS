import org.jetbrains.kotlin.gradle.internal.KaptGenerateStubsTask

plugins {
    java
    alias(libs.plugins.spring.boot)
    alias(libs.plugins.kotlin.jvm)
    alias(libs.plugins.kotlin.spring)
    alias(libs.plugins.kotlin.kapt)
    alias(libs.plugins.dependency.management)
    alias(libs.plugins.detekt)
    alias(libs.plugins.openapi.generator)
    alias(libs.plugins.kotlin.jpa)   
}

group = "com.serezk4"
version = "2"

openApiGenerate {
    generatorName.set("kotlin-spring")
    skipOperationExample.set(true)

    globalProperties.apply {
        put("modelDocs", "true")
        put("generateSupportingFiles", "true")
    }
    configOptions.apply {
        put("useBeanValidation", "false")
        put("modelMutable", "true")
        put("gradleBuildFile", "false")
        put("useAudit", "true")
        put("interfaceOnly", "true")
        put("serializationLibrary", "jackson")
        put("exceptionHandler", "false")
        put("enumPropertyNaming", "UPPERCASE")
        put("useMetrics", "true")
        put("useTags", "true")
        put("useSpringBoot3", "true")
    }

    inputSpec.set("${layout.projectDirectory}/src/main/resources/static/api.yml")
    outputDir.set("${layout.buildDirectory.asFile.get()}/generated/openapi")

    val packageString = "com.serezk4.api"
    packageName.set(packageString)
    apiPackage.set("$packageString.api")
    invokerPackage.set("$packageString.invoker")
    modelPackage.set("$packageString.model")
}

detekt {
    buildUponDefaultConfig = true
    config.setFrom(files("$projectDir/detekt.yml"))
    source.setFrom(files("src/main/kotlin", "src/test/kotlin"))
}

kotlin.sourceSets.main {
    kotlin.srcDir("${layout.buildDirectory.asFile.get()}/generated/openapi/src/main/kotlin")
}

repositories {
    mavenCentral()
}

dependencies {
    implementation(platform("org.springframework.boot:spring-boot-dependencies:${libs.versions.springBoot.get()}"))

    implementation(libs.kotlin.stdlib)
    implementation(libs.kotlin.reflect)
    implementation(libs.kotlin.coroutines.slf4j)

    implementation(libs.spring.boot.starter.web)
    implementation(libs.spring.boot.starter.data.jpa)
    implementation(libs.spring.boot.starter.actuator)

    implementation(libs.kotlin.logging)
    implementation(libs.logstash.logback.encoder)

    implementation(libs.springdoc.openapi.webmvc.ui)
    implementation(libs.swagger.annotations)

    implementation(libs.spring.boot.starter.security)
    implementation(libs.spring.security.oauth2.authorization.server)
    implementation(libs.spring.boot.starter.oauth2.client)
    implementation(libs.spring.boot.starter.data.redis)
    implementation(libs.spring.boot.starter.websocket)
    implementation(libs.spring.boot.starter.amqp)

    implementation(libs.projectreactor.reactor.netty)
    implementation(libs.caffeine)

    implementation(libs.resilience4j.spring)
    implementation(libs.resilience4j.ratelimiter)

    implementation(libs.jackson.module.kotlin)

    runtimeOnly(libs.postgresql)
    implementation(libs.flyway.core)
    implementation(libs.flyway.postgresql)

    implementation(libs.mapstruct.core)
    kapt(libs.mapstruct.processor)

    implementation(libs.keycloak.admin.client) {
        exclude(group = "commons-io", module = "commons-io")
    }
    implementation(libs.commons.io)
    implementation(libs.jboss.resteasy.client)
    implementation(libs.opencsv.opencsv)
    implementation(libs.apache.commons.dbcp2)
    implementation(libs.alibaba.druid)
    implementation(libs.alibaba.druid.starter)

    testImplementation(libs.spring.boot.starter.test)
    testImplementation(libs.spring.security.test)
    testImplementation(libs.mockito.kotlin)
    testImplementation(libs.mockito.core)
    testImplementation(libs.kotest.runner.junit5)
    testImplementation(libs.junit.jupiter.engine)
    testImplementation(libs.assertj.core)
}

java {
    toolchain {
        languageVersion.set(JavaLanguageVersion.of(21))
        vendor.set(JvmVendorSpec.ADOPTIUM)
    }
}

tasks.withType<org.jetbrains.kotlin.gradle.tasks.KotlinCompile>().configureEach {
    compilerOptions {
        jvmTarget.set(org.jetbrains.kotlin.gradle.dsl.JvmTarget.JVM_21)
        freeCompilerArgs.add("-Xjsr305=strict")
    }
}

tasks.test {
    useJUnitPlatform()
    testLogging {
        events("passed", "skipped", "failed")
    }
}

tasks {
    compileKotlin {
        dependsOn(openApiGenerate)
    }
    compileJava {
        dependsOn(openApiGenerate)
    }
}

tasks.withType<KaptGenerateStubsTask>().configureEach {
    dependsOn(tasks.named("openApiGenerate"))
}
