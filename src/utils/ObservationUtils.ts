import type { Observation } from "@/types/observation";

export const messages = [
  {
    message: "Leads Off",
    description: "ECG leads disconnected",
    validity: "The HR value is null, if invalid",
    observationType: "ECG",
  },
  {
    message: "Asystole",
    description: "Arrhythmia - Asystole",
    validity: "The HR value is null, if invalid",
    observationType: "ECG",
  },
  {
    message: "Missed Beat",
    description: "Arrhythmia – Missed beat",
    validity: "The HR value is null, if invalid",
    observationType: "ECG",
  },
  {
    message: "Tachy Cardia",
    description: "Arrhythmia - Tachycardia",
    validity: "The HR value is null, if invalid",
    observationType: "ECG",
  },
  {
    message: "Brady Cardia",
    description: "Arrhythmia – Brady cardia",
    validity: "The HR value is null, if invalid",
    observationType: "ECG",
  },
  {
    message: "VFIB",
    description: "Arrhythmia - Ventricular Fibrillation",
    validity: "The HR value is null, if invalid",
    observationType: "ECG",
  },
  {
    message: "VTAC",
    description: "Arrhythmia - Ventricular Tachycardia",
    validity: "The HR value is null, if invalid",
    observationType: "ECG",
  },
  {
    message: "R ON T",
    description: "Arrhythmia – R on T",
    validity: "The HR value is null, if invalid",
    observationType: "ECG",
  },
  {
    message: "COUPLET",
    description: "Arrhythmia – PVC couplet",
    validity: "The HR value is null, if invalid",
    observationType: "ECG",
  },
  {
    message: "BIGEMINY",
    description: "Arrhythmia - Bigeminy",
    validity: "The HR value is null, if invalid",
    observationType: "ECG",
  },
  {
    message: "TRIGEMINY",
    description: "Arrhythmia - Trigeminy",
    validity: "The HR value is null, if invalid",
    observationType: "ECG",
  },
  {
    message: "PNC",
    description: "Arrhythmia - Premature Nodal contraction",
    validity: "The HR value is null, if invalid",
    observationType: "ECG",
  },
  {
    message: "PNP",
    description: "Arrhythmia - Pace not pacing",
    validity: "The HR value is null, if invalid",
    observationType: "ECG",
  },
  {
    message: "ARRHYTHMIA",
    description: "Arrhythmia present, couldn’t detect the specific arrhythmia",
    validity: "The HR value is null, if invalid",
    observationType: "ECG",
  },
  {
    message: "Run of PVCs",
    description: "Arrhythmia – Run of PVCs",
    validity: "The HR value is null, if invalid",
    observationType: "ECG",
  },
  {
    message: "Ventricular Premature Beat",
    description: "Arrhythmia – Ventricular Premature Beat",
    validity: "The HR value is null, if invalid",
    observationType: "ECG",
  },
  {
    message: "PVC High",
    description: "Arrhythmia – PVC High",
    validity: "The HR value is null, if invalid",
    observationType: "ECG",
  },
  {
    message: "Non Standard Ventricular Tachycardia",
    description: "Arrhythmia – Nonstandard Ventricular Tachycardia",
    validity: "The HR value is null, if invalid",
    observationType: "ECG",
  },
  {
    message: "Extreme Tachycardia",
    description: "Arrhythmia – Extreme Tachycardia",
    validity: "The HR value is null, if invalid",
    observationType: "ECG",
  },
  {
    message: "Extreme Bradycardia",
    description: "Arrhythmia – Extreme Bradycardia",
    validity: "The HR value is null, if invalid",
    observationType: "ECG",
  },
  {
    message: "Pause",
    description: "Arrhythmia – Heart Pause",
    validity: "The HR value is null, if invalid",
    observationType: "ECG",
  },
  {
    message: "Irregular Rhythm",
    description: "Arrhythmia – Irregular rhythm",
    validity: "The HR value is null, if invalid",
    observationType: "ECG",
  },
  {
    message: "Ventricular Bradycardia",
    description: "Arrhythmia – Ventricular tachycardia",
    validity: "The HR value is null, if invalid",
    observationType: "ECG",
  },
  {
    message: "Ventricular Rhythm",
    description: "Arrhythmia – Ventricular rhythm.",
    validity: "The HR value is null, if invalid",
    observationType: "ECG",
  },
  {
    message: "Wrong cuff",
    description:
      "Wrong cuff for the patient (for example paediatric NIBP being measured using ADULT cuff)",
    validity: "",
    observationType: "NIBP",
  },
  {
    message: "Connect Cuff",
    description: "No cuff / loose cuff",
    validity: "",
    observationType: "NIBP",
  },
  {
    message: "Measurement error",
    description: "Measurement taken is erroneous",
    validity: "",
    observationType: "NIBP",
  },
  {
    message: "No finger in probe",
    description: "SpO2 sensor has fallen off the patient finger",
    validity:
      "The SpO2, PR value is invalid if this message is present. Value will be set to null.",
    observationType: "SPO2",
  },
  {
    message: "Probe unplugged",
    description:
      "The SPO2 sensor probe is disconnected from the patient monitor.",
    validity:
      "The SpO2, PR value is invalid if this message is present. Value will be set to null.",
    observationType: "SPO2",
  },
  {
    message: "Leads off",
    description:
      "Respiration leads have fallen off / disconnected from the patient",
    validity: "The value is null if invalid",
    observationType: "Respiration",
  },
  {
    message: "Measurement invalid",
    description: "The measured value is invalid",
    validity: "When this message is present, the measured value is invalid.",
    observationType: "Temperature",
    invalid: true,
  },
];

export const isValid = (observation: Observation) => {
  if (
    !observation ||
    !observation.status ||
    (!["blood-pressure"].includes(observation.observation_id) &&
      isNaN(observation.value ?? NaN))
  ) {
    return false;
  }

  if (observation.status === "final") return true;

  const message = observation.status.replace("Message-", "");
  const messageObj = messages.find((m) => m.message === message);

  if (messageObj?.invalid) {
    return false;
  }

  return true;
};
