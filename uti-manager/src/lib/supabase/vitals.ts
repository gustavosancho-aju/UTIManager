import { createClient } from "@/lib/supabase/client";
import type { Vital, Database } from "@/types/database";

type VitalInsert = Database["public"]["Tables"]["vitals"]["Insert"];


export async function getVitalsByPatient(patientId: string): Promise<Vital[]> {
  const client = createClient();

  const { data, error } = await client
    .from("vitals")
    .select("*")
    .eq("patient_id", patientId)
    .order("date", { ascending: false })
    .order("time", { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch vitals: ${error.message}`);
  }

  return data || [];
}

export async function createVital(
  data: VitalInsert
): Promise<Vital> {
  const client = createClient();

  const { data: vital, error } = await client
    .from("vitals")
    .insert(data as never)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create vital: ${error.message}`);
  }

  if (!vital) {
    throw new Error(`Failed to create vital`);
  }

  return vital;
}

export async function deleteVital(id: string): Promise<void> {
  const client = createClient();

  const { error } = await client
    .from("vitals")
    .delete()
    .eq("id", id);

  if (error) {
    throw new Error(`Failed to delete vital: ${error.message}`);
  }
}
