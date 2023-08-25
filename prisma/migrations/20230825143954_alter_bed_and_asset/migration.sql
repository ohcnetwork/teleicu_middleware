/*
  Warnings:

  - You are about to drop the column `patientExternalId` on the `Bed` table. All the data in the column will be lost.
  - You are about to drop the column `x` on the `Bed` table. All the data in the column will be lost.
  - You are about to drop the column `y` on the `Bed` table. All the data in the column will be lost.
  - You are about to drop the column `zoom` on the `Bed` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[externalId]` on the table `Bed` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `cameraId` to the `Bed` table without a default value. This is not possible if the table is not empty.
  - Added the required column `externalId` to the `Bed` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `Bed` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "AssetType" AS ENUM ('CAMERA', 'MONITOR');

-- DropIndex
DROP INDEX "Bed_patientExternalId_key";

-- AlterTable
ALTER TABLE "Asset" ADD COLUMN     "type" "AssetType" NOT NULL DEFAULT 'MONITOR',
ALTER COLUMN "port" SET DEFAULT 80;

-- AlterTable
ALTER TABLE "Bed" DROP COLUMN "patientExternalId",
DROP COLUMN "x",
DROP COLUMN "y",
DROP COLUMN "zoom",
ADD COLUMN     "cameraId" INTEGER NOT NULL,
ADD COLUMN     "externalId" TEXT NOT NULL,
ADD COLUMN     "name" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "Preset" (
    "id" SERIAL NOT NULL,
    "x" INTEGER NOT NULL,
    "y" INTEGER NOT NULL,
    "zoom" INTEGER NOT NULL DEFAULT 0,
    "bedId" INTEGER NOT NULL,

    CONSTRAINT "Preset_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Preset_bedId_key" ON "Preset"("bedId");

-- CreateIndex
CREATE UNIQUE INDEX "Bed_externalId_key" ON "Bed"("externalId");

-- AddForeignKey
ALTER TABLE "Bed" ADD CONSTRAINT "Bed_cameraId_fkey" FOREIGN KEY ("cameraId") REFERENCES "Asset"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Preset" ADD CONSTRAINT "Preset_bedId_fkey" FOREIGN KEY ("bedId") REFERENCES "Bed"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
