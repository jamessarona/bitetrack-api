# PostgreSQL image bundling every extension BiteTrack needs:
#   - PostGIS   -> geospatial queries / nearby-vendor search
#   - pgvector  -> AI recommendations (embeddings)
#   - pg_trgm   -> fast fuzzy text search (ships with contrib)
FROM postgis/postgis:16-3.4

RUN apt-get update \
    && apt-get install -y --no-install-recommends postgresql-16-pgvector \
    && rm -rf /var/lib/apt/lists/*
