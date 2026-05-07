import * as XLSX from "xlsx-js-style";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import { PCRRecord } from "../types";
import { APGAR_SCHEMA, LUND_BROWDER_AGE_MAP, LUND_BROWDER_REGIONS } from "../constants";

export const handleExportPDF = (record: PCRRecord, showToast: (msg: string, type: any) => void) => {
  const { form } = record;
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // Header
  doc.setFillColor(192, 57, 43); // MDRRMO Red
  doc.rect(0, 0, pageWidth, 30, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("MAMBUSAO MDRRMO", pageWidth / 2, 15, { align: "center" });
  doc.setFontSize(12);
  doc.text("PATIENT CARE RECORD", pageWidth / 2, 23, { align: "center" });

  let y = 40;

  const addSection = (title: string) => {
    doc.setFillColor(51, 65, 85); // Slate
    doc.rect(10, y, pageWidth - 20, 8, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.text(title, 15, y + 6);
    y += 12;
  };

  const addField = (label: string, value: string, x: number, width: number) => {
    doc.setTextColor(100, 116, 139);
    doc.setFontSize(8);
    doc.text(label, x, y);
    doc.setTextColor(30, 41, 59);
    doc.setFontSize(10);
    doc.text(value || "N/A", x, y + 5);
  };

  addSection("INCIDENT INFORMATION");
  addField("PCR No.", form.pcrNo, 15, 40);
  addField("Date", form.date, 60, 40);
  addField("Time", form.timeOfDay, 105, 40);
  addField("Status", form.status, 150, 40);
  y += 15;
  addField("Team Name", form.teamName, 15, 40);
  addField("Driver", form.driver, 60, 40);
  addField("Place of Incident", form.placeOfIncident, 105, 80);
  if (form.coordinates) {
    addField("Coordinates", `${form.coordinates.lat.toFixed(4)}, ${form.coordinates.lng.toFixed(4)}`, 150, 40);
  }
  y += 15;

  addField("Classification", form.responseType === "Others" ? `Others (${form.responseTypeOthers || ""})` : form.responseType, 15, pageWidth - 30);
  y += 15;
  addField("Location Type", form.locationTypes.join(", ") || "N/A", 15, 80);
  addField("Disposition", form.disposition.join(", ") || "N/A", 100, pageWidth - 110);
  y += 15;

  addSection("PATIENT INFORMATION");
  addField("Name", form.patientName, 15, 80);
  addField("Age", form.age, 100, 20);
  addField("Gender", form.gender, 125, 20);
  addField("Civil Status", form.civilStatus, 150, 30);
  y += 15;
  addField("Address", form.address, 15, 120);
  addField("Contact", form.contactNo, 140, 40);
  y += 15;

  addSection("VITAL SIGNS");
  (doc as any).autoTable({
    startY: y,
    head: [['Metric', 'Initial', '5m', '10m', '15m', 'Dest']],
    body: [
      ['BP', form.vitalSigns.initial.bp, form.vitalSigns.min5.bp, form.vitalSigns.min10.bp, form.vitalSigns.min15.bp, form.vitalSigns.destination.bp],
      ['Pulse', form.vitalSigns.initial.pulse, form.vitalSigns.min5.pulse, form.vitalSigns.min10.pulse, form.vitalSigns.min15.pulse, form.vitalSigns.destination.pulse],
      ['Resp', form.vitalSigns.initial.resp, form.vitalSigns.min5.resp, form.vitalSigns.min10.resp, form.vitalSigns.min15.resp, form.vitalSigns.destination.resp],
      ['O2 Sat', form.vitalSigns.initial.o2sat, form.vitalSigns.min5.o2sat, form.vitalSigns.min10.o2sat, form.vitalSigns.min15.o2sat, form.vitalSigns.destination.o2sat],
    ],
    margin: { left: 15 },
    theme: 'striped',
    headStyles: { fillColor: [192, 57, 43] },
  });
  y = (doc as any).lastAutoTable.finalY + 10;

  addSection("NARRATIVE REPORT");
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(9);
  const splitNarrative = doc.splitTextToSize(form.narrative || "No narrative provided.", pageWidth - 30);
  doc.text(splitNarrative, 15, y);
  y += splitNarrative.length * 5 + 10;

  // Check for page overflow
  if (y > 220) { doc.addPage(); y = 20; }

  // OB/GYN Record
  if (form.obRecord && Object.values(form.obRecord).some(v => v)) {
    addSection("OB/GYN RECORD");
    addField("G", form.obRecord.g, 15, 20);
    addField("T", form.obRecord.t, 35, 20);
    addField("P", form.obRecord.p, 55, 20);
    addField("A", form.obRecord.a, 75, 20);
    addField("L", form.obRecord.l, 95, 20);
    addField("LMP", form.obRecord.lmp, 115, 40);
    y += 15;
    addField("AOG", form.obRecord.aog, 15, 30);
    addField("EDC", form.obRecord.edc, 45, 30);
    addField("WT", form.obRecord.wt, 75, 30);
    addField("FH", form.obRecord.fundicHeight, 105, 30);
    addField("FHB", form.obRecord.fetalHeartBeat, 135, 30);
    addField("Dilation", form.obRecord.cervicalDilation, 165, 30);
    y += 20;
  }

  if (y > 200) { doc.addPage(); y = 20; }

  // APGAR Score
  if (form.apgarScore && Object.values(form.apgarScore).some(v => v.min1 !== null || v.min5 !== null)) {
    addSection("APGAR SCORE");
    (doc as any).autoTable({
      startY: y,
      head: [['Sign', '1 min', '5 min']],
      body: APGAR_SCHEMA.map(s => [
        s.label, 
        form.apgarScore?.[s.id as keyof typeof form.apgarScore]?.min1 ?? "N/A", 
        form.apgarScore?.[s.id as keyof typeof form.apgarScore]?.min5 ?? "N/A"
      ]),
      margin: { left: 15 },
      theme: 'grid',
      headStyles: { fillColor: [51, 65, 85] },
    });
    y = (doc as any).lastAutoTable.finalY + 10;
  }

  // Burn Scale
  const hasBurnData = (form.burnRegions && form.burnRegions.length > 0) || form.burnExtent;
  if (hasBurnData) {
    if (y > 220) { doc.addPage(); y = 20; }
    addSection(`BURN SCALE (${(form.burnScaleType || "adult").toUpperCase()})`);
    const burnRegs = form.burnRegions || [];
    const selected = burnRegs.map(id => LUND_BROWDER_REGIONS.find(r => r.id === id)?.label).filter(Boolean).join(", ");
    addField("Regions", selected || "None", 15, 180);
    y += 15;
    
    const type = form.burnScaleType || "adult";
    let ageKey: any = type === "adult" ? "adult" : parseInt(form.age);
    if (isNaN(ageKey)) ageKey = 0;
    else if (ageKey >= 15) ageKey = 15;
    else if (ageKey >= 10) ageKey = 10;
    else if (ageKey >= 5) ageKey = 5;
    else if (ageKey >= 1) ageKey = 1;
    else if (ageKey < 1) ageKey = 0;
    
    const dynamicValues = LUND_BROWDER_AGE_MAP[ageKey as keyof typeof LUND_BROWDER_AGE_MAP] || LUND_BROWDER_AGE_MAP.adult;
    const totalTBSA = burnRegs.reduce((acc, curr) => {
      const region = LUND_BROWDER_REGIONS.find(r => r.id === curr);
      if (!region) return acc;
      if (region.percentage) return acc + region.percentage;
      if (region.type === "A") return acc + dynamicValues.head;
      if (region.type === "B") return acc + dynamicValues.thigh;
      if (region.type === "C") return acc + dynamicValues.leg;
      return acc;
    }, 0);

    addField("Total Extent", totalTBSA + "% TBSA", 15, 40);
    y += 15;
    if (form.burnExtent) {
      addField("Burn Notes", form.burnExtent, 15, pageWidth - 30);
      y += 15;
    }
  }

  doc.save(`PCR_${form.pcrNo || "NoNo"}_${form.date}.pdf`);
  showToast("PDF exported successfully", "success");
};

export const handleExportExcel = (record: PCRRecord, showToast: (msg: string, type: any) => void) => {
  const { form } = record;
  const gcsTotal = (form.gcs.eye || 0) + (form.gcs.verbal || 0) + (form.gcs.motor || 0);

  const data: any[][] = [
    ["MAMBUSAO MDRRMO - PATIENT CARE RECORD"],
    [],
    ["▌ INCIDENT INFORMATION"],
    ["PCR No.", form.pcrNo, "Date", form.date, "Time of Day", form.timeOfDay],
    ["Team Name", form.teamName, "Driver", form.driver, "Place", form.placeOfIncident],
    ["Status", form.status],
    [],
    ["▌ TIMESTAMPS"],
    ["Call Received", form.timestamps.callReceived, "Incident", form.timestamps.timeOfIncident, "Walk-In", form.timestamps.walkIn],
    ["En Route", form.timestamps.enRoute, "At Scene", form.timestamps.atScene, "At Patient", form.timestamps.atPatient],
    ["Depart", form.timestamps.depart, "At Base", form.timestamps.atBase, "In Service", form.timestamps.inService],
    [],
    ["▌ CLASSIFICATION"],
    ["Response Type", form.responseType === "Others" ? `Others (${form.responseTypeOthers})` : form.responseType],
    ["Location Type", form.locationTypes.join(", ")],
    ["Emergency Type", form.emergencyTypes.join(", ")],
    ["Disposition", form.disposition.join(", ")],
    ["Consciousness", form.consciousness],
    [],
    ["▌ PATIENT INFORMATION"],
    ["Name", form.patientName, "Age", form.age, "Gender", form.gender],
    ["Birth Date", form.birthDate, "Civil Status", form.civilStatus, "Contact", form.contactNo],
    ["Address", form.address],
    ["Resp. Person", form.responsiblePerson, "Relationship", form.relationship],
    ["Chief Complaint", form.chiefComplaint],
    [],
    ["▌ VITAL SIGNS"],
    ["Metric", "Initial", "5 mins", "10 mins", "15 mins", "Destination"],
    ["BP", form.vitalSigns.initial.bp, form.vitalSigns.min5.bp, form.vitalSigns.min10.bp, form.vitalSigns.min15.bp, form.vitalSigns.destination.bp],
    ["Temp", form.vitalSigns.initial.temp, form.vitalSigns.min5.temp, form.vitalSigns.min10.temp, form.vitalSigns.min15.temp, form.vitalSigns.destination.temp],
    ["Pulse", form.vitalSigns.initial.pulse, form.vitalSigns.min5.pulse, form.vitalSigns.min10.pulse, form.vitalSigns.min15.pulse, form.vitalSigns.destination.pulse],
    ["Resp", form.vitalSigns.initial.resp, form.vitalSigns.min5.resp, form.vitalSigns.min10.resp, form.vitalSigns.min15.resp, form.vitalSigns.destination.resp],
    ["O2 Sat", form.vitalSigns.initial.o2sat, form.vitalSigns.min5.o2sat, form.vitalSigns.min10.o2sat, form.vitalSigns.min15.o2sat, form.vitalSigns.destination.o2sat],
    ["O2 Given", form.vitalSigns.initial.o2given, form.vitalSigns.min5.o2given, form.vitalSigns.min10.o2given, form.vitalSigns.min15.o2given, form.vitalSigns.destination.o2given],
    [],
    ["▌ GLASGOW COMA SCALE"],
    ["Eye Opening", form.gcs.eye, "Verbal", form.gcs.verbal, "Motor", form.gcs.motor, "TOTAL", gcsTotal],
    [],
    ["▌ CLINICAL ASSESSMENT"],
    ["Eyes", form.eyes.join(", ")],
    ["Wounds", form.wounds.join(", ")],
    ["Pain Scale", form.painScale, "Quality", form.painQuality.join(", "), "Radiating", form.severityRadiating],
    [],
    ["▌ SAMPLE HISTORY"],
    ["Signs & Symptoms", form.sampleHistory.signsSymptoms],
    ["Allergies", form.sampleHistory.allergies],
    ["Medications", form.sampleHistory.medications],
    ["Past Medical History", form.sampleHistory.pastHistory],
    ["Last Meal", form.sampleHistory.lastMeal],
    ["Event Prior", form.sampleHistory.eventPrior],
    [],
    ["▌ NARRATIVE REPORT"],
    [form.narrative],
    [],
    ["▌ RESPONDERS & ENDORSEMENT"],
    ["Responders", `${form.responders.r1}, ${form.responders.r2}, ${form.responders.r3}`],
    ["Nurse/s", form.nurses, "Encoded By", form.encodedBy],
    ["Hospital", form.hospital, "Endorsed To", form.endorsedTo],
    [],
    ["▌ OB/GYN RECORD"],
    ["G", form.obRecord?.g, "T", form.obRecord?.t, "P", form.obRecord?.p, "A", form.obRecord?.a, "L", form.obRecord?.l],
    ["WT", form.obRecord?.wt, "Fundic Height", form.obRecord?.fundicHeight, "FHB", form.obRecord?.fetalHeartBeat],
    ["Dilation", form.obRecord?.cervicalDilation],
    [],
    ["▌ APGAR SCORE"],
    ["1 min TOTAL", ["heartRate", "respRate", "muscleTone", "reflexIrritability", "color"].reduce((acc, curr) => acc + (form.apgarScore?.[curr as keyof typeof form.apgarScore]?.min1 || 0), 0)],
    ["5 min TOTAL", ["heartRate", "respRate", "muscleTone", "reflexIrritability", "color"].reduce((acc, curr) => acc + (form.apgarScore?.[curr as keyof typeof form.apgarScore]?.min5 || 0), 0)],
    [],
    ["▌ BURN SCALE"],
    ["Regions", (form.burnRegions || []).map(id => LUND_BROWDER_REGIONS.find(r => r.id === id)?.label).filter(Boolean).join(", ") || "None"],
    ["Total Extent", (() => {
       const burnRegs = form.burnRegions || [];
       if (burnRegs.length === 0) return "";
       const type = form.burnScaleType || "adult";
       let ageKey: any = type === "adult" ? "adult" : parseInt(form.age);
       if (isNaN(ageKey)) ageKey = 0;
       else if (ageKey >= 15) ageKey = 15;
       else if (ageKey >= 10) ageKey = 10;
       else if (ageKey >= 5) ageKey = 5;
       else if (ageKey >= 1) ageKey = 1;
       else if (ageKey < 1) ageKey = 0;
       const dynamicValues = LUND_BROWDER_AGE_MAP[ageKey as keyof typeof LUND_BROWDER_AGE_MAP] || LUND_BROWDER_AGE_MAP.adult;
       const total = burnRegs.reduce((acc, curr) => {
         const region = LUND_BROWDER_REGIONS.find(r => r.id === curr);
         if (!region) return acc;
         if (region.percentage) return acc + region.percentage;
         if (region.type === "A") return acc + dynamicValues.head;
         if (region.type === "B") return acc + dynamicValues.thigh;
         if (region.type === "C") return acc + dynamicValues.leg;
         return acc;
       }, 0);
       return `${total}% TBSA (${type.toUpperCase()})`;
    })()],
    ["Burn Notes", form.burnExtent || ""],
    [],
    ["Refusal Accepted", form.refusalAccepted ? "YES" : "NO"],
  ];

  const ws = XLSX.utils.aoa_to_sheet(data);

  // Apply styles to single PCR export
  const borderStyle = {
    top: { style: "thin" },
    bottom: { style: "thin" },
    left: { style: "thin" },
    right: { style: "thin" }
  };

  Object.keys(ws).forEach(cell => {
    if (cell.startsWith("!")) return;
    const cellData = ws[cell];
    if (cellData && cellData.v) {
      const val = String(cellData.v);
      
      // Default style
      cellData.s = {
        alignment: { vertical: "center", wrapText: true },
        border: borderStyle
      };

      // Main title
      if (cell === "A1") {
        cellData.s = {
          ...cellData.s,
          font: { bold: true, sz: 16, color: { rgb: "FFFFFF" } },
          fill: { fgColor: { rgb: "C0392B" } },
          alignment: { horizontal: "center", vertical: "center" }
        };
      }
      // Section headers
      else if (val.startsWith("▌")) {
        cellData.s = {
          ...cellData.s,
          font: { bold: true, color: { rgb: "FFFFFF" } },
          fill: { fgColor: { rgb: "334155" } },
          alignment: { vertical: "center" }
        };
      }
      // Labels (simplified check)
      else if (val.includes(":") || ["Metric", "Initial", "5 mins", "10 mins", "15 mins", "Destination", "PARA", "TOTAL"].includes(val)) {
        cellData.s = {
          ...cellData.s,
          font: { bold: true },
          fill: { fgColor: { rgb: "F1F5F9" } }
        };
      }
    }
  });

  ws["!cols"] = [{ wch: 20 }, { wch: 25 }, { wch: 15 }, { wch: 25 }, { wch: 15 }, { wch: 25 }, { wch: 12 }, { wch: 12 }];
  ws["!rows"] = [{ hpt: 30 }]; // Taller title row
  ws["!merges"] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 7 } }, // Main Title
    { s: { r: 2, c: 0 }, e: { r: 2, c: 7 } }, // Incident Info Header
    { s: { r: 7, c: 0 }, e: { r: 7, c: 7 } }, // Timestamps Header
    { s: { r: 12, c: 0 }, e: { r: 12, c: 7 } }, // Classification Header
    { s: { r: 19, c: 0 }, e: { r: 19, c: 7 } }, // Patient Info Header
    { s: { r: 26, c: 0 }, e: { r: 26, c: 7 } }, // Vital Signs Header
    { s: { r: 35, c: 0 }, e: { r: 35, c: 7 } }, // GCS Header
    { s: { r: 38, c: 0 }, e: { r: 38, c: 7 } }, // Clinical Assessment Header
    { s: { r: 43, c: 0 }, e: { r: 43, c: 7 } }, // Sample History Header
    { s: { r: 51, c: 0 }, e: { r: 51, c: 7 } }, // Narrative Header
    { s: { r: 54, c: 0 }, e: { r: 54, c: 7 } }, // Responders Header
    { s: { r: 52, c: 0 }, e: { r: 52, c: 7 } }, // Narrative content merge
  ];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Patient Care Record");
  XLSX.writeFile(wb, `PCR_${form.pcrNo || "NoNo"}_${form.date}.xlsx`);
  showToast("Excel exported successfully", "success");
};

