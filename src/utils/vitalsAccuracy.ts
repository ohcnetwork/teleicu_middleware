import { DailyRoundObservation } from "@/types/observation";

type ComparisonType = "relative" | "fixed";

function calculateAccuracy(
  obj1: Object,
  obj2: Object,
  keysToCompare: string[],
  comparisonType: ComparisonType = "relative",
) {
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

  let totalScore = 0;

  for (const key of keysToCompare) {
    const value1 = getValue(obj1, key);
    const value2 = getValue(obj2, key);
    totalScore += compareValues(value1, value2, comparisonType);
  }

  return (totalScore / keysToCompare.length) * 100;
}

export function caclculateVitalsAccuracy(
  vitals: DailyRoundObservation | null | undefined,
  original: DailyRoundObservation | null | undefined,
  type: ComparisonType = "relative",
) {
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

  return calculateAccuracy(vitals, original, keysToCompare, type);
}
