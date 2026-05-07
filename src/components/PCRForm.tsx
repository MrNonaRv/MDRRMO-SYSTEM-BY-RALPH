import React from "react";
import {
  AlertTriangle,
  Clock,
  Save,
  FileSpreadsheet,
  FileJson,
  MapPin,
} from "lucide-react";
import { motion } from "motion/react";
import { PCRForm, VitalSignsTable } from "../types";
import { MapPicker } from "./MapPicker";
import { BodyMap } from "./BodyMap";
import {
  STATUS_OPTIONS,
  RESPONSE_TYPES,
  LOCATION_TYPES,
  EMERGENCY_TYPES,
  DISPOSITION_OPTIONS,
  CONSCIOUSNESS_LEVELS,
  GENDER_OPTIONS,
  GCS_EYE_OPTIONS,
  GCS_VERBAL_OPTIONS,
  GCS_MOTOR_OPTIONS,
  PAIN_QUALITY_OPTIONS,
  EYES_OPTIONS,
  WOUNDS_OPTIONS,
  TEAM_OPTIONS,
  APGAR_SCHEMA,
  LUND_BROWDER_AGE_MAP,
  LUND_BROWDER_REGIONS,
} from "../constants";

interface PCRFormProps {
  formData: PCRForm;
  setFormData: React.Dispatch<React.SetStateAction<PCRForm>>;
  isEditing: boolean;
  loading: boolean;
  handleSave: (exportType?: "excel" | "json" | "pdf") => void;
  setActiveTab: (tab: any) => void;
  getStatusColor: (status: string) => string;
  getEmergencyColor: (type: string) => string;
  getGCSColor: (score: number) => string;
  getGCSLabel: (score: number) => string;
  driverOptions: string[];
  teamOptions: string[];
  handleNewRecord: () => void;
}

