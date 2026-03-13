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

interface DeviceField {
  active: boolean;
  details: string;
}

interface ExtractedData {
  gender: string | null;
  initials: string | null;
  bed: string | null;
  admissionDate: string | null;
  admissionReason: string | null;
  mainDiagnosis: string | null;
  clinicalCondition: string | null;
  devices: {
    tot: DeviceField;
    sondaVesical: DeviceField;
    acessoVenoso: DeviceField;
    sng: DeviceField;
    sne: DeviceField;
    dva: DeviceField;
  };
  ventilation: { mode: string; fio2: string; peep: string };
  sedation: { drugs: string; rass: string };
  antibiotics: string | null;
  hemodynamics: string | null;
  diuresis: string | null;
  vitalSigns: {
    pa: string | null;
    fc: number | null;
    temp: number | null;
    sato2: number | null;
  };
}

const DEVICE_LABELS: Record<string, string> = {
  tot: "TOT (Tubo Orotraqueal)",
  sondaVesical: "Sonda Vesical",
  acessoVenoso: "Acesso Venoso",
  sng: "SNG (Sonda Nasogastrica)",
  sne: "SNE (Sonda Nasoenteral)",
  dva: "DVA (Droga Vasoativa)",
};

const DEFAULT_DEVICES: ExtractedData["devices"] = {
  tot: { active: false, details: "" },
  sondaVesical: { active: false, details: "" },
  acessoVenoso: { active: false, details: "" },
  sng: { active: false, details: "" },
  sne: { active: false, details: "" },
  dva: { active: false, details: "" },
};

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

  // Clinical
  const [clinicalCondition, setClinicalCondition] = useState("");
  const [mainDiagnosis, setMainDiagnosis] = useState("");

  // Devices
  const [devices, setDevices] =
    useState<ExtractedData["devices"]>(DEFAULT_DEVICES);

  // Ventilation
  const [ventMode, setVentMode] = useState("");
  const [fio2, setFio2] = useState("");
  const [peep, setPeep] = useState("");

  // Sedation
  const [sedDrugs, setSedDrugs] = useState("");
  const [rass, setRass] = useState("");

  // Others
  const [antibiotics, setAntibiotics] = useState("");
  const [hemodynamics, setHemodynamics] = useState("");
  const [diuresis, setDiuresis] = useState("");

  // Vitals
  const [pa, setPa] = useState("");
  const [fc, setFc] = useState("");
  const [temp, setTemp] = useState("");
  const [sato2, setSato2] = useState("");

  // Auth user
  const [authorName, setAuthorName] = useState("Médico");

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

      // Clinical
      setClinicalCondition(data.clinicalCondition || "");
      setMainDiagnosis(data.mainDiagnosis || "");

      // Devices
      if (data.devices) {
        setDevices({
          tot: data.devices.tot || DEFAULT_DEVICES.tot,
          sondaVesical:
            data.devices.sondaVesical || DEFAULT_DEVICES.sondaVesical,
          acessoVenoso:
            data.devices.acessoVenoso || DEFAULT_DEVICES.acessoVenoso,
          sng: data.devices.sng || DEFAULT_DEVICES.sng,
          sne: data.devices.sne || DEFAULT_DEVICES.sne,
          dva: data.devices.dva || DEFAULT_DEVICES.dva,
        });
      }

      // Ventilation
      if (data.ventilation) {
        setVentMode(data.ventilation.mode || "");
        setFio2(data.ventilation.fio2 || "");
        setPeep(data.ventilation.peep || "");
      }

      // Sedation
      if (data.sedation) {
        setSedDrugs(data.sedation.drugs || "");
        setRass(data.sedation.rass || "");
      }

      // Others
      setAntibiotics(data.antibiotics || "");
      setHemodynamics(data.hemodynamics || "");
      setDiuresis(data.diuresis || "");

      // Vitals
      if (data.vitalSigns) {
        setPa(data.vitalSigns.pa || "");
        setFc(data.vitalSigns.fc?.toString() || "");
        setTemp(data.vitalSigns.temp?.toString() || "");
        setSato2(data.vitalSigns.sato2?.toString() || "");
      }
    } catch {
      router.replace("/audio");
    }
  }, [router]);

  function updateDevice(
    key: keyof ExtractedData["devices"],
    field: "active" | "details",
    value: boolean | string
  ) {
    setDevices((prev) => ({
      ...prev,
      [key]: { ...prev[key], [field]: value },
    }));
  }

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
          admission_reason: mainDiagnosis || "A definir",
          main_diagnosis: mainDiagnosis || "A definir",
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
        devices: JSON.parse(JSON.stringify(devices)),
        ventilation: JSON.parse(JSON.stringify({ mode: ventMode, fio2, peep })),
        sedation: JSON.parse(JSON.stringify({ drugs: sedDrugs, rass })),
        antibiotics: antibiotics || "",
        hemodynamics: hemodynamics || "",
        clinical_condition: clinicalCondition || "",
        diuresis: diuresis || "",
        vital_signs: JSON.parse(JSON.stringify({
          pa: pa || null,
          fc: fc ? Number(fc) : null,
          temp: temp ? Number(temp) : null,
          sato2: sato2 ? Number(sato2) : null,
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

      {/* Section 2 - Clinical Condition */}
      <Section title="Condicao Clinica">
        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">
              Condicao Clinica
            </label>
            <Textarea
              value={clinicalCondition}
              onChange={(e) => setClinicalCondition(e.target.value)}
              rows={3}
              className="resize-none"
            />
          </div>
          {isNewPatient && (
            <Field
              label="Diagnostico Principal"
              value={mainDiagnosis}
              onChange={setMainDiagnosis}
            />
          )}
        </div>
      </Section>

      {/* Section 3 - Devices */}
      <Section title="Dispositivos">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {(
            Object.keys(DEVICE_LABELS) as Array<
              keyof ExtractedData["devices"]
            >
          ).map((key) => (
            <div
              key={key}
              className={`rounded-xl border p-3 transition-colors ${
                devices[key].active
                  ? "border-primary/20 bg-primary/5"
                  : "border-border"
              }`}
            >
              <label className="flex items-center gap-2 mb-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={devices[key].active}
                  onChange={(e) =>
                    updateDevice(key, "active", e.target.checked)
                  }
                  className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
                />
                <span className="text-sm font-medium text-foreground">
                  {DEVICE_LABELS[key]}
                </span>
              </label>
              {devices[key].active && (
                <Input
                  value={devices[key].details}
                  onChange={(e) =>
                    updateDevice(key, "details", e.target.value)
                  }
                  placeholder="Detalhes..."
                  className="text-sm"
                />
              )}
            </div>
          ))}
        </div>
      </Section>

      {/* Section 4 - Ventilation */}
      <Section title="Ventilacao">
        <div className="grid grid-cols-3 gap-4">
          <Field label="Modo" value={ventMode} onChange={setVentMode} />
          <Field label="FiO2" value={fio2} onChange={setFio2} />
          <Field label="PEEP" value={peep} onChange={setPeep} />
        </div>
      </Section>

      {/* Section 5 - Sedation */}
      <Section title="Sedacao">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Drogas" value={sedDrugs} onChange={setSedDrugs} />
          <Field label="RASS" value={rass} onChange={setRass} />
        </div>
      </Section>

      {/* Section 6 - Others */}
      <Section title="Outros">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field
            label="Antibioticos"
            value={antibiotics}
            onChange={setAntibiotics}
          />
          <Field
            label="Hemodinamica"
            value={hemodynamics}
            onChange={setHemodynamics}
          />
          <Field label="Diurese" value={diuresis} onChange={setDiuresis} />
        </div>
      </Section>

      {/* Section 7 - Vital Signs */}
      <Section title="Sinais Vitais">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Field label="PA" value={pa} onChange={setPa} placeholder="120/80" />
          <Field label="FC" value={fc} onChange={setFc} placeholder="80" />
          <Field
            label="Temperatura"
            value={temp}
            onChange={setTemp}
            placeholder="36.5"
          />
          <Field
            label="SatO2"
            value={sato2}
            onChange={setSato2}
            placeholder="98"
          />
        </div>
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