export const handleExportAllExcel = (records: PCRRecord[], showToast: (msg: string, type: any) => void, year?: string, mode: 'single' | 'multi' = 'single') => {
  if (records.length === 0) {
    showToast("No records to export", "info");
    return;
  }

  const wb = XLSX.utils.book_new();
  const headers = [
    "PCR No.", "Team", "Type of Emergency", "Date of Incident", "Time", "Driver",
    "Responder/s", "Nurse/s", "Name of Patient", "Age", "Sex",
    "Address of Patient", "Chief Complaint", "Place of Incident", "Coordinates", "Encoded by"
  ];

  const createSheet = (filteredRecords: PCRRecord[], sheetName: string) => {
    const data: any[][] = [
      [sheetName.toUpperCase()], // Row 0
      headers,                   // Row 1
    ];

    filteredRecords.forEach((record, index) => {
      const { form } = record;
      const responders = [form.responders.r1, form.responders.r2, form.responders.r3].filter(Boolean).join(" / ");
      const coords = form.coordinates ? `${form.coordinates.lat.toFixed(4)}, ${form.coordinates.lng.toFixed(4)}` : "N/A";
      data.push([
        form.pcrNo, form.teamName, form.emergencyTypes.join(", "), form.date,
        form.timestamps.timeOfIncident, form.driver, responders, form.nurses,
        form.patientName || "Unnamed Patient", form.age, form.gender, form.address,
        form.chiefComplaint, form.placeOfIncident, coords, form.encodedBy
      ]);
    });

    const ws = XLSX.utils.aoa_to_sheet(data);

    // Define border style
    const borderStyle = {
      top: { style: "thin" },
      bottom: { style: "thin" },
      left: { style: "thin" },
      right: { style: "thin" }
    };

    // Apply styles to all cells with data
    const range = XLSX.utils.decode_range(ws["!ref"] || "A1:O1");
    for (let R = range.s.r; R <= range.e.r; ++R) {
      for (let C = range.s.c; C <= range.e.c; ++C) {
        const cellRef = XLSX.utils.encode_cell({ r: R, c: C });
        if (!ws[cellRef]) continue;

        // Default style
        ws[cellRef].s = {
          alignment: { vertical: "center", wrapText: true },
          border: borderStyle
        };

        // Main Title (Row 0)
        if (R === 0) {
          ws[cellRef].s = {
            ...ws[cellRef].s,
            font: { bold: true, sz: 16, color: { rgb: "FFFFFF" } },
            fill: { fgColor: { rgb: "C0392B" } }, // MDRRMO Red
            alignment: { horizontal: "center", vertical: "center" }
          };
        }
        // Headers (Row 1)
        else if (R === 1) {
          ws[cellRef].s = {
            ...ws[cellRef].s,
            font: { bold: true, color: { rgb: "334155" } },
            fill: { fgColor: { rgb: "F1F5F9" } },
            alignment: { horizontal: "center", vertical: "center" }
          };
        }
        // Data Rows (R > 1)
        else {
          if (R % 2 === 0) {
            ws[cellRef].s.fill = { fgColor: { rgb: "F8FAFC" } };
          }
          if ([0, 3, 4, 9, 10].includes(C)) {
            ws[cellRef].s.alignment.horizontal = "center";
          }
        }
      }
    }

    ws["!merges"] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 15 } }];
    ws["!cols"] = [
      { wch: 6 }, { wch: 12 }, { wch: 22 }, { wch: 18 }, { wch: 12 },
      { wch: 22 }, { wch: 35 }, { wch: 25 }, { wch: 30 }, { wch: 8 },
      { wch: 10 }, { wch: 35 }, { wch: 35 }, { wch: 35 }, { wch: 22 }, { wch: 15 }
    ];
    ws["!rows"] = [{ hpt: 30 }, { hpt: 25 }];
    return ws;
  };

  if (mode === 'multi') {
    const yearsSet = new Set<string>();
    records.forEach(r => {
      if (r.form.date) {
        const y = r.form.date.split('-')[0];
        if (y && y.length === 4) yearsSet.add(y);
      }
    });
    const years = Array.from(yearsSet).sort();
    
    if (years.length === 0) {
      showToast("No records with valid dates found", "info");
      return;
    }

    years.forEach(y => {
      const yearRecords = records.filter(r => r.form.date.startsWith(y));
      if (yearRecords.length > 0) {
        const ws = createSheet(yearRecords, `PATIENT RECORD ${y}`);
        XLSX.utils.book_append_sheet(wb, ws, `PATIENT RECORD ${y}`);
      }
    });
  } else {
    const filteredRecords = year ? records.filter(r => r.form.date.startsWith(year)) : records;
    if (filteredRecords.length === 0) {
      showToast(`No records found for year ${year}`, "info");
      return;
    }
    const ws = createSheet(filteredRecords, year ? `PATIENT RECORD ${year}` : "PATIENT RECORD");
    XLSX.utils.book_append_sheet(wb, ws, year ? `PATIENT RECORD ${year}` : "PATIENT RECORD");
  }

  const fileName = mode === 'multi' 
    ? `MDRRMO_All_Records_By_Year_${new Date().toISOString().split('T')[0]}.xlsx`
    : (year ? `MDRRMO_Records_${year}_${new Date().toISOString().split('T')[0]}.xlsx` : `MDRRMO_Patient_Records_${new Date().toISOString().split('T')[0]}.xlsx`);
  
  XLSX.writeFile(wb, fileName);
  showToast(mode === 'multi' ? "All Records Exported" : (year ? `Records for ${year} Exported` : "Excel Database Exported"), "success");
};
