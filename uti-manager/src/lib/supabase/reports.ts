import { createClient } from "@/lib/supabase/client";
import type { Report, Database } from "@/types/database";

type ReportInsert = Database["public"]["Tables"]["reports"]["Insert"];

export async function createReport(data: ReportInsert): Promise<Report> {
  const client = createClient();

  const { data: report, error } = await client
    .from("reports")
    .insert(data as never)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create report: ${error.message}`);
  }

  if (!report) {
    throw new Error(`Failed to create report`);
  }

  return report;
}

export async function getReportsByPatient(patientId: string): Promise<Report[]> {
  const client = createClient();

  const { data, error } = await client
    .from("reports")
    .select("*")
    .eq("patient_id", patientId)
    .order("date", { ascending: false })
    .order("time", { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch reports: ${error.message}`);
  }

  return data || [];
}

export async function getReport(id: string): Promise<Report> {
  const client = createClient();

  const { data, error } = await client
    .from("reports")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    throw new Error(`Failed to fetch report: ${error.message}`);
  }

  if (!data) {
    throw new Error(`Report not found`);
  }

  return data;
}
