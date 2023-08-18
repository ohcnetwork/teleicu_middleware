-- CreateEnum
CREATE TYPE "AssetType" AS ENUM ('CAMERA', 'MONITOR');

-- AlterTable
ALTER TABLE "Asset" ADD COLUMN     "bedId" INTEGER,
ADD COLUMN     "password" TEXT,
ADD COLUMN     "port" INTEGER DEFAULT 80,
ADD COLUMN     "type" "AssetType" NOT NULL DEFAULT 'MONITOR',
ADD COLUMN     "username" TEXT;

-- CreateTable
CREATE TABLE "Bed" (
    "id" SERIAL NOT NULL,
    "externalId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Bed_pkey" PRIMARY KEY ("id")
);

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
CREATE UNIQUE INDEX "Bed_externalId_key" ON "Bed"("externalId");

-- CreateIndex
CREATE UNIQUE INDEX "Preset_bedId_key" ON "Preset"("bedId");

-- AddForeignKey
ALTER TABLE "Asset" ADD CONSTRAINT "Asset_bedId_fkey" FOREIGN KEY ("bedId") REFERENCES "Bed"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Preset" ADD CONSTRAINT "Preset_bedId_fkey" FOREIGN KEY ("bedId") REFERENCES "Bed"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
