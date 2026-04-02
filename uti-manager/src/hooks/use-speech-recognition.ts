"use client";
import { useState, useRef, useCallback, useEffect } from "react";

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionInstance extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  start(): void;
  stop(): void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: Event & { error: string }) => void) | null;
  onend: (() => void) | null;
}

interface UseSpeechRecognitionReturn {
  transcription: string;
  setTranscription: (value: string) => void;
  recording: boolean;
  seconds: number;
  speechAvailable: boolean;
  error: string | null;
  startRecording: () => void;
  stopRecording: () => void;
  formatTime: (seconds: number) => string;
}

export function useSpeechRecognition(): UseSpeechRecognitionReturn {
  const [transcription, setTranscription] = useState("");
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const finalTranscriptRef = useRef("");

  const [speechAvailable, setSpeechAvailable] = useState(false);

  const getSpeechAPI = () => {
    if (typeof window === "undefined") return null;
    const w = window as unknown as Record<string, unknown>;
    return (w.SpeechRecognition || w.webkitSpeechRecognition) as
      | (new () => SpeechRecognitionInstance)
      | null;
  };

  useEffect(() => {
    setSpeechAvailable(!!getSpeechAPI());
  }, []);

  // Sync ref when user edits transcription manually
  useEffect(() => {
    if (!recognitionRef.current) {
      finalTranscriptRef.current = transcription;
    }
  }, [transcription]);

  const startRecording = useCallback(() => {
    const SpeechRecognitionAPI = getSpeechAPI();
    if (!SpeechRecognitionAPI) return;
    setError(null);

    const recognition = new SpeechRecognitionAPI();
    recognition.lang = "pt-BR";
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    // Use ref to avoid stale closure
    finalTranscriptRef.current = transcription;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const t = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscriptRef.current += (finalTranscriptRef.current ? " " : "") + t;
        } else {
          interim = t;
        }
      }
      setTranscription(
        finalTranscriptRef.current + (interim ? " " + interim : "")
      );
    };

    recognition.onerror = (e: Event & { error: string }) => {
      if (e.error !== "no-speech") setError(`Erro: ${e.error}`);
    };

    recognition.onend = () => {
      // Auto-restart if still recording (browser stops after silence)
      if (recognitionRef.current) {
        try {
          recognition.start();
        } catch {
          // ignore restart errors
        }
      }
    };

    try {
      recognition.start();
      recognitionRef.current = recognition;
      setRecording(true);
      setSeconds(0);
      intervalRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
    } catch {
      setError("Microfone indisponivel.");
    }
  }, [transcription]);

  const stopRecording = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.onend = null;
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setRecording(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
  }, []);

  useEffect(() => {
    return () => {
      stopRecording();
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [stopRecording]);

  const formatTime = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  return {
    transcription,
    setTranscription,
    recording,
    seconds,
    speechAvailable,
    error,
    startRecording,
    stopRecording,
    formatTime,
  };
}
