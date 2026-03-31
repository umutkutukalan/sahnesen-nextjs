// src/app/api/generate/route.ts
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const { prompt, context } = await req.json();

  // Burada OpenAI veya Gemini API'ına istek atıyoruz
  // Örnek: const response = await fetch('https://api.openai.com/v1/chat/completions', ...)
  
  // Şimdilik simüle edelim (Test için):
  const aiSuggestion = `...bu yolculuğun sonunda bizi bekleyen ışık, aslında en başından beri içimizde taşıdığımız umudun ta kendisiydi.`;

  return NextResponse.json({ text: aiSuggestion });
}