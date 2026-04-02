"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Loader2,
  Pencil,
  Trash2,
  Bed,
  Calendar,
  FileText,
  Mic,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import {
  getPatientWithReports,
  deletePatient,
} from "@/lib/supabase/patients";
import type { Patient, Report } from "@/types/database";
import { GenderBadge } from "@/components/shared";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Button } from "@/components/ui/button";

// Helper to safely parse JSON fields from report
function safeJson(val: unknown): Record<string, unknown> {
  if (val && typeof val === "object" && !Array.isArray(val)) return val as Record<string, unknown>;
  if (typeof val === "string") {
    try { return JSON.parse(val); } catch { return {}; }
  }
  return {};
}

function ReportCard({ report }: { report: Report }) {
  const [open, setOpen] = useState(false);

  const sedation = safeJson(report.sedation);
  const ventilation = safeJson(report.ventilation);
  const devices = safeJson(report.devices);
  const vitalSigns = safeJson(report.vital_signs);

  const sedDrogas = String(sedation.drogas || "");
  const sedRass = String(sedation.rass || "");
  const sedObj = String(sedation.objetivo || "");
  const ventConforto = String(ventilation.conforto || "");
  const ventObj = String(ventilation.objetivo || "");

  const profilaxia = (devices.profilaxia as Record<string, boolean>) || {};
  const dieta = (devices.dieta as Record<string, string>) || {};
  const hemodinamica = (vitalSigns.hemodinamica as Record<string, string>) || {};
  const antibiotico = (vitalSigns.antibiotico as Record<string, unknown>) || {};
  const plano = String(vitalSigns.planoTerapeutico || "");

  // Fallback: try hemodynamics field directly
  let hemoPA = hemodinamica.pa || "";
  let hemoDVA = hemodinamica.dva || "";
  if (!hemoPA && report.hemodynamics) {
    try {
      const h = JSON.parse(report.hemodynamics);
      hemoPA = h.pa || "";
      hemoDVA = h.dva || "";
    } catch {
      // legacy string format
    }
  }

  return (
    <div className="glass-card rounded-xl border border-border mb-3">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-4"
      >
        <div className="flex items-center gap-3">
          <FileText className="w-4 h-4 text-muted-foreground" />
          <div className="text-left">
            <p className="text-sm font-semibold text-foreground">
              {new Date(report.date).toLocaleDateString("pt-BR")} - {report.time}
            </p>
            <p className="text-[11px] text-muted-foreground">
              {report.author} {report.clinical_condition ? `| ${report.clinical_condition}` : ""}
            </p>
          </div>
        </div>
        {open ? (
          <ChevronUp className="w-4 h-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        )}
      </button>

      {open && (
        <div className="px-4 pb-4 space-y-3">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {report.clinical_condition && (
              <DataItem label="Diagnostico" value={report.clinical_condition} />
            )}
            {report.diuresis && (
              <DataItem label="Dias Internacao" value={`D${report.diuresis}`} />
            )}
            {sedDrogas && (
              <DataItem label="Sedacao - Drogas" value={sedDrogas} />
            )}
            {sedRass && (
              <DataItem label="RASS" value={sedRass} />
            )}
            {sedObj && (
              <DataItem label="Sedacao - Objetivo" value={sedObj} />
            )}
            {ventConforto && (
              <DataItem label="VM - Conforto" value={ventConforto} />
            )}
            {ventObj && (
              <DataItem label="VM - Objetivo" value={ventObj} />
            )}
            {dieta.via && (
              <DataItem label="Dieta" value={String(dieta.via)} />
            )}
            {hemoPA && (
              <DataItem label="PA" value={hemoPA} />
            )}
            {hemoDVA && (
              <DataItem label="DVA" value={hemoDVA} />
            )}
            {report.antibiotics && (
              <DataItem label="Antibiotico" value={report.antibiotics} />
            )}
            {(antibiotico.dias != null && antibiotico.dias !== "") && (
              <DataItem label="ATB Dias" value={`D${antibiotico.dias}`} />
            )}
          </div>

          {/* Profilaxia */}
          {(profilaxia.ulceraPressao || profilaxia.lamg || profilaxia.trombose) && (
            <div>
              <p className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider mb-1">
                Profilaxia
              </p>
              <div className="flex gap-2 flex-wrap">
                {profilaxia.ulceraPressao && <Badge>UP</Badge>}
                {profilaxia.lamg && <Badge>LAMG</Badge>}
                {profilaxia.trombose && <Badge>Trombose</Badge>}
              </div>
            </div>
          )}

          {/* Plano */}
          {plano && (
            <div>
              <p className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider mb-1">
                Plano Terapeutico
              </p>
              <p className="text-sm text-foreground">{plano}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function DataItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider mb-0.5">
        {label}
      </p>
      <p className="text-sm font-medium text-foreground capitalize">{value}</p>
    </div>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-primary/10 text-primary border border-primary/20">
      {children}
    </span>
  );
}

export default function PacienteDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [patient, setPatient] = useState<Patient | null>(null);
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const data = await getPatientWithReports(id);
        setPatient(data.patient);
        setReports(data.reports);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Erro ao carregar paciente");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  async function handleDelete() {
    setDeleting(true);
    try {
      await deletePatient(id);
      router.push("/pacientes");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro ao excluir paciente");
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <div className="glass-card rounded-xl p-12 flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
        <span className="ml-3 text-sm text-muted-foreground">
          Carregando dados do paciente...
        </span>
      </div>
    );
  }

  if (error || !patient) {
    return (
      <div>
        <Link
          href="/pacientes"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar para Gestao de Pacientes
        </Link>
        <div className="glass-card rounded-xl bg-destructive/10 border border-destructive/20 p-6 text-center">
          <p className="text-sm text-destructive">
            {error ?? "Paciente nao encontrado"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-7">
        <div>
          <Link
            href="/pacientes"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary mb-3"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar para Gestao de Pacientes
          </Link>
          <h1 className="text-2xl font-bold font-display text-foreground">
            {patient.name}
          </h1>
          <p className="text-sm text-muted-foreground">
            Matricula: {patient.registration}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/audio/gravar?paciente=${id}`}>
            <Button variant="outline" className="gap-2">
              <Mic className="w-4 h-4" />
              Nova Evolucao
            </Button>
          </Link>
          <Link href={`/pacientes/${id}/editar`}>
            <Button variant="outline" className="gap-2">
              <Pencil className="w-4 h-4" />
              Editar
            </Button>
          </Link>
          <ConfirmDialog
            trigger={
              <Button
                variant="outline"
                className="gap-2 text-destructive border-destructive/20 hover:bg-destructive/10 hover:text-red-700"
                disabled={deleting}
              >
                {deleting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
                Excluir
              </Button>
            }
            title="Excluir paciente"
            description="Tem certeza que deseja excluir este paciente? Esta acao nao pode ser desfeita. Todos os dados clinicos associados serao perdidos."
            confirmLabel="Excluir"
            onConfirm={handleDelete}
            destructive
          />
        </div>
      </div>

      {/* Identificacao */}
      <div className="glass-card rounded-xl p-6 mb-6">
        <h2 className="text-sm font-bold text-foreground uppercase tracking-wider mb-4">
          Identificacao
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider mb-1">
              Leito
            </p>
            <p className="text-lg font-bold font-display text-primary flex items-center gap-1.5">
              <Bed className="w-4 h-4" />
              {patient.bed}
            </p>
          </div>
          <div>
            <p className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider mb-1">
              Iniciais
            </p>
            <p className="text-lg font-bold text-foreground">
              {patient.initials}
            </p>
          </div>
          <div>
            <p className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider mb-1">
              Genero
            </p>
            <GenderBadge gender={patient.gender} />
          </div>
          <div>
            <p className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider mb-1">
              Data de Admissao
            </p>
            <p className="text-sm font-medium text-foreground flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
              {new Date(patient.admission_date).toLocaleDateString("pt-BR")}
            </p>
          </div>
        </div>
        {patient.main_diagnosis && (
          <div className="mt-4">
            <p className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider mb-1">
              Diagnostico Principal
            </p>
            <p className="text-sm font-medium text-foreground">
              {patient.main_diagnosis}
            </p>
          </div>
        )}
      </div>

      {/* Evolucoes */}
      <div className="mb-6">
        <h2 className="text-sm font-bold text-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
          <FileText className="w-4 h-4 text-muted-foreground" />
          Historico de Evolucoes
        </h2>

        {reports.length === 0 ? (
          <div className="glass-card rounded-xl p-8 text-center">
            <FileText className="w-10 h-10 text-muted-foreground/30 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground mb-4">
              Nenhuma evolucao registrada para este paciente.
            </p>
            <Link href={`/audio/gravar?paciente=${id}`}>
              <Button className="gap-2">
                <Mic className="w-4 h-4" />
                Registrar Primeira Evolucao
              </Button>
            </Link>
          </div>
        ) : (
          reports.map((report) => (
            <ReportCard key={report.id} report={report} />
          ))
        )}
      </div>
    </div>
  );
}
