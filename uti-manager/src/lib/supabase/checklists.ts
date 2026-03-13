import { createClient } from "@/lib/supabase/client";
import type { Checklist, Database, Json } from "@/types/database";

/**
 * Fetch a checklist by patient ID
 * Returns null if not found, does not throw
 */
export async function getChecklist(patientId: string): Promise<Checklist | null> {
  try {
    const supabase = createClient();

    const { data, error } = await supabase
      .from("checklists")
      .select("*")
      .eq("patient_id", patientId)
      .maybeSingle();

    if (error) throw error;

    return data ? (data as Checklist) : null;
  } catch (error) {
    console.error("Error fetching checklist:", error);
    return null;
  }
}

/**
 * Upsert a checklist for a patient
 * Creates if doesn't exist, updates if it does
 * Throws on error
 */
type ChecklistInsert = Database["public"]["Tables"]["checklists"]["Insert"];

export async function upsertChecklist(
  patientId: string,
  data: Partial<Omit<ChecklistInsert, "patient_id">>
): Promise<Checklist> {
  try {
    const supabase = createClient();

    const { data: result, error } = await supabase
      .from("checklists")
      .upsert({ patient_id: patientId, ...data } as never, {
        onConflict: "patient_id",
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return result as Checklist;
  } catch (error) {
    console.error("Error upserting checklist:", error);
    throw new Error(
      `Failed to upsert checklist for patient ${patientId}: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}
