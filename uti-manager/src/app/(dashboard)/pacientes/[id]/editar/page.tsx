"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import { getPatient, updatePatient } from "@/lib/supabase/patients";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function EditarPacientePage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    initials: "",
    name: "",
    gender: "M" as "M" | "F",
    birth_date: "",
    registration: "",
    bed: "",
    unit: "",
    admission_date: "",
    admission_reason: "",
    main_diagnosis: "",
    clinical_status: "",
  });

  useEffect(() => {
    async function load() {
      try {
        const patient = await getPatient(id);
        setForm({
          initials: patient.initials,
          name: patient.name,
          gender: patient.gender,
          birth_date: patient.birth_date,
          registration: patient.registration,
          bed: patient.bed,
          unit: patient.unit,
          admission_date: patient.admission_date,
          admission_reason: patient.admission_reason,
          main_diagnosis: patient.main_diagnosis,
          clinical_status: patient.clinical_status,
        });
      } catch (err: any) {
        setError(err.message ?? "Erro ao carregar paciente");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      await updatePatient(id, form);
      router.push(`/pacientes/${id}`);
    } catch (err: any) {
      setError(err.message ?? "Erro ao atualizar paciente");
      setSaving(false);
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

  return (
    <div>
      <div className="mb-7">
        <Link
          href={`/pacientes/${id}`}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary mb-3"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar para Detalhes
        </Link>
        <h1 className="text-2xl font-bold font-display text-foreground">
          Editar Paciente
        </h1>
        <p className="text-sm text-muted-foreground">
          Atualize os dados do paciente
        </p>
      </div>

      {error && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-4 mb-6">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="glass-card rounded-xl p-6 mb-6">
          <h2 className="text-sm font-bold text-foreground uppercase tracking-wider mb-4">
            Dados Pessoais
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Nome Completo *
              </label>
              <Input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Nome do paciente"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Iniciais *
              </label>
              <Input
                name="initials"
                value={form.initials}
                onChange={handleChange}
                placeholder="Ex: JSS"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Gênero *
              </label>
              <select
                name="gender"
                value={form.gender}
                onChange={handleChange}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                required
              >
                <option value="M">Masculino</option>
                <option value="F">Feminino</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Data de Nascimento *
              </label>
              <Input
                type="date"
                name="birth_date"
                value={form.birth_date}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Matrícula *
              </label>
              <Input
                name="registration"
                value={form.registration}
                onChange={handleChange}
                placeholder="Número de matrícula"
                required
              />
            </div>
          </div>
        </div>

        <div className="glass-card rounded-xl p-6 mb-6">
          <h2 className="text-sm font-bold text-foreground uppercase tracking-wider mb-4">
            Internação
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Leito *
              </label>
              <Input
                name="bed"
                value={form.bed}
                onChange={handleChange}
                placeholder="Ex: 01"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Unidade
              </label>
              <Input
                name="unit"
                value={form.unit}
                onChange={handleChange}
                placeholder="UTI Adulto"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Data de Admissão *
              </label>
              <Input
                type="date"
                name="admission_date"
                value={form.admission_date}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Status Clínico
              </label>
              <Input
                name="clinical_status"
                value={form.clinical_status}
                onChange={handleChange}
                placeholder="Não informado"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Motivo da Internação *
              </label>
              <Input
                name="admission_reason"
                value={form.admission_reason}
                onChange={handleChange}
                placeholder="Motivo da admissão na UTI"
                required
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Diagnóstico Principal *
              </label>
              <Input
                name="main_diagnosis"
                value={form.main_diagnosis}
                onChange={handleChange}
                placeholder="Diagnóstico principal"
                required
              />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            type="submit"
            disabled={saving}
            className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {saving ? "Salvando..." : "Salvar Alterações"}
          </Button>
          <Link href={`/pacientes/${id}`}>
            <Button type="button" variant="outline">
              Cancelar
            </Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
