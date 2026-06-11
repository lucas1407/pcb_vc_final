import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

export default async function handler(req: any, res: any) {
  // CORS configuration for Vercel
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,PATCH,DELETE,POST,PUT");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
  );

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { imageData, mimeType } = req.body;
    if (!imageData || !mimeType) {
      return res.status(400).json({ error: "Missing imageData or mimeType" });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: "CONFIG_ERROR: Chave de API (GEMINI_API_KEY) não configurada no servidor." });
    }

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
                data: imageData.includes(',') ? imageData.split(',')[1] : imageData,
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

    const result = JSON.parse(response.text.trim());
    res.json(result);
  } catch (error: any) {
    console.error("Error analyzing PCB:", error);
    res.status(500).json({ error: error.message || "Failed to analyze image" });
  }
}
