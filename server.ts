import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

// Load environment variables in local development
dotenv.config();

const app = express();
const PORT = 3000;

// Setup body parsers with sufficient limit for base64 image payloads
app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ limit: "20mb", extended: true }));

// Helper to check and retrieve Gemini API Key
const getApiKey = () => {
  const key = process.env.GEMINI_API_KEY;
  if (!key || key === "MY_GEMINI_API_KEY" || key === "") {
    return null;
  }
  return key;
};

// Lazy initialize GoogleGenAI client
let aiInstance: GoogleGenAI | null = null;
const getAiClient = () => {
  if (!aiInstance) {
    const key = getApiKey();
    if (!key) {
      throw new Error("CONFIG_ERROR: A chave de API do Gemini (GEMINI_API_KEY) não está configurada no servidor.");
    }
    aiInstance = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiInstance;
};

// API Endpoint for PCB Analysis
app.post("/api/analyze-pcb", async (req, res) => {
  try {
    const { imageData, mimeType } = req.body;

    if (!imageData || !mimeType) {
      return res.status(400).json({ error: "Imagem e tipo MIME são obrigatórios." });
    }

    const ai = getAiClient();
    
    // Extrahindo base64 limpo (sem cabeçalho de data URL, se houver)
    const base64Data = imageData.includes(",") 
      ? imageData.split(",")[1] 
      : imageData;

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
      model: "gemini-3.5-flash",
      contents: [
        {
          parts: [
            {
              inlineData: {
                data: base64Data,
                mimeType: mimeType,
              },
            },
            { text: prompt },
          ],
        },
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
                  status: { type: Type.STRING, enum: ["ok", "warning", "error"] },
                },
                required: ["name", "status"],
              },
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
                    description: "[ymin, xmin, ymax, xmax] normalized 0-1000",
                  },
                },
                required: ["type", "severity", "description"],
              },
            },
            repairSuggestions: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
          },
          required: ["summary", "boardType", "componentsFound", "damageDetected"],
        },
      },
    });

    if (!response.text) {
      throw new Error("Resposta vazia da inteligência artificial.");
    }

    const parsedResult = JSON.parse(response.text.trim());
    return res.json(parsedResult);

  } catch (error: any) {
    console.error("Erro na análise de PCB server-side:", error);
    const isConfigError = error.message?.includes("CONFIG_ERROR") || !process.env.GEMINI_API_KEY;
    return res.status(500).json({ 
      error: isConfigError 
        ? "CONFIG_ERROR: A chave de API do Gemini (GEMINI_API_KEY) não está configurada no servidor."
        : `Erro no processamento da imagem: ${error.message || error}`
    });
  }
});

// Setup development or production build orchestration
async function setupServer() {
  if (process.env.NODE_ENV !== "production") {
    console.log("Iniciando servidor em modo de desenvolvimento com middleware Vite...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Iniciando servidor em modo de produção escutando à pasta dist...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Servidor rodando nominalmente no endereço: http://localhost:${PORT}`);
  });
}

setupServer();
