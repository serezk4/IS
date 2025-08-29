-- V0__create_base_schema.sql @ serezk4

CREATE TABLE coordinates
(
    id SERIAL PRIMARY KEY,
    x  INTEGER NOT NULL,
    y  REAL    NOT NULL
);

CREATE TABLE humans
(
    id       SERIAL PRIMARY KEY,
    birthday DATE
);

CREATE TABLE cities
(
    id                     SERIAL PRIMARY KEY,
    owner_sub              VARCHAR(255),
    name                   VARCHAR(255) NOT NULL,
    coordinates_id         INTEGER      NOT NULL REFERENCES coordinates (id) ON DELETE CASCADE,
    creation_date          DATE,
    area                   REAL,
    population             BIGINT       NOT NULL,
    establishment_date     TIMESTAMP WITH TIME ZONE,
    capital                BOOLEAN,
    meters_above_sea_level INTEGER      NOT NULL,
    timezone               INTEGER      NOT NULL,
    climate                VARCHAR(50)  NOT NULL,
    government             VARCHAR(50)  NOT NULL,
    governor_id            INTEGER      NOT NULL REFERENCES humans (id) ON DELETE CASCADE
);

CREATE INDEX idx_cities_coordinates_id ON cities (coordinates_id);
CREATE INDEX idx_cities_governor_id ON cities (governor_id);