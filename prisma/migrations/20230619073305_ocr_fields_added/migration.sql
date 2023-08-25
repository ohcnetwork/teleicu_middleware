-- AlterTable
ALTER TABLE "Asset" ADD COLUMN     "password" TEXT,
ADD COLUMN     "port" INTEGER,
ADD COLUMN     "username" TEXT;

-- CreateTable
CREATE TABLE "Bed" (
    "id" SERIAL NOT NULL,
    "patientExternalId" TEXT NOT NULL,
    "x" INTEGER NOT NULL,
    "y" INTEGER NOT NULL,
    "zoom" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Bed_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Bed_patientExternalId_key" ON "Bed"("patientExternalId");
