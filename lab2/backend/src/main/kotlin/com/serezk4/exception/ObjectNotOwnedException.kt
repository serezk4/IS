package com.serezk4.exception

import org.springframework.http.HttpStatus

class ObjectNotOwnedException : ApiException(
    "object_not_owned",
    HttpStatus.FORBIDDEN,
    "У вас нет прав на доступ к этому объекту."
)
