import React, { memo } from "react";
import { 
  PlusCircle, 
  Search, 
  FileText, 
  Eye, 
  Edit, 
  Trash2, 
  LayoutGrid, 
  List as ListIcon,
  Calendar,
  Clock,
  User,
  Activity
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { PCRRecord, PCRForm } from "../types";
import { STATUS_OPTIONS, EMERGENCY_TYPES } from "../constants";

// Memoized Table Row Component
const RecordTableRow = memo(({ 
  record, 
  getStatusColor, 
  getEmergencyColor, 
  getGCSColor, 
  getGCSLabel,
  updateStatus, 
  setCurrentRecord, 
  setActiveTab, 
  setFormData, 
  setIsEditing, 
  setDeleteModal,
  itemVariants 
}: any) => (
  <motion.tr variants={itemVariants} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors group">
    <td className="px-6 py-4">
      <span className="bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-tight">
        {record.form.pcrNo || "N/A"}
      </span>
    </td>
    <td className="px-6 py-4">
      <div className="font-bold text-slate-900 dark:text-white">{record.form.patientName || "Unnamed Patient"}</div>
      <div className="text-[10px] font-medium text-slate-400 truncate max-w-[150px]">{record.form.chiefComplaint}</div>
    </td>
    <td className="px-6 py-4">
      <div className="flex items-center gap-1.5 text-sm font-bold text-slate-600 dark:text-slate-400">
        <Calendar className="w-3.5 h-3.5 text-slate-400" />
        {record.form.date}
      </div>
    </td>
    <td className="px-6 py-4">
      <div className="flex flex-wrap gap-1">
        {record.form.emergencyTypes.map((t: string) => (
          <span key={t} className={`px-1.5 py-0.5 rounded text-[9px] font-black text-white uppercase tracking-tighter ${getEmergencyColor(t)}`}>
            {t}
          </span>
        ))}
      </div>
    </td>
    <td className="px-6 py-4">
      <div className="flex items-center gap-2">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white font-black text-xs ${getGCSColor(record.gcsTotal)}`}>
          {record.gcsTotal}
        </div>
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">
          {getGCSLabel(record.gcsTotal)}
        </span>
      </div>
    </td>
    <td className="px-6 py-4">
      <select 
        value={record.form.status}
        onChange={(e) => updateStatus(record, e.target.value)}
        className={`px-2 py-1 rounded-full text-[10px] font-black text-white uppercase tracking-tight outline-none cursor-pointer ${getStatusColor(record.form.status)}`}
      >
        {STATUS_OPTIONS.map(s => <option key={s} value={s} className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">{s}</option>)}
      </select>
    </td>
    <td className="px-6 py-4">
      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button 
          onClick={() => { setCurrentRecord(record); setActiveTab("view"); }}
          className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
          title="View"
        >
          <Eye className="w-4 h-4" />
        </button>
        <button 
          onClick={() => { 
            setFormData(record.form); 
            setCurrentRecord(record); 
            setIsEditing(true); 
            setActiveTab("form"); 
          }}
          className="p-2 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 rounded-lg hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors"
          title="Edit"
        >
          <Edit className="w-4 h-4" />
        </button>
        <button 
          onClick={() => setDeleteModal(record.id)}
          className="p-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
          title="Delete"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </td>
  </motion.tr>
));

// Memoized Grid Card Component
const RecordGridCard = memo(({ 
  record, 
  getStatusColor, 
  getEmergencyColor, 
  getGCSColor, 
  getGCSLabel,
  updateStatus, 
  setCurrentRecord, 
  setActiveTab, 
  setFormData, 
  setIsEditing, 
  setDeleteModal,
  itemVariants 
}: any) => (
  <motion.div 
    variants={itemVariants}
    className="bg-white dark:bg-slate-800 rounded-3xl border border-[#e2e8f0] dark:border-slate-700 p-6 shadow-sm hover:shadow-md transition-all group relative overflow-hidden"
  >
    <div className={`absolute top-0 left-0 w-1.5 h-full ${getStatusColor(record.form.status)}`} />
    
    <div className="flex justify-between items-start mb-4">
      <span className="bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-tight">
        {record.form.pcrNo || "N/A"}
      </span>
      <select 
        value={record.form.status}
        onChange={(e) => updateStatus(record, e.target.value)}
        className={`px-2 py-1 rounded-full text-[10px] font-black text-white uppercase tracking-tight outline-none cursor-pointer ${getStatusColor(record.form.status)}`}
      >
        {STATUS_OPTIONS.map(s => <option key={s} value={s} className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">{s}</option>)}
      </select>
    </div>

    <div className="mb-4">
      <h3 className="text-lg font-black text-slate-900 dark:text-white mb-1 truncate">
        {record.form.patientName || "Unnamed Patient"}
      </h3>
      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400">
        <Calendar className="w-3.5 h-3.5" />
        {record.form.date}
        <span className="mx-1">·</span>
        <Clock className="w-3.5 h-3.5" />
        {record.form.timeOfDay}
      </div>
    </div>

    <div className="space-y-3 mb-6">
      <div className="flex items-center gap-2">
        <Activity className="w-3.5 h-3.5 text-slate-400" />
        <div className="flex flex-wrap gap-1">
          {record.form.emergencyTypes.map((t: string) => (
            <span key={t} className={`px-1.5 py-0.5 rounded text-[8px] font-black text-white uppercase tracking-tighter ${getEmergencyColor(t)}`}>
              {t}
            </span>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <User className="w-3.5 h-3.5 text-slate-400" />
        <span className="text-xs font-bold text-slate-600 dark:text-slate-400 truncate">
          {record.form.chiefComplaint || "No complaint recorded."}
        </span>
      </div>
    </div>

    <div className="flex items-center justify-between pt-4 border-t border-slate-50 dark:border-slate-700">
      <div className="flex items-center gap-2">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white font-black text-xs ${getGCSColor(record.gcsTotal)}`}>
          {record.gcsTotal}
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">GCS SCORE</span>
          <span className="text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-tighter">
            {getGCSLabel(record.gcsTotal)}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-1">
        <button 
          onClick={() => { setCurrentRecord(record); setActiveTab("view"); }}
          className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
          title="View"
        >
          <Eye className="w-4 h-4" />
        </button>
        <button 
          onClick={() => { 
            setFormData(record.form); 
            setCurrentRecord(record); 
            setIsEditing(true); 
            setActiveTab("form"); 
          }}
          className="p-2 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 rounded-lg hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors"
          title="Edit"
        >
          <Edit className="w-4 h-4" />
        </button>
        <button 
          onClick={() => setDeleteModal(record.id)}
          className="p-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
          title="Delete"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  </motion.div>
));

