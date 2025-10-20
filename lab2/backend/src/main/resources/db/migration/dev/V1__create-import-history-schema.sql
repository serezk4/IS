CREATE TABLE import_history
(
    id             BIGSERIAL PRIMARY KEY,
    file_name      VARCHAR(255) NOT NULL,
    file_size      BIGINT       NOT NULL CHECK (file_size >= 0),
    imported_by    VARCHAR(255) NOT NULL,
    import_date    DATE         NOT NULL,
    imported_count INTEGER      NOT NULL CHECK (imported_count >= 0),
    status         VARCHAR(50)  NOT NULL
);

CREATE INDEX idx_import_history_imported_by ON import_history (imported_by);
CREATE INDEX idx_import_history_import_date ON import_history (import_date);
CREATE INDEX idx_import_history_status ON import_history (status);
