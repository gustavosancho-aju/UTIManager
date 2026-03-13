import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

// --- Rate Limiting (in-memory, per-user) ---
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_MAX = 30; // requests
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute

function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(userId);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(userId, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }

  if (entry.count >= RATE_LIMIT_MAX) {
    return false;
  }

  entry.count++;
  return true;
}

// --- Sanitization ---
function sanitizeTranscription(text: string): string {
  return text
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "") // control chars
    .trim();
}

const AI_SYSTEM_PROMPT = `Você é um assistente médico especializado em UTI. Receba a transcrição de um áudio médico e extraia dados estruturados.

REGRAS:
- Extraia APENAS o que foi explicitamente mencionado
- Use null para campos não mencionados
- Para dispositivos, marque active: true/false baseado no contexto
- PA deve estar no formato "XXX/XX" (converter "10 por 6" para "100/60")
- Temperatura: número decimal
- FC e SatO2: números inteiros
- DVA: inclua droga e dose exatamente como mencionado (ml/h ou mcg/kg/min)
- RASS: string (pode ser número ou "Coma", "Agitado", etc)
- bed: número do leito se mencionado

Responda APENAS com JSON válido, sem markdown, sem backticks, sem explicação:
{
  "gender": "M" ou "F" ou null,
  "initials": "XXX" ou null,
  "bed": "XX" ou null,
  "admissionDate": "YYYY-MM-DD" ou null,
  "admissionReason": "texto" ou null,
  "mainDiagnosis": "texto" ou null,
  "clinicalCondition": "texto" ou null,
  "devices": {
    "tot": { "active": bool, "details": "texto" },
    "sondaVesical": { "active": bool, "details": "texto" },
    "acessoVenoso": { "active": bool, "details": "texto" },
    "sng": { "active": bool, "details": "texto" },
    "sne": { "active": bool, "details": "texto" },
    "dva": { "active": bool, "details": "texto" }
  },
  "ventilation": { "mode": "texto", "fio2": "texto", "peep": "texto" },
  "sedation": { "drugs": "texto", "rass": "texto" },
  "antibiotics": "texto",
  "hemodynamics": "texto",
  "diuresis": "texto",
  "vitalSigns": { "pa": "XXX/XX", "fc": numero, "temp": numero, "sato2": numero }
}`;

export async function POST(request: NextRequest) {
  // --- 1. Auth check (explicit, not relying only on middleware) ---
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll() {
          // Route handler — no cookie setting needed
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // --- 2. Rate limiting ---
  if (!checkRateLimit(user.id)) {
    return NextResponse.json(
      { error: "Rate limit exceeded. Try again in 1 minute." },
      { status: 429 }
    );
  }

  // --- 3. API key check ---
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "AI service not configured" },
      { status: 500 }
    );
  }

  try {
    const { transcription } = await request.json();

    // --- 4. Input validation ---
    if (!transcription || typeof transcription !== "string") {
      return NextResponse.json(
        { error: "transcription is required" },
        { status: 400 }
      );
    }

    if (transcription.length > 50000) {
      return NextResponse.json(
        { error: "transcription too long (max 50000 chars)" },
        { status: 400 }
      );
    }

    // --- 5. Sanitize input ---
    const cleanTranscription = sanitizeTranscription(transcription);
    if (cleanTranscription.length === 0) {
      return NextResponse.json(
        { error: "transcription is empty after sanitization" },
        { status: 400 }
      );
    }

    // --- 6. Call Claude API ---
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 1024,
        temperature: 0,
        system: AI_SYSTEM_PROMPT,
        messages: [
          {
            role: "user",
            content: `Transcrição do áudio médico:\n\n"${cleanTranscription}"`,
          },
        ],
      }),
    });

    if (!response.ok) {
      console.error("Anthropic API error:", response.status);
      return NextResponse.json(
        { error: "AI service temporarily unavailable" },
        { status: 502 }
      );
    }

    const data = await response.json();
    const rawText =
      data.content
        ?.map((block: { type: string; text?: string }) =>
          block.type === "text" ? block.text || "" : ""
        )
        .join("") || "";
    const clean = rawText.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(clean);

    return NextResponse.json({ extracted: parsed });
  } catch (error) {
    console.error("AI extraction error:", error);
    return NextResponse.json(
      { error: "Failed to process transcription" },
      { status: 500 }
    );
  }
}
