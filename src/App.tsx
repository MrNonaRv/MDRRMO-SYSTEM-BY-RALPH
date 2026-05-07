/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from "react";
import {
  LayoutDashboard,
  FileText,
  PlusCircle,
  Activity,
  LogOut,
  Moon,
  Sun,
  Cloud,
  CloudOff
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

// Components
import { Dashboard } from "./components/Dashboard";
import { RecordsList } from "./components/RecordsList";
import { PCRFormPage } from "./components/PCRForm";
import { RecordDetailView } from "./components/RecordDetailView";
import { Login } from "./components/Login";

// Hooks & Utils & Context
import { useRecordsContext } from "./context/RecordsContext";
import { handleExportPDF, handleExportExcel } from "./lib/exportUtils";
import { getStatusColor, getEmergencyColor, getGCSColor, getGCSLabel, generateNextPcrNo } from "./utils/helpers";
import { PER_PAGE, DEFAULT_DRIVER_OPTIONS, TEAM_OPTIONS } from "./constants";
import { PCRRecord, PCRForm } from "./types";

// --- HELPERS ---

const initialFormState: PCRForm = {
  pcrNo: "",
  date: new Date().toISOString().split("T")[0],
  timeOfDay: "AM",
  teamName: "",
  driver: "",
  placeOfIncident: "",
  status: "Active",
  timestamps: {
    callReceived: "",
    timeOfIncident: "",
    walkIn: "",
    enRoute: "",
    atScene: "",
    atPatient: "",
    depart: "",
    atBase: "",
    inService: "",
  },
  responseType: "Response to Scene",
  responseTypeOthers: "",
  locationTypes: [],
  emergencyTypes: [],
  disposition: [],
  consciousness: "",
  patientName: "",
  age: "",
  birthDate: "",
  gender: "",
  civilStatus: "",
  contactNo: "",
  address: "",
  responsiblePerson: "",
  relationship: "",
  chiefComplaint: "",
  sampleHistory: {
    signsSymptoms: "",
    allergies: "",
    medications: "",
    pastHistory: "",
    lastMeal: "",
    eventPrior: "",
  },
  vitalSigns: {
    initial: { bp: "", temp: "", pulse: "", resp: "", o2sat: "", o2given: "", others: "" },
    min5: { bp: "", temp: "", pulse: "", resp: "", o2sat: "", o2given: "", others: "" },
    min10: { bp: "", temp: "", pulse: "", resp: "", o2sat: "", o2given: "", others: "" },
    min15: { bp: "", temp: "", pulse: "", resp: "", o2sat: "", o2given: "", others: "" },
    destination: { bp: "", temp: "", pulse: "", resp: "", o2sat: "", o2given: "", others: "" },
  },
  gcs: { eye: 0, verbal: 0, motor: 0 },
  eyes: [],
  wounds: [],
  painScale: null,
  painQuality: [],
  severityRadiating: "",
  burnExtent: "",
  burnScaleType: "adult",
  burnRegions: [],
  obRecord: {
    g: "", t: "", p: "", a: "", l: "", lmp: "", aog: "", edc: "", wt: "", fundicHeight: "", fetalHeartBeat: "", cervicalDilation: ""
  },
  apgarScore: {
    heartRate: { min1: null, min5: null },
    respRate: { min1: null, min5: null },
    muscleTone: { min1: null, min5: null },
    reflexIrritability: { min1: null, min5: null },
    color: { min1: null, min5: null },
  },
  narrative: "",
  responders: { r1: "", r2: "", r3: "" },
  nurses: "",
  encodedBy: "",
  hospital: "",
  endorsedTo: "",
  refusalAccepted: false,
  coordinates: { lat: 11.3583, lng: 122.5972 }, // Default to Mambusao
};

// --- MAIN APP ---

export default function App() {
  const { 
    records, 
    loading: recordsLoading, 
    addRecord, 
    updateRecord, 
    deleteRecord, 
    updateStatus 
  } = useRecordsContext();

  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem("is_logged_in") === "true";
  });
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('dark_mode');
    return saved ? JSON.parse(saved) : false;
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('dark_mode', JSON.stringify(darkMode));
  }, [darkMode]);

  const handleLogin = (username: string, password: string) => {
    // Admin password for Mambusao unit
    if (username === "admin" && password === "mambusao2026") {
      setIsLoggedIn(true);
      localStorage.setItem("is_logged_in", "true");
      showToast("Welcome back, Admin", "success");
    } else {
      showToast("Invalid credentials", "error");
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem("is_logged_in");
    showToast("Logged out successfully", "info");
  };

  const [activeTab, setActiveTab] = useState<"dashboard" | "records" | "form" | "view">(() => {
    const saved = localStorage.getItem('session_active_tab');
    return (saved as any) || "dashboard";
  });
  const [currentRecord, setCurrentRecord] = useState<PCRRecord | null>(null);
  const [formData, setFormData] = useState<PCRForm>(() => {
    const savedDraft = localStorage.getItem('pcr_form_draft');
    if (savedDraft) {
      try {
        return JSON.parse(savedDraft);
      } catch (e) {
        console.error("Failed to parse draft", e);
      }
    }
    return initialFormState;
  });
  const [isEditing, setIsEditing] = useState(() => {
    return localStorage.getItem('session_is_editing') === 'true';
  });
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  const [driverOptions, setDriverOptions] = useState<string[]>(() => {
    const saved = localStorage.getItem('driver_options');
    return saved ? JSON.parse(saved) : DEFAULT_DRIVER_OPTIONS;
  });
  const [teamOptions, setTeamOptions] = useState<string[]>(() => {
    const saved = localStorage.getItem('team_options');
    return saved ? JSON.parse(saved) : TEAM_OPTIONS;
  });

  // Restore current record from session on mount (after records load)
  const restoredRef = React.useRef(false);
  useEffect(() => {
    if (!recordsLoading && !restoredRef.current) {
      restoredRef.current = true;
      const savedId = localStorage.getItem('session_current_record_id');
      if (savedId) {
        const found = records.find(r => r.id === savedId);
        if (found) setCurrentRecord(found);
        else localStorage.removeItem('session_current_record_id');
      }

      // Generate PCR No if starting fresh
      if (!localStorage.getItem('pcr_form_draft') && formData.pcrNo === "" && !isEditing) {
        const nextPcrNo = generateNextPcrNo(records);
        setFormData(prev => ({ ...prev, pcrNo: nextPcrNo }));
      }
    }
  }, [recordsLoading, records, formData.pcrNo, isEditing]);

  // Persist active tab to session
  useEffect(() => {
    localStorage.setItem('session_active_tab', activeTab);
  }, [activeTab]);

  // Persist current record id to session
  useEffect(() => {
    if (currentRecord) {
      localStorage.setItem('session_current_record_id', currentRecord.id);
    } else {
      localStorage.removeItem('session_current_record_id');
    }
  }, [currentRecord]);

  // Auto-save draft
  useEffect(() => {
    if (activeTab === "form") {
      localStorage.setItem('pcr_form_draft', JSON.stringify(formData));
      localStorage.setItem('session_is_editing', String(isEditing));
    }
  }, [formData, activeTab, isEditing]);

  // Persist driver options
  useEffect(() => {
    localStorage.setItem('driver_options', JSON.stringify(driverOptions));
  }, [driverOptions]);

  // Persist team options
  useEffect(() => {
    localStorage.setItem('team_options', JSON.stringify(teamOptions));
  }, [teamOptions]);

  // Heartbeat – keeps server alive; server auto-shuts-down when this stops
  useEffect(() => {
    const ping = () => fetch('/api/ping', { method: 'POST', keepalive: true }).catch(() => {});
    ping(); // immediate ping on mount
    const id = setInterval(ping, 5000);
    return () => clearInterval(id);
  }, []);

  // On window close: flush draft + send shutdown signal to server
  useEffect(() => {
    const handleUnload = () => {
      // Flush current form draft
      if (activeTab === 'form') {
        localStorage.setItem('pcr_form_draft', JSON.stringify(formData));
        localStorage.setItem('session_is_editing', String(isEditing));
      }
      // Signal server to shut down (keepalive ensures it fires during unload)
      fetch('/api/shutdown', { method: 'POST', keepalive: true }).catch(() => {});
    };
    window.addEventListener('beforeunload', handleUnload);
    return () => window.removeEventListener('beforeunload', handleUnload);
  }, [activeTab, isEditing, formData]);

  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);
  const [deleteModal, setDeleteModal] = useState<string | null>(null);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [emergencyFilter, setEmergencyFilter] = useState("All");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [sortOrder, setSortOrder] = useState("Newest First");
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");

  const showToast = (message: string, type: "success" | "error" | "info" = "info") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleNewRecord = () => {
    const nextPcrNo = generateNextPcrNo(records);
    setFormData({ ...initialFormState, pcrNo: nextPcrNo });
    setIsEditing(false);
    setCurrentRecord(null);
    setActiveTab("form");
  };

  // --- ACTIONS ---

  const handleSave = async (exportType?: "excel" | "json" | "pdf") => {
    if (!formData.pcrNo) {
      showToast("PCR Number is required", "error");
      return;
    }
    if (!formData.patientName) {
      showToast("Patient Name is required", "error");
      return;
    }
    if (!formData.date) {
      showToast("Incident Date is required", "error");
      return;
    }

    setLoading(true);

    try {
      let saved: PCRRecord | undefined;
      if (isEditing && currentRecord) {
        saved = await updateRecord(currentRecord.id, formData);
        showToast("Record updated successfully", "success");
      } else {
        saved = await addRecord(formData);
        showToast("Record saved successfully", "success");
      }

      if (saved) {
        setCurrentRecord(saved);
        if (!isEditing) {
          localStorage.removeItem('pcr_form_draft');
          localStorage.removeItem('session_is_editing');
        }
        if (exportType === "excel") handleExportExcel(saved, showToast);
        if (exportType === "pdf") handleExportPDF(saved, showToast);
        setActiveTab("view");
      }
    } catch (e) {
      showToast("Failed to save record", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteRecord(id);
      setDeleteModal(null);
      showToast("Record deleted", "info");
      if (activeTab === "view") setActiveTab("records");
    } catch (e) {
      showToast("Failed to delete record", "error");
    }
  };

  const handleUpdateStatus = async (record: PCRRecord, newStatus: string) => {
    try {
      const updated = await updateStatus(record.id, newStatus);
      if (updated) {
        setCurrentRecord(updated);
        showToast(`Status updated to ${newStatus}`, "success");
      }
    } catch (e) {
      showToast("Failed to update status", "error");
    }
  };

  const filteredRecords = useMemo(() => {
    let result = [...records];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(r => 
        r.form.patientName.toLowerCase().includes(q) ||
        r.form.pcrNo.toLowerCase().includes(q) ||
        r.form.date.includes(q)
      );
    }
    if (statusFilter !== "All") result = result.filter(r => r.form.status === statusFilter);
    if (emergencyFilter !== "All") result = result.filter(r => r.form.emergencyTypes.includes(emergencyFilter));
    if (startDate) result = result.filter(r => r.form.date >= startDate);
    if (endDate) result = result.filter(r => r.form.date <= endDate);

    result.sort((a, b) => {
      if (sortOrder === "Newest First") return new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime();
      if (sortOrder === "Oldest First") return new Date(a.savedAt).getTime() - new Date(b.savedAt).getTime();
      return 0;
    });

    return result;
  }, [records, searchQuery, statusFilter, emergencyFilter, startDate, endDate, sortOrder]);

  const paginatedRecords = filteredRecords.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE);
  const totalPages = Math.ceil(filteredRecords.length / PER_PAGE);

  return (
    <div className={darkMode ? "dark" : ""}>
      <AnimatePresence mode="wait">
        {!isLoggedIn ? (
          <Login key="login" onLogin={handleLogin} darkMode={darkMode} setDarkMode={setDarkMode} />
        ) : (
          <motion.div 
            key="app"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="min-h-screen bg-slate-50 dark:bg-[#0f172a] font-sans text-slate-900 dark:text-slate-100 transition-colors duration-300"
          >
          <nav className="sticky top-0 z-50 bg-[#c0392b] dark:bg-[#922b21] text-white shadow-lg">
            <div className="max-w-7xl mx-auto px-4">
              <div className="flex items-center justify-between h-16">
                <div className="flex items-center gap-2">
                  <div className="bg-white dark:bg-slate-800 p-1.5 rounded-lg">
                    <Activity className="w-6 h-6 text-[#c0392b] dark:text-[#e74c3c]" />
                  </div>
                  <div className="hidden sm:block">
                    <h1 className="text-lg font-black tracking-tighter leading-none font-display italic">MAMBUSAO MDRRMO</h1>
                    <p className="text-[10px] font-bold opacity-80 uppercase tracking-widest">Patient Care Records</p>
                  </div>
                </div>
                
                <div className="flex h-full items-center gap-2 sm:gap-4">
                  <div className="flex h-full">
                    {[
                      { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
                      { id: "records", label: "Records", icon: FileText, badge: records.length },
                      { id: "form", label: "New Record", icon: PlusCircle },
                    ].map(tab => (
                      <button
                        key={tab.id}
                        onClick={() => {
                          if (tab.id === "form") {
                            handleNewRecord();
                          } else {
                            setActiveTab(tab.id as any);
                          }
                        }}
                        className={`px-3 sm:px-6 flex items-center gap-2 font-bold text-sm transition-all relative h-full ${
                          activeTab === tab.id ? "bg-[#922b21] dark:bg-[#7b241c] opacity-100" : "opacity-70 hover:opacity-100"
                        }`}
                      >
                        <tab.icon className="w-4 h-4" />
                        <span className="hidden md:inline">{tab.label}</span>
                        {tab.badge !== undefined && (
                          <span className="bg-white text-[#c0392b] text-[10px] px-1.5 py-0.5 rounded-full ml-1">{tab.badge}</span>
                        )}
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center gap-2 pl-2 border-l border-white/20">
                    <div className="flex items-center gap-1.5 px-2 py-1 bg-white/10 rounded-full" title={isOnline ? "Online - Syncing to Cloud" : "Offline - Local Changes Persistent"}>
                      {isOnline ? (
                        <Cloud className="w-3.5 h-3.5 text-emerald-300" />
                      ) : (
                        <CloudOff className="w-3.5 h-3.5 text-amber-300" />
                      )}
                      <span className="text-[10px] font-black uppercase tracking-widest hidden lg:inline">
                        {isOnline ? "Cloud Sync" : "Offline"}
                      </span>
                    </div>
                    <button onClick={() => setDarkMode(!darkMode)} className="p-2 rounded-lg hover:bg-white/10 transition-colors">
                      {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                    </button>
                    <button onClick={handleLogout} className="p-2 rounded-lg hover:bg-white/10 transition-colors text-white/70 hover:text-white">
                      <LogOut className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </nav>

          <main className="max-w-7xl mx-auto px-4 py-8">
            <AnimatePresence mode="wait">
              <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}>
                {activeTab === "dashboard" && (
                  <Dashboard 
                    setActiveTab={setActiveTab}
                    setCurrentRecord={setCurrentRecord}
                    getEmergencyColor={getEmergencyColor}
                    getStatusColor={getStatusColor}
                    showToast={showToast}
                    driverOptions={driverOptions}
                    setDriverOptions={setDriverOptions}
                    teamOptions={teamOptions}
                    setTeamOptions={setTeamOptions}
                    setFormData={setFormData}
                    setIsEditing={setIsEditing}
                    handleNewRecord={handleNewRecord}
                    initialFormState={initialFormState}
                    darkMode={darkMode}
                  />
                )}
                {activeTab === "records" && (
                  <RecordsList 
                    filteredRecords={filteredRecords}
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    statusFilter={statusFilter}
                    setStatusFilter={setStatusFilter}
                    emergencyFilter={emergencyFilter}
                    setEmergencyFilter={setEmergencyFilter}
                    startDate={startDate}
                    setStartDate={setStartDate}
                    endDate={endDate}
                    setEndDate={setEndDate}
                    sortOrder={sortOrder}
                    setSortOrder={setSortOrder}
                    setActiveTab={setActiveTab}
                    setFormData={setFormData}
                    setIsEditing={setIsEditing}
                    handleNewRecord={handleNewRecord}
                    setCurrentRecord={setCurrentRecord}
                    setDeleteModal={setDeleteModal}
                    getEmergencyColor={getEmergencyColor}
                    getGCSColor={getGCSColor}
                    getGCSLabel={getGCSLabel}
                    getStatusColor={getStatusColor}
                    initialFormState={initialFormState}
                    viewMode={viewMode}
                    setViewMode={setViewMode}
                    updateStatus={handleUpdateStatus}
                  />
                )}
                {activeTab === "form" && (
                  <PCRFormPage 
                    formData={formData}
                    setFormData={setFormData}
                    isEditing={isEditing}
                    loading={loading}
                    handleSave={handleSave}
                    setActiveTab={setActiveTab}
                    getStatusColor={getStatusColor}
                    getEmergencyColor={getEmergencyColor}
                    getGCSColor={getGCSColor}
                    getGCSLabel={getGCSLabel}
                    driverOptions={driverOptions}
                    teamOptions={teamOptions}
                    handleNewRecord={handleNewRecord}
                  />
                )}
                {activeTab === "view" && currentRecord && (
                  <RecordDetailView 
                    currentRecord={currentRecord}
                    setActiveTab={setActiveTab}
                    setFormData={setFormData}
                    setIsEditing={setIsEditing}
                    handleExportExcel={(r) => handleExportExcel(r, showToast)}
                    handleExportPDF={(r) => handleExportPDF(r, showToast)}
                    setDeleteModal={setDeleteModal}
                    updateStatus={handleUpdateStatus}
                    getStatusColor={getStatusColor}
                    getEmergencyColor={getEmergencyColor}
                    getGCSColor={getGCSColor}
                    getGCSLabel={getGCSLabel}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </main>

          {/* Toast Notification */}
          <AnimatePresence>
            {toast && (
              <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }} className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100]">
                <div className={`px-6 py-3 rounded-2xl shadow-2xl text-white font-bold flex items-center gap-3 ${toast.type === 'success' ? 'bg-emerald-600' : toast.type === 'error' ? 'bg-red-600' : 'bg-slate-800'}`}>
                   {toast.message}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Delete Confirmation Modal */}
          {deleteModal && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-white dark:bg-slate-800 rounded-3xl p-8 max-w-sm w-full shadow-2xl">
                <h3 className="text-xl font-black text-slate-900 dark:text-white mb-4">Delete Record?</h3>
                <p className="text-slate-500 dark:text-slate-400 font-bold text-sm mb-6">This action cannot be undone. Are you sure you want to remove this record?</p>
                <div className="flex gap-3">
                  <button onClick={() => setDeleteModal(null)} className="flex-1 py-3 font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors">Cancel</button>
                  <button onClick={() => handleDelete(deleteModal)} className="flex-1 py-3 font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors shadow-lg shadow-red-600/20">Delete</button>
                </div>
              </motion.div>
            </div>
          )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
