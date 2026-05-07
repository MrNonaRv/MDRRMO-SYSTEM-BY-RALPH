import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { PCRRecord, PCRForm } from '../types';
import { 
  collection, 
  onSnapshot, 
  doc, 
  setDoc, 
  deleteDoc, 
  updateDoc, 
  query, 
  orderBy,
  writeBatch
} from 'firebase/firestore';
import { db } from '../lib/firebase';

interface RecordsContextType {
  records: PCRRecord[];
  loading: boolean;
  addRecord: (formData: PCRForm) => Promise<PCRRecord>;
  updateRecord: (id: string, formData: PCRForm) => Promise<PCRRecord | undefined>;
  deleteRecord: (id: string) => Promise<void>;
  updateStatus: (id: string, newStatus: string) => Promise<PCRRecord | undefined>;
  exportBackup: () => void;
  importBackup: (data: string | PCRRecord[]) => Promise<{ success: boolean; count?: number; error?: string }>;
  clearAllRecords: () => Promise<{ success: boolean }>;
  checkDuplicates: () => PCRRecord[][];
  removeDuplicates: () => Promise<{ success: boolean; count: number }>;
}

const STORAGE_KEY = "pcr_records_local";
const SCHEMA_VERSION = 4; // bump this when adding new fields
const SCHEMA_VERSION_KEY = "pcr_schema_version";

// ─── Migration: fills missing fields in old saved records ────────────────────
function migrateRecord(r: any): any {
  const f = r.form ?? {};

  // V2 – Added responseTypeOthers, burnScaleType
  f.responseTypeOthers  ??= "";
  f.burnScaleType       ??= "adult";
  f.burnExtent          ??= "";

  // V2 – Added OB record
  f.obRecord ??= {
    g: "", t: "", p: "", a: "", l: "", lmp: "", aog: "",
    edc: "", wt: "", fundicHeight: "", fetalHeartBeat: "", cervicalDilation: "",
  };

  // V2 – Added APGAR
  f.apgarScore ??= {
    heartRate:          { min1: null, min5: null },
    respRate:           { min1: null, min5: null },
    muscleTone:         { min1: null, min5: null },
    reflexIrritability: { min1: null, min5: null },
    color:              { min1: null, min5: null },
  };

  // V3 – responseType default (old records may have had empty string)
  if (!f.responseType) f.responseType = "Response to Scene";

  // V3 – Ensure timestamp fields exist
  f.timestamps ??= {};
  f.timestamps.callReceived    ??= "";
  f.timestamps.timeOfIncident  ??= "";
  f.timestamps.walkIn          ??= "";
  f.timestamps.enRoute         ??= "";
  f.timestamps.atScene         ??= "";
  f.timestamps.atPatient       ??= "";
  f.timestamps.depart          ??= "";
  f.timestamps.atBase          ??= "";
  f.timestamps.inService       ??= "";

  // V4 – burnRegions: array of selected body-map region IDs
  f.burnRegions ??= [];

  return { ...r, form: f };
}

const RecordsContext = createContext<RecordsContextType | undefined>(undefined);

