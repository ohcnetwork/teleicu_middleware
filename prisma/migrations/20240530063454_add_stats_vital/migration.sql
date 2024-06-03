-- CreateTable
CREATE TABLE "VitalsStat" (
    "id" SERIAL NOT NULL,
    "imageId" TEXT NOT NULL,
    "vitalsFromObservation" JSONB NOT NULL,
    "vitalsFromImage" JSONB NOT NULL,
    "gptDetails" JSONB NOT NULL,
    "accuracy" DOUBLE PRECISION NOT NULL,
    "cumulativeAccuracy" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VitalsStat_pkey" PRIMARY KEY ("id")
);
