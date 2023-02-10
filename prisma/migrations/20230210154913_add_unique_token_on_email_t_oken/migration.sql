/*
  Warnings:

  - A unique constraint covering the columns `[emailToken]` on the table `Token` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "isAdmin" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE UNIQUE INDEX "Token_emailToken_key" ON "Token"("emailToken");
