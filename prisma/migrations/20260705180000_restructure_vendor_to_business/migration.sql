SET search_path TO "bitetrack_dev", "public";

ALTER TABLE "vendor_profiles" RENAME TO "businesses";

DROP INDEX IF EXISTS "vendor_profiles_userId_key";

ALTER TABLE "businesses" ADD COLUMN "slug" TEXT;
ALTER TABLE "businesses" ADD COLUMN "logoUrl" TEXT;

UPDATE "businesses"
SET "slug" = LOWER(
  REGEXP_REPLACE(
    REGEXP_REPLACE(TRIM("businessName"), '[^a-zA-Z0-9]+', '-', 'g'),
    '(^-|-$)',
    '',
    'g'
  )
) || '-' || SUBSTRING("id"::text, 1, 8)
WHERE "slug" IS NULL;

ALTER TABLE "businesses" ALTER COLUMN "slug" SET NOT NULL;
CREATE UNIQUE INDEX "businesses_slug_key" ON "businesses"("slug");

CREATE INDEX "businesses_userId_idx" ON "businesses"("userId");

ALTER TABLE "products" RENAME COLUMN "vendorId" TO "businessId";
ALTER TABLE "reviews" RENAME COLUMN "vendorId" TO "businessId";
ALTER TABLE "favorites" RENAME COLUMN "vendorId" TO "businessId";

ALTER TABLE "vendor_shifts" RENAME TO "business_shifts";
ALTER TABLE "business_shifts" RENAME COLUMN "vendorId" TO "businessId";

ALTER INDEX IF EXISTS "products_vendorId_idx" RENAME TO "products_businessId_idx";
ALTER INDEX IF EXISTS "reviews_vendorId_idx" RENAME TO "reviews_businessId_idx";
ALTER INDEX IF EXISTS "reviews_vendorId_customerId_key" RENAME TO "reviews_businessId_customerId_key";
ALTER INDEX IF EXISTS "favorites_vendorId_idx" RENAME TO "favorites_businessId_idx";
ALTER INDEX IF EXISTS "favorites_customerId_vendorId_key" RENAME TO "favorites_customerId_businessId_key";
ALTER INDEX IF EXISTS "vendor_shifts_vendorId_idx" RENAME TO "business_shifts_businessId_idx";
