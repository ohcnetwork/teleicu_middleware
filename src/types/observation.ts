export type Observation =
  | {
      observation_id:
        | "heart-rate"
        | "ST"
        | "SpO2"
        | "pulse-rate"
        | "respiratory-rate"
        | "body-temperature1"
        | "body-temperature2";
      device_id: string;
      "date-time": string;
      "patient-id": string;
      "patient-name": string;
      status:
        | "final"
        | "Message-Leads Off"
        | "Message-Measurement Invalid"
        | "Message-Tachy Cardia"
        | "Message-Probe Unplugged"
        | null
        | undefined;
      value: number | null | undefined;
      data?: undefined;
      unit: string;
      interpretation?: "normal" | "low" | "high" | "NA";
      "low-limit": number;
      "high-limit": number;
      systolic?: undefined;
      diastolic?: undefined;
      map?: undefined;
    }
  | {
      observation_id: "blood-pressure";
      device_id: string;
      "date-time": string;
      "patient-id": string;
      status: "final" | null | undefined;
      value?: undefined;
      data?: undefined;
      unit?: undefined;
      interpretation?: undefined;
      "low-limit"?: undefined;
      "high-limit"?: undefined;
      systolic: {
        value: number | null | undefined;
        unit: string;
        interpretation?: "normal" | "low" | "high" | "NA";
        "low-limit": number;
        "high-limit": number;
      };
      diastolic: {
        value: number | null | undefined;
        unit: string;
        interpretation?: "normal" | "low" | "high" | "NA";
        "low-limit": number;
        "high-limit": number;
      };
      map?: {
        value: number | null | undefined;
        unit: string;
        interpretation?: "normal" | "low" | "high" | "NA";
        "low-limit": number;
        "high-limit": number;
      };
    }
  | {
      observation_id: "waveform";
      device_id: string;
      "date-time": string;
      "patient-id": string;
      "patient-name": string;
      "wave-name": "II" | "Pleth" | "Respiration";
      resolution: string;
      "sampling rate": string;
      "data-baseline": number;
      "data-low-limit": number;
      "data-high-limit": number;
      data: string;
      status?: undefined;
      value?: undefined;
      unit?: undefined;
      interpretation?: undefined;
      "low-limit"?: undefined;
      "high-limit"?: undefined;
      systolic?: undefined;
      diastolic?: undefined;
      map?: undefined;
    }
  | {
      observation_id: "device-connection";
      device_id: string;
      "date-time": string;
      "patient-id": string;
      "patient-name": string;
      status: "Connected" | "Disconnected";
      value?: undefined;
      data?: undefined;
      unit?: undefined;
      interpretation?: undefined;
      "low-limit"?: undefined;
      "high-limit"?: undefined;
      systolic?: undefined;
      diastolic?: undefined;
      map?: undefined;
    };

export type ObservationType = Observation["observation_id"];

export interface DailyRoundObservation {
  spo2?: number | null;
  ventilator_spo2?: number | null;
  resp?: number | null;
  pulse?: number | null;
  temperature?: number | null;
  temperature_measured_at?: string | null;
  bp?: {
    systolic?: number | null;
    diastolic?: number | null;
    mean?: number | null;
  };
  taken_at?: string | Date | null;
  rounds_type?: "AUTOMATED";
  is_parsed_by_ocr?: boolean;
}

export interface ObservationStatus {
  time: string;
  status: {
    [device_id: string]: "up" | "down";
  };
}

export interface StaticObservation {
  device_id: string;
  observations: Record<ObservationType, Observation[]>;
  last_updated: Date;
}

export type ObservationTypeWithWaveformTypes =
  | ObservationType
  | "waveform_II"
  | "waveform_Pleth"
  | "waveform_Respiration";

export type LastObservationData = {
  [observation_id in ObservationTypeWithWaveformTypes]?: {
    [device_id: string]: Observation;
  };
};
