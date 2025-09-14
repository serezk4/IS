SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET bytea_output = 'hex';
SET client_min_messages = warning;
SET row_security = off;

CREATE TABLE IF NOT EXISTS audit_logs
(
    id           BIGSERIAL PRIMARY KEY,
    "timestamp"  TEXT NOT NULL DEFAULT to_char((CURRENT_TIMESTAMP AT TIME ZONE 'UTC'), 'YYYY-MM-DD"T"HH24:MI:SSOF'),
    action       VARCHAR(255),
    performed_by VARCHAR(255),
    details      TEXT
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs (("timestamp"));
CREATE INDEX IF NOT EXISTS idx_audit_logs_performed_by ON audit_logs (performed_by);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs (action);

CREATE TABLE IF NOT EXISTS humans
(
    id       BIGSERIAL PRIMARY KEY,
    birthday DATE
);

CREATE TABLE IF NOT EXISTS rings
(
    id     BIGSERIAL PRIMARY KEY,
    name   VARCHAR(200) NOT NULL,
    weight REAL         NOT NULL CHECK (weight > 0)
);

CREATE INDEX IF NOT EXISTS idx_rings_name ON rings (name);

CREATE TABLE IF NOT EXISTS coordinates
(
    id BIGSERIAL PRIMARY KEY,
    x  BIGINT,
    y  DOUBLE PRECISION NOT NULL
);

CREATE TABLE IF NOT EXISTS magic_cities
(
    id                 BIGSERIAL PRIMARY KEY,
    name               VARCHAR(200)     NOT NULL,
    area               DOUBLE PRECISION NOT NULL CHECK (area > 0),
    population         BIGINT           NOT NULL CHECK (population > 0),
    establishment_date TIMESTAMPTZ,
    governor_id        BIGINT UNIQUE,
    is_capital         BOOLEAN,
    population_density DOUBLE PRECISION NOT NULL CHECK (population_density > 0),

    CONSTRAINT fk_magic_cities_governor
        FOREIGN KEY (governor_id)
            REFERENCES humans (id)
            ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_magic_cities_name ON magic_cities (name);
CREATE INDEX IF NOT EXISTS idx_magic_cities_is_capital ON magic_cities (is_capital);

CREATE TABLE IF NOT EXISTS book_creatures
(
    id                   BIGSERIAL PRIMARY KEY,
    owner_sub            VARCHAR(128) NOT NULL,
    owner_email          VARCHAR(256) NOT NULL,
    name                 VARCHAR(200) NOT NULL,

    coordinates_id       BIGINT       NOT NULL UNIQUE,
    age                  BIGINT CHECK (age IS NULL OR age > 0),

    creature_type        VARCHAR(32)  NOT NULL,

    creature_location_id BIGINT       NOT NULL,

    attack_level         BIGINT       NOT NULL CHECK (attack_level >= 1),
    defense_level        REAL         NOT NULL CHECK (defense_level > 0),

    ring_id              BIGINT UNIQUE,

    creation_date        TIMESTAMPTZ  NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_book_creatures_coordinates
        FOREIGN KEY (coordinates_id)
            REFERENCES coordinates (id)
            ON DELETE RESTRICT,

    CONSTRAINT fk_book_creatures_creature_location
        FOREIGN KEY (creature_location_id)
            REFERENCES magic_cities (id)
            ON DELETE RESTRICT,

    CONSTRAINT fk_book_creatures_ring
        FOREIGN KEY (ring_id)
            REFERENCES rings (id)
            ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_book_creatures_owner_sub ON book_creatures (owner_sub);
CREATE INDEX IF NOT EXISTS idx_book_creatures_owner_email ON book_creatures (owner_email);
CREATE INDEX IF NOT EXISTS idx_book_creatures_name ON book_creatures (name);
CREATE INDEX IF NOT EXISTS idx_book_creatures_creature_type ON book_creatures (creature_type);
CREATE INDEX IF NOT EXISTS idx_book_creatures_location_id ON book_creatures (creature_location_id);


CREATE OR REPLACE FUNCTION fn_delete_coordinates_on_creature_delete()
    RETURNS TRIGGER
    LANGUAGE plpgsql
AS
$$
BEGIN
    IF OLD.coordinates_id IS NOT NULL THEN
        DELETE FROM coordinates WHERE id = OLD.coordinates_id;
    END IF;
    RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS trg_delete_coordinates_on_creature_delete ON book_creatures;
CREATE TRIGGER trg_delete_coordinates_on_creature_delete
    AFTER DELETE
    ON book_creatures
    FOR EACH ROW
EXECUTE FUNCTION fn_delete_coordinates_on_creature_delete();

CREATE OR REPLACE FUNCTION fn_normalize_book_creatures_email()
    RETURNS TRIGGER
    LANGUAGE plpgsql
AS
$$
BEGIN
    IF NEW.owner_email IS NOT NULL THEN
        NEW.owner_email := lower(trim(NEW.owner_email));
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_normalize_book_creatures_email_ins ON book_creatures;
CREATE TRIGGER trg_normalize_book_creatures_email_ins
    BEFORE INSERT
    ON book_creatures
    FOR EACH ROW
EXECUTE FUNCTION fn_normalize_book_creatures_email();

DROP TRIGGER IF EXISTS trg_normalize_book_creatures_email_upd ON book_creatures;
CREATE TRIGGER trg_normalize_book_creatures_email_upd
    BEFORE UPDATE OF owner_email
    ON book_creatures
    FOR EACH ROW
EXECUTE FUNCTION fn_normalize_book_creatures_email();

CREATE OR REPLACE FUNCTION fn_set_book_creature_creation_date()
    RETURNS TRIGGER
    LANGUAGE plpgsql
AS
$$
BEGIN
    IF NEW.creation_date IS NULL THEN
        NEW.creation_date := NOW();
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_set_book_creature_creation_date ON book_creatures;
CREATE TRIGGER trg_set_book_creature_creation_date
    BEFORE INSERT
    ON book_creatures
    FOR EACH ROW
EXECUTE FUNCTION fn_set_book_creature_creation_date();

CREATE OR REPLACE FUNCTION fn_set_audit_logs_timestamp_text()
    RETURNS TRIGGER
    LANGUAGE plpgsql
AS
$$
BEGIN
    IF NEW."timestamp" IS NULL OR length(trim(NEW."timestamp")) = 0 THEN
        NEW."timestamp" := to_char((CURRENT_TIMESTAMP AT TIME ZONE 'UTC'), 'YYYY-MM-DD"T"HH24:MI:SSOF');
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_set_audit_logs_timestamp_text ON audit_logs;
CREATE TRIGGER trg_set_audit_logs_timestamp_text
    BEFORE INSERT
    ON audit_logs
    FOR EACH ROW
EXECUTE FUNCTION fn_set_audit_logs_timestamp_text();
