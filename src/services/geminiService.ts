import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface PCBAnalysisResult {
  summary: string;
  boardType: string;
  confidence: number;
  componentsFound: {
    name: string;
    description: string;
    location: string;
    status: "ok" | "warning" | "error";
  }[];
  damageDetected: {
    type: string;
    severity: "low" | "medium" | "high";
    description: string;
    rect?: [number, number, number, number]; // [ymin, xmin, ymax, xmax] normalize to 1000
  }[];
  repairSuggestions: string[];
}

export async function analyzePCB(imageData: string, mimeType: string): Promise<PCBAnalysisResult> {
  const prompt = `Você é uma IA de diagnóstico de PCB de alta precisão. Analise a imagem fornecida de uma Placa de Circuito Impresso.
  
  Tarefas:
  1. Identifique o tipo de placa (placa-mãe, fonte de alimentação, controlador, etc.).
  2. Localize e identifique os principais componentes (ICs, capacitores, resistores, conectores).
  3. Detecte sinais de danos:
     - Componentes queimados (carbonização, descoloração).
     - Capacitores eletrolíticos estufados ou vazando.
     - Trilhas ou pads corroídos (fuzz verde/branco típico).
     - Juntas de solda quebradas ou rachadas.
     - Resíduos de danos por líquidos.
     - Componentes ausentes.
  
  Forneça a análise em formato JSON estrito. Responda tudo em PORTUGUÊS.`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [
      {
        parts: [
          {
            inlineData: {
              data: imageData.split(',')[1],
              mimeType: mimeType
            }
          },
          { text: prompt }
        ]
      }
    ],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          summary: { type: Type.STRING },
          boardType: { type: Type.STRING },
          confidence: { type: Type.NUMBER },
          componentsFound: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                description: { type: Type.STRING },
                location: { type: Type.STRING },
                status: { type: Type.STRING, enum: ["ok", "warning", "error"] }
              },
              required: ["name", "status"]
            }
          },
          damageDetected: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                type: { type: Type.STRING },
                severity: { type: Type.STRING, enum: ["low", "medium", "high"] },
                description: { type: Type.STRING },
                rect: {
                  type: Type.ARRAY,
                  items: { type: Type.NUMBER },
                  description: "[ymin, xmin, ymax, xmax] normalized 0-1000"
                }
              },
              required: ["type", "severity", "description"]
            }
          },
          repairSuggestions: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          }
        },
        required: ["summary", "boardType", "componentsFound", "damageDetected"]
      }
    }
  });

  if (!response.text) {
    throw new Error("Empty response from AI");
  }

  return JSON.parse(response.text.trim());
}
