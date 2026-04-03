/*
  Warnings:

  - You are about to drop the `secondBrain_notions` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "secondBrain_notions" DROP CONSTRAINT "secondBrain_notions_user_fkey";

-- AlterTable
ALTER TABLE "Boards" ALTER COLUMN "favouritePosition" SET DATA TYPE BIGINT,
ALTER COLUMN "position" SET DATA TYPE BIGINT;

-- AlterTable
ALTER TABLE "Employees" ALTER COLUMN "salary" SET DATA TYPE BIGINT;

-- AlterTable
ALTER TABLE "Sections" ALTER COLUMN "position" SET DATA TYPE BIGINT;

-- AlterTable
ALTER TABLE "Tasks" ALTER COLUMN "position" SET DATA TYPE BIGINT,
ALTER COLUMN "likes" SET DATA TYPE BIGINT;

-- AlterTable
ALTER TABLE "crm_Accounts_Tasks" ALTER COLUMN "likes" SET DATA TYPE BIGINT;

-- AlterTable
ALTER TABLE "crm_Opportunities" ALTER COLUMN "budget" SET DATA TYPE BIGINT,
ALTER COLUMN "expected_revenue" SET DATA TYPE BIGINT;

-- AlterTable
ALTER TABLE "crm_Opportunities_Sales_Stages" ALTER COLUMN "probability" SET DATA TYPE BIGINT,
ALTER COLUMN "order" SET DATA TYPE BIGINT;

-- AlterTable
ALTER TABLE "crm_Opportunities_Type" ALTER COLUMN "order" SET DATA TYPE BIGINT;

-- DropTable
DROP TABLE "secondBrain_notions";

-- CreateTable
CREATE TABLE "crm_marketing_campaigns" (
    "id" TEXT NOT NULL,
    "__v" INTEGER NOT NULL DEFAULT 0,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "budget" DECIMAL(65,30),
    "spent" DECIMAL(65,30),
    "targetAudience" JSONB,
    "emailSubject" TEXT,
    "emailContent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" UUID,
    "sentCount" INTEGER NOT NULL DEFAULT 0,
    "openCount" INTEGER NOT NULL DEFAULT 0,
    "clickCount" INTEGER NOT NULL DEFAULT 0,
    "conversionCount" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "crm_marketing_campaigns_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "crm_marketing_campaigns" ADD CONSTRAINT "crm_marketing_campaigns_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "Users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
