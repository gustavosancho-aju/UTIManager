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
    <div className="max-w-2xl mx-auto">
      {/* Patient info */}
      {patient && (
        <div className="mb-6 bg-white rounded-2xl border border-sky-200 p-4 text-center">
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
              ? "bg-sky-500 text-white shadow-md shadow-sky-500/25"
              : "bg-white text-muted-foreground border border-border hover:bg-muted/50"
          }`}
        >
          <AudioLines className="w-4 h-4" />
          Áudio
        </button>
        <button
          onClick={() => handleSwitchMode("texto")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
            mode === "texto"
              ? "bg-sky-500 text-white shadow-md shadow-sky-500/25"
              : "bg-white text-muted-foreground border border-border hover:bg-muted/50"
          }`}
        >
          <Keyboard className="w-4 h-4" />
          Digitar
        </button>
      </div>

      {/* ==================== MODO ÁUDIO ==================== */}
      {mode === "audio" && (
        <>
          {/* Speech not available warning */}
          {!speechAvailable && (
            <div className="mb-6 bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
              <p className="text-sm text-amber-800">
                Reconhecimento de voz não disponível neste navegador. Use o Google
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
                  : "bg-gradient-to-br from-sky-500 to-sky-400 shadow-sky-500/30 hover:shadow-sky-500/50 hover:scale-105"
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {recording ? (
                <MicOff className="w-12 h-12 text-white" />
              ) : (
                <Mic className="w-12 h-12 text-white" />
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
                {hasRecorded ? "Gravação finalizada" : "Toque para gravar"}
              </p>
            )}
          </div>

          {/* Transcription */}
          <div className="bg-white rounded-2xl border border-border p-4 mb-6">
            <label className="text-sm font-semibold text-foreground mb-2 block">
              Transcrição
            </label>
            <Textarea
              value={transcription}
              onChange={(e) => setTranscription(e.target.value)}
              readOnly={recording}
              placeholder={
                recording
                  ? "Ouvindo..."
                  : "A transcrição aparecerá aqui. Você pode editar após parar a gravação."
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
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-sky-500 to-sky-400 flex items-center justify-center shadow-lg shadow-sky-500/25">
              <Keyboard className="w-9 h-9 text-white" />
            </div>
            <p className="text-sm text-muted-foreground">
              Digite a evolução médica abaixo
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-border p-4 mb-6">
            <label className="text-sm font-semibold text-foreground mb-2 block">
              Texto da evolução
            </label>
            <Textarea
              value={textoManual}
              onChange={(e) => setTextoManual(e.target.value)}
              placeholder="Ex: Paciente masculino, leito 3, iniciais JMS. PA 120/80, FC 88, Temp 36.8, SatO2 98%. Em ventilação mecânica modo PCV, FiO2 40%, PEEP 8. Noradrenalina 0.1 mcg/kg/min..."
              rows={8}
              className="resize-none"
            />
            <p className="text-[11px] text-muted-foreground mt-2">
              Descreva o estado do paciente como faria em um áudio. A IA irá extrair os dados estruturados.
            </p>
          </div>
        </>
      )}

      {/* Error messages */}
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700">
          {error}
        </div>
      )}
      {sendError && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700">
          {sendError}
        </div>
      )}

      {/* Action Buttons — Modo Texto (sempre visível) */}
      {mode === "texto" && (
        <div className="flex flex-col gap-3">
          <Button
            onClick={handleSendToAI}
            disabled={!podeSalvar || sending}
            className="w-full bg-gradient-to-r from-sky-500 to-sky-400 hover:from-sky-600 hover:to-sky-500 text-white"
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

      {/* Action Buttons — Modo Áudio após gravação */}
      {mode === "audio" && !recording && hasRecorded && (
        <div className="flex flex-col gap-3">
          <Button
            onClick={handleSendToAI}
            disabled={!podeSalvar || sending}
            className="w-full bg-gradient-to-r from-sky-500 to-sky-400 hover:from-sky-600 hover:to-sky-500 text-white"
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

      {/* Voltar — Modo Áudio sem gravação */}
      {mode === "audio" && !recording && !hasRecorded && (
        <div className="text-center">
          <Button variant="outline" onClick={() => router.push("/audio")}>
            <X className="w-4 h-4 mr-2" />
            Voltar
          </Button>
        </div>
      )}
    </div>
  );
}
