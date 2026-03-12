"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import { createPatient } from "@/lib/supabase/patients";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function NovoPacientePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    initials: "",
    name: "",
    gender: "M" as "M" | "F",
    birth_date: "",
    registration: "",
    bed: "",
    unit: "UTI Adulto",
    admission_date: "",
    admission_reason: "",
    main_diagnosis: "",
    clinical_status: "Não informado",
  });

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await createPatient(form);
      router.push("/pacientes");
    } catch (err: any) {
      setError(err.message ?? "Erro ao criar paciente");
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="mb-7">
        <Link
          href="/pacientes"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-sky-700 mb-3"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar para Pacientes
        </Link>
        <h1 className="text-2xl font-extrabold text-foreground">
          Novo Paciente
        </h1>
        <p className="text-sm text-muted-foreground">
          Preencha os dados para cadastrar um novo paciente na UTI
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-6">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="bg-white rounded-2xl border border-border shadow-sm p-6 mb-6">
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

        <div className="bg-white rounded-2xl border border-border shadow-sm p-6 mb-6">
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
            disabled={loading}
            className="bg-sky-600 hover:bg-sky-700 text-white gap-2"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {loading ? "Salvando..." : "Cadastrar Paciente"}
          </Button>
          <Link href="/pacientes">
            <Button type="button" variant="outline">
              Cancelar
            </Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
