"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Mic, UserPlus, ChevronDown, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getPatients } from "@/lib/supabase/patients";
import type { Patient } from "@/types/database";

export default function AudioPage() {
  const router = useRouter();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(false);
  const [showPatientList, setShowPatientList] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    getPatients()
      .then(setPatients)
      .catch(() => setPatients([]));
  }, []);

  const filtered = patients.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.bed.toLowerCase().includes(search.toLowerCase()) ||
      p.initials.toLowerCase().includes(search.toLowerCase())
  );

  function handleSelectPatient(id: string) {
    setLoading(true);
    router.push(`/audio/gravar?paciente=${id}`);
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-9">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-600 to-green-500 inline-flex items-center justify-center shadow-lg shadow-green-600/25 mb-4">
          <Mic className="w-7 h-7 text-white" />
        </div>
        <h1 className="text-2xl font-extrabold text-foreground mb-1">
          Novo Laudo por Audio
        </h1>
        <p className="text-sm text-muted-foreground">
          Selecione o tipo de registro para comecar
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Paciente Existente */}
        <div
          onClick={() => setShowPatientList(!showPatientList)}
          className={`bg-white rounded-2xl p-7 border-2 transition-all cursor-pointer text-center flex flex-col items-center gap-3.5 ${
            showPatientList
              ? "border-sky-500 shadow-lg shadow-sky-500/10"
              : "border-border hover:border-sky-500"
          }`}
        >
          <div className="w-13 h-13 rounded-xl bg-gradient-to-br from-sky-500 to-sky-400 flex items-center justify-center">
            <Mic className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="text-base font-bold text-foreground mb-1 flex items-center justify-center gap-1">
              Paciente Existente
              <ChevronDown
                className={`w-4 h-4 transition-transform ${
                  showPatientList ? "rotate-180" : ""
                }`}
              />
            </div>
            <div className="text-xs text-muted-foreground leading-relaxed">
              Atualizar laudo de um paciente ja cadastrado
            </div>
          </div>
        </div>

        {/* Novo Paciente */}
        <div
          onClick={() => router.push("/audio/gravar")}
          className="bg-white rounded-2xl p-7 border-2 border-border hover:border-green-500 transition-all cursor-pointer text-center flex flex-col items-center gap-3.5"
        >
          <div className="w-13 h-13 rounded-xl bg-gradient-to-br from-green-600 to-green-500 flex items-center justify-center">
            <UserPlus className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="text-base font-bold text-foreground mb-1">
              Novo Paciente
            </div>
            <div className="text-xs text-muted-foreground leading-relaxed">
              Cadastrar novo paciente via audio — a IA cria o registro
            </div>
          </div>
        </div>
      </div>

      {/* Patient Selection List */}
      {showPatientList && (
        <div className="mt-4 bg-white rounded-2xl border-2 border-sky-200 overflow-hidden">
          <div className="p-3 border-b border-border">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome, leito ou iniciais..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
                autoFocus
              />
            </div>
          </div>
          <div className="max-h-64 overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="p-6 text-center text-sm text-muted-foreground">
                Nenhum paciente encontrado
              </div>
            ) : (
              filtered.map((patient) => (
                <button
                  key={patient.id}
                  onClick={() => handleSelectPatient(patient.id)}
                  disabled={loading}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-sky-50 transition-colors text-left border-b border-border last:border-b-0"
                >
                  <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-sky-500 to-sky-400 flex items-center justify-center text-white text-xs font-bold shrink-0">
                    {patient.initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-foreground truncate">
                      {patient.name}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Leito {patient.bed} — {patient.unit}
                    </div>
                  </div>
                  <span className="shrink-0 text-xs font-medium text-sky-600 border border-sky-200 rounded-md px-2.5 py-1">
                    Selecionar
                  </span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
