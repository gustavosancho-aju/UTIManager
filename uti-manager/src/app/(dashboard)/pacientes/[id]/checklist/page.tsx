"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Check, X, Minus, ArrowLeft, Loader2 } from "lucide-react";
import { getChecklist, upsertChecklist } from "@/lib/supabase/checklists";
import { getPatient } from "@/lib/supabase/patients";

type TriState = boolean | null;

interface SectionConfig {
  key: string;
  title: string;
  items: { field: string; label: string }[];
}

const SECTIONS: SectionConfig[] = [
  {
    key: "analgesia_sedacao",
    title: "Analgesia e Sedação",
    items: [
      { field: "semDor", label: "Sem dor / sedação adequada?" },
      { field: "diminuirSedacao", label: "Diminuir/interromper sedação?" },
      { field: "sedacaoMeta", label: "Sedação por meta (RASS)?" },
      { field: "contencao", label: "Contenção?" },
      { field: "agitacao", label: "Agitação tratada?" },
    ],
  },
  {
    key: "dieta",
    title: "Dieta",
    items: [
      { field: "adequada", label: "Dieta adequada?" },
      { field: "jejum12h", label: "Jejum >12h?" },
    ],
  },
  {
    key: "prev_complicacoes",
    title: "Prev. Complicações",
    items: [
      { field: "profilaxiaUlcera", label: "Profilaxia úlcera stress?" },
      { field: "profilaxiaTVP", label: "Profilaxia TVP?" },
      { field: "controleGlicemico", label: "Controle glicêmico?" },
    ],
  },
  {
    key: "prev_pneumonia",
    title: "Prev. Pneumonia",
    items: [
      { field: "protecaoVentilatoria", label: "Proteção ventilatória?" },
      { field: "criterioTRE", label: "Critério TRE?" },
      { field: "extubacao", label: "Possível extubação?" },
    ],
  },
  {
    key: "prev_ipcs",
    title: "Prev. IPCS",
    items: [
      { field: "indicacaoCVC", label: "Indicação CVC?" },
      { field: "curativoCVC", label: "Curativo CVC adequado?" },
      { field: "trocarCVC", label: "Trocar CVC?" },
    ],
  },
  {
    key: "antibioticos",
    title: "Antibióticos",
    items: [
      { field: "doseCorreta", label: "Dose/tempo corretos?" },
      { field: "descalonar", label: "Descalonar?" },
    ],
  },
  {
    key: "exames",
    title: "Exames",
    items: [
      { field: "culturas", label: "Culturas solicitadas?" },
      { field: "examesPendentes", label: "Exames pendentes?" },
      { field: "procedimentos", label: "Procedimentos?" },
      { field: "especialista", label: "Especialista?" },
    ],
  },
  {
    key: "planejamento",
    title: "Planejamento",
    items: [
      { field: "feito", label: "Planejamento feito?" },
      { field: "metasAlcancadas", label: "Metas alcançadas?" },
      { field: "revisao", label: "Revisão necessária?" },
    ],
  },
  {
    key: "conformidades",
    title: "Conformidades",
    items: [
      { field: "pulseira", label: "Pulseira identificação?" },
      { field: "cabeceira", label: "Cabeceira elevada 30-45°?" },
      { field: "filtroBarreira", label: "Filtro barreira?" },
      { field: "curativoCVC", label: "Curativo CVC?" },
      { field: "equipamentos", label: "Equipamentos funcionando?" },
      { field: "svdFixada", label: "SVD fixada?" },
      { field: "bolsaColetora", label: "Bolsa coletora abaixo?" },
    ],
  },
];

function buildInitialState(existing?: Record<string, Record<string, TriState>>) {
  const state: Record<string, Record<string, TriState>> = {};
  for (const section of SECTIONS) {
    state[section.key] = {};
    for (const item of section.items) {
      state[section.key][item.field] =
        existing?.[section.key]?.[item.field] ?? null;
    }
  }
  return state;
}

function getSectionProgress(data: Record<string, TriState>) {
  const total = Object.keys(data).length;
  const answered = Object.values(data).filter((v) => v !== null).length;
  return { answered, total };
}

function getOverallProgress(data: Record<string, Record<string, TriState>>) {
  let answered = 0;
  let total = 0;
  for (const section of Object.values(data)) {
    for (const v of Object.values(section)) {
      total++;
      if (v !== null) answered++;
    }
  }
  return { answered, total };
}

