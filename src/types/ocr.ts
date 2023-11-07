export interface OCRObservationV1Raw {
  SpO2?: number | string | null;
  "Respiratory Rate"?: number | string | null;
  "Pulse Rate"?: number | string | null;
  Temperature?: number | string | null;
  "Blood Pressure"?: number | string | null;
}

export interface OCRObservationV1Sanitized {
  spo2?: number | null;
  ventilator_spo2?: number | null;
  resp?: number | null;
  pulse?: number | null;
  temperature?: number | null;
  bp?: {
    systolic: number | null;
    mean: number | null;
    diastolic: number | null;
  } | null;
}
