export interface VitalSigns {
  bp: string;
  temp: string;
  pulse: string;
  resp: string;
  o2sat: string;
  o2given: string;
  others: string;
}

export interface VitalSignsTable {
  initial: VitalSigns;
  min5: VitalSigns;
  min10: VitalSigns;
  min15: VitalSigns;
  destination: VitalSigns;
}

export interface OBRecord {
  g: string;
  t: string;
  p: string;
  a: string;
  l: string;
  lmp: string;
  aog: string;
  edc: string;
  wt: string;
  fundicHeight: string;
  fetalHeartBeat: string;
  cervicalDilation: string;
}

export interface ApgarScore {
  heartRate: { min1: number | null; min5: number | null };
  respRate: { min1: number | null; min5: number | null };
  muscleTone: { min1: number | null; min5: number | null };
  reflexIrritability: { min1: number | null; min5: number | null };
  color: { min1: number | null; min5: number | null };
}

export interface PCRForm {
  pcrNo: string;
  date: string;
  timeOfDay: "AM" | "PM";
  teamName: string;
  driver: string;
  placeOfIncident: string;
  status: string;
  timestamps: {
    callReceived: string;
    timeOfIncident: string;
    walkIn: string;
    enRoute: string;
    atScene: string;
    atPatient: string;
    depart: string;
    atBase: string;
    inService: string;
  };
  responseType: string;
  responseTypeOthers?: string;
  locationTypes: string[];
  emergencyTypes: string[];
  disposition: string[];
  consciousness: string;
  patientName: string;
  age: string;
  birthDate: string;
  gender: string;
  civilStatus: string;
  contactNo: string;
  address: string;
  responsiblePerson: string;
  relationship: string;
  chiefComplaint: string;
  sampleHistory: {
    signsSymptoms: string;
    allergies: string;
    medications: string;
    pastHistory: string;
    lastMeal: string;
    eventPrior: string;
  };
  vitalSigns: VitalSignsTable;
  gcs: {
    eye: number;
    verbal: number;
    motor: number;
  };
  eyes: string[];
  wounds: string[];
  painScale: number | null;
  painQuality: string[];
  severityRadiating: string;
  burnExtent?: string;
  burnScaleType?: "adult" | "infant";
  burnRegions?: string[];
  obRecord?: OBRecord;
  apgarScore?: ApgarScore;
  narrative: string;
  responders: {
    r1: string;
    r2: string;
    r3: string;
  };
  nurses: string;
  encodedBy: string;
  hospital: string;
  endorsedTo: string;
  refusalAccepted: boolean;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface PCRRecord {
  id: string;
  form: PCRForm;
  gcsTotal: number;
  savedAt: string;
  updatedAt: string | null;
}
