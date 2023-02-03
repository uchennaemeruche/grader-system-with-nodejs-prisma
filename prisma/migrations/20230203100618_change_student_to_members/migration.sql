/*
  Warnings:

  - You are about to drop the column `testId` on the `AssessmentResult` table. All the data in the column will be lost.
  - Added the required column `assessmentId` to the `AssessmentResult` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "AssessmentResult" DROP CONSTRAINT "AssessmentResult_testId_fkey";

-- AlterTable
ALTER TABLE "AssessmentResult" DROP COLUMN "testId",
ADD COLUMN     "assessmentId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "AssessmentResult" ADD CONSTRAINT "AssessmentResult_assessmentId_fkey" FOREIGN KEY ("assessmentId") REFERENCES "Assessment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
