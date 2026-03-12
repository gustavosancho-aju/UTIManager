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
  ClipboardCheck,
  HeartPulse,
} from "lucide-react";
import {
  getPatientWithReports,
  deletePatient,
} from "@/lib/supabase/patients";
import type { Patient, Report } from "@/types/database";
import { GenderBadge } from "@/components/shared";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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
    if (!window.confirm("Tem certeza que deseja excluir este paciente? Esta ação não pode ser desfeita.")) {
      return;
    }
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
      <div className="bg-white rounded-2xl border border-border shadow-sm p-12 flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-sky-600" />
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
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-sky-700 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar para Pacientes
        </Link>
        <div className="bg-white rounded-2xl border border-red-200 shadow-sm p-6 text-center">
          <p className="text-sm text-red-600">
            {error ?? "Paciente não encontrado"}
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
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-sky-700 mb-3"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar para Pacientes
          </Link>
          <h1 className="text-2xl font-extrabold text-foreground">
            {patient.name}
          </h1>
          <p className="text-sm text-muted-foreground">
            Matrícula: {patient.registration}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/pacientes/${id}/vitais`}>
            <Button variant="outline" className="gap-2">
              <HeartPulse className="w-4 h-4" />
              Sinais Vitais
            </Button>
          </Link>
          <Link href={`/pacientes/${id}/checklist`}>
            <Button variant="outline" className="gap-2">
              <ClipboardCheck className="w-4 h-4" />
              Checklist
            </Button>
          </Link>
          <Link href={`/pacientes/${id}/editar`}>
            <Button variant="outline" className="gap-2">
              <Pencil className="w-4 h-4" />
              Editar
            </Button>
          </Link>
          <Button
            variant="outline"
            className="gap-2 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
            onClick={handleDelete}
            disabled={deleting}
          >
            {deleting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
            Excluir
          </Button>
        </div>
      </div>

      {/* Dados do Paciente */}
      <div className="bg-white rounded-2xl border border-border shadow-sm p-6 mb-6">
        <h2 className="text-sm font-bold text-foreground uppercase tracking-wider mb-4">
          Identificação
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider mb-1">
              Leito
            </p>
            <p className="text-lg font-extrabold text-sky-700 flex items-center gap-1.5">
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
              Gênero
            </p>
            <GenderBadge gender={patient.gender} />
          </div>
          <div>
            <p className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider mb-1">
              Data de Nascimento
            </p>
            <p className="text-sm font-medium text-foreground">
              {new Date(patient.birth_date).toLocaleDateString("pt-BR")}
            </p>
          </div>
          <div>
            <p className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider mb-1">
              Unidade
            </p>
            <p className="text-sm font-medium text-foreground">
              {patient.unit}
            </p>
          </div>
        </div>
      </div>

      {/* Dados Clínicos */}
      <div className="bg-white rounded-2xl border border-border shadow-sm p-6 mb-6">
        <h2 className="text-sm font-bold text-foreground uppercase tracking-wider mb-4">
          Dados Clínicos
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider mb-1">
              Data de Admissão
            </p>
            <p className="text-sm font-medium text-foreground flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
              {new Date(patient.admission_date).toLocaleDateString("pt-BR")}
            </p>
          </div>
          <div>
            <p className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider mb-1">
              Status Clínico
            </p>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-semibold bg-sky-500/10 text-sky-700 border border-sky-500/20">
              {patient.clinical_status}
            </span>
          </div>
          <div className="md:col-span-2">
            <p className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider mb-1">
              Motivo da Internação
            </p>
            <p className="text-sm text-foreground">
              {patient.admission_reason}
            </p>
          </div>
          <div className="md:col-span-2">
            <p className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider mb-1">
              Diagnóstico Principal
            </p>
            <p className="text-sm font-medium text-foreground">
              {patient.main_diagnosis}
            </p>
          </div>
        </div>
      </div>

      {/* Evoluções */}
      <div className="bg-white rounded-2xl border border-border shadow-sm p-6">
        <h2 className="text-sm font-bold text-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
          <FileText className="w-4 h-4 text-muted-foreground" />
          Evoluções
        </h2>

        {reports.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="w-10 h-10 text-muted-foreground/30 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              Nenhuma evolução registrada para este paciente.
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="font-semibold">Data</TableHead>
                <TableHead className="font-semibold">Hora</TableHead>
                <TableHead className="font-semibold">Autor</TableHead>
                <TableHead className="font-semibold">
                  Condição Clínica
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reports.map((report) => (
                <TableRow key={report.id}>
                  <TableCell className="text-sm">
                    {new Date(report.date).toLocaleDateString("pt-BR")}
                  </TableCell>
                  <TableCell className="text-sm">{report.time}</TableCell>
                  <TableCell className="text-sm font-medium">
                    {report.author}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground max-w-[300px] truncate">
                    {report.clinical_condition}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
