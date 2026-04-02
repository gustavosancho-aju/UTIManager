"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Mic,
  MicOff,
  Send,
  RotateCcw,
  X,
  AlertTriangle,
  Loader2,
  Keyboard,
  AudioLines,
  ClipboardList,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useSpeechRecognition } from "@/hooks/use-speech-recognition";
import { getPatient } from "@/lib/supabase/patients";
import type { Patient } from "@/types/database";

export default function GravarPageWrapper() {
  return (
    <Suspense fallback={<div className="text-center py-12 text-muted-foreground">Carregando...</div>}>
      <GravarPage />
    </Suspense>
  );
}

type InputMode = "audio" | "texto";

const ROTEIRO_ITEMS = [
  { num: 1, label: "Diagnostico", hint: "TCE, PNM, Sepse..." },
  { num: 2, label: "Dias de Internacao", hint: "Quantos dias" },
  { num: 3, label: "Sedacao", hint: "Drogas / RASS / Manter ou Desmamar" },
  { num: 4, label: "Ventilacao Mecanica", hint: "Confortavel? / Manter ou Desmamar" },
  { num: 5, label: "Dieta", hint: "Oral / Enteral / Parenteral / Zero" },
  { num: 6, label: "Hemodinamica", hint: "PA e Drogas Vasoativas" },
  { num: 7, label: "Antibiotico", hint: "Qual e quantos dias" },
  { num: 8, label: "Profilaxia", hint: "UP / LAMG / Trombose" },
  { num: 9, label: "Plano Terapeutico", hint: "Alta? / Mudancas no tratamento" },
];

function GravarPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pacienteId = searchParams.get("paciente");

  const {
    transcription,
    setTranscription,
    recording,
    seconds,
    speechAvailable,
    error,
    startRecording,
    stopRecording,
    formatTime,
  } = useSpeechRecognition();

  const [patient, setPatient] = useState<Patient | null>(null);
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [hasRecorded, setHasRecorded] = useState(false);
  const [mode, setMode] = useState<InputMode>("audio");
  const [textoManual, setTextoManual] = useState("");

  useEffect(() => {
    if (pacienteId) {
      getPatient(pacienteId)
        .then(setPatient)
        .catch(() => setPatient(null));
    }
  }, [pacienteId]);

  function handleStop() {
    stopRecording();
    setHasRecorded(true);
  }

  const textoFinal = mode === "audio" ? transcription : textoManual;
  const podeSalvar = textoFinal.trim().length > 0;

  async function handleSendToAI() {
    if (!podeSalvar) return;
    setSending(true);
    setSendError(null);

    try {
      const res = await fetch("/api/ai/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcription: textoFinal }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Erro ao processar");
      }

      const { extracted } = await res.json();

      sessionStorage.setItem(
        "audio-review-data",
        JSON.stringify({
          extracted,
          transcription: textoFinal,
          patientId: pacienteId || null,
        })
      );

      router.push("/audio/revisar");
    } catch (err) {
      setSendError(err instanceof Error ? err.message : "Erro desconhecido");
    } finally {
      setSending(false);
    }
  }

  function handleRestart() {
    setTranscription("");
    setTextoManual("");
    setHasRecorded(false);
    setSendError(null);
  }

  function handleSwitchMode(newMode: InputMode) {
    if (recording) stopRecording();
    setMode(newMode);
    setSendError(null);
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr,320px] gap-6">
      {/* Roteiro - aparece primeiro em mobile */}
      <div className="order-first lg:order-last">
        <div className="glass-card rounded-xl border border-border p-4 lg:sticky lg:top-6">
          <div className="flex items-center gap-2 mb-4">
            <ClipboardList className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-bold text-foreground">Roteiro UTI</h2>
          </div>
          <div className="space-y-2">
            {ROTEIRO_ITEMS.map((item) => (
              <div
                key={item.num}
                className="flex items-start gap-3 p-2.5 rounded-lg bg-muted/50 border border-border/50"
              >
                <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                  {item.num}
                </span>
                <div>
                  <p className="text-[13px] font-semibold text-foreground leading-tight">
                    {item.label}
                  </p>
                  <p className="text-[11px] text-muted-foreground leading-tight mt-0.5">
                    {item.hint}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Area de gravacao */}
      <div className="order-last lg:order-first">
        {/* Patient info */}
        {patient && (
          <div className="mb-6 glass-card rounded-xl border border-primary/20 p-4 text-center">
            <p className="text-sm text-muted-foreground">Registrando para:</p>
            <p className="text-base font-bold text-foreground">
              {patient.name} — Leito {patient.bed}
            </p>
          </div>
        )}

        {/* Mode Toggle */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <button
            onClick={() => handleSwitchMode("audio")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              mode === "audio"
                ? "bg-primary text-primary-foreground shadow-md shadow-primary/25"
                : "bg-card text-muted-foreground border border-border hover:bg-muted/50"
            }`}
          >
            <AudioLines className="w-4 h-4" />
            Audio
          </button>
          <button
            onClick={() => handleSwitchMode("texto")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              mode === "texto"
                ? "bg-primary text-primary-foreground shadow-md shadow-primary/25"
                : "bg-card text-muted-foreground border border-border hover:bg-muted/50"
            }`}
          >
            <Keyboard className="w-4 h-4" />
            Digitar
          </button>
        </div>

        {/* ==================== MODO AUDIO ==================== */}
        {mode === "audio" && (
          <>
            {/* Speech not available warning */}
            {!speechAvailable && (
              <div className="mb-6 bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
                <p className="text-sm text-foreground">
                  Reconhecimento de voz nao disponivel neste navegador. Use o Google
                  Chrome ou alterne para o modo Digitar.
                </p>
              </div>
            )}

            {/* Microphone Button */}
            <div className="flex flex-col items-center gap-4 mb-8">
              <button
                onClick={recording ? handleStop : startRecording}
                disabled={!speechAvailable || sending}
                className={`w-32 h-32 rounded-full flex items-center justify-center transition-all shadow-lg ${
                  recording
                    ? "bg-red-500 shadow-red-500/30 animate-pulse"
                    : "bg-primary shadow-primary/30 hover:shadow-primary/50 hover:scale-105"
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {recording ? (
                  <MicOff className="w-12 h-12 text-primary-foreground" />
                ) : (
                  <Mic className="w-12 h-12 text-primary-foreground" />
                )}
              </button>

              {recording ? (
                <div className="text-center">
                  <p className="text-2xl font-mono font-bold text-red-600">
                    {formatTime(seconds)}
                  </p>
                  <p className="text-sm text-red-500 animate-pulse">Gravando...</p>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  {hasRecorded ? "Gravacao finalizada" : "Toque para gravar"}
                </p>
              )}
            </div>

            {/* Transcription */}
            <div className="glass-card rounded-xl border border-border p-4 mb-6">
              <label className="text-sm font-semibold text-foreground mb-2 block">
                Transcricao
              </label>
              <Textarea
                value={transcription}
                onChange={(e) => setTranscription(e.target.value)}
                readOnly={recording}
                placeholder={
                  recording
                    ? "Ouvindo..."
                    : "A transcricao aparecera aqui. Voce pode editar apos parar a gravacao."
                }
                rows={6}
                className="resize-none"
              />
            </div>
          </>
        )}

        {/* ==================== MODO TEXTO ==================== */}
        {mode === "texto" && (
          <>
            <div className="flex flex-col items-center gap-3 mb-8">
              <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/25">
                <Keyboard className="w-9 h-9 text-primary-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">
                Digite a evolucao medica abaixo
              </p>
            </div>

            <div className="glass-card rounded-xl border border-border p-4 mb-6">
              <label className="text-sm font-semibold text-foreground mb-2 block">
                Texto da evolucao
              </label>
              <Textarea
                value={textoManual}
                onChange={(e) => setTextoManual(e.target.value)}
                placeholder="Siga o roteiro ao lado. Ex: Diagnostico TCE, 5 dias de internacao, sedacao com Midazolam RASS -2 manter, ventilacao mecanica confortavel manter..."
                rows={8}
                className="resize-none"
              />
              <p className="text-[11px] text-muted-foreground mt-2">
                Descreva o estado do paciente seguindo o roteiro. A IA ira extrair os dados estruturados.
              </p>
            </div>
          </>
        )}

        {/* Error messages */}
        {error && (
          <div className="mb-4 bg-destructive/10 border border-destructive/20 rounded-xl p-3 text-sm text-destructive">
            {error}
          </div>
        )}
        {sendError && (
          <div className="mb-4 bg-destructive/10 border border-destructive/20 rounded-xl p-3 text-sm text-destructive">
            {sendError}
          </div>
        )}

        {/* Action Buttons — Modo Texto */}
        {mode === "texto" && (
          <div className="flex flex-col gap-3">
            <Button
              onClick={handleSendToAI}
              disabled={!podeSalvar || sending}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {sending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processando com IA...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Enviar para IA
                </>
              )}
            </Button>
            <Button variant="outline" onClick={() => router.push("/audio")}>
              <X className="w-4 h-4 mr-2" />
              Voltar
            </Button>
          </div>
        )}

        {/* Action Buttons — Modo Audio apos gravacao */}
        {mode === "audio" && !recording && hasRecorded && (
          <div className="flex flex-col gap-3">
            <Button
              onClick={handleSendToAI}
              disabled={!podeSalvar || sending}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {sending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processando com IA...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Enviar para IA
                </>
              )}
            </Button>
            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" onClick={handleRestart}>
                <RotateCcw className="w-4 h-4 mr-2" />
                Gravar novamente
              </Button>
              <Button variant="outline" onClick={() => router.push("/audio")}>
                <X className="w-4 h-4 mr-2" />
                Cancelar
              </Button>
            </div>
          </div>
        )}

        {/* Voltar — Modo Audio sem gravacao */}
        {mode === "audio" && !recording && !hasRecorded && (
          <div className="text-center">
            <Button variant="outline" onClick={() => router.push("/audio")}>
              <X className="w-4 h-4 mr-2" />
              Voltar
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
