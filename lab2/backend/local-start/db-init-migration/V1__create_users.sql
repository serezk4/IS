CREATE USER keycloak WITH ENCRYPTED PASSWORD 'keycloak';
CREATE USER backend_user WITH PASSWORD 'backend';

GRANT ALL PRIVILEGES ON DATABASE keycloak TO keycloak;
GRANT ALL PRIVILEGES ON DATABASE backend TO backend_user;

\connect keycloak

GRANT USAGE, CREATE ON SCHEMA public TO keycloak;

CREATE OR REPLACE VIEW public.user_entity_ids AS
SELECT NULL::character varying(36) AS id
WHERE false;

\connect backend

GRANT USAGE ON SCHEMA public TO backend_user;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO backend_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO backend_user;
ALTER ROLE backend_user SET search_path TO backend;