-- AlterTable
ALTER TABLE "Account" ADD COLUMN     "sortOrder" INTEGER NOT NULL DEFAULT 0;

-- Backfill: give existing accounts a stable initial order based on their
-- current creation order, per user, so the new column doesn't leave every
-- row tied at 0 (which would make the very first drag reorder unpredictable).
WITH ranked AS (
  SELECT "id", ROW_NUMBER() OVER (PARTITION BY "userId" ORDER BY "createdAt" ASC) - 1 AS rn
  FROM "Account"
)
UPDATE "Account"
SET "sortOrder" = ranked.rn
FROM ranked
WHERE "Account"."id" = ranked."id";
