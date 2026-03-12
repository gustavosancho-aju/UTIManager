"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Loader2,
  Plus,
  Trash2,
  Heart,
  Activity,
  Thermometer,
  Droplets,
  X,
  HeartPulse,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  getVitalsByPatient,
  createVital,
  deleteVital,
} from "@/lib/supabase/vitals";
import { getPatient } from "@/lib/supabase/patients";
import type { Vital, Patient } from "@/types/database";

function todayStr() {
  const d = new Date();
  return d.toISOString().slice(0, 10);
}

function nowTimeStr() {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

function formatDatePtBR(dateStr: string) {
  const [year, month, day] = dateStr.split("-").map(Number);
  const d = new Date(year, month - 1, day);
  return d.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function fcColor(fc: number) {
  return fc > 120 || fc < 50 ? "text-red-500" : "text-foreground";
}

function tempColor(temp: number) {
  return temp > 38.0 ? "text-red-500" : "text-foreground";
}

function sato2Color(sato2: number) {
  return sato2 < 94 ? "text-red-500" : "text-foreground";
}

function groupByDate(vitals: Vital[]): Record<string, Vital[]> {
  const groups: Record<string, Vital[]> = {};
  for (const v of vitals) {
    if (!groups[v.date]) groups[v.date] = [];
    groups[v.date].push(v);
  }
  return groups;
}

export default function VitaisPage() {
  const params = useParams();
  const id = params.id as string;

  const [patient, setPatient] = useState<Patient | null>(null);
  const [vitals, setVitals] = useState<Vital[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const [formDate, setFormDate] = useState(todayStr());
  const [formTime, setFormTime] = useState(nowTimeStr());
  const [formPa, setFormPa] = useState("");
  const [formFc, setFormFc] = useState("");
  const [formTemp, setFormTemp] = useState("");
  const [formSato2, setFormSato2] = useState("");
  const [formAuthor, setFormAuthor] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const [p, v] = await Promise.all([
          getPatient(id),
          getVitalsByPatient(id),
        ]);
        setPatient(p);
        setVitals(v);
      } catch (err: unknown) {
        setError(
          err instanceof Error ? err.message : "Erro ao carregar dados"
        );
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  function resetForm() {
    setFormDate(todayStr());
    setFormTime(nowTimeStr());
    setFormPa("");
    setFormFc("");
    setFormTemp("");
    setFormSato2("");
    setFormAuthor("");
  }

  async function handleSave() {
    setSaving(true);
    try {
      await createVital({
        patient_id: id,
        date: formDate,
        time: formTime,
        pa: formPa,
        fc: Number(formFc),
        temp: Number(formTemp),
        sato2: Number(formSato2),
        author: formAuthor,
      });
      const updated = await getVitalsByPatient(id);
      setVitals(updated);
      setShowForm(false);
      resetForm();
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Erro ao salvar registro"
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(vitalId: string) {
    if (!window.confirm("Tem certeza que deseja excluir este registro?")) {
      return;
    }
    try {
      await deleteVital(vitalId);
      setVitals((prev) => prev.filter((v) => v.id !== vitalId));
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Erro ao excluir registro"
      );
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-border shadow-sm p-12 flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-sky-600" />
        <span className="ml-3 text-sm text-muted-foreground">
          Carregando sinais vitais...
        </span>
      </div>
    );
  }

  if (error && !patient) {
    return (
      <div>
        <Link
          href={`/pacientes/${id}`}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-sky-700 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar para Paciente
        </Link>
        <div className="bg-white rounded-2xl border border-red-200 shadow-sm p-6 text-center">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  const grouped = groupByDate(vitals);
  const sortedDates = Object.keys(grouped).sort(
    (a, b) => b.localeCompare(a)
  );

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-7">
        <div>
          <Link
            href={`/pacientes/${id}`}
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-sky-700 mb-3"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar para Paciente
          </Link>
          <h1 className="text-2xl font-extrabold text-foreground">
            Sinais Vitais
          </h1>
          {patient && (
            <p className="text-sm text-muted-foreground">
              {patient.name} &mdash; Leito {patient.bed}
            </p>
          )}
        </div>
        <Button
          className="gap-2"
          onClick={() => {
            setShowForm(!showForm);
            if (!showForm) resetForm();
          }}
        >
          {showForm ? (
            <>
              <X className="w-4 h-4" />
              Cancelar
            </>
          ) : (
            <>
              <Plus className="w-4 h-4" />
              Novo Registro
            </>
          )}
        </Button>
      </div>

      {/* Error banner */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-6">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* New vital form */}
      {showForm && (
        <div className="bg-white rounded-2xl border border-border shadow-sm p-6 mb-6">
          <h2 className="text-sm font-bold text-foreground uppercase tracking-wider mb-4">
            Novo Registro de Sinais Vitais
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider mb-1 block">
                Data
              </label>
              <Input
                type="date"
                value={formDate}
                onChange={(e) => setFormDate(e.target.value)}
              />
            </div>
            <div>
              <label className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider mb-1 block">
                Hora
              </label>
              <Input
                type="time"
                value={formTime}
                onChange={(e) => setFormTime(e.target.value)}
              />
            </div>
            <div>
              <label className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider mb-1 block">
                PA
              </label>
              <Input
                type="text"
                placeholder="120/80"
                value={formPa}
                onChange={(e) => setFormPa(e.target.value)}
              />
            </div>
            <div>
              <label className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider mb-1 block">
                FC (bpm)
              </label>
              <Input
                type="number"
                placeholder="80"
                value={formFc}
                onChange={(e) => setFormFc(e.target.value)}
              />
            </div>
            <div>
              <label className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider mb-1 block">
                Temp (&deg;C)
              </label>
              <Input
                type="number"
                step="0.1"
                placeholder="36.5"
                value={formTemp}
                onChange={(e) => setFormTemp(e.target.value)}
              />
            </div>
            <div>
              <label className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider mb-1 block">
                SatO2 (%)
              </label>
              <Input
                type="number"
                placeholder="98"
                value={formSato2}
                onChange={(e) => setFormSato2(e.target.value)}
              />
            </div>
            <div className="col-span-2">
              <label className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider mb-1 block">
                Responsável
              </label>
              <Input
                type="text"
                placeholder="Dr./Enf."
                value={formAuthor}
                onChange={(e) => setFormAuthor(e.target.value)}
              />
            </div>
          </div>
          <div className="flex items-center gap-2 justify-end">
            <Button
              variant="outline"
              onClick={() => {
                setShowForm(false);
                resetForm();
              }}
            >
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              Salvar
            </Button>
          </div>
        </div>
      )}

      {/* Timeline */}
      {vitals.length === 0 ? (
        <div className="bg-white rounded-2xl border border-border shadow-sm p-12 text-center">
          <HeartPulse className="w-10 h-10 text-muted-foreground/30 mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">
            Nenhum registro de sinais vitais
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {sortedDates.map((date) => (
            <div key={date}>
              {/* Date header */}
              <h3 className="text-sm font-bold text-foreground uppercase tracking-wider mb-4">
                {formatDatePtBR(date)}
              </h3>

              {/* Timeline for this date */}
              <div className="relative pl-8">
                {/* Vertical line */}
                <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-sky-200" />

                <div className="space-y-4">
                  {grouped[date].map((vital) => (
                    <div key={vital.id} className="relative">
                      {/* Timeline dot */}
                      <div className="absolute -left-8 top-4 w-6 h-6 rounded-full bg-sky-100 border-2 border-sky-400 flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-sky-500" />
                      </div>

                      {/* Vital card */}
                      <div className="bg-white rounded-2xl border border-border shadow-sm p-5">
                        <div className="flex items-start justify-between mb-3">
                          {/* Time badge */}
                          <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-sky-100 text-sky-700">
                            {vital.time}
                          </span>

                          {/* Delete button */}
                          <button
                            onClick={() => handleDelete(vital.id)}
                            className="text-muted-foreground hover:text-red-500 transition-colors p-1 rounded-lg hover:bg-red-50"
                            title="Excluir registro"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Vital indicators */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-rose-50 flex items-center justify-center">
                              <Heart className="w-4 h-4 text-rose-500" />
                            </div>
                            <div>
                              <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">
                                PA
                              </p>
                              <p className="text-sm font-bold text-foreground">
                                {vital.pa}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center">
                              <Activity className="w-4 h-4 text-orange-500" />
                            </div>
                            <div>
                              <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">
                                FC
                              </p>
                              <p
                                className={`text-sm font-bold ${fcColor(vital.fc)}`}
                              >
                                {vital.fc} bpm
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
                              <Thermometer className="w-4 h-4 text-amber-500" />
                            </div>
                            <div>
                              <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">
                                Temp
                              </p>
                              <p
                                className={`text-sm font-bold ${tempColor(vital.temp)}`}
                              >
                                {vital.temp}&deg;C
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-sky-50 flex items-center justify-center">
                              <Droplets className="w-4 h-4 text-sky-500" />
                            </div>
                            <div>
                              <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">
                                SatO2
                              </p>
                              <p
                                className={`text-sm font-bold ${sato2Color(vital.sato2)}`}
                              >
                                {vital.sato2}%
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Author */}
                        {vital.author && (
                          <p className="text-xs text-muted-foreground mt-3 pt-3 border-t border-border">
                            Registrado por{" "}
                            <span className="font-semibold">
                              {vital.author}
                            </span>
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
