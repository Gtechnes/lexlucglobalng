-- CreateEnum
CREATE TYPE "ServiceStatus" AS ENUM ('DRAFT', 'PUBLISHED');

-- AlterTable
ALTER TABLE "services" ADD COLUMN "status" "ServiceStatus" NOT NULL DEFAULT 'DRAFT';
ALTER TABLE "services" ADD COLUMN "features" TEXT[] DEFAULT ARRAY[]::TEXT[];