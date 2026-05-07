import React from "react";
import {
  ChevronLeft,
  User,
  Clock,
  Edit,
  FileSpreadsheet,
  FileText,
  Printer,
  Trash2,
  Activity,
  Stethoscope,
} from "lucide-react";
import { motion } from "motion/react";
import { PCRRecord, PCRForm, VitalSignsTable } from "../types";
import { 
  STATUS_OPTIONS, 
  APGAR_SCHEMA, 
  LUND_BROWDER_AGE_MAP, 
  LUND_BROWDER_REGIONS 
} from "../constants";

interface RecordDetailViewProps {
  currentRecord: PCRRecord | null;
  setActiveTab: (tab: any) => void;
  setFormData: (data: PCRForm) => void;
  setIsEditing: (editing: boolean) => void;
  handleExportExcel: (record: PCRRecord) => void;
  handleExportPDF: (record: PCRRecord) => void;
  setDeleteModal: (id: string | null) => void;
  updateStatus: (record: PCRRecord, newStatus: string) => void;
  getStatusColor: (status: string) => string;
  getEmergencyColor: (type: string) => string;
  getGCSColor: (score: number) => string;
  getGCSLabel: (score: number) => string;
}

export const RecordDetailView: React.FC<RecordDetailViewProps> = ({
  currentRecord,
  setActiveTab,
  setFormData,
  setIsEditing,
  handleExportExcel,
  handleExportPDF,
  setDeleteModal,
  updateStatus,
  getStatusColor,
  getEmergencyColor,
  getGCSColor,
  getGCSLabel,
}) => {
  if (!currentRecord) return null;
  const { form, gcsTotal, savedAt } = currentRecord;

  const DetailRow = ({ label, value }: { label: string; value: any }) => {
    if (!value || (Array.isArray(value) && value.length === 0)) return null;
    return (
      <div className="py-3 flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-50 dark:border-slate-700 gap-1">
        <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
          {label}
        </span>
        <span className="text-sm font-bold text-slate-700 dark:text-slate-300 text-right">
          {Array.isArray(value) ? value.join(", ") : value.toString()}
        </span>
      </div>
    );
  };

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
      className="space-y-6 pb-24 print:pb-0 print:space-y-4"
    >
      {/* Header Row */}
      <motion.div
        variants={itemVariants}
        className="flex items-center gap-2 mb-2 print:hidden"
      >
        <button
          onClick={() => setActiveTab("records")}
          className="text-xs font-bold text-slate-500 flex items-center gap-1 hover:text-[#c0392b] transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Records
        </button>
      </motion.div>
      <motion.div
        variants={itemVariants}
        className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-[#e2e8f0] dark:border-slate-700 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 print:shadow-none print:border-black print:rounded-none"
      >
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-[#fff0ef] dark:bg-red-900/20 rounded-2xl flex items-center justify-center text-[#c0392b] dark:text-red-400 print:hidden">
            <User className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h2 className="text-2xl font-black text-slate-900 dark:text-white">
                {form.patientName || "Unnamed Patient"}
              </h2>
              <span
                className={`px-2 py-1 rounded-full text-[10px] font-black text-white uppercase tracking-tight ${getStatusColor(form.status)} print:text-black print:border print:border-black print:bg-transparent`}
              >
                {form.status}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-tight print:bg-transparent print:border print:border-black print:text-black">
                PCR: {form.pcrNo}
              </span>
              {form.emergencyTypes.map((t) => (
                <span
                  key={t}
                  className={`px-2 py-0.5 rounded text-[10px] font-black text-white uppercase tracking-tight ${getEmergencyColor(t)} print:text-black print:border print:border-black print:bg-transparent`}
                >
                  {t}
                </span>
              ))}
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 flex items-center gap-1 print:text-black">
                <Clock className="w-3 h-3" />
                Saved: {new Date(savedAt).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 print:hidden">
          <button
            onClick={() => {
              setFormData(form);
              setIsEditing(true);
              setActiveTab("form");
            }}
            className="p-3 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 rounded-xl hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors flex items-center gap-2 font-bold text-sm"
          >
            <Edit className="w-4 h-4" />
            Edit
          </button>
          <button
            onClick={() => handleExportExcel(currentRecord)}
            className="p-3 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-xl hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors flex items-center gap-2 font-bold text-sm"
          >
            <FileSpreadsheet className="w-4 h-4" />
            Excel
          </button>
          <button
            onClick={() => handleExportPDF(currentRecord)}
            className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors flex items-center gap-2 font-bold text-sm"
          >
            <FileText className="w-4 h-4" />
            PDF
          </button>
          <button
            onClick={() => window.print()}
            className="p-3 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors flex items-center gap-2 font-bold text-sm"
          >
            <Printer className="w-4 h-4" />
            Print
          </button>
          <button
            onClick={() => setDeleteModal(currentRecord.id)}
            className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </motion.div>

      {/* Status Update Bar */}
      <motion.div
        variants={itemVariants}
        className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-[#e2e8f0] dark:border-slate-700 shadow-sm flex items-center gap-4 overflow-x-auto print:hidden"
      >
        <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest whitespace-nowrap">
          Quick Status Update:
        </span>
        <div className="flex gap-2">
          {STATUS_OPTIONS.map((s) => (
            <button
              key={s}
              onClick={() => updateStatus(currentRecord, s)}
              className={`px-4 py-2 rounded-xl text-[10px] font-black transition-all border-2 ${
                form.status === s
                  ? `${getStatusColor(s)} border-transparent text-white shadow-md`
                  : "bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-400 dark:text-slate-500 hover:border-slate-200 dark:hover:border-slate-600"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LEFT COLUMN */}
        <div className="space-y-6 print:space-y-4">
          <motion.div
            variants={itemVariants}
            className="bg-white dark:bg-slate-800 rounded-3xl border border-[#e2e8f0] dark:border-slate-700 p-6 shadow-sm print:shadow-none print:border-black print:rounded-none"
          >
            <h3 className="text-sm font-black text-[#c0392b] dark:text-red-400 uppercase tracking-widest mb-4 flex items-center gap-2 print:text-black">
              <Activity className="w-4 h-4" />
              Incident Information
            </h3>
            <DetailRow label="PCR No." value={form.pcrNo} />
            <DetailRow label="Date" value={form.date} />
            <DetailRow label="Time of Day" value={form.timeOfDay} />
            <DetailRow label="Team Name" value={form.teamName} />
            <DetailRow label="Driver" value={form.driver} />
            <DetailRow label="Place" value={form.placeOfIncident} />
            <DetailRow 
              label="Classification" 
              value={form.responseType === "Others" ? `Others (${form.responseTypeOthers})` : form.responseType} 
            />
            <DetailRow label="Location" value={form.locationTypes.join(", ") || "N/A"} />
            <DetailRow label="Disposition" value={form.disposition.join(", ") || "N/A"} />
            <div className="mt-4 grid grid-cols-3 gap-2">
              {Object.entries(form.timestamps).map(
                ([key, val]) =>
                  val && (
                    <div
                      key={key}
                      className="bg-slate-50 dark:bg-slate-900/50 p-2 rounded-xl text-center"
                    >
                      <div className="text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-tight truncate">
                        {key.replace(/([A-Z])/g, " $1")}
                      </div>
                      <div className="text-xs font-black text-slate-700 dark:text-slate-300">
                        {val}
                      </div>
                    </div>
                  ),
              )}
            </div>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="bg-white dark:bg-slate-800 rounded-3xl border border-[#e2e8f0] dark:border-slate-700 p-6 shadow-sm print:shadow-none print:border-black print:rounded-none"
          >
            <h3 className="text-sm font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest mb-4 flex items-center gap-2 print:text-black">
              <User className="w-4 h-4" />
              Patient Information
            </h3>
            <DetailRow label="Name" value={form.patientName} />
            <DetailRow label="Age" value={form.age} />
            <DetailRow label="Birth Date" value={form.birthDate} />
            <DetailRow label="Gender" value={form.gender} />
            <DetailRow label="Civil Status" value={form.civilStatus} />
            <DetailRow label="Contact" value={form.contactNo} />
            <DetailRow label="Address" value={form.address} />
            <DetailRow label="Responsible" value={form.responsiblePerson} />
            <DetailRow label="Relationship" value={form.relationship} />
            <div className="mt-4 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl">
              <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-1">
                Chief Complaint
              </span>
              <p className="text-sm font-bold text-slate-700 dark:text-slate-300 leading-relaxed">
                {form.chiefComplaint || "No complaint recorded."}
              </p>
            </div>
          </motion.div>

          {/* SAMPLE History */}
          <motion.div
            variants={itemVariants}
            className="bg-white dark:bg-slate-800 rounded-3xl border border-[#e2e8f0] dark:border-slate-700 p-6 shadow-sm print:shadow-none print:border-black print:rounded-none"
          >
            <h3 className="text-sm font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest mb-4 flex items-center gap-2 print:text-black">
              <Stethoscope className="w-4 h-4" />
              SAMPLE History
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {Object.entries(form.sampleHistory).map(([key, val]) => (
                val && (
                  <div key={key} className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-2xl">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">
                      {key.replace(/([A-Z])/g, " $1")}
                    </span>
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-300">{val}</p>
                  </div>
                )
              ))}
            </div>
          </motion.div>

          {/* OB/GYN Record */}
          {form.obRecord && Object.values(form.obRecord).some(v => v) && (
            <motion.div
              variants={itemVariants}
              className="bg-white dark:bg-slate-800 rounded-3xl border border-[#e2e8f0] dark:border-slate-700 p-6 shadow-sm print:shadow-none print:border-black print:rounded-none"
            >
              <h3 className="text-sm font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest mb-4 print:text-black">
                OB/GYN Record
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {Object.entries(form.obRecord).map(([key, val]) => (
                  val && (
                    <div key={key} className="bg-slate-50 dark:bg-slate-900/50 p-2 rounded-xl">
                      <div className="text-[8px] font-black text-slate-400 uppercase">{key.replace(/([A-Z])/g, " $1")}</div>
                      <div className="text-xs font-bold text-slate-700 dark:text-slate-300">{val}</div>
                    </div>
                  )
                ))}
              </div>
            </motion.div>
          )}
        </div>

        {/* RIGHT COLUMN */}
        <div className="space-y-6 print:space-y-4">
          <motion.div
            variants={itemVariants}
            className="bg-white dark:bg-slate-800 rounded-3xl border border-[#e2e8f0] dark:border-slate-700 overflow-hidden shadow-sm print:shadow-none print:border-black print:rounded-none"
          >
            <div className="p-6 border-b border-slate-50 dark:border-slate-700 print:border-black">
              <h3 className="text-sm font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest flex items-center gap-2">
                <Activity className="w-4 h-4" />
                Vital Signs
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-900">
                    <th className="px-4 py-3 text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase">
                      Metric
                    </th>
                    <th className="px-4 py-3 text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase">
                      Init
                    </th>
                    <th className="px-4 py-3 text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase">
                      5m
                    </th>
                    <th className="px-4 py-3 text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase">
                      10m
                    </th>
                    <th className="px-4 py-3 text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase">
                      15m
                    </th>
                    <th className="px-4 py-3 text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase">
                      Dest
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-700">
                  {[
                    "bp",
                    "temp",
                    "pulse",
                    "resp",
                    "o2sat",
                    "o2given",
                    "others",
                  ].map((metric) => (
                    <tr key={metric}>
                      <td className="px-4 py-2 text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase bg-slate-50/30 dark:bg-slate-900/30">
                        {metric}
                      </td>
                      {["initial", "min5", "min10", "min15", "destination"].map(
                        (time) => (
                          <td
                            key={time}
                            className="px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-300"
                          >
                            {form.vitalSigns[time as keyof VitalSignsTable][
                              metric as keyof VitalSignsTable["initial"]
                            ] || "-"}
                          </td>
                        ),
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="bg-white dark:bg-slate-800 rounded-3xl border border-[#e2e8f0] dark:border-slate-700 p-6 shadow-sm print:shadow-none print:border-black print:rounded-none"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest flex items-center gap-2 print:text-black">
                <Activity className="w-4 h-4" />
                GCS Summary
              </h3>
              <div
                className={`px-4 py-1 rounded-full text-white font-black text-xs ${getGCSColor(gcsTotal)} print:text-black print:border print:border-black print:bg-transparent flex items-center gap-2`}
              >
                <span>TOTAL: {gcsTotal}</span>
                <span className="opacity-80 text-[10px] border-l border-white/30 pl-2 ml-1">{getGCSLabel(gcsTotal)}</span>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase mb-1">
                  Eye
                </div>
                <div className="text-lg font-black text-slate-700 dark:text-slate-300">
                  {form.gcs.eye}
                </div>
              </div>
              <div className="text-center">
                <div className="text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase mb-1">
                  Verbal
                </div>
                <div className="text-lg font-black text-slate-700 dark:text-slate-300">
                  {form.gcs.verbal}
                </div>
              </div>
              <div className="text-center">
                <div className="text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase mb-1">
                  Motor
                </div>
                <div className="text-lg font-black text-slate-700 dark:text-slate-300">
                  {form.gcs.motor}
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="bg-white dark:bg-slate-800 rounded-3xl border border-[#e2e8f0] dark:border-slate-700 p-6 shadow-sm print:shadow-none print:border-black print:rounded-none"
          >
            <h3 className="text-sm font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest mb-4 print:text-black">
              Clinical Assessment
            </h3>
            <DetailRow label="Eyes" value={form.eyes} />
            <DetailRow label="Wounds" value={form.wounds} />
            <DetailRow label="Pain Intensity" value={form.painScale} />
            <DetailRow label="Pain Quality" value={form.painQuality} />
            <DetailRow label="Radiating" value={form.severityRadiating} />
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="bg-white dark:bg-slate-800 rounded-3xl border border-[#e2e8f0] dark:border-slate-700 p-6 shadow-sm print:shadow-none print:border-black print:rounded-none"
          >
            <h3 className="text-sm font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest mb-4 print:text-black">
              Narrative Report
            </h3>
            <p className="text-sm font-bold text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
              {form.narrative || "No narrative report provided."}
            </p>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="bg-white dark:bg-slate-800 rounded-3xl border border-[#e2e8f0] dark:border-slate-700 p-6 shadow-sm print:shadow-none print:border-black print:rounded-none"
          >
            <DetailRow
              label="Refusal Waiver"
              value={
                form.refusalAccepted ? "Accepted/Signed" : "Not Applicable"
              }
            />
          </motion.div>

          {/* APGAR & Burn Summary */}
          {(form.apgarScore || form.burnExtent) && (
            <motion.div
              variants={itemVariants}
              className="bg-white dark:bg-slate-800 rounded-3xl border border-[#e2e8f0] dark:border-slate-700 overflow-hidden shadow-sm print:shadow-none print:border-black print:rounded-none mt-6"
            >
              <div className="p-6">
                {form.apgarScore && (
                  <div className="mb-8">
                    <div className="flex justify-between items-center mb-4">
                       <h3 className="text-sm font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest">APGAR Score</h3>
                       <div className="flex gap-4">
                         <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded">1M: {["heartRate", "respRate", "muscleTone", "reflexIrritability", "color"].reduce((acc, curr) => acc + (form.apgarScore?.[curr as keyof typeof form.apgarScore]?.min1 || 0), 0)}</span>
                         <span className="text-[10px] font-black text-blue-600 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded">5M: {["heartRate", "respRate", "muscleTone", "reflexIrritability", "color"].reduce((acc, curr) => acc + (form.apgarScore?.[curr as keyof typeof form.apgarScore]?.min5 || 0), 0)}</span>
                       </div>
                    </div>
                    <table className="w-full text-[10px] border-collapse">
                      <thead>
                        <tr className="border-b border-slate-100 dark:border-slate-700">
                          <th className="text-left py-2 font-black text-slate-400 uppercase">Sign</th>
                          <th className="text-center py-2 font-black text-slate-400 uppercase">1m</th>
                          <th className="text-center py-2 font-black text-slate-400 uppercase">5m</th>
                        </tr>
                      </thead>
                      <tbody>
                        {APGAR_SCHEMA.map(s => (
                          <tr key={s.id} className="border-b border-slate-50 dark:border-slate-800/50">
                            <td className="py-2 font-bold text-slate-600 dark:text-slate-400">{s.label}</td>
                            <td className="py-2 text-center font-black text-slate-800 dark:text-slate-200">{form.apgarScore?.[s.id as keyof typeof form.apgarScore]?.min1}</td>
                            <td className="py-2 text-center font-black text-slate-800 dark:text-slate-200">{form.apgarScore?.[s.id as keyof typeof form.apgarScore]?.min5}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {((form.burnRegions && form.burnRegions.length > 0) || form.burnExtent) && (
                  <div className="pt-6 border-t border-slate-100 dark:border-slate-700">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-sm font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest">Burn Scale ({form.burnScaleType || "adult"})</h3>
                      <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 px-3 py-1 rounded-xl text-[10px] font-black border border-red-100 dark:border-red-900/30">
                        TOTAL: {(() => {
                          const burnRegs = form.burnRegions || [];
                          const type = form.burnScaleType || "adult";
                          let ageKey: any = type === "adult" ? "adult" : parseInt(form.age);
                          if (isNaN(ageKey)) ageKey = 0;
                          else if (ageKey >= 15) ageKey = 15;
                          else if (ageKey >= 10) ageKey = 10;
                          else if (ageKey >= 5) ageKey = 5;
                          else if (ageKey >= 1) ageKey = 1;
                          else if (ageKey < 1) ageKey = 0;
                          const dynamicValues = LUND_BROWDER_AGE_MAP[ageKey as keyof typeof LUND_BROWDER_AGE_MAP] || LUND_BROWDER_AGE_MAP.adult;
                          return burnRegs.reduce((acc, curr) => {
                            const region = LUND_BROWDER_REGIONS.find(r => r.id === curr);
                            if (!region) return acc;
                            if (region.percentage) return acc + region.percentage;
                            if (region.type === "A") return acc + dynamicValues.head;
                            if (region.type === "B") return acc + dynamicValues.thigh;
                            if (region.type === "C") return acc + dynamicValues.leg;
                            return acc;
                          }, 0);
                        })()}% TBSA
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {(form.burnRegions || []).map(id => {
                        const region = LUND_BROWDER_REGIONS.find(r => r.id === id);
                        return region ? (
                          <span key={id} className="bg-slate-50 dark:bg-slate-900/50 text-slate-600 dark:text-slate-400 px-2 py-1 rounded text-[10px] font-black border border-slate-100 dark:border-slate-800">
                            {region.label}
                          </span>
                        ) : null;
                      })}
                    </div>
                    {form.burnExtent && <DetailRow label="Burn Notes" value={form.burnExtent} />}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
};
