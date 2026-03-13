import { createClient } from "@/lib/supabase/client";
import type { Patient, Report, Database } from "@/types/database";

type PatientInsert = Database["public"]["Tables"]["patients"]["Insert"];
type PatientUpdate = Database["public"]["Tables"]["patients"]["Update"];

export async function getPatients(): Promise<Patient[]> {
  const client = createClient();

  const { data, error } = await client
    .from("patients")
    .select("*")
    .order("bed", { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch patients: ${error.message}`);
  }

  return data || [];
}

export async function getPatient(id: string): Promise<Patient> {
  const client = createClient();

  const { data, error } = await client
    .from("patients")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    throw new Error(`Failed to fetch patient: ${error.message}`);
  }

  if (!data) {
    throw new Error(`Patient not found`);
  }

  return data;
}

export async function createPatient(
  data: PatientInsert
): Promise<Patient> {
  const client = createClient();

  const { data: patient, error } = await client
    .from("patients")
    // Supabase self-referential Insert type resolves to never — known issue
    .insert(data as never)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create patient: ${error.message}`);
  }

  if (!patient) {
    throw new Error(`Failed to create patient`);
  }

  return patient;
}

export async function updatePatient(
  id: string,
  data: PatientUpdate
): Promise<Patient> {
  const client = createClient();

  const { data: patient, error } = await client
    .from("patients")
    .update(data as never)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update patient: ${error.message}`);
  }

  if (!patient) {
    throw new Error(`Patient not found`);
  }

  return patient;
}

export async function deletePatient(id: string): Promise<void> {
  const client = createClient();

  const { error } = await client
    .from("patients")
    .delete()
    .eq("id", id);

  if (error) {
    throw new Error(`Failed to delete patient: ${error.message}`);
  }
}

export async function getPatientWithReports(
  id: string
): Promise<{ patient: Patient; reports: Report[] }> {
  const client = createClient();

  const { data: patient, error: patientError } = await client
    .from("patients")
    .select("*")
    .eq("id", id)
    .single();

  if (patientError || !patient) {
    throw new Error(`Failed to fetch patient: ${patientError?.message ?? "not found"}`);
  }

  const { data: reports, error: reportsError } = await client
    .from("reports")
    .select("*")
    .eq("patient_id", id)
    .order("created_at", { ascending: false });

  if (reportsError) {
    throw new Error(`Failed to fetch reports: ${reportsError.message}`);
  }

  return { patient: patient as Patient, reports: (reports as Report[]) || [] };
}
