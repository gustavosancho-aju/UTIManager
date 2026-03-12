"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Users, Plus, Loader2 } from "lucide-react";
import { getPatients } from "@/lib/supabase/patients";
import type { Patient } from "@/types/database";
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

export default function PacientesPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const data = await getPatients();
        setPatients(data);
      } catch (err: any) {
        setError(err.message ?? "Erro ao carregar pacientes");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-7">
        <div>
          <h1 className="text-2xl font-bold font-display text-foreground">
            Pacientes Internados
          </h1>
          <p className="text-sm text-muted-foreground">
            Gestão de leitos da UTI
          </p>
        </div>
        <Link href="/pacientes/novo">
          <Button className="bg-primary hover:bg-primary/90 text-white gap-2">
            <Plus className="w-4 h-4" />
            Novo Paciente
          </Button>
        </Link>
      </div>

      {loading && (
        <div className="glass-card rounded-xl p-12 flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
          <span className="ml-3 text-sm text-muted-foreground">
            Carregando pacientes...
          </span>
        </div>
      )}

      {error && (
        <div className="glass-card rounded-xl bg-destructive/10 border border-destructive/20 p-6 text-center">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {!loading && !error && patients.length === 0 && (
        <div className="glass-card rounded-xl p-12 text-center">
          <Users className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-foreground mb-1">
            Nenhum paciente cadastrado
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            Comece adicionando o primeiro paciente da UTI.
          </p>
          <Link href="/pacientes/novo">
            <Button className="bg-primary hover:bg-primary/90 text-white gap-2">
              <Plus className="w-4 h-4" />
              Novo Paciente
            </Button>
          </Link>
        </div>
      )}

      {!loading && !error && patients.length > 0 && (
        <div className="glass-card rounded-xl overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="font-semibold">Leito</TableHead>
                <TableHead className="font-semibold">Iniciais</TableHead>
                <TableHead className="font-semibold">Nome</TableHead>
                <TableHead className="font-semibold">Gênero</TableHead>
                <TableHead className="font-semibold">Diagnóstico</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {patients.map((patient) => (
                <TableRow key={patient.id} className="hover:bg-primary/5">
                  <TableCell>
                    <Link
                      href={`/pacientes/${patient.id}`}
                      className="font-bold text-primary hover:underline"
                    >
                      {patient.bed}
                    </Link>
                  </TableCell>
                  <TableCell className="font-semibold">
                    {patient.initials}
                  </TableCell>
                  <TableCell>
                    <Link
                      href={`/pacientes/${patient.id}`}
                      className="text-foreground hover:text-primary hover:underline"
                    >
                      {patient.name}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <GenderBadge gender={patient.gender} />
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate text-sm text-muted-foreground">
                    {patient.main_diagnosis}
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
                      {patient.clinical_status}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
