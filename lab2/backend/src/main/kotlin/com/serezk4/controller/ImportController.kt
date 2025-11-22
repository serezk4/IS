package com.serezk4.controller

import com.serezk4.api.api.ImportApi
import com.serezk4.api.model.FormattedImportHistoryPage
import com.serezk4.api.model.ImportObjectsFromCsv200Response
import com.serezk4.exception.ParseException
import com.serezk4.service.ImportService
import com.serezk4.util.parseSort
import org.springframework.data.domain.PageRequest
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.RestController
import org.springframework.web.multipart.MultipartFile

@RestController
class ImportController(
    private val importService: ImportService
) : ImportApi {

    override fun importObjectsFromCsv(file: MultipartFile?): ResponseEntity<ImportObjectsFromCsv200Response> {
        val result = importService.import(file ?: throw ParseException("не передан файл"))
        return ResponseEntity.status(HttpStatus.CREATED).body(result)
    }

    override fun getImportHistory(page: Int, size: Int, sort: String): ResponseEntity<FormattedImportHistoryPage> {
        val pageable = PageRequest.of(page, size, parseSort(sort))
        val result = importService.getImportHistory(pageable)
        return ResponseEntity.ok(result)
    }
}
