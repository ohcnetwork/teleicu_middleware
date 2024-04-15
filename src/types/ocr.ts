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

export type OCRV2Response = {
  time_stamp: string | null;
  ecg: {
    Heart_Rate_bpm: number | null;
  };
  nibp: {
    systolic_mmhg: number | null;
    diastolic_mmhg: number | null;
    mean_arterial_pressure_mmhg: number | null;
  };
  spO2: {
    oxygen_saturation_percentage: number | null;
  };
  respiration_rate: {
    breaths_per_minute: number | null;
  };
  temperature: {
    fahrenheit: number | null;
  };
};
