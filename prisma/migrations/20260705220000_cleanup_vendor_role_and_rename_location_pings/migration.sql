SET search_path TO "bitetrack_dev", "public";

UPDATE "users" SET "role" = 'CUSTOMER' WHERE "role" = 'VENDOR';

ALTER TABLE "users" ALTER COLUMN "role" DROP DEFAULT;

ALTER TYPE "UserRole" RENAME TO "UserRole_old";
CREATE TYPE "UserRole" AS ENUM ('CUSTOMER', 'ADMIN');
ALTER TABLE "users"
  ALTER COLUMN "role" TYPE "UserRole"
  USING ("role"::text::"UserRole");
ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'CUSTOMER'::"UserRole";
DROP TYPE "UserRole_old";

ALTER TYPE "NotificationType" RENAME VALUE 'VENDOR_NEARBY' TO 'BUSINESS_NEARBY';
ALTER TYPE "NotificationType" RENAME VALUE 'FAVORITE_VENDOR_NEARBY' TO 'FAVORITE_BUSINESS_NEARBY';

ALTER TABLE "vendor_location_pings" RENAME TO "business_location_pings";

ALTER INDEX IF EXISTS "vendor_location_pings_pkey" RENAME TO "business_location_pings_pkey";
ALTER INDEX IF EXISTS "vendor_location_pings_shiftId_idx" RENAME TO "business_location_pings_shiftId_idx";
ALTER INDEX IF EXISTS "vendor_location_pings_recordedAt_idx" RENAME TO "business_location_pings_recordedAt_idx";
ALTER INDEX IF EXISTS "vendor_location_pings_location_idx" RENAME TO "business_location_pings_location_idx";
