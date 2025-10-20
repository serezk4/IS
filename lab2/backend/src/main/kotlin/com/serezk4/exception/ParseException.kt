package com.serezk4.exception

import org.springframework.http.HttpStatus

class ParseException(reason: String) : ApiException(
    "parse_exception",
    HttpStatus.BAD_REQUEST,
    "Ошибка при попытке чтения файла: $reason"
)
