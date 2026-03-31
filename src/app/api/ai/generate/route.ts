import { AI_CONFIG } from "@/lib/ai/prompts";
import { GoogleGenAI, ThinkingLevel } from "@google/genai";
import { NextResponse } from "next/server";

// Client'ı dışarıda tanımlayalım
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { context } = await req.json();

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview", // Senin bulduğun güncel model
      contents: `${AI_CONFIG.SENTIMENT_ANALYSIS_PROMPT} ${context} `,
      config: {
        thinkingConfig: {
          thinkingLevel: ThinkingLevel.LOW, // Hızlı yanıt için düşük düşünme seviyesi
        },
      },
    });

    const aiText = response.text;

    return NextResponse.json({ text: aiText });
  } catch (error: any) {
    console.error("Gemini 3 Hatası:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
