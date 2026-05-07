import React, { useRef, useState, useMemo } from "react";
import { FileText, Activity, Clock, Download, Upload, Settings, X, FileSpreadsheet, Plus, Trash2, RefreshCw, ExternalLink } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { motion } from "motion/react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";

import { useRecordsContext } from "../context/RecordsContext";
import { parseExcelRecords } from "../lib/importUtils";
import { handleExportAllExcel } from "../lib/exportUtils";
import { hashPassword } from "../utils/helpers";
import { PCRRecord, PCRForm } from "../types";

interface DashboardProps {
  setActiveTab: (tab: any) => void;
  setCurrentRecord: (record: PCRRecord) => void;
  getEmergencyColor: (type: string) => string;
  getStatusColor: (status: string) => string;
  showToast: (msg: string, type: "success" | "error" | "info") => void;
  driverOptions: string[];
  setDriverOptions: React.Dispatch<React.SetStateAction<string[]>>;
  teamOptions: string[];
  setTeamOptions: React.Dispatch<React.SetStateAction<string[]>>;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  setIsEditing: React.Dispatch<React.SetStateAction<boolean>>;
  handleNewRecord: () => void;
  initialFormState: PCRForm;
  darkMode: boolean;
}

export const Dashboard: React.FC<DashboardProps> = ({ 
  setActiveTab, 
  setCurrentRecord, 
  showToast,
  driverOptions,
  setDriverOptions,
  teamOptions,
  setTeamOptions,
  setFormData,
  setIsEditing,
  handleNewRecord,
  initialFormState,
  darkMode
}) => {
  const { 
    records, 
    exportBackup, 
    importBackup, 
    clearAllRecords, 
    checkDuplicates, 
    removeDuplicates 
  } = useRecordsContext();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const xlsxInputRef = useRef<HTMLInputElement>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showExportOptions, setShowExportOptions] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [activityRange, setActivityRange] = useState<7 | 14 | 30>(7);
  const [newDriverName, setNewDriverName] = useState("");
  const [newTeamName, setNewTeamName] = useState("");
  const [updateInfo, setUpdateInfo] = useState<{ currentVersion: string, latestVersion: string, updateAvailable: boolean, repoUrl: string } | null>(null);
  const [checkingUpdate, setCheckingUpdate] = useState(false);

  const duplicateGroups = useMemo(() => checkDuplicates(), [records, checkDuplicates]);
  const duplicateCount = useMemo(() => 
    duplicateGroups.reduce((acc, group) => acc + (group.length - 1), 0), 
    [duplicateGroups]
  );

  const stats = useMemo(() => {
    const today = new Date().toISOString().split("T")[0];
    return records.reduce((acc, r) => {
      acc.total++;
      if (r.form.status === "Active") acc.active++;
      else if (r.form.status === "Closed") acc.closed++;
      if (r.form.date === today) acc.today++;
      return acc;
    }, { total: 0, active: 0, closed: 0, today: 0 });
  }, [records]);

  const years = useMemo(() => {
    const ySet = new Set<string>();
    records.forEach(r => { if (r.form.date) ySet.add(r.form.date.split('-')[0]); });
    return Array.from(ySet).sort((a, b) => b.localeCompare(a));
  }, [records]);

  const barData = useMemo(() => {
    const lastN = Array.from({ length: activityRange }).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toISOString().split("T")[0];
    }).reverse();

    const counts = records.reduce((acc, r) => {
      acc[r.form.date] = (acc[r.form.date] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return lastN.map(date => ({
      date: date.substring(5).replace('-', '/'),
      count: counts[date] || 0
    }));
  }, [records, activityRange]);

  const handleXlsxChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const newRecords = await parseExcelRecords(file, initialFormState);
      const result = await importBackup(newRecords);
      if (result.success) showToast(`Imported ${newRecords.length} records`, "success");
      else showToast(result.error || "Import failed", "error");
    } catch (err) {
      showToast("Error parsing Excel file", "error");
    }
    if (xlsxInputRef.current) xlsxInputRef.current.value = "";
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black">Dashboard</h1>
          <p className="text-sm text-slate-500 font-bold">{new Date().toLocaleDateString()}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <input type="file" ref={fileInputRef} className="hidden" onChange={async (e) => {
            const file = e.target.files?.[0];
            if (file) {
              const text = await file.text();
              const res = await importBackup(text);
              if (res.success) showToast("Backup restored", "success");
              else showToast(res.error || "Failed", "error");
            }
          }} />
          <input type="file" accept=".xlsx" ref={xlsxInputRef} onChange={handleXlsxChange} className="hidden" />
          
          <button onClick={() => setShowSettings(true)} className="p-2.5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm"><Settings className="w-4 h-4" /></button>
          <button onClick={() => xlsxInputRef.current?.click()} className="px-4 py-2.5 bg-emerald-50 text-emerald-700 rounded-xl font-bold text-sm border border-emerald-200">Import XLSX</button>
          <button onClick={() => setShowExportOptions(true)} className="px-4 py-2.5 bg-blue-50 text-blue-700 rounded-xl font-bold text-sm border border-blue-200">Export All</button>
          <button onClick={exportBackup} className="px-4 py-2.5 bg-slate-900 text-white rounded-xl font-bold text-sm shadow-md">Backup</button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Total Records", value: stats.total, icon: FileText, color: "text-blue-500" },
          { label: "Active", value: stats.active, icon: Activity, color: "text-emerald-500" },
          { label: "Closed", value: stats.closed, icon: Clock, color: "text-slate-500" },
          { label: "Added Today", value: stats.today, icon: Activity, color: "text-red-500" },
        ].map((s, i) => (
          <div key={i} className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm">
            <div className="flex justify-between items-center mb-2">
              <s.icon className={`w-5 h-5 ${s.color}`} />
              <span className="text-3xl font-black">{s.value}</span>
            </div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Charts & Map */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm h-[400px]">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-black text-lg">Activity History</h3>
            <select value={activityRange} onChange={(e) => setActivityRange(Number(e.target.value) as any)} className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-xs font-bold">
              <option value={7}>7 Days</option>
              <option value={14}>14 Days</option>
              <option value={30}>30 Days</option>
            </select>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData}>
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} axisLine={false} tickLine={false} />
                <Tooltip cursor={{ fill: '#f1f5f9' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden h-[400px]">
           <h3 className="font-black text-lg mb-6">Emergency Clusters</h3>
           <div className="h-[300px] rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-700">
             <MapContainer center={[11.3583, 122.5972]} zoom={13} style={{ height: "100%", width: "100%" }}>
               <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
               {records.filter(r => r.form.coordinates).map(r => (
                 <Marker key={r.id} position={[r.form.coordinates!.lat, r.form.coordinates!.lng]}>
                   <Popup>
                     <div className="p-1 font-bold">
                       <p className="text-red-600 uppercase text-[10px] tracking-widest">{r.form.emergencyTypes.join(", ")}</p>
                       <p>{r.form.patientName}</p>
                       <button onClick={() => { setCurrentRecord(r); setActiveTab("view"); }} className="mt-2 text-xs text-blue-600 underline">View Record</button>
                     </div>
                   </Popup>
                 </Marker>
               ))}
             </MapContainer>
           </div>
        </div>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl w-full max-w-2xl my-8 overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
              <h3 className="font-black text-lg">System Settings</h3>
              <button onClick={() => setShowSettings(false)}><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest block mb-2">Admin Password</label>
                <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl" />
                <button onClick={async () => {
                   const hash = await hashPassword(newPassword);
                   localStorage.setItem("admin_password_hash", hash);
                   showToast("Password updated", "success");
                    setNewPassword("");
                 }} className="w-full mt-2 py-3 bg-slate-900 text-white rounded-xl font-bold">Update Password</button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-slate-100 dark:border-slate-700">
                {/* Driver Management */}
                <div>
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest block mb-2">Manage Drivers</label>
                  <div className="flex gap-2 mb-3">
                    <input 
                      type="text" 
                      value={newDriverName} 
                      onChange={(e) => setNewDriverName(e.target.value)}
                      placeholder="Driver Name"
                      className="flex-1 p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm"
                    />
                    <button 
                      onClick={() => {
                        if (newDriverName && !driverOptions.includes(newDriverName)) {
                          setDriverOptions([...driverOptions, newDriverName]);
                          setNewDriverName("");
                          showToast("Driver added", "success");
                        }
                      }}
                      className="p-2 bg-emerald-500 text-white rounded-lg"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="max-h-40 overflow-y-auto space-y-1 p-1 bg-slate-50 dark:bg-slate-900 rounded-xl">
                    {driverOptions.map(d => (
                      <div key={d} className="flex justify-between items-center p-2 hover:bg-white dark:hover:bg-slate-800 rounded-lg group">
                        <span className="text-sm font-bold">{d}</span>
                        <button 
                          onClick={() => setDriverOptions(driverOptions.filter(x => x !== d))}
                          className="text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Team Management */}
                <div>
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest block mb-2">Manage Teams</label>
                  <div className="flex gap-2 mb-3">
                    <input 
                      type="text" 
                      value={newTeamName} 
                      onChange={(e) => setNewTeamName(e.target.value)}
                      placeholder="Team Name"
                      className="flex-1 p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm"
                    />
                    <button 
                      onClick={() => {
                        if (newTeamName && !teamOptions.includes(newTeamName)) {
                          setTeamOptions([...teamOptions, newTeamName]);
                          setNewTeamName("");
                          showToast("Team added", "success");
                        }
                      }}
                      className="p-2 bg-blue-500 text-white rounded-lg"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="max-h-40 overflow-y-auto space-y-1 p-1 bg-slate-50 dark:bg-slate-900 rounded-xl">
                    {teamOptions.map(t => (
                      <div key={t} className="flex justify-between items-center p-2 hover:bg-white dark:hover:bg-slate-800 rounded-lg group">
                        <span className="text-sm font-bold">{t}</span>
                        <button 
                          onClick={() => setTeamOptions(teamOptions.filter(x => x !== t))}
                          className="text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-100 dark:border-slate-700">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h4 className="font-black text-sm">System Update</h4>
                    <p className="text-xs text-slate-500 font-bold">
                      {updateInfo 
                        ? (updateInfo.updateAvailable ? `Update available: v${updateInfo.latestVersion}` : "System is up to date")
                        : "Check for new features and fixes"}
                    </p>
                  </div>
                  <button 
                    onClick={async () => {
                      setCheckingUpdate(true);
                      try {
                        const res = await fetch("/api/update/check");
                        const data = await res.json();
                        setUpdateInfo(data);
                        if (data.updateAvailable) showToast(`New version v${data.latestVersion} available!`, "info");
                        else showToast("You are on the latest version", "success");
                      } catch (e) {
                        showToast("Failed to check for updates", "error");
                      } finally {
                        setCheckingUpdate(false);
                      }
                    }}
                    disabled={checkingUpdate}
                    className="px-3 py-1.5 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-200 rounded-lg text-xs font-bold hover:bg-slate-200 transition-colors flex items-center gap-2"
                  >
                    <RefreshCw className={`w-3 h-3 ${checkingUpdate ? "animate-spin" : ""}`} />
                    {checkingUpdate ? "Checking..." : "Check Now"}
                  </button>
                </div>
                {updateInfo?.updateAvailable && (
                  <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-2xl animate-in slide-in-from-top-2">
                    <p className="text-xs text-blue-700 dark:text-blue-300 font-bold mb-2">
                      A new version is available. To update, download the latest files from the repository.
                    </p>
                    <a 
                      href={updateInfo.repoUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-black text-blue-600 hover:underline"
                    >
                      View Update on GitHub <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}
                
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h4 className="font-black text-sm">Duplicate Records</h4>
                    <p className="text-xs text-slate-500 font-bold">
                      {duplicateGroups.length > 0 
                        ? `${duplicateGroups.length} groups found (${duplicateCount} unnecessary copies)` 
                        : "No duplicates detected"}
                    </p>
                  </div>
                  {duplicateCount > 0 && (
                    <button 
                      onClick={async () => {
                        if (window.confirm(`Remove ${duplicateCount} duplicate records?`)) {
                          const res = await removeDuplicates();
                          showToast(`Removed ${res.count} duplicates`, "success");
                        }
                      }}
                      className="px-3 py-1.5 bg-amber-50 text-amber-600 rounded-lg text-xs font-bold border border-amber-200 hover:bg-amber-100 transition-colors"
                    >
                      Fix Now
                    </button>
                  )}
                </div>
                <button onClick={() => { if (window.confirm("Clear all?")) clearAllRecords(); }} className="w-full py-3 text-red-600 font-bold border border-red-100 rounded-xl hover:bg-red-50">Clear Database</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Export Options Modal */}
      {showExportOptions && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
           <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl w-full max-w-md p-6">
             <div className="flex justify-between items-center mb-6">
               <h3 className="font-black text-lg">Export Options</h3>
               <button onClick={() => setShowExportOptions(false)}><X className="w-5 h-5" /></button>
             </div>
             <div className="space-y-4">
               <button onClick={() => { handleExportAllExcel(records, showToast, undefined, 'multi'); setShowExportOptions(false); }} className="w-full p-4 bg-blue-50 text-blue-700 rounded-2xl font-bold text-left border border-blue-100 flex items-center justify-between">
                 All Years (Multi-Sheet)
                 <FileSpreadsheet className="w-5 h-5 opacity-50" />
               </button>
               <div className="grid grid-cols-2 gap-2">
                 {years.map(y => (
                   <button key={y} onClick={() => { handleExportAllExcel(records, showToast, y, 'single'); setShowExportOptions(false); }} className="p-4 bg-slate-50 text-slate-700 rounded-xl font-bold border border-slate-100 text-sm">
                     {y} Records
                   </button>
                 ))}
               </div>
             </div>
           </div>
        </div>
      )}
    </div>
  );
};
