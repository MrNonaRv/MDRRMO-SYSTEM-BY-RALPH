import * as XLSX from "xlsx-js-style";
import { PCRRecord, PCRForm } from "../types";

export const parseExcelRecords = async (
  file: File, 
  initialFormState: PCRForm
): Promise<PCRRecord[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const data = new Uint8Array(event.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });

        const safeString = (val: any) => val !== undefined && val !== null ? String(val).trim() : "";
        const safeInt = (val: any, fallback: number | null = 0) => {
          const parsed = parseInt(safeString(val), 10);
          return isNaN(parsed) ? fallback : parsed;
        };

        const createEmptyRecord = (): PCRRecord => ({
          id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString() + Math.random().toString(36).substring(2),
          savedAt: new Date().toISOString(),
          updatedAt: null,
          form: JSON.parse(JSON.stringify(initialFormState)),
          gcsTotal: 0
        });

        const formatDate = (rawDate: string) => {
          if (!rawDate) return "";
          if (rawDate.includes("/")) {
            const parts = rawDate.split("/");
            if (parts.length === 3) {
              let year = parts[2];
              if (year.length === 2) year = "20" + year;
              return `${year}-${parts[0].padStart(2, '0')}-${parts[1].padStart(2, '0')}`;
            }
          }
          return rawDate;
        };

        const parseCoordinates = (rawCoords: string): { lat: number; lng: number } | null => {
          if (!rawCoords || rawCoords === "N/A") return null;
          const parts = rawCoords.split(",").map(s => parseFloat(s.trim()));
          if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
            return { lat: parts[0], lng: parts[1] };
          }
          return null;
        };

        const mapEmergencyType = (rawType: string) => {
          const type = rawType.toUpperCase();
          const types: string[] = [];
          if (type.includes("TRAUMA")) types.push("Trauma");
          if (type.includes("MEDICAL")) types.push("Medical");
          if (type.includes("OB")) types.push("OB/Gyne");
          if (type.includes("PSYCH")) types.push("Psychiatric");
          if (types.length === 0 && rawType) types.push(rawType);
          return types;
        };

        // Process a single sheet and return parsed records
        const parseSheet = (worksheet: XLSX.WorkSheet): PCRRecord[] => {
          const json = XLSX.utils.sheet_to_json(worksheet, { header: 1, raw: false }) as any[];
          const sheetRecords: PCRRecord[] = [];

          let formatType: "PATIENT_RECORD" | "BARANGAY" | null = null;
          let dataStartRow = 0;

          for (let r = 0; r < Math.min(json.length, 10); r++) {
            const rowStr = json[r]?.join(" ").toUpperCase() || "";
            if (rowStr.includes("PATIENT RECORD") && !rowStr.includes("BARANGAY")) {
              formatType = "PATIENT_RECORD";
              dataStartRow = r + 2; // skip title row + header row
              break;
            }
            if (rowStr.includes("BARANGAY PATIENT RECORD") || rowStr.includes("NUMBER OF CASUALTY")) {
              formatType = "BARANGAY";
              dataStartRow = r + 1;
              break;
            }
          }

          if (formatType === "PATIENT_RECORD") {
            // Column layout (aligned with handleExportAllExcel):
            // 0: PCR No. | 1: Team | 2: Emergency Type | 3: Date | 4: Time of Incident
            // 5: Driver  | 6: Responders | 7: Nurses | 8: Patient Name | 9: Age
            // 10: Sex    | 11: Address | 12: Chief Complaint | 13: Place of Incident
            // 14: Coordinates | 15: Encoded By
            for (let i = dataStartRow; i < json.length; i++) {
              const row = json[i];
              if (!row || row.length < 3) continue;

              const pcrNo = safeString(row[0]);
              const patientName = safeString(row[8]) || "Unnamed Patient";
              const rawDate = safeString(row[3]);

              if (!pcrNo && patientName === "Unnamed Patient" && !rawDate) continue;

              const record = createEmptyRecord();
              record.form.pcrNo = pcrNo;
              record.form.teamName = safeString(row[1]);
              record.form.emergencyTypes = mapEmergencyType(safeString(row[2]));
              record.form.date = formatDate(rawDate);
              record.form.timestamps.timeOfIncident = safeString(row[4]);
              record.form.driver = safeString(row[5]);
              const respondersRaw = safeString(row[6]).split("/").map((s: string) => s.trim());
              record.form.responders = {
                r1: respondersRaw[0] || "",
                r2: respondersRaw[1] || "",
                r3: respondersRaw[2] || ""
              };
              record.form.nurses = safeString(row[7]);
              record.form.patientName = patientName;
              record.form.age = safeString(row[9]);
              record.form.gender = safeString(row[10]);
              record.form.address = safeString(row[11]);
              record.form.chiefComplaint = safeString(row[12]);
              record.form.placeOfIncident = safeString(row[13]);
              const coords = parseCoordinates(safeString(row[14]));
              if (coords) record.form.coordinates = coords;
              record.form.encodedBy = safeString(row[15]);

              sheetRecords.push(record);
            }
          } else if (formatType === "BARANGAY") {
            for (let i = dataStartRow; i < json.length; i++) {
              const row = json[i];
              if (!row || row.length < 3) continue;

              const pcrNo = safeString(row[0]);
              const rawDate = safeString(row[1]);
              const patientName = safeString(row[2]) || "Unnamed Patient";

              if (!pcrNo && patientName === "Unnamed Patient" && !rawDate) continue;

              const record = createEmptyRecord();
              record.form.pcrNo = pcrNo;
              record.form.date = formatDate(rawDate);
              record.form.patientName = patientName;
              record.form.sampleHistory.signsSymptoms = safeString(row[3]);
              record.form.age = safeString(row[4]);
              const casualties = safeString(row[5]);
              if (casualties) record.form.narrative = `Number of Casualties: ${casualties}`;
              record.form.emergencyTypes = mapEmergencyType(safeString(row[6]));
              record.form.address = safeString(row[7]);
              record.form.placeOfIncident = safeString(row[8]);
              record.form.responsiblePerson = safeString(row[9]);
              record.form.contactNo = safeString(row[10]);

              sheetRecords.push(record);
            }
          }

          return sheetRecords;
        };

        // Aggregate records from ALL sheets (supports multi-sheet year exports)
        const allRecords: PCRRecord[] = [];
        for (const sheetName of workbook.SheetNames) {
          const worksheet = workbook.Sheets[sheetName];
          const sheetRecords = parseSheet(worksheet);
          allRecords.push(...sheetRecords);
        }

        resolve(allRecords);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
};
