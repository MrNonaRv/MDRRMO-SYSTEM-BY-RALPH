/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export const getGCSColor = (score: number) => {
  if (score === 15) return "bg-emerald-500"; // Normal
  if (score >= 13) return "bg-green-500";   // Mild
  if (score >= 9) return "bg-amber-500";    // Moderate
  if (score >= 3) return "bg-red-500";      // Severe
  return "bg-slate-500";                   // Unknown/Error
};

export const getGCSLabel = (score: number) => {
  if (score === 15) return "Normal";
  if (score >= 13) return "Mild";
  if (score >= 9) return "Moderate";
  if (score >= 3) return "Severe";
  return "N/A";
};

export const getStatusColor = (status: string) => {
  switch (status) {
    case "Active": return "bg-[#16a34a]";
    case "Closed": return "bg-[#64748b]";
    case "Referred": return "bg-[#0ea5e9]";
    case "Pending": return "bg-[#f59e0b]";
    default: return "bg-slate-400";
  }
};

export const getEmergencyColor = (type: string) => {
  switch (type) {
    case "Medical": return "bg-blue-500";
    case "Trauma": return "bg-red-500";
    case "Drowning": return "bg-cyan-500";
    case "Fire": return "bg-orange-500";
    case "Psych": return "bg-purple-500";
    case "OB": return "bg-pink-500";
    default: return "bg-slate-500";
  }
};

export const hashPassword = async (password: string): Promise<string> => {
  const msgUint8 = new TextEncoder().encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
};

export const generateNextPcrNo = (records: { form: { pcrNo: string } }[]) => {
  const currentYear = new Date().getFullYear().toString();
  
  // Find all records that follow the YYYY-XXXX format
  const formattedRecords = records.filter(r => 
    r.form.pcrNo && 
    r.form.pcrNo.startsWith(currentYear) && 
    r.form.pcrNo.includes('-')
  );
  
  if (formattedRecords.length === 0) {
    return `${currentYear}-0001`;
  }
  
  // Find the highest sequence number for the current year
  const maxSeq = Math.max(...formattedRecords.map(r => {
    const parts = r.form.pcrNo.split('-');
    const seq = parseInt(parts[parts.length - 1]);
    return isNaN(seq) ? 0 : seq;
  }));
  
  const nextSeq = (maxSeq + 1).toString().padStart(4, '0');
  return `${currentYear}-${nextSeq}`;
};