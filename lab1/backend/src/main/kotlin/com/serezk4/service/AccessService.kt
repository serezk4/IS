package com.serezk4.service

import com.serezk4.config.security.util.sub
import com.serezk4.config.security.util.user
import com.serezk4.constants.ACCOUNT
import com.serezk4.constants.ADMIN
import com.serezk4.entity.City
import com.serezk4.exception.ObjectNotOwnedException
import org.springframework.stereotype.Service

@Service
class AccessService {

    fun checkAccess(city: City) {
        require(
            city.ownerSub == sub || user.resourceAccess[ACCOUNT]?.roles?.contains(ADMIN) == true
        ) { throw ObjectNotOwnedException() }
    }
}