export const PCRFormPage: React.FC<PCRFormProps> = ({
  formData,
  setFormData,
  isEditing,
  loading,
  handleSave,
  setActiveTab,
  getStatusColor,
  getEmergencyColor,
  getGCSColor,
  getGCSLabel,
  driverOptions,
  teamOptions,
  handleNewRecord,
}) => {
  const updateFormData = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const updateTimestamp = (
    field: keyof PCRForm["timestamps"],
    value: string,
  ) => {
    setFormData((prev) => ({
      ...prev,
      timestamps: { ...prev.timestamps, [field]: value },
    }));
  };

  const updateSampleHistory = (
    field: keyof PCRForm["sampleHistory"],
    value: string,
  ) => {
    setFormData((prev) => ({
      ...prev,
      sampleHistory: { ...prev.sampleHistory, [field]: value },
    }));
  };

  const updateResponders = (
    field: keyof PCRForm["responders"],
    value: string,
  ) => {
    setFormData((prev) => ({
      ...prev,
      responders: { ...prev.responders, [field]: value },
    }));
  };

  const toggleMultiSelect = (
    field:
      | "locationTypes"
      | "emergencyTypes"
      | "disposition"
      | "eyes"
      | "wounds"
      | "painQuality",
    value: string,
  ) => {
    setFormData((prev) => {
      const current = prev[field] as string[];
      const updated = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];
      return { ...prev, [field]: updated };
    });
  };

  const updateVitalSign = (
    time: keyof VitalSignsTable,
    metric: keyof VitalSignsTable["initial"],
    value: string,
  ) => {
    setFormData((prev) => ({
      ...prev,
      vitalSigns: {
        ...prev.vitalSigns,
        [time]: { ...prev.vitalSigns[time], [metric]: value },
      },
    }));
  };

  const updateOBRecord = (field: keyof PCRForm["obRecord"], value: string) => {
    setFormData((prev) => ({
      ...prev,
      obRecord: {
        ...(prev.obRecord || {
          g: "", t: "", p: "", a: "", l: "", lmp: "", aog: "", edc: "", wt: "", fundicHeight: "", fetalHeartBeat: "", cervicalDilation: ""
        }),
        [field]: value,
      },
    }));
  };

  const updateApgarScore = (
    sign: keyof PCRForm["apgarScore"],
    time: "min1" | "min5",
    value: number | null
  ) => {
    setFormData((prev) => ({
      ...prev,
      apgarScore: {
        ...(prev.apgarScore || {
          heartRate: { min1: null, min5: null },
          respRate: { min1: null, min5: null },
          muscleTone: { min1: null, min5: null },
          reflexIrritability: { min1: null, min5: null },
          color: { min1: null, min5: null },
        }),
        [sign]: {
          ...(prev.apgarScore ? prev.apgarScore[sign] : { min1: null, min5: null }),
          [time]: value,
        },
      },
    }));
  };

  const gcsTotal =
    (formData.gcs.eye || 0) +
    (formData.gcs.verbal || 0) +
    (formData.gcs.motor || 0);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="space-y-6 pb-24"
    >
      {isEditing && (
        <motion.div
          variants={itemVariants}
          className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 p-4 rounded-2xl flex items-center gap-3 text-amber-800 dark:text-amber-200"
        >
          <AlertTriangle className="w-5 h-5" />
          <span className="font-bold">
            You are currently editing an existing record (PCR No:{" "}
            {formData.pcrNo}).
          </span>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LEFT COLUMN */}
        <div className="space-y-6">
          {/* Incident Information */}
          <motion.div
            variants={itemVariants}
            className="bg-white dark:bg-slate-900 rounded-2xl border border-[#e2e8f0] dark:border-slate-800 overflow-hidden shadow-sm"
          >
            <div className="bg-[#c0392b] p-4 text-white font-black uppercase tracking-widest text-sm">
              1. Incident Information
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase mb-1">
                    PCR No.
                  </label>
                  <input
                    type="text"
                    value={formData.pcrNo}
                    onChange={(e) => updateFormData("pcrNo", e.target.value)}
                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-[#e2e8f0] dark:border-slate-700 rounded-xl text-sm font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#c0392b]/20"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => updateFormData("date", e.target.value)}
                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-[#e2e8f0] dark:border-slate-700 rounded-xl text-sm font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#c0392b]/20"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase mb-1">
                    Time of Day
                  </label>
                  <div className="flex bg-slate-50 dark:bg-slate-800 p-1 rounded-xl border border-[#e2e8f0] dark:border-slate-700">
                    {["AM", "PM"].map((t) => (
                      <button
                        key={t}
                        onClick={() => updateFormData("timeOfDay", t)}
                        className={`flex-1 py-1 rounded-lg text-xs font-black transition-all ${
                          formData.timeOfDay === t
                            ? "bg-white dark:bg-slate-700 shadow-sm text-[#c0392b]"
                            : "text-slate-400 dark:text-slate-500"
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase mb-1">
                    Team Name
                  </label>
                  <select
                    value={formData.teamName}
                    onChange={(e) => updateFormData("teamName", e.target.value)}
                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-[#e2e8f0] dark:border-slate-700 rounded-xl text-sm font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#c0392b]/20"
                  >
                    <option value="">Select Team</option>
                    {teamOptions.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase mb-1">
                    Driver
                  </label>
                  <select
                    value={formData.driver}
                    onChange={(e) => updateFormData("driver", e.target.value)}
                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-[#e2e8f0] dark:border-slate-700 rounded-xl text-sm font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#c0392b]/20"
                  >
                    <option value="">Select Driver</option>
                    {driverOptions.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase mb-1">
                    Place of Incident
                  </label>
                  <input
                    type="text"
                    value={formData.placeOfIncident}
                    onChange={(e) =>
                      updateFormData("placeOfIncident", e.target.value)
                    }
                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-[#e2e8f0] dark:border-slate-700 rounded-xl text-sm font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#c0392b]/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase mb-2 flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> Incident Location (Tap map to set)
                </label>
                <MapPicker 
                  lat={formData.coordinates?.lat || 11.3583} 
                  lng={formData.coordinates?.lng || 122.5972} 
                  onChange={(lat, lng) => updateFormData("coordinates", { lat, lng })} 
                />
                {formData.coordinates && (
                  <p className="mt-2 text-[10px] font-mono text-slate-500 dark:text-slate-400">
                    Lat: {formData.coordinates.lat.toFixed(6)}, Lng: {formData.coordinates.lng.toFixed(6)}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase mb-2">
                  Status
                </label>
                <div className="flex flex-wrap gap-2">
                  {STATUS_OPTIONS.map((s) => (
                    <button
                      key={s}
                      onClick={() => updateFormData("status", s)}
                      className={`px-4 py-2 rounded-xl text-xs font-black transition-all border-2 ${
                        formData.status === s
                          ? `${getStatusColor(s)} border-transparent text-white shadow-lg`
                          : "bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-400 dark:text-slate-500 hover:border-slate-200 dark:hover:border-slate-600"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase mb-3">
                  Timestamps
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {[
                    { id: "callReceived", label: "Call Received" },
                    { id: "timeOfIncident", label: "Time of Incident" },
                    { id: "walkIn", label: "Walk-In" },
                    { id: "enRoute", label: "En Route" },
                    { id: "atScene", label: "At Scene" },
                    { id: "atPatient", label: "At Patient" },
                    { id: "depart", label: "Depart" },
                    { id: "atBase", label: "At Base" },
                    { id: "inService", label: "In Service" },
                  ].map((ts) => (
                    <div key={ts.id}>
                      <label className="block text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">
                        {ts.label}
                      </label>
                      <input
                        type="time"
                        value={
                          formData.timestamps[
                            ts.id as keyof PCRForm["timestamps"]
                          ]
                        }
                        onChange={(e) =>
                          updateTimestamp(ts.id as any, e.target.value)
                        }
                        className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-[#e2e8f0] dark:border-slate-700 rounded-lg text-xs font-bold text-slate-900 dark:text-slate-100 focus:outline-none"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Classification */}
          <motion.div
            variants={itemVariants}
            className="bg-white dark:bg-slate-900 rounded-2xl border border-[#e2e8f0] dark:border-slate-800 overflow-hidden shadow-sm"
          >
            <div className="bg-slate-800 dark:bg-slate-950 p-4 text-white font-black uppercase tracking-widest text-sm">
              2. Classification
            </div>
            <div className="p-6 space-y-6">
              <div>
                <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase mb-2">
                  Response Type
                </label>
                <div className="flex flex-wrap gap-2">
                  {RESPONSE_TYPES.map((t) => (
                    <button
                      key={t}
                      onClick={() => updateFormData("responseType", t)}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all border ${
                        formData.responseType === t
                          ? "bg-slate-800 dark:bg-slate-700 text-white border-slate-800 dark:border-slate-700"
                          : "bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
                {formData.responseType === "Others" && (
                  <input
                    type="text"
                    value={formData.responseTypeOthers || ""}
                    onChange={(e) => updateFormData("responseTypeOthers", e.target.value)}
                    placeholder="Specify other response type..."
                    className="mt-3 w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-500/20"
                  />
                )}
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase mb-2">
                  Location Type
                </label>
                <div className="flex flex-wrap gap-2">
                  {LOCATION_TYPES.map((t) => (
                    <button
                      key={t}
                      onClick={() => toggleMultiSelect("locationTypes", t)}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all border ${
                        formData.locationTypes.includes(t)
                          ? "bg-slate-800 dark:bg-slate-700 text-white border-slate-800 dark:border-slate-700"
                          : "bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase mb-2">
                  Type of Emergency
                </label>
                <div className="flex flex-wrap gap-2">
                  {EMERGENCY_TYPES.map((t) => (
                    <button
                      key={t}
                      onClick={() => toggleMultiSelect("emergencyTypes", t)}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all border ${
                        formData.emergencyTypes.includes(t)
                          ? `${getEmergencyColor(t)} text-white border-transparent shadow-sm`
                          : "bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase mb-2">
                  Patient Disposition
                </label>
                <div className="flex flex-wrap gap-2">
                  {DISPOSITION_OPTIONS.map((t) => (
                    <button
                      key={t}
                      onClick={() => toggleMultiSelect("disposition", t)}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all border ${
                        formData.disposition.includes(t)
                          ? "bg-slate-800 dark:bg-slate-700 text-white border-slate-800 dark:border-slate-700"
                          : "bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase mb-2">
                  Level of Consciousness
                </label>
                <div className="flex flex-wrap gap-2">
                  {CONSCIOUSNESS_LEVELS.map((t) => (
                    <button
                      key={t}
                      onClick={() => updateFormData("consciousness", t)}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all border ${
                        formData.consciousness === t
                          ? "bg-slate-800 dark:bg-slate-700 text-white border-slate-800 dark:border-slate-700"
                          : "bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Patient Information */}
          <motion.div
            variants={itemVariants}
            className="bg-white dark:bg-slate-900 rounded-2xl border border-[#e2e8f0] dark:border-slate-800 overflow-hidden shadow-sm"
          >
            <div className="bg-slate-800 dark:bg-slate-950 p-4 text-white font-black uppercase tracking-widest text-sm">
              3. Patient Information
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase mb-1">
                    Patient Name
                  </label>
                  <input
                    type="text"
                    value={formData.patientName}
                    onChange={(e) =>
                      updateFormData("patientName", e.target.value)
                    }
                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-[#e2e8f0] dark:border-slate-700 rounded-xl text-sm font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#c0392b]/20"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase mb-1">
                      Age
                    </label>
                    <input
                      type="text"
                      value={formData.age}
                      onChange={(e) => updateFormData("age", e.target.value)}
                      className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-[#e2e8f0] dark:border-slate-700 rounded-xl text-sm font-bold text-slate-900 dark:text-slate-100 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase mb-1">
                      Birth Date
                    </label>
                    <input
                      type="date"
                      value={formData.birthDate}
                      onChange={(e) =>
                        updateFormData("birthDate", e.target.value)
                      }
                      className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-[#e2e8f0] dark:border-slate-700 rounded-xl text-sm font-bold text-slate-900 dark:text-slate-100 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase mb-1">
                    Gender
                  </label>
                  <div className="flex bg-slate-50 dark:bg-slate-800 p-1 rounded-xl border border-[#e2e8f0] dark:border-slate-700">
                    {GENDER_OPTIONS.map((g) => (
                      <button
                        key={g}
                        onClick={() => updateFormData("gender", g)}
                        className={`flex-1 py-1 rounded-lg text-[10px] font-bold transition-all ${
                          formData.gender === g
                            ? "bg-white dark:bg-slate-700 shadow-sm text-slate-800 dark:text-slate-100"
                            : "text-slate-400 dark:text-slate-500"
                        }`}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase mb-1">
                    Civil Status
                  </label>
                  <input
                    type="text"
                    value={formData.civilStatus}
                    onChange={(e) =>
                      updateFormData("civilStatus", e.target.value)
                    }
                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-[#e2e8f0] dark:border-slate-700 rounded-xl text-sm font-bold text-slate-900 dark:text-slate-100 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase mb-1">
                    Contact No.
                  </label>
                  <input
                    type="text"
                    value={formData.contactNo}
                    onChange={(e) =>
                      updateFormData("contactNo", e.target.value)
                    }
                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-[#e2e8f0] dark:border-slate-700 rounded-xl text-sm font-bold text-slate-900 dark:text-slate-100 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase mb-1">
                  Address
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => updateFormData("address", e.target.value)}
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-[#e2e8f0] dark:border-slate-700 rounded-xl text-sm font-bold text-slate-900 dark:text-slate-100 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase mb-1">
                    Responsible Person
                  </label>
                  <input
                    type="text"
                    value={formData.responsiblePerson}
                    onChange={(e) =>
                      updateFormData("responsiblePerson", e.target.value)
                    }
                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-[#e2e8f0] dark:border-slate-700 rounded-xl text-sm font-bold text-slate-900 dark:text-slate-100 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase mb-1">
                    Relationship
                  </label>
                  <input
                    type="text"
                    value={formData.relationship}
                    onChange={(e) =>
                      updateFormData("relationship", e.target.value)
                    }
                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-[#e2e8f0] dark:border-slate-700 rounded-xl text-sm font-bold text-slate-900 dark:text-slate-100 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase mb-1">
                  Chief Complaint
                </label>
                <textarea
                  value={formData.chiefComplaint}
                  onChange={(e) =>
                    updateFormData("chiefComplaint", e.target.value)
                  }
                  rows={3}
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-[#e2e8f0] dark:border-slate-700 rounded-xl text-sm font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#c0392b]/20"
                />
              </div>
            </div>
          </motion.div>

          {/* SAMPLE History */}
          <motion.div
            variants={itemVariants}
            className="bg-white dark:bg-slate-900 rounded-2xl border border-[#e2e8f0] dark:border-slate-800 overflow-hidden shadow-sm"
          >
            <div className="bg-slate-800 dark:bg-slate-950 p-4 text-white font-black uppercase tracking-widest text-sm">
              4. SAMPLE History
            </div>
            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { id: "signsSymptoms", label: "Signs & Symptoms" },
                { id: "allergies", label: "Allergies" },
                { id: "medications", label: "Medications" },
                { id: "pastHistory", label: "Past Medical History" },
                { id: "lastMeal", label: "Last Meal Taken" },
                { id: "eventPrior", label: "Event Prior to Injury" },
              ].map((field) => (
                <div key={field.id}>
                  <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase mb-1">
                    {field.label}
                  </label>
                  <textarea
                    value={
                      formData.sampleHistory[
                        field.id as keyof PCRForm["sampleHistory"]
                      ]
                    }
                    onChange={(e) =>
                      updateSampleHistory(field.id as any, e.target.value)
                    }
                    rows={2}
                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-[#e2e8f0] dark:border-slate-700 rounded-xl text-sm font-bold text-slate-900 dark:text-slate-100 focus:outline-none"
                  />
                </div>
              ))}
            </div>
          </motion.div>

          {/* Section 11: OB/GYN Record */}
          <motion.div
            variants={itemVariants}
            className="bg-white dark:bg-slate-900 rounded-2xl border border-[#e2e8f0] dark:border-slate-800 overflow-hidden shadow-sm"
          >
            <div className="bg-[#c0392b] p-4 text-white font-black uppercase tracking-widest text-sm">
              11. OB/GYN Record
            </div>
            <div className="p-6">
              <div className="grid grid-cols-5 gap-2 mb-4">
                {["g", "t", "p", "a", "l"].map((f) => (
                  <div key={f}>
                    <label className="block text-[8px] font-black text-slate-400 uppercase mb-1">{f}</label>
                    <input
                      type="text"
                      value={formData.obRecord?.[f as keyof typeof formData.obRecord] || ""}
                      onChange={(e) => updateOBRecord(f as any, e.target.value)}
                      className="w-full px-2 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded text-xs font-bold"
                    />
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { id: "lmp", label: "M/LMP" },
                  { id: "aog", label: "AOG" },
                  { id: "edc", label: "EDC" },
                  { id: "wt", label: "WT" },
                  { id: "fundicHeight", label: "Fundic Height" },
                  { id: "fetalHeartBeat", label: "FHB" },
                  { id: "cervicalDilation", label: "Dilation (cm)" },
                ].map((f) => (
                  <div key={f.id}>
                    <label className="block text-[8px] font-black text-slate-400 uppercase mb-1">{f.label}</label>
                    <input
                      type="text"
                      value={formData.obRecord?.[f.id as keyof typeof formData.obRecord] || ""}
                      onChange={(e) => updateOBRecord(f.id as any, e.target.value)}
                      className="w-full px-2 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded text-xs font-bold"
                    />
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="space-y-6">
          {/* Vital Signs */}
          <motion.div
            variants={itemVariants}
            className="bg-white dark:bg-slate-900 rounded-2xl border border-[#e2e8f0] dark:border-slate-800 overflow-hidden shadow-sm"
          >
            <div className="bg-slate-800 dark:bg-slate-950 p-4 text-white font-black uppercase tracking-widest text-sm">
              5. Vital Signs
            </div>
            <div className="p-0 overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[600px]">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-[#e2e8f0] dark:border-slate-800">
                    <th className="px-4 py-3 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase">
                      Metric
                    </th>
                    <th className="px-4 py-3 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase">
                      Initial
                    </th>
                    <th className="px-4 py-3 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase">
                      5 mins
                    </th>
                    <th className="px-4 py-3 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase">
                      10 mins
                    </th>
                    <th className="px-4 py-3 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase">
                      15 mins
                    </th>
                    <th className="px-4 py-3 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase">
                      Dest.
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e2e8f0] dark:divide-slate-800">
                  {[
                    { id: "bp", label: "BP" },
                    { id: "temp", label: "Temp" },
                    { id: "pulse", label: "Pulse" },
                    { id: "resp", label: "Resp" },
                    { id: "o2sat", label: "O2 Sat" },
                    { id: "o2given", label: "O2 Given" },
                    { id: "others", label: "Others" },
                  ].map((metric) => (
                    <tr key={metric.id}>
                      <td className="px-4 py-2 text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase bg-slate-50/50 dark:bg-slate-800/30">
                        {metric.label}
                      </td>
                      {["initial", "min5", "min10", "min15", "destination"].map(
                        (time) => (
                          <td key={time} className="px-2 py-1">
                            <input
                              type="text"
                              value={
                                formData.vitalSigns[
                                  time as keyof VitalSignsTable
                                ][metric.id as keyof VitalSignsTable["initial"]]
                              }
                              onChange={(e) =>
                                updateVitalSign(
                                  time as any,
                                  metric.id as any,
                                  e.target.value,
                                )
                              }
                              className="w-full px-2 py-1 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded text-xs font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#c0392b]"
                            />
                          </td>
                        ),
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>

          {/* GCS */}
          <motion.div
            variants={itemVariants}
            className="bg-white dark:bg-slate-900 rounded-2xl border border-[#e2e8f0] dark:border-slate-800 overflow-hidden shadow-sm"
          >
            <div className="bg-slate-800 dark:bg-slate-950 p-4 text-white font-black uppercase tracking-widest text-sm flex justify-between items-center">
              <span>6. Glasgow Coma Scale (GCS)</span>
              <div
                className={`px-3 py-1 rounded-lg text-white font-black text-xs ${getGCSColor(gcsTotal)} flex items-center gap-2`}
              >
                <span>TOTAL: {gcsTotal}</span>
                <span className="opacity-80 text-[10px] border-l border-white/30 pl-2 ml-1">{getGCSLabel(gcsTotal)}</span>
              </div>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase mb-2">
                  Eye Opening
                </label>
                <div className="flex flex-wrap gap-2">
                  {GCS_EYE_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          gcs: { ...prev.gcs, eye: opt.value },
                        }))
                      }
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all border ${
                        formData.gcs.eye === opt.value
                          ? "bg-slate-800 dark:bg-slate-700 text-white border-slate-800 dark:border-slate-700"
                          : "bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase mb-2">
                  Verbal Response
                </label>
                <div className="flex flex-wrap gap-2">
                  {GCS_VERBAL_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          gcs: { ...prev.gcs, verbal: opt.value },
                        }))
                      }
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all border ${
                        formData.gcs.verbal === opt.value
                          ? "bg-slate-800 dark:bg-slate-700 text-white border-slate-800 dark:border-slate-700"
                          : "bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase mb-2">
                  Motor Response
                </label>
                <div className="flex flex-wrap gap-2">
                  {GCS_MOTOR_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          gcs: { ...prev.gcs, motor: opt.value },
                        }))
                      }
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all border ${
                        formData.gcs.motor === opt.value
                          ? "bg-slate-800 dark:bg-slate-700 text-white border-slate-800 dark:border-slate-700"
                          : "bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Eyes & Wounds */}
          <motion.div
            variants={itemVariants}
            className="bg-white dark:bg-slate-900 rounded-2xl border border-[#e2e8f0] dark:border-slate-800 overflow-hidden shadow-sm"
          >
            <div className="bg-slate-800 dark:bg-slate-950 p-4 text-white font-black uppercase tracking-widest text-sm">
              7. Eyes & Wounds
            </div>
            <div className="p-6 space-y-6">
              <div>
                <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase mb-2">
                  Eyes (R/L)
                </label>
                <div className="flex flex-wrap gap-2">
                  {EYES_OPTIONS.map((t) => (
                    <button
                      key={t}
                      onClick={() => toggleMultiSelect("eyes", t)}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all border ${
                        formData.eyes.includes(t)
                          ? "bg-slate-800 dark:bg-slate-700 text-white border-slate-800 dark:border-slate-700"
                          : "bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase mb-2">
                  Wounds
                </label>
                <div className="flex flex-wrap gap-2">
                  {WOUNDS_OPTIONS.map((t) => (
                    <button
                      key={t}
                      onClick={() => toggleMultiSelect("wounds", t)}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all border ${
                        formData.wounds.includes(t)
                          ? "bg-slate-800 dark:bg-slate-700 text-white border-slate-800 dark:border-slate-700"
                          : "bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Pain Scale */}
          <motion.div
            variants={itemVariants}
            className="bg-white dark:bg-slate-900 rounded-2xl border border-[#e2e8f0] dark:border-slate-800 overflow-hidden shadow-sm"
          >
            <div className="bg-slate-800 dark:bg-slate-950 p-4 text-white font-black uppercase tracking-widest text-sm">
              8. Pain Scale
            </div>
            <div className="p-6 space-y-6">
              <div>
                <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase mb-3">
                  Intensity (1-10)
                </label>
                <div className="flex flex-wrap gap-2">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                    <button
                      key={n}
                      onClick={() => updateFormData("painScale", n)}
                      className={`w-10 h-10 rounded-full font-black text-sm transition-all border-2 ${
                        formData.painScale === n
                          ? "bg-[#c0392b] border-transparent text-white shadow-lg"
                          : "bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-400 dark:text-slate-500 hover:border-slate-200 dark:hover:border-slate-600"
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase mb-2">
                  Pain Quality
                </label>
                <div className="flex flex-wrap gap-2">
                  {PAIN_QUALITY_OPTIONS.map((t) => (
                    <button
                      key={t}
                      onClick={() => toggleMultiSelect("painQuality", t)}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all border ${
                        formData.painQuality.includes(t)
                          ? "bg-slate-800 dark:bg-slate-700 text-white border-slate-800 dark:border-slate-700"
                          : "bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase mb-2">
                  Severity Radiating
                </label>
                <div className="flex gap-2">
                  {["Yes", "No"].map((t) => (
                    <button
                      key={t}
                      onClick={() => updateFormData("severityRadiating", t)}
                      className={`flex-1 py-2 rounded-xl text-xs font-black transition-all border ${
                        formData.severityRadiating === t
                          ? "bg-slate-800 dark:bg-slate-700 text-white border-slate-800 dark:border-slate-700"
                          : "bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Narrative Report */}
          <motion.div
            variants={itemVariants}
            className="bg-white dark:bg-slate-900 rounded-2xl border border-[#e2e8f0] dark:border-slate-800 overflow-hidden shadow-sm"
          >
            <div className="bg-slate-800 dark:bg-slate-950 p-4 text-white font-black uppercase tracking-widest text-sm">
              9. Narrative Report
            </div>
            <div className="p-6">
              <textarea
                value={formData.narrative}
                onChange={(e) => updateFormData("narrative", e.target.value)}
                rows={8}
                placeholder="Enter detailed narrative report here..."
                className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-[#e2e8f0] dark:border-slate-700 rounded-xl text-sm font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#c0392b]/20"
              />
            </div>
          </motion.div>

          {/* Responders & Endorsement */}
          <motion.div
            variants={itemVariants}
            className="bg-white dark:bg-slate-900 rounded-2xl border border-[#e2e8f0] dark:border-slate-800 overflow-hidden shadow-sm"
          >
            <div className="bg-slate-800 dark:bg-slate-950 p-4 text-white font-black uppercase tracking-widest text-sm">
              10. Responders & Endorsement
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase mb-1">
                    Responder 1
                  </label>
                  <input
                    type="text"
                    value={formData.responders.r1}
                    onChange={(e) => updateResponders("r1", e.target.value)}
                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-[#e2e8f0] dark:border-slate-700 rounded-xl text-sm font-bold text-slate-900 dark:text-slate-100 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase mb-1">
                    Responder 2
                  </label>
                  <input
                    type="text"
                    value={formData.responders.r2}
                    onChange={(e) => updateResponders("r2", e.target.value)}
                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-[#e2e8f0] dark:border-slate-700 rounded-xl text-sm font-bold text-slate-900 dark:text-slate-100 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase mb-1">
                    Responder 3
                  </label>
                  <input
                    type="text"
                    value={formData.responders.r3}
                    onChange={(e) => updateResponders("r3", e.target.value)}
                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-[#e2e8f0] dark:border-slate-700 rounded-xl text-sm font-bold text-slate-900 dark:text-slate-100 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase mb-1">
                    Nurse/s
                  </label>
                  <input
                    type="text"
                    value={formData.nurses}
                    onChange={(e) => updateFormData("nurses", e.target.value)}
                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-[#e2e8f0] dark:border-slate-700 rounded-xl text-sm font-bold text-slate-900 dark:text-slate-100 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase mb-1">
                    Encoded By
                  </label>
                  <input
                    type="text"
                    value={formData.encodedBy}
                    onChange={(e) =>
                      updateFormData("encodedBy", e.target.value)
                    }
                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-[#e2e8f0] dark:border-slate-700 rounded-xl text-sm font-bold text-slate-900 dark:text-slate-100 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase mb-1">
                    Name of Hospital
                  </label>
                  <input
                    type="text"
                    value={formData.hospital}
                    onChange={(e) => updateFormData("hospital", e.target.value)}
                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-[#e2e8f0] dark:border-slate-700 rounded-xl text-sm font-bold text-slate-900 dark:text-slate-100 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase mb-1">
                    Endorsed To
                  </label>
                  <input
                    type="text"
                    value={formData.endorsedTo}
                    onChange={(e) =>
                      updateFormData("endorsedTo", e.target.value)
                    }
                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-[#e2e8f0] dark:border-slate-700 rounded-xl text-sm font-bold text-slate-900 dark:text-slate-100 focus:outline-none"
                  />
                </div>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700">
                <label className="flex items-start gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={formData.refusalAccepted}
                    onChange={(e) =>
                      updateFormData("refusalAccepted", e.target.checked)
                    }
                    className="mt-1 w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-[#c0392b] focus:ring-[#c0392b]"
                  />
                  <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 leading-relaxed group-hover:text-slate-700 dark:group-hover:text-slate-300 transition-colors">
                    <span className="text-slate-900 dark:text-slate-100 block mb-1 uppercase tracking-widest font-black">
                      Refusal of Treatment Waiver
                    </span>
                    I, the undersigned, have been advised by the MDRRMO EMS team
                    that medical treatment/transportation is necessary. I
                    voluntarily refuse such treatment/transportation and release
                    the Municipality of Mambusao and its personnel from any
                    liability resulting from this refusal.
                  </div>
                </label>
              </div>
            </div>
          </motion.div>

          {/* APGAR Score */}
          <motion.div
            variants={itemVariants}
            className="bg-white dark:bg-slate-900 rounded-2xl border border-[#e2e8f0] dark:border-slate-800 overflow-hidden shadow-sm"
          >
            <div className="bg-slate-800 dark:bg-slate-950 p-4 text-white font-black uppercase tracking-widest text-sm flex justify-between items-center">
              <span>12. APGAR Score</span>
              <div className="flex gap-4">
                <div className="bg-emerald-600 px-2 py-1 rounded text-[10px] font-black">
                  1 MIN: {Object.values(formData.apgarScore || {}).reduce((acc, curr) => acc + (curr?.min1 || 0), 0)}
                </div>
                <div className="bg-blue-600 px-2 py-1 rounded text-[10px] font-black">
                  5 MIN: {Object.values(formData.apgarScore || {}).reduce((acc, curr) => acc + (curr?.min5 || 0), 0)}
                </div>
              </div>
            </div>
            <div className="p-0 overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[500px]">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-[#e2e8f0] dark:border-slate-800">
                    <th className="px-4 py-3 text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase">Sign</th>
                    <th className="px-4 py-3 text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase text-center">1 min</th>
                    <th className="px-4 py-3 text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase text-center">5 min</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e2e8f0] dark:divide-slate-800">
                  {APGAR_SCHEMA.map((sign) => (
                    <tr key={sign.id}>
                      <td className="px-4 py-3">
                        <div className="text-[10px] font-black text-slate-700 dark:text-slate-300 uppercase">{sign.label}</div>
                      </td>
                      {["min1", "min5"].map((time) => (
                        <td key={time} className="px-4 py-3 text-center">
                          <div className="flex justify-center gap-1">
                            {[0, 1, 2].map((val) => (
                              <button
                                key={val}
                                onClick={() => updateApgarScore(sign.id as any, time as any, val)}
                                className={`w-8 h-8 rounded-lg text-[10px] font-black transition-all flex flex-col items-center justify-center leading-none border-2 ${
                                  formData.apgarScore?.[sign.id as keyof typeof formData.apgarScore]?.[time as "min1" | "min5"] === val
                                    ? "bg-slate-800 dark:bg-slate-700 text-white border-transparent shadow-lg"
                                    : "bg-white dark:bg-slate-800 text-slate-400 dark:text-slate-500 border-slate-100 dark:border-slate-700"
                                }`}
                                title={sign.options[val]}
                              >
                                {val}
                                <span className="text-[6px] opacity-70 mt-0.5">{sign.options[val].split(' ')[0]}</span>
                              </button>
                            ))}
                          </div>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </div>

          {/* Section 13 - Burn Scale (Lund-Browder Chart) */}
          <motion.div
            variants={itemVariants}
            className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-[#e2e8f0] dark:border-slate-800 overflow-hidden shadow-sm mt-6"
          >
            <div className="bg-[#c0392b] p-4 text-white font-black uppercase tracking-widest text-sm flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-4">
                <span>13. Burn Scale (Lund-Browder)</span>
                <div className="flex bg-white/10 p-1 rounded-xl">
                  {["adult", "infant"].map((t) => (
                    <button
                      key={t}
                      onClick={() => updateFormData("burnScaleType", t as any)}
                      className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${
                        (formData.burnScaleType || "adult") === t
                          ? "bg-white text-[#c0392b] shadow-lg"
                          : "text-white hover:bg-white/10"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              <div className="bg-white text-[#c0392b] px-4 py-2 rounded-xl text-xs font-black shadow-lg flex items-center gap-2">
                <span className="opacity-60 text-[10px]">TOTAL TBSA:</span>
                <span className="text-sm">
                  {(() => {
                    const burnRegs = formData.burnRegions || [];
                    const type = formData.burnScaleType || "adult";
                    let ageKey: any = type === "adult" ? "adult" : parseInt(formData.age);
                    if (type === "infant") {
                      if (isNaN(ageKey)) ageKey = 0;
                      else if (ageKey >= 15) ageKey = 15;
                      else if (ageKey >= 10) ageKey = 10;
                      else if (ageKey >= 5) ageKey = 5;
                      else if (ageKey >= 1) ageKey = 1;
                      else ageKey = 0;
                    }
                    const dynamicValues = LUND_BROWDER_AGE_MAP[ageKey as keyof typeof LUND_BROWDER_AGE_MAP];
                    return burnRegs.reduce((acc, curr) => {
                      const region = LUND_BROWDER_REGIONS.find(r => r.id === curr);
                      if (!region) return acc;
                      if (region.percentage) return acc + region.percentage;
                      if (region.type === "A") return acc + dynamicValues.head;
                      if (region.type === "B") return acc + dynamicValues.thigh;
                      if (region.type === "C") return acc + dynamicValues.leg;
                      return acc;
                    }, 0);
                  })()}%
                </span>
              </div>
            </div>
            <div className="p-6">
               <BodyMap 
                 age={formData.age}
                 type={formData.burnScaleType || "adult"}
                 selectedRegions={formData.burnRegions || []}
                 onToggleRegion={(id) => {
                    const current = formData.burnRegions || [];
                    const updated = current.includes(id)
                      ? current.filter(x => x !== id)
                      : [...current, id];
                    updateFormData("burnRegions", updated);
                 }}
               />
               <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800">
                 <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">Burn Assessment Notes</label>
                 <textarea
                   value={formData.burnExtent || ""}
                   onChange={(e) => updateFormData("burnExtent", e.target.value)}
                   rows={3}
                   className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-4 focus:ring-[#c0392b]/5"
                   placeholder="Describe degree, appearance, and specific locations of burns..."
                 />
               </div>
            </div>
          </motion.div>
        </div>

      {/* Bottom Action Bar */}
      <motion.div
        variants={itemVariants}
        className="fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-t border-[#e2e8f0] dark:border-slate-800 p-4 z-40"
      >
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500 text-[10px] font-black uppercase tracking-widest">
            <Clock className="w-3 h-3" />
            Autosave Enabled
          </div>
          <div className="flex items-center gap-4">
          <button
            onClick={() => setActiveTab("records")}
            className="px-6 py-3 rounded-xl font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            Cancel
          </button>
          {!isEditing && (
            <button
              onClick={() => {
                if (window.confirm("Clear all data in this form?")) {
                  handleNewRecord();
                }
              }}
              className="px-6 py-3 rounded-xl font-bold bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/40 transition-colors"
            >
              Clear Form
            </button>
          )}
          <button
            disabled={loading}
            onClick={() => handleSave()}
            className="px-8 py-3 rounded-xl font-bold bg-[#c0392b] text-white hover:bg-[#922b21] transition-colors flex items-center gap-2 shadow-lg shadow-red-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Clock className="w-5 h-5 animate-spin" />
            ) : (
              <Save className="w-5 h-5" />
            )}
            {isEditing ? "Update Record" : "Save Record"}
          </button>
          <div className="flex gap-1">
            <button
              disabled={loading}
              onClick={() => handleSave("excel")}
              className="p-3 rounded-xl font-bold bg-[#16a34a] text-white hover:bg-[#15803d] transition-colors flex items-center gap-2 shadow-lg shadow-green-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Save + Export Excel"
            >
              <FileSpreadsheet className="w-5 h-5" />
            </button>
            <button
              disabled={loading}
              onClick={() => handleSave("json")}
              className="p-3 rounded-xl font-bold bg-[#16a34a] text-white hover:bg-[#15803d] transition-colors flex items-center gap-2 shadow-lg shadow-green-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Save + Export JSON"
            >
              <FileJson className="w-5 h-5" />
            </button>
            <button
              disabled={loading}
              onClick={() => handleSave("pdf")}
              className="p-3 rounded-xl font-bold bg-[#16a34a] text-white hover:bg-[#15803d] transition-colors flex items-center gap-2 shadow-lg shadow-green-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Save + Export PDF"
            >
              <Clock className="w-5 h-5" />
            </button>
          </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};
