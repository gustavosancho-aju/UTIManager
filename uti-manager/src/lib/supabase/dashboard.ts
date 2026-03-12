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

  const { data: patients, error } = await supabase
    .from("patients")
    .select("*")
    .order("bed", { ascending: true });

  if (error || !patients) return [];

  const summaries: PatientSummary[] = [];

  for (const patient of patients as Patient[]) {
    // Fetch latest vitals
    const { data: vitals } = await supabase
      .from("vitals")
      .select("*")
      .eq("patient_id", patient.id)
      .order("date", { ascending: false })
      .order("time", { ascending: false })
      .limit(1);

    // Fetch latest report (for devices)
    const { data: reports } = await supabase
      .from("reports")
      .select("*")
      .eq("patient_id", patient.id)
      .order("created_at", { ascending: false })
      .limit(1);

    const latestReport = reports?.[0] ? (reports[0] as Report) : null;
    const latestVitals = vitals?.[0] ? (vitals[0] as Vital) : null;

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

    // Calculate days admitted
    const admDate = new Date(patient.admission_date);
    const today = new Date();
    const daysAdmitted = Math.max(1, Math.ceil((today.getTime() - admDate.getTime()) / (1000 * 60 * 60 * 24)));

    summaries.push({
      patient,
      latestVitals,
      latestReport,
      daysAdmitted,
      devices,
    });
  }

  return summaries;
}
