export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      patients: {
        Row: {
          id: string;
          initials: string;
          name: string;
          gender: "M" | "F";
          birth_date: string;
          registration: string;
          bed: string;
          unit: string;
          admission_date: string;
          admission_reason: string;
          main_diagnosis: string;
          clinical_status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["patients"]["Row"], "id" | "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["patients"]["Insert"]>;
      };
      reports: {
        Row: {
          id: string;
          patient_id: string;
          date: string;
          time: string;
          author: string;
          transcription: string;
          devices: Json;
          ventilation: Json;
          sedation: Json;
          antibiotics: string;
          hemodynamics: string;
          clinical_condition: string;
          diuresis: string;
          vital_signs: Json;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["reports"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["reports"]["Insert"]>;
      };
      vitals: {
        Row: {
          id: string;
          patient_id: string;
          date: string;
          time: string;
          pa: string;
          fc: number;
          temp: number;
          sato2: number;
          author: string;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["vitals"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["vitals"]["Insert"]>;
      };
      checklists: {
        Row: {
          id: string;
          patient_id: string;
          analgesia_sedacao: Json;
          dieta: Json;
          prev_complicacoes: Json;
          prev_pneumonia: Json;
          prev_ipcs: Json;
          antibioticos: Json;
          exames: Json;
          planejamento: Json;
          conformidades: Json;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["checklists"]["Row"], "id" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["checklists"]["Insert"]>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}

// Convenience types
export type Patient = Database["public"]["Tables"]["patients"]["Row"];
export type Report = Database["public"]["Tables"]["reports"]["Row"];
export type Vital = Database["public"]["Tables"]["vitals"]["Row"];
export type Checklist = Database["public"]["Tables"]["checklists"]["Row"];