export const RecordsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [records, setRecords] = useState<PCRRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. First, check if we need to migrate local storage to Firebase
    const migrateToFirebase = async (localRecords: PCRRecord[]) => {
      try {
        const batch = writeBatch(db);
        localRecords.forEach(record => {
          const docRef = doc(db, "records", record.id);
          batch.set(docRef, record);
        });
        await batch.commit();
        localStorage.removeItem(STORAGE_KEY); // Clear local storage after migration
        console.log("Migration to Firebase successful");
      } catch (err) {
        console.error("Migration failed:", err);
      }
    };

    const savedRecords = localStorage.getItem(STORAGE_KEY);
    if (savedRecords) {
      try {
        const parsed: any[] = JSON.parse(savedRecords);
        const migrated = parsed.map(migrateRecord) as PCRRecord[];
        setRecords(migrated);
        // Start migration in background
        migrateToFirebase(migrated);
      } catch (e) {
        console.error("Failed to parse local records", e);
      }
    }

    // 2. Set up real-time listener for Firestore
    const q = query(collection(db, "records"), orderBy("savedAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const cloudRecords = snapshot.docs.map(doc => doc.data() as PCRRecord);
      setRecords(cloudRecords);
      setLoading(false);
    }, (error) => {
      console.error("Firestore sync error:", error);
      // If Firestore fails (e.g. no config), we stop loading so UI doesn't hang
      setLoading(false);
    });

    localStorage.setItem(SCHEMA_VERSION_KEY, String(SCHEMA_VERSION));
    return () => unsubscribe();
  }, []);

  // Removed the localStorage persistence effect as Firestore handles it now

  const addRecord = useCallback(async (formData: PCRForm) => {
    setLoading(true);
    const gcsTotal = (formData.gcs.eye || 0) + (formData.gcs.verbal || 0) + (formData.gcs.motor || 0);
    const now = new Date().toISOString();
    const id = crypto.randomUUID ? crypto.randomUUID() : Date.now().toString() + Math.random().toString(36).substring(2);
    
    const newRecord: PCRRecord = {
      id,
      form: formData,
      gcsTotal,
      savedAt: now,
      updatedAt: null,
    };

    try {
      await setDoc(doc(db, "records", id), newRecord);
      // Note: onSnapshot will update the local state
    } catch (error) {
      console.error("Error adding record to Firestore:", error);
      // Fallback update to keep UI responsive even if Firestore write fails initially
      setRecords(prev => [newRecord, ...prev]);
    }
    
    setLoading(false);
    return newRecord;
  }, []);

  const updateRecord = useCallback(async (id: string, formData: PCRForm) => {
    setLoading(true);
    const gcsTotal = (formData.gcs.eye || 0) + (formData.gcs.verbal || 0) + (formData.gcs.motor || 0);
    const now = new Date().toISOString();

    let updatedRecord: PCRRecord | undefined;
    const existingRecord = records.find(r => r.id === id);
    if (existingRecord) {
      updatedRecord = { ...existingRecord, form: formData, gcsTotal, updatedAt: now };
      try {
        await setDoc(doc(db, "records", id), updatedRecord);
      } catch (error) {
        console.error("Error updating record in Firestore:", error);
      }
    }
    
    setLoading(false);
    return updatedRecord;
  }, []);

  const deleteRecord = useCallback(async (id: string) => {
    setLoading(true);
    try {
      await deleteDoc(doc(db, "records", id));
    } catch (error) {
      console.error("Error deleting record from Firestore:", error);
    }
    setLoading(false);
  }, []);

  const updateStatus = useCallback(async (id: string, newStatus: string) => {
    setLoading(true);
    const now = new Date().toISOString();
    
    let updatedRecord: PCRRecord | undefined;
    const existingRecord = records.find(r => r.id === id);
    if (existingRecord) {
      updatedRecord = { ...existingRecord, form: { ...existingRecord.form, status: newStatus as any }, updatedAt: now };
      try {
        await setDoc(doc(db, "records", id), updatedRecord);
      } catch (error) {
        console.error("Error updating status in Firestore:", error);
      }
    }

    setLoading(false);
    return updatedRecord;
  }, []);

  const exportBackup = useCallback(() => {
    const dataStr = JSON.stringify(records, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', url);
    linkElement.setAttribute('download', `mdrrmo_pcr_backup_${new Date().toISOString().split('T')[0]}.json`);
    linkElement.click();
    URL.revokeObjectURL(url);
  }, [records]);

  const importBackup = useCallback(async (data: string | PCRRecord[]) => {
    try {
      let parsed: any[];
      if (typeof data === 'string') {
        parsed = JSON.parse(data);
      } else {
        parsed = data;
      }
      
      if (Array.isArray(parsed)) {
        setLoading(true);
        const newRecords = parsed.map(r => ({
          ...r,
          id: r.id || crypto.randomUUID(),
          savedAt: r.savedAt || new Date().toISOString(),
          updatedAt: r.updatedAt || null,
        }));
        
        setRecords(prev => {
          const recordMap = new Map(prev.map(r => [r.id, r]));
          newRecords.forEach(r => recordMap.set(r.id, r));
          return Array.from(recordMap.values()).sort((a, b) => 
            new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime()
          );
        });

        setLoading(false);
        return { success: true, count: newRecords.length };
      }
      return { success: false, error: "Invalid backup format" };
    } catch (error) {
      setLoading(false);
      return { success: false, error: "Failed to parse or import backup file" };
    }
  }, []);

  const clearAllRecords = useCallback(async () => {
    setLoading(true);
    try {
      const batch = writeBatch(db);
      records.forEach(record => {
        batch.delete(doc(db, "records", record.id));
      });
      await batch.commit();
    } catch (error) {
      console.error("Error clearing records:", error);
    }
    setLoading(false);
    return { success: true };
  }, []);

  const checkDuplicates = useCallback(() => {
    const seen = new Map<string, PCRRecord[]>();
    const duplicateGroups: PCRRecord[][] = [];

    records.forEach(record => {
      // We use a combination of Name, Date, Gender, and Age as a unique fingerprint
      // This catches duplicates even if they have different PCR numbers
      const key = `${record.form.patientName}|${record.form.date}|${record.form.gender}|${record.form.age}`.toLowerCase().trim();
      if (seen.has(key)) {
        seen.get(key)!.push(record);
      } else {
        seen.set(key, [record]);
      }
    });

    seen.forEach((group) => {
      if (group.length > 1) {
        duplicateGroups.push(group);
      }
    });

    return duplicateGroups;
  }, [records]);

  const removeDuplicates = useCallback(async () => {
    const duplicateGroups = checkDuplicates();
    if (duplicateGroups.length === 0) return { success: true, count: 0 };

    const idsToRemove: string[] = [];
    duplicateGroups.forEach(group => {
      // Keep the first one, delete the rest
      group.slice(1).forEach(record => idsToRemove.push(record.id));
    });

    setLoading(true);
    try {
      const batch = writeBatch(db);
      idsToRemove.forEach(id => {
        batch.delete(doc(db, "records", id));
      });
      await batch.commit();
      setLoading(false);
      return { success: true, count: idsToRemove.length };
    } catch (error) {
      console.error("Error removing duplicates from Firestore:", error);
      setLoading(false);
      return { success: false, count: 0 };
    }
  }, [checkDuplicates]);

  const value = useMemo(() => ({
    records,
    loading,
    addRecord,
    updateRecord,
    deleteRecord,
    updateStatus,
    exportBackup,
    importBackup,
    clearAllRecords,
    checkDuplicates,
    removeDuplicates,
  }), [records, loading, addRecord, updateRecord, deleteRecord, updateStatus, exportBackup, importBackup, clearAllRecords, checkDuplicates, removeDuplicates]);

  return <RecordsContext.Provider value={value}>{children}</RecordsContext.Provider>;
};

export const useRecordsContext = () => {
  const context = useContext(RecordsContext);
  if (context === undefined) {
    throw new Error('useRecordsContext must be used within a RecordsProvider');
  }
  return context;
};
