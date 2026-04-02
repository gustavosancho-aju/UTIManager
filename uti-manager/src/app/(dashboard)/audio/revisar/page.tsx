"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Save,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  FileText,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createPatient } from "@/lib/supabase/patients";
import { createReport } from "@/lib/supabase/reports";
import { createClient } from "@/lib/supabase/client";

interface ExtractedData {
  gender: string | null;
  initials: string | null;
  bed: string | null;
  diagnostico: string | null;
  diasInternacao: number | null;
  sedacao: {
    drogas: string | null;
    rass: string | null;
    objetivo: string | null;
  };
  ventilacao: {
    conforto: string | null;
    objetivo: string | null;
  };
  dieta: {
    via: string | null;
  };
  hemodinamica: {
    pa: string | null;
    dva: string | null;
  };
  antibiotico: {
    nome: string | null;
    dias: number | null;
  };
  profilaxia: {
    ulceraPressao: boolean | null;
    lamg: boolean | null;
    trombose: boolean | null;
  };
  planoTerapeutico: string | null;
}

export default function RevisarPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [showTranscription, setShowTranscription] = useState(false);

  // Form state
  const [transcription, setTranscription] = useState("");
  const [patientId, setPatientId] = useState<string | null>(null);

  // Identification (new patient only)
  const [bed, setBed] = useState("");
  const [initials, setInitials] = useState("");
  const [gender, setGender] = useState("M");

  // Roteiro fields
  const [diagnostico, setDiagnostico] = useState("");
  const [diasInternacao, setDiasInternacao] = useState("");

  // Sedacao
  const [sedDrogas, setSedDrogas] = useState("");
  const [rass, setRass] = useState("");
  const [sedObjetivo, setSedObjetivo] = useState("");

  // Ventilacao
  const [ventConforto, setVentConforto] = useState("");
  const [ventObjetivo, setVentObjetivo] = useState("");

  // Dieta
  const [dietaVia, setDietaVia] = useState("");

  // Hemodinamica
  const [pa, setPa] = useState("");
  const [dva, setDva] = useState("");

  // Antibiotico
  const [atbNome, setAtbNome] = useState("");
  const [atbDias, setAtbDias] = useState("");

  // Profilaxia
  const [profUlcera, setProfUlcera] = useState(false);
  const [profLamg, setProfLamg] = useState(false);
  const [profTrombose, setProfTrombose] = useState(false);

  // Plano
  const [plano, setPlano] = useState("");

  // Auth user
  const [authorName, setAuthorName] = useState("Medico");

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (data.user?.email) {
        setAuthorName(data.user.user_metadata?.name || data.user.email.split("@")[0]);
      }
    });
  }, []);

  useEffect(() => {
    const raw = sessionStorage.getItem("audio-review-data");
    if (!raw) {
      router.replace("/audio");
      return;
    }

    try {
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== "object" || !parsed.extracted || typeof parsed.transcription !== "string") {
        router.replace("/audio");
        return;
      }
      const { extracted, transcription: t, patientId: pid } = parsed;
      const data = extracted as ExtractedData;

      setTranscription(t || "");
      setPatientId(pid || null);

      // Identification
      setBed(data.bed || "");
      setInitials(data.initials || "");
      setGender(data.gender || "M");

      // Roteiro
      setDiagnostico(data.diagnostico || "");
      setDiasInternacao(data.diasInternacao?.toString() || "");

      // Sedacao
      if (data.sedacao) {
        setSedDrogas(data.sedacao.drogas || "");
        setRass(data.sedacao.rass || "");
        setSedObjetivo(data.sedacao.objetivo || "");
      }

      // Ventilacao
      if (data.ventilacao) {
        setVentConforto(data.ventilacao.conforto || "");
        setVentObjetivo(data.ventilacao.objetivo || "");
      }

      // Dieta
      if (data.dieta) {
        setDietaVia(data.dieta.via || "");
      }

      // Hemodinamica
      if (data.hemodinamica) {
        setPa(data.hemodinamica.pa || "");
        setDva(data.hemodinamica.dva || "");
      }

      // Antibiotico
      if (data.antibiotico) {
        setAtbNome(data.antibiotico.nome || "");
        setAtbDias(data.antibiotico.dias?.toString() || "");
      }

      // Profilaxia
      if (data.profilaxia) {
        setProfUlcera(data.profilaxia.ulceraPressao ?? false);
        setProfLamg(data.profilaxia.lamg ?? false);
        setProfTrombose(data.profilaxia.trombose ?? false);
      }

      // Plano
      setPlano(data.planoTerapeutico || "");
    } catch {
      router.replace("/audio");
    }
  }, [router]);

  async function handleSave() {
    setSaving(true);
    setSaveError(null);

    try {
      let targetPatientId = patientId;

      // Create patient if new
      if (!targetPatientId) {
        const now = new Date();
        const patient = await createPatient({
          initials: initials || "---",
          name: initials || "Paciente",
          gender: (gender as "M" | "F") || "M",
          birth_date: new Date().toISOString().split("T")[0],
          registration: `REG-${Date.now()}`,
          bed: bed || "0",
          unit: "UTI",
          admission_date: now.toISOString().split("T")[0],
          admission_reason: diagnostico || "A definir",
          main_diagnosis: diagnostico || "A definir",
          clinical_status: "Internado",
        });
        targetPatientId = patient.id;
      }

      const now = new Date();
      await createReport({
        patient_id: targetPatientId,
        date: now.toISOString().split("T")[0],
        time: now.toTimeString().slice(0, 5),
        author: authorName,
        transcription,
        // Reutilizar campos JSON existentes para os dados do roteiro
        devices: JSON.parse(JSON.stringify({
          profilaxia: { ulceraPressao: profUlcera, lamg: profLamg, trombose: profTrombose },
          dieta: { via: dietaVia },
        })),
        ventilation: JSON.parse(JSON.stringify({
          conforto: ventConforto,
          objetivo: ventObjetivo,
        })),
        sedation: JSON.parse(JSON.stringify({
          drogas: sedDrogas,
          rass,
          objetivo: sedObjetivo,
        })),
        antibiotics: atbNome ? `${atbNome}${atbDias ? ` (D${atbDias})` : ""}` : "",
        hemodynamics: JSON.stringify({ pa, dva }),
        clinical_condition: diagnostico || "",
        diuresis: diasInternacao || "",
        vital_signs: JSON.parse(JSON.stringify({
          planoTerapeutico: plano,
          hemodinamica: { pa, dva },
          antibiotico: { nome: atbNome, dias: atbDias ? Number(atbDias) : null },
        })),
      });

      sessionStorage.removeItem("audio-review-data");
      router.push(`/pacientes/${targetPatientId}`);
    } catch (err) {
      setSaveError(
        err instanceof Error ? err.message : "Erro ao salvar evolucao"
      );
    } finally {
      setSaving(false);
    }
  }

  const isNewPatient = !patientId;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-foreground mb-1">
          Revisar Evolucao
        </h1>
        <p className="text-sm text-muted-foreground">
          Confira e edite os dados extraidos pela IA antes de salvar
        </p>
      </div>

      {/* Transcription collapsible */}
      <div className="glass-card rounded-xl border border-border mb-6">
        <button
          onClick={() => setShowTranscription(!showTranscription)}
          className="w-full flex items-center justify-between p-4"
        >
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-semibold text-foreground">
              Transcricao Original
            </span>
          </div>
          {showTranscription ? (
            <ChevronUp className="w-4 h-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          )}
        </button>
        {showTranscription && (
          <div className="px-4 pb-4">
            <p className="text-sm text-muted-foreground whitespace-pre-wrap bg-muted rounded-xl p-3">
              {transcription}
            </p>
          </div>
        )}
      </div>

      {/* Section 1 - Identification (new patient only) */}
      {isNewPatient && (
        <Section title="Identificacao">
          <div className="grid grid-cols-3 gap-4">
            <Field label="Leito" value={bed} onChange={setBed} />
            <Field label="Iniciais" value={initials} onChange={setInitials} />
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">
                Sexo
              </label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="M">Masculino</option>
                <option value="F">Feminino</option>
              </select>
            </div>
          </div>
        </Section>
      )}

      {/* Section 2 - Diagnostico */}
      <Section title="Diagnostico">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Diagnostico" value={diagnostico} onChange={setDiagnostico} placeholder="Ex: TCE, PNM" />
          <Field label="Dias de Internacao" value={diasInternacao} onChange={setDiasInternacao} placeholder="Ex: 5" />
        </div>
      </Section>

      {/* Section 3 - Sedacao */}
      <Section title="Sedacao">
        <div className="grid grid-cols-3 gap-4">
          <Field label="Drogas" value={sedDrogas} onChange={setSedDrogas} placeholder="Ex: Midazolam, Fentanil" />
          <Field label="RASS" value={rass} onChange={setRass} placeholder="Ex: -2" />
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">
              Objetivo
            </label>
            <select
              value={sedObjetivo}
              onChange={(e) => setSedObjetivo(e.target.value)}
              className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="">--</option>
              <option value="manter">Manter</option>
              <option value="desmamar">Desmamar</option>
            </select>
          </div>
        </div>
      </Section>

      {/* Section 4 - Ventilacao Mecanica */}
      <Section title="Ventilacao Mecanica">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">
              Conforto
            </label>
            <select
              value={ventConforto}
              onChange={(e) => setVentConforto(e.target.value)}
              className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="">--</option>
              <option value="confortavel">Confortavel</option>
              <option value="desconfortavel">Desconfortavel</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">
              Objetivo
            </label>
            <select
              value={ventObjetivo}
              onChange={(e) => setVentObjetivo(e.target.value)}
              className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="">--</option>
              <option value="manter">Manter</option>
              <option value="desmamar">Desmamar</option>
            </select>
          </div>
        </div>
      </Section>

      {/* Section 5 - Dieta */}
      <Section title="Dieta">
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1 block">
            Via
          </label>
          <select
            value={dietaVia}
            onChange={(e) => setDietaVia(e.target.value)}
            className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="">--</option>
            <option value="oral">Oral</option>
            <option value="enteral">Enteral</option>
            <option value="parenteral">Parenteral</option>
            <option value="zero">Zero (Jejum)</option>
          </select>
        </div>
      </Section>

      {/* Section 6 - Hemodinamica */}
      <Section title="Hemodinamica">
        <div className="grid grid-cols-2 gap-4">
          <Field label="PA" value={pa} onChange={setPa} placeholder="120/80" />
          <Field label="Drogas Vasoativas" value={dva} onChange={setDva} placeholder="Ex: Noradrenalina 0.1 mcg/kg/min" />
        </div>
      </Section>

      {/* Section 7 - Antibiotico */}
      <Section title="Antibiotico">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Qual" value={atbNome} onChange={setAtbNome} placeholder="Ex: Meropenem" />
          <Field label="Dias" value={atbDias} onChange={setAtbDias} placeholder="Ex: 7" />
        </div>
      </Section>

      {/* Section 8 - Profilaxia */}
      <Section title="Profilaxia">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <label className="flex items-center gap-2 p-3 rounded-xl border border-border cursor-pointer hover:bg-muted/50 transition-colors">
            <input
              type="checkbox"
              checked={profUlcera}
              onChange={(e) => setProfUlcera(e.target.checked)}
              className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
            />
            <span className="text-sm font-medium text-foreground">Ulcera por Pressao</span>
          </label>
          <label className="flex items-center gap-2 p-3 rounded-xl border border-border cursor-pointer hover:bg-muted/50 transition-colors">
            <input
              type="checkbox"
              checked={profLamg}
              onChange={(e) => setProfLamg(e.target.checked)}
              className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
            />
            <span className="text-sm font-medium text-foreground">LAMG</span>
          </label>
          <label className="flex items-center gap-2 p-3 rounded-xl border border-border cursor-pointer hover:bg-muted/50 transition-colors">
            <input
              type="checkbox"
              checked={profTrombose}
              onChange={(e) => setProfTrombose(e.target.checked)}
              className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
            />
            <span className="text-sm font-medium text-foreground">Trombose</span>
          </label>
        </div>
      </Section>

      {/* Section 9 - Plano Terapeutico */}
      <Section title="Plano Terapeutico">
        <Textarea
          value={plano}
          onChange={(e) => setPlano(e.target.value)}
          rows={3}
          placeholder="Ex: Alta prevista para amanha, suspender ATB, aumentar sedacao..."
          className="resize-none"
        />
      </Section>

      {/* Error */}
      {saveError && (
        <div className="mb-4 bg-destructive/10 border border-destructive/20 rounded-xl p-3 text-sm text-destructive">
          {saveError}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3 mt-2 mb-8">
        <Button
          variant="outline"
          onClick={() => router.push("/audio/gravar")}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>
        <Button
          onClick={handleSave}
          disabled={saving}
          className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Salvando...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Salvar Evolucao
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="glass-card rounded-xl border border-border p-5 mb-4">
      <h2 className="text-base font-bold text-foreground mb-4">{title}</h2>
      {children}
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="text-xs font-medium text-muted-foreground mb-1 block">
        {label}
      </label>
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  );
}
