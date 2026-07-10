-- UpgradeContactStatusEnum
ALTER TYPE "ContactStatus" RENAME TO "ContactStatus_old";
CREATE TYPE "ContactStatus" AS ENUM ('NEW', 'IN_PROGRESS', 'RESPONDED', 'CLOSED');
ALTER TABLE "contact_messages" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "contact_messages" ALTER COLUMN "status" TYPE "ContactStatus" USING CASE
  WHEN "status"::text = 'READ' THEN 'IN_PROGRESS'
  ELSE "status"::text
END::"ContactStatus";
ALTER TABLE "contact_messages" ALTER COLUMN "status" SET DEFAULT 'NEW';
DROP TYPE "ContactStatus_old";

-- UpgradeContactMessageFields
ALTER TABLE "contact_messages" ADD COLUMN "fullName" TEXT;
UPDATE "contact_messages"
SET "fullName" = trim(concat_ws(' ', "firstName", "lastName"))
WHERE "fullName" IS NULL;
ALTER TABLE "contact_messages" ALTER COLUMN "fullName" SET NOT NULL;
ALTER TABLE "contact_messages" ADD COLUMN "isRead" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "contact_messages" DROP COLUMN "firstName";
ALTER TABLE "contact_messages" DROP COLUMN "lastName";
CREATE INDEX "contact_messages_isRead_idx" ON "contact_messages"("isRead");
