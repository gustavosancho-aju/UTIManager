import { createClient } from "@/lib/supabase/client";
import type { Patient, Report, Vital } from "@/types/database";

export interface PatientSummary {
  patient: Patient;
  latestVitals: Vital | null;
  latestReport: Report | null;
  daysAdmitted: number;
  devices: {
    tot: boolean;
    cvc: boolean;
    svd: boolean;
    dva: boolean;
    sng: boolean;
    sne: boolean;
  };
}

export async function getDashboardData(): Promise<PatientSummary[]> {
  const supabase = createClient();

  // Fetch all data in parallel (3 queries instead of 1 + 2N)
  const [patientsRes, vitalsRes, reportsRes] = await Promise.all([
    supabase.from("patients").select("*").order("bed", { ascending: true }),
    supabase.from("vitals").select("*").order("date", { ascending: false }).order("time", { ascending: false }),
    supabase.from("reports").select("*").order("created_at", { ascending: false }),
  ]);

  if (patientsRes.error || !patientsRes.data) {
    console.error("Failed to fetch patients:", patientsRes.error?.message);
    return [];
  }

  const patients = patientsRes.data as Patient[];
  const allVitals = (vitalsRes.data || []) as Vital[];
  const allReports = (reportsRes.data || []) as Report[];

  // Index by patient_id for O(1) lookup
  const vitalsMap = new Map<string, Vital>();
  for (const v of allVitals) {
    if (!vitalsMap.has(v.patient_id)) {
      vitalsMap.set(v.patient_id, v); // first = most recent (already sorted)
    }
  }

  const reportsMap = new Map<string, Report>();
  for (const r of allReports) {
    if (!reportsMap.has(r.patient_id)) {
      reportsMap.set(r.patient_id, r);
    }
  }

  const today = new Date();

  return patients.map((patient) => {
    const latestVitals = vitalsMap.get(patient.id) ?? null;
    const latestReport = reportsMap.get(patient.id) ?? null;

    // Parse devices from latest report
    const reportDevices = latestReport?.devices as Record<string, { active?: boolean }> | null;
    const devices = {
      tot: reportDevices?.tot?.active ?? false,
      cvc: reportDevices?.acessoVenoso?.active ?? false,
      svd: reportDevices?.sondaVesical?.active ?? false,
      dva: reportDevices?.dva?.active ?? false,
      sng: reportDevices?.sng?.active ?? false,
      sne: reportDevices?.sne?.active ?? false,
    };

    // Calculate days admitted (with validation)
    const admDate = new Date(patient.admission_date);
    const daysAdmitted = isNaN(admDate.getTime())
      ? 1
      : Math.max(1, Math.ceil((today.getTime() - admDate.getTime()) / (1000 * 60 * 60 * 24)));

    return {
      patient,
      latestVitals,
      latestReport,
      daysAdmitted,
      devices,
    };
  });
}
