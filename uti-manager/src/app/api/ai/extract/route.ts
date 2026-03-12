import { NextRequest, NextResponse } from "next/server";

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
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "GEMINI_API_KEY not configured" },
      { status: 500 }
    );
  }

  try {
    const { transcription } = await request.json();

    if (!transcription || typeof transcription !== "string") {
      return NextResponse.json(
        { error: "transcription is required" },
        { status: 400 }
      );
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite-preview:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system_instruction: {
            parts: [{ text: AI_SYSTEM_PROMPT }],
          },
          contents: [
            {
              role: "user",
              parts: [
                {
                  text: `Transcrição do áudio médico:\n\n"${transcription}"`,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 1000,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: "AI API error", details: errorText },
        { status: response.status }
      );
    }

    const data = await response.json();
    const rawText =
      data.candidates?.[0]?.content?.parts
        ?.map((p: { text?: string }) => p.text || "")
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
