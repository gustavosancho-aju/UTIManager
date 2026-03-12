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

  const [speechAvailable, setSpeechAvailable] = useState(false);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const getSpeechAPI = () =>
    typeof window !== "undefined"
      ? (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      : null;

  useEffect(() => {
    setSpeechAvailable(!!getSpeechAPI());
  }, []);

  const startRecording = useCallback(() => {
    const SpeechRecognitionAPI = getSpeechAPI();
    if (!SpeechRecognitionAPI) return;
    setError(null);

    const recognition = new SpeechRecognitionAPI();
    recognition.lang = "pt-BR";
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    let finalTranscript = transcription;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const t = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += (finalTranscript ? " " : "") + t;
        } else {
          interim = t;
        }
      }
      setTranscription(finalTranscript + (interim ? " " + interim : ""));
    };

    recognition.onerror = (e: Event & { error: string }) => {
      if (e.error !== "no-speech") setError(`Erro: ${e.error}`);
    };

    recognition.onend = () => {
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
      setError("Microfone indisponível.");
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
