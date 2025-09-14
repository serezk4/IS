package com.serezk4.service

import com.serezk4.config.security.util.sub
import com.serezk4.config.security.util.user
import com.serezk4.constants.ADMIN
import com.serezk4.entity.BookCreature
import com.serezk4.exception.ObjectNotOwnedException
import org.springframework.stereotype.Service

@Service
class AccessService {

    fun checkAccess(bookCreature: BookCreature) {
        require(
            bookCreature.ownerSub == sub || user.realmAccess.roles.contains(ADMIN)
        ) { throw ObjectNotOwnedException() }
    }
}
