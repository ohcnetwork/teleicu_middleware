import { DailyRoundObservation } from "@/types/observation";

type ComparisonType = "relative" | "fixed";

type AccuracyMetrics = {
  field: string;
  accuracy: number;
  falsePositive: number;
  falseNegative: number;
};

export type Accuracy = { overall: number; metrics: AccuracyMetrics[] };

function calculateAccuracy(
  obj1: Object,
  obj2: Object,
  keysToCompare: string[],
  comparisonType: ComparisonType = "relative",
): AccuracyMetrics[] {
  function compareValues(
    value1: number,
    value2: number,
    comparisonType: ComparisonType = "relative",
  ) {
    if (
      value1 === null ||
      value2 === null ||
      value1 === undefined ||
      value2 === undefined ||
      isNaN(value1) ||
      isNaN(value2)
    ) {
      return 0;
    }

    if (comparisonType === "relative") {
      const maxDiff = Math.max(Math.abs(value1), Math.abs(value2));
      const diff = Math.abs(value1 - value2);
      return maxDiff === 0 ? 1 : 1 - diff / maxDiff;
    } else {
      return value1 === value2 ? 1 : 0;
    }
  }

  function getValue(obj: any, key: string): any {
    return key.split(".").reduce((o, k) => (o ? o[k] : undefined), obj);
  }

  const metrics: AccuracyMetrics[] = [];

  for (const key of keysToCompare) {
    const value1 = getValue(obj1, key);
    const value2 = getValue(obj2, key);
    const accuracy = compareValues(value1, value2, comparisonType);
    const falsePositive =
      (value1 === null || value1 === undefined) &&
      value2 !== null &&
      value2 !== undefined
        ? 1
        : 0;
    const falseNegative =
      value1 !== null &&
      value1 !== undefined &&
      (value2 === null || value2 === undefined)
        ? 1
        : 0;

    metrics.push({
      field: key,
      accuracy,
      falsePositive,
      falseNegative,
    });
  }

  return metrics;
}

export function calculateVitalsAccuracy(
  vitals: DailyRoundObservation | null | undefined,
  original: DailyRoundObservation | null | undefined,
  type: ComparisonType = "relative",
): Accuracy | null {
  if (!vitals || !original) {
    return null;
  }

  const keysToCompare = [
    "spo2",
    "ventilator_spo2",
    "resp",
    "pulse",
    "temperature",
    "bp.systolic",
    "bp.diastolic",
  ];

  const metrics = calculateAccuracy(vitals, original, keysToCompare, type);
  const overall =
    metrics.reduce((acc, curr) => acc + curr.accuracy, 0) /
    keysToCompare.length;

  return {
    overall: overall * 100,
    metrics,
  };
}