interface RecordsListProps {
  filteredRecords: PCRRecord[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  statusFilter: string;
  setStatusFilter: (filter: string) => void;
  emergencyFilter: string;
  setEmergencyFilter: (filter: string) => void;
  startDate: string;
  setStartDate: (date: string) => void;
  endDate: string;
  setEndDate: (date: string) => void;
  sortOrder: string;
  setSortOrder: (order: string) => void;
  setActiveTab: (tab: any) => void;
  setFormData: (data: PCRForm) => void;
  setIsEditing: (editing: boolean) => void;
  setCurrentRecord: (record: PCRRecord) => void;
  setDeleteModal: (id: string | null) => void;
  getEmergencyColor: (type: string) => string;
  getGCSColor: (score: number) => string;
  getGCSLabel: (score: number) => string;
  getStatusColor: (status: string) => string;
  initialFormState: PCRForm;
  viewMode: "table" | "grid";
  setViewMode: (mode: "table" | "grid") => void;
  updateStatus: (record: PCRRecord, newStatus: string) => void;
  handleNewRecord: () => void;
}

export const RecordsList: React.FC<RecordsListProps> = ({
  filteredRecords,
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
  emergencyFilter,
  setEmergencyFilter,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  sortOrder,
  setSortOrder,
  setActiveTab,
  setFormData,
  setIsEditing,
  setCurrentRecord,
  setDeleteModal,
  getEmergencyColor,
  getGCSColor,
  getGCSLabel,
  getStatusColor,
  initialFormState,
  viewMode,
  setViewMode,
  updateStatus,
  handleNewRecord,
}) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="space-y-6"
    >
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">PCR Records</h2>
          <p className="text-sm font-bold text-slate-500 dark:text-slate-400">{filteredRecords.length} records found</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-1 rounded-xl flex items-center shadow-sm">
            <button 
              onClick={() => setViewMode("table")}
              className={`p-2 rounded-lg transition-all ${viewMode === "table" ? "bg-slate-900 dark:bg-slate-600 text-white shadow-md" : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"}`}
              title="Table View"
            >
              <ListIcon className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded-lg transition-all ${viewMode === "grid" ? "bg-slate-900 dark:bg-slate-600 text-white shadow-md" : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"}`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
          <button 
            onClick={handleNewRecord}
            className="bg-[#c0392b] dark:bg-[#922b21] text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-[#922b21] dark:hover:bg-[#7b241c] transition-colors shadow-lg shadow-red-900/20"
          >
            <PlusCircle className="w-5 h-5" />
            New Record
          </button>
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-[#e2e8f0] dark:border-slate-700 shadow-sm grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text"
            placeholder="Search records..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-900/50 border border-[#e2e8f0] dark:border-slate-700 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#c0392b]/20 dark:text-white"
          />
        </div>
        <select 
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900/50 border border-[#e2e8f0] dark:border-slate-700 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-300 focus:outline-none"
        >
          <option value="All" className="bg-white dark:bg-slate-800">All Statuses</option>
          {STATUS_OPTIONS.map(s => <option key={s} value={s} className="bg-white dark:bg-slate-800">{s}</option>)}
        </select>
        <select 
          value={emergencyFilter}
          onChange={(e) => setEmergencyFilter(e.target.value)}
          className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900/50 border border-[#e2e8f0] dark:border-slate-700 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-300 focus:outline-none"
        >
          <option value="All" className="bg-white dark:bg-slate-800">All Emergencies</option>
          {EMERGENCY_TYPES.map(t => <option key={t} value={t} className="bg-white dark:bg-slate-800">{t}</option>)}
        </select>
        
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter shrink-0">From</span>
          <input 
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900/50 border border-[#e2e8f0] dark:border-slate-700 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter shrink-0">To</span>
          <input 
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900/50 border border-[#e2e8f0] dark:border-slate-700 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 focus:outline-none"
          />
        </div>

        <select 
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
          className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900/50 border border-[#e2e8f0] dark:border-slate-700 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-300 focus:outline-none"
        >
          <option value="Newest First" className="bg-white dark:bg-slate-800">Newest First</option>
          <option value="Oldest First" className="bg-white dark:bg-slate-800">Oldest First</option>
          <option value="Name A–Z" className="bg-white dark:bg-slate-800">Name A–Z</option>
          <option value="PCR No." className="bg-white dark:bg-slate-800">PCR No.</option>
        </select>

        {(searchQuery || statusFilter !== "All" || emergencyFilter !== "All" || startDate || endDate) && (
          <button 
            onClick={() => {
              setSearchQuery("");
              setStatusFilter("All");
              setEmergencyFilter("All");
              setStartDate("");
              setEndDate("");
            }}
            className="xl:col-span-6 mt-2 text-[10px] font-black text-[#c0392b] uppercase tracking-widest hover:underline text-center w-full"
          >
            Clear All Filters
          </button>
        )}
      </motion.div>

      <AnimatePresence mode="wait">
        {viewMode === "table" ? (
          <motion.div 
            key="table"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            variants={itemVariants} 
            className="bg-white dark:bg-slate-800 rounded-2xl border border-[#e2e8f0] dark:border-slate-700 shadow-sm overflow-hidden flex flex-col"
            style={{ maxHeight: 'calc(100vh - 320px)' }}
          >
            <div className="overflow-auto custom-scrollbar">
              <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 z-10 bg-slate-50 dark:bg-slate-900 shadow-sm">
                  <tr className="border-b border-[#e2e8f0] dark:border-slate-700">
                    <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">PCR No.</th>
                    <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">Patient Name</th>
                    <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">Date</th>
                    <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">Emergency Type</th>
                    <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">GCS</th>
                    <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                    <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <motion.tbody 
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className="divide-y divide-[#e2e8f0] dark:divide-slate-700"
                >
                  {filteredRecords.map(record => (
                    <RecordTableRow 
                      key={record.id}
                      record={record}
                      getStatusColor={getStatusColor}
                      getEmergencyColor={getEmergencyColor}
                      getGCSColor={getGCSColor}
                      getGCSLabel={getGCSLabel}
                      updateStatus={updateStatus}
                      setCurrentRecord={setCurrentRecord}
                      setActiveTab={setActiveTab}
                      setFormData={setFormData}
                      setIsEditing={setIsEditing}
                      setDeleteModal={setDeleteModal}
                      itemVariants={itemVariants}
                    />
                  ))}
                </motion.tbody>
              </table>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="grid"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            variants={containerVariants}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 overflow-y-auto custom-scrollbar pr-2"
            style={{ maxHeight: 'calc(100vh - 320px)' }}
          >
            {filteredRecords.map(record => (
              <RecordGridCard 
                key={record.id}
                record={record}
                getStatusColor={getStatusColor}
                getEmergencyColor={getEmergencyColor}
                getGCSColor={getGCSColor}
                getGCSLabel={getGCSLabel}
                updateStatus={updateStatus}
                setCurrentRecord={setCurrentRecord}
                setActiveTab={setActiveTab}
                setFormData={setFormData}
                setIsEditing={setIsEditing}
                setDeleteModal={setDeleteModal}
                itemVariants={itemVariants}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {filteredRecords.length === 0 && (
        <div className="p-20 text-center bg-white dark:bg-slate-800 rounded-3xl border border-dashed border-slate-200 dark:border-slate-700">
          <div className="w-16 h-16 bg-slate-50 dark:bg-slate-900 text-slate-300 dark:text-slate-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-400 dark:text-slate-500">No records found matching your filters.</h3>
          <p className="text-sm text-slate-300 dark:text-slate-600 mt-1">Try adjusting your search or filter criteria.</p>
        </div>
      )}

      {filteredRecords.length > 0 && (
        <motion.div variants={itemVariants} className="p-4 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-center">
          <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
            End of Records · {filteredRecords.length} total
          </p>
        </motion.div>
      )}
    </motion.div>
  );
};
