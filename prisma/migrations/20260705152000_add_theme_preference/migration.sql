CREATE TYPE "ThemePreference" AS ENUM ('LIGHT', 'DARK', 'SYSTEM');

ALTER TABLE "users" ADD COLUMN "themePreference" "ThemePreference" NOT NULL DEFAULT 'SYSTEM';
