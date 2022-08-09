/*
  Warnings:

  - Added the required column `response` to the `DailyRound` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "DailyRound" ADD COLUMN     "response" TEXT NOT NULL,
ALTER COLUMN "time" SET DEFAULT CURRENT_TIMESTAMP;
