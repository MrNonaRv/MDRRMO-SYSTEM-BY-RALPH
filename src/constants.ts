export const STORAGE_KEY = "mdrrmo_pcr_v2";
export const PER_PAGE = 8;

export const TEAM_OPTIONS = ["Alpha", "Bravo", "Charlie"];
export const DEFAULT_DRIVER_OPTIONS = [
  "Anacleto Apsay",
  "Eduardo Briones",
  "John Rey Singson",
  "Jolito Jaguio",
  "Rex Camique",
  "Roel Abiera",
  "Ryan Palma"
];

export const STATUS_OPTIONS = ["Active", "Closed", "Referred", "Pending"];

export const EMERGENCY_TYPES = [
  "Medical",
  "Trauma",
  "Drowning",
  "Fire",
  "Psych",
  "OB",
];

export const RESPONSE_TYPES = [
  "Response to Scene",
  "Intercept",
  "Schedule Interfacility Transfer",
  "Deployment",
  "Pass by",
  "Unscheduled",
  "Standby",
  "Interfacility Transfer",
  "Others",
];

export const LOCATION_TYPES = [
  "Airport",
  "Highway/Street",
  "Farm",
  "Industrial",
  "Restaurant/Bar",
  "Public Bldg",
  "Hospital",
  "Waterway",
  "Clinic/Medical",
  "Educational",
  "Residential",
  "Other",
];

export const DISPOSITION_OPTIONS = [
  "Treat/Transport EMS",
  "Treatment/Transport PVT",
  "Treat/Transfer Care",
  "No Treatment Required",
  "Refused Treatment",
  "Cancelled",
  "No Patient Found",
  "Treated/Released",
  "No Sign of Life at Scene",
];

export const CONSCIOUSNESS_LEVELS = [
  "Alert",
  "Responds to Verbal",
  "Responds to Pain",
  "Unresponsive",
];

export const GENDER_OPTIONS = ["Male", "Female", "Other"];

export const EYES_OPTIONS = [
  "Sluggish",
  "Nonreactive",
  "Blind",
  "Dilated",
  "Glaucoma",
  "Cataract",
  "Constrictive",
];

export const WOUNDS_OPTIONS = [
  "Abrasion",
  "Laceration",
  "Incision",
  "Avulsion",
  "Puncture",
  "Amputation",
  "Fracture",
  "Dislocation",
];

export const PAIN_QUALITY_OPTIONS = [
  "Sharp",
  "Dull",
  "Cramp",
  "Crushing",
  "Intermittent",
  "Constant",
];

export const GCS_EYE_OPTIONS = [
  { label: "4-Spontaneous", value: 4 },
  { label: "3-To Voice", value: 3 },
  { label: "2-To Pain", value: 2 },
  { label: "1-None", value: 1 },
];

export const GCS_VERBAL_OPTIONS = [
  { label: "5-Oriented", value: 5 },
  { label: "4-Confused", value: 4 },
  { label: "3-Inappropriate", value: 3 },
  { label: "2-Moaning", value: 2 },
  { label: "1-None", value: 1 },
];

export const GCS_MOTOR_OPTIONS = [
  { label: "6-Obeys Command", value: 6 },
  { label: "5-Localizes Pain", value: 5 },
  { label: "4-Withdraws to Pain", value: 4 },
  { label: "3-Decorticate", value: 3 },
  { label: "2-Decerebrate", value: 2 },
  { label: "1-None", value: 1 },
];
export const APGAR_SCHEMA = [
  { id: "heartRate", label: "Heart Rate", options: ["Absent", "< 100", "> 100"] },
  { id: "respRate", label: "Resp. Rate", options: ["Absent", "Weak cry", "Strong cry"] },
  { id: "muscleTone", label: "Muscle Tone", options: ["Flaccid", "Some flexion", "Active Motion"] },
  { id: "reflexIrritability", label: "Reflex Irritability", options: ["No response", "Some Motion", "Vigorous cry"] },
  { id: "color", label: "Color", options: ["Blue/Pale", "Body pink, Ext. blue", "Fully pink"] },
];

export const LUND_BROWDER_AGE_MAP = {
  0: { head: 9.5, thigh: 2.75, leg: 2.5 },
  1: { head: 8.5, thigh: 3.25, leg: 2.5 },
  5: { head: 6.5, thigh: 4.0, leg: 2.75 },
  10: { head: 5.5, thigh: 4.25, leg: 3.0 },
  15: { head: 4.5, thigh: 4.5, leg: 3.25 },
  adult: { head: 3.5, thigh: 4.75, leg: 3.5 },
};

export const LUND_BROWDER_REGIONS = [
  // Dynamic A, B, C
  { id: "head-f", label: "Head (Front)", type: "A" },
  { id: "head-b", label: "Head (Back)", type: "A" },
  { id: "thigh-rf", label: "Right Thigh (Front)", type: "B" },
  { id: "thigh-rb", label: "Right Thigh (Back)", type: "B" },
  { id: "thigh-lf", label: "Left Thigh (Front)", type: "B" },
  { id: "thigh-lb", label: "Left Thigh (Back)", type: "B" },
  { id: "leg-rf", label: "Right Lower Leg (Front)", type: "C" },
  { id: "leg-rb", label: "Right Lower Leg (Back)", type: "C" },
  { id: "leg-lf", label: "Left Lower Leg (Front)", type: "C" },
  { id: "leg-lb", label: "Left Lower Leg (Back)", type: "C" },
  
  // Static
  { id: "neck-f", label: "Neck (Front)", percentage: 1 },
  { id: "neck-b", label: "Neck (Back)", percentage: 1 },
  { id: "torso-f", label: "Torso (Front)", percentage: 13 },
  { id: "torso-b", label: "Torso (Back)", percentage: 13 },
  { id: "uarm-rf", label: "Right Upper Arm (Front)", percentage: 2 },
  { id: "uarm-rb", label: "Right Upper Arm (Back)", percentage: 2 },
  { id: "uarm-lf", label: "Left Upper Arm (Front)", percentage: 2 },
  { id: "uarm-lb", label: "Left Upper Arm (Back)", percentage: 2 },
  { id: "larm-rf", label: "Right Lower Arm (Front)", percentage: 1.5 },
  { id: "larm-rb", label: "Right Lower Arm (Back)", percentage: 1.5 },
  { id: "larm-lf", label: "Left Lower Arm (Front)", percentage: 1.5 },
  { id: "larm-lb", label: "Left Lower Arm (Back)", percentage: 1.5 },
  { id: "hand-rf", label: "Right Hand (Front)", percentage: 1.25 },
  { id: "hand-rb", label: "Right Hand (Back)", percentage: 1.25 },
  { id: "hand-lf", label: "Left Hand (Front)", percentage: 1.25 },
  { id: "hand-lb", label: "Left Hand (Back)", percentage: 1.25 },
  { id: "genitals", label: "Genitals", percentage: 1 },
  { id: "buttock-r", label: "Right Buttock", percentage: 2.5 },
  { id: "buttock-l", label: "Left Buttock", percentage: 2.5 },
  { id: "foot-rf", label: "Right Foot (Front)", percentage: 1.75 },
  { id: "foot-rb", label: "Right Foot (Back)", percentage: 1.75 },
  { id: "foot-lf", label: "Left Foot (Front)", percentage: 1.75 },
  { id: "foot-lb", label: "Left Foot (Back)", percentage: 1.75 },
];
