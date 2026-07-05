SET search_path TO "bitetrack_dev", "public";

UPDATE "users"
SET "firstName" = COALESCE(NULLIF(TRIM("firstName"), ''), 'User')
WHERE "firstName" IS NULL OR TRIM("firstName") = '';

UPDATE "users"
SET "lastName" = COALESCE(NULLIF(TRIM("lastName"), ''), 'User')
WHERE "lastName" IS NULL OR TRIM("lastName") = '';

ALTER TABLE "users" ALTER COLUMN "firstName" SET NOT NULL;
ALTER TABLE "users" ALTER COLUMN "lastName" SET NOT NULL;
