/*
  Warnings:

  - Made the column `institution` on table `professionals` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "professionals" ALTER COLUMN "institution" SET NOT NULL;
