ALTER TABLE "bitetrack_dev"."users" ADD COLUMN "googleId" TEXT;

CREATE UNIQUE INDEX "users_googleId_key" ON "bitetrack_dev"."users"("googleId");
