-- V1__add_owner_name.sql @ serezk4

ALTER TABLE cities
    ADD COLUMN
        owner_name VARCHAR(255);