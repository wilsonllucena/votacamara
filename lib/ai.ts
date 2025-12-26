import { GoogleGenerativeAI } from "@google/generative-ai";
import OpenAI from "openai";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || "";

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

export type AIProvider = "gemini" | "openai";

export interface AISummaryResult {
  title: string;
  summary: string;
}

export async function generateSummary(text: string, provider: AIProvider = "gemini"): Promise<AISummaryResult> {
  const prompt = `Analise o seguinte texto de um projeto de lei e gere dois itens:
1. Um TÍTULO sugestivo e formal (ex: "Projeto de lei que autoriza...", "Projeto de lei que dispõe sobre...") de no máximo 15 palavras.
2. Uma EMENTA (resumo) (ex: "O projeto visa autorizar...", "O projeto visa dispor sobre...") concisa de no máximo 5 linhas.

Responda EXATAMENTE no formato abaixo, sem textos adicionais:
TITULO: [Seu título aqui]
RESUMO: [Seu resumo aqui]

Texto do projeto:
${text}`;

  if (provider === "gemini") {
    if (!GEMINI_API_KEY) throw new Error("GEMINI_API_KEY não configurada.");
    
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const output = response.text().trim();
    
    const titleMatch = output.match(/TITULO:\s*(.*)/i);
    const summaryMatch = output.match(/RESUMO:\s*([\s\S]*)/i);
    
    return {
      title: titleMatch ? titleMatch[1].trim() : "Novo Projeto de Lei",
      summary: summaryMatch ? summaryMatch[1].trim() : output
    };
  } else {
    if (!OPENAI_API_KEY) throw new Error("OPENAI_API_KEY não configurada.");

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 300,
    });
    const output = response.choices[0].message.content?.trim() || "";
    
    const titleMatch = output.match(/TITULO:\s*(.*)/i);
    const summaryMatch = output.match(/RESUMO:\s*([\s\S]*)/i);
    
    return {
      title: titleMatch ? titleMatch[1].trim() : "Novo Projeto de Lei",
      summary: summaryMatch ? summaryMatch[1].trim() : output
    };
  }
}

export async function generateEmbeddings(text: string, provider: AIProvider = "gemini"): Promise<number[]> {
  if (provider === "gemini") {
    if (!GEMINI_API_KEY) throw new Error("GEMINI_API_KEY não configurada.");
    const model = genAI.getGenerativeModel({ model: "text-embedding-004" });
    const result = await model.embedContent(text);
    return result.embedding.values;
  } else {
    if (!OPENAI_API_KEY) throw new Error("OPENAI_API_KEY não configurada.");
    const response = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: text,
      encoding_format: "float",
    });
    return response.data[0].embedding;
  }
}