export default function ChecklistPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [patient, setPatient] = useState<{ name: string; bed: string } | null>(null);
  const [data, setData] = useState<Record<string, Record<string, TriState>>>(() =>
    buildInitialState()
  );
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [p, c] = await Promise.all([getPatient(id), getChecklist(id)]);
        setPatient(p);
        if (c) {
          setData(buildInitialState(c as unknown as Record<string, Record<string, TriState>>));
        }
      } catch (err) {
        console.error("Erro ao carregar checklist:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  function setValue(sectionKey: string, field: string, value: TriState) {
    setData((prev) => ({
      ...prev,
      [sectionKey]: {
        ...prev[sectionKey],
        [field]: prev[sectionKey][field] === value ? null : value,
      },
    }));
  }

  async function handleSave() {
    setSaving(true);
    try {
      await upsertChecklist(id, data);
    } catch (err) {
      console.error("Erro ao salvar checklist:", err);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-sky-500" />
      </div>
    );
  }

  const overall = getOverallProgress(data);
  const overallPct = overall.total > 0 ? Math.round((overall.answered / overall.total) * 100) : 0;

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Header */}
      <div className="bg-sky-600 text-white px-4 py-6 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <button
            onClick={() => router.push(`/pacientes/${id}`)}
            className="flex items-center gap-1 text-sky-100 hover:text-white mb-3 text-sm"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </button>
          <h1 className="text-2xl font-bold">Checklist Diário</h1>
          {patient && (
            <p className="text-sky-100 mt-1">
              {patient.name} — Leito {patient.bed}
            </p>
          )}

          {/* Overall progress */}
          <div className="mt-4">
            <div className="flex justify-between text-sm mb-1">
              <span>Progresso geral</span>
              <span>
                {overall.answered}/{overall.total} ({overallPct}%)
              </span>
            </div>
            <div className="w-full bg-sky-800 rounded-full h-2.5">
              <div
                className="bg-white rounded-full h-2.5 transition-all duration-300"
                style={{ width: `${overallPct}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Sections grid */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 mt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {SECTIONS.map((section) => {
            const progress = getSectionProgress(data[section.key]);
            const pct =
              progress.total > 0
                ? Math.round((progress.answered / progress.total) * 100)
                : 0;

            return (
              <div
                key={section.key}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5"
              >
                <div className="flex items-center justify-between mb-3">
                  <h2 className="font-semibold text-gray-800">{section.title}</h2>
                  <span className="text-xs text-gray-500">
                    {progress.answered}/{progress.total}
                  </span>
                </div>

                {/* Section progress bar */}
                <div className="w-full bg-gray-100 rounded-full h-1.5 mb-4">
                  <div
                    className="bg-sky-500 rounded-full h-1.5 transition-all duration-300"
                    style={{ width: `${pct}%` }}
                  />
                </div>

                <div className="space-y-2.5">
                  {section.items.map((item) => {
                    const val = data[section.key][item.field];
                    return (
                      <div
                        key={item.field}
                        className="flex items-center justify-between gap-2"
                      >
                        <span className="text-sm text-gray-700 flex-1">
                          {item.label}
                        </span>
                        <div className="flex gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => setValue(section.key, item.field, true)}
                            className={`inline-flex items-center justify-center h-8 w-8 rounded-lg text-xs font-medium transition-colors ${
                              val === true
                                ? "bg-green-500 text-white"
                                : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                            }`}
                            title="Sim"
                          >
                            <Check className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setValue(section.key, item.field, false)}
                            className={`inline-flex items-center justify-center h-8 w-8 rounded-lg text-xs font-medium transition-colors ${
                              val === false
                                ? "bg-red-500 text-white"
                                : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                            }`}
                            title="Não"
                          >
                            <X className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setValue(section.key, item.field, null)}
                            className={`inline-flex items-center justify-center h-8 w-8 rounded-lg text-xs font-medium transition-colors ${
                              val === null && data[section.key][item.field] === null
                                ? "bg-gray-100 text-gray-500"
                                : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                            }`}
                            title="N/A"
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Save button */}
        <div className="mt-8 flex justify-center">
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-sky-600 hover:bg-sky-700 text-white px-10 py-3 text-base rounded-xl"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Salvando...
              </>
            ) : (
              "Salvar"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
