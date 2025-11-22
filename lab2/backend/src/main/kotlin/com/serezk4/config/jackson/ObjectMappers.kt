package com.serezk4.config.jackson

import com.fasterxml.jackson.annotation.JsonAutoDetect
import com.fasterxml.jackson.annotation.PropertyAccessor
import com.fasterxml.jackson.databind.DeserializationFeature
import com.fasterxml.jackson.databind.MapperFeature
import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.databind.SerializationFeature
import com.fasterxml.jackson.databind.json.JsonMapper

fun redisJsonObjectMapper(): ObjectMapper = JsonMapper.builder()
    .disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS)
    .disable(MapperFeature.ALLOW_COERCION_OF_SCALARS)
    .enable(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES)
    .enable(DeserializationFeature.FAIL_ON_NULL_FOR_PRIMITIVES)
    .disable(DeserializationFeature.ACCEPT_EMPTY_STRING_AS_NULL_OBJECT)
    .disable(DeserializationFeature.ACCEPT_FLOAT_AS_INT)
    .visibility(PropertyAccessor.ALL, JsonAutoDetect.Visibility.ANY)
    .build()
    .apply { findAndRegisterModules() }
