package com.serezk4.service

import com.opencsv.CSVReaderBuilder
import com.serezk4.api.model.BookCreatureDto
import com.serezk4.api.model.FormattedImportHistoryPage
import com.serezk4.api.model.ImportObjectsFromCsv200Response
import com.serezk4.api.model.ImportStatus
import com.serezk4.config.security.util.sub
import com.serezk4.config.security.util.user
import com.serezk4.entity.AuditLog
import com.serezk4.entity.ImportHistory
import com.serezk4.mapper.toBookCreatureDto
import com.serezk4.mapper.toDto
import com.serezk4.mapper.toResponse
import com.serezk4.repository.AuditRepository
import com.serezk4.repository.ImportHistoryRepository
import io.github.oshai.kotlinlogging.KotlinLogging
import org.springframework.data.domain.Pageable
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.multipart.MultipartFile
import java.sql.Timestamp
import java.time.Instant

@Service
class ImportService(
    private val objectsService: ObjectsService,
    private val auditRepository: AuditRepository,
    private val importHistoryRepository: ImportHistoryRepository,
    private val timeService: TimeService
) {

    fun parseCsv(file: MultipartFile): List<BookCreatureDto> {
        val creatures = mutableListOf<BookCreatureDto>()

        file.inputStream.bufferedReader().use { reader ->
            val csvReader = CSVReaderBuilder(reader)
                .withSkipLines(1)
                .build()

            csvReader.forEach { line ->
                if (line.isNotEmpty() && line.any { it.isNotBlank() }) {
                    line.toBookCreatureDto().let { creatures.add(it) }
                }
            }
        }

        return creatures
    }

    fun saveToAudit(result: ImportObjectsFromCsv200Response) {
        auditRepository.save(
            AuditLog(
                timestamp = Timestamp.from(Instant.now()).toString(),
                action = "import",
                performedBy = sub,
                details = "Пользователь ${user.email} успешно импортировал ${result.importedCount} объектов"
            )
        )
    }

    fun saveToImportHistory(file: MultipartFile, result: ImportObjectsFromCsv200Response) {
        importHistoryRepository.save(
            ImportHistory(
                fileName = file.name,
                fileSize = file.size,
                importDate = timeService.localDateNow(),
                importedBy = user.email,
                importedCount = result.importedCount,
                status = ImportStatus.COMPLETED
            )
        )
    }

    fun getImportHistory(pageable: Pageable): FormattedImportHistoryPage {
        return importHistoryRepository.findAll(pageable)
            .map { it.toDto() }
            .toResponse()
    }

    @Transactional(rollbackFor = [Exception::class])
    fun import(file: MultipartFile): ImportObjectsFromCsv200Response {
        logger.info { "Starting import operation for ${file.name}" }
        val imported = objectsService.createObjects(parseCsv(file))
        return ImportObjectsFromCsv200Response(
            importedCount = imported.size,
            failedCount = 0,
            errors = mutableListOf()
        )
            .also { saveToAudit(it) }
            .also { saveToImportHistory(file, it) }
            .also { logger.info { "Finished import operation with result $it" } }
    }

    companion object {
        private val logger = KotlinLogging.logger {}
    }
}
