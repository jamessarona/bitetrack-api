-- Runs automatically the first time the Postgres data directory is initialized.
-- Enables the extensions required by BiteTrack.

-- Geospatial support (nearby vendors, route trails, ETA).
CREATE EXTENSION IF NOT EXISTS postgis;

-- Fuzzy / trigram text search (vendor + product autocomplete).
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Vector similarity search (AI recommendations, embeddings).
CREATE EXTENSION IF NOT EXISTS vector;

-- Case-insensitive text (emails, usernames).
CREATE EXTENSION IF NOT EXISTS citext;
