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
  const response = await fetch("/api/analyze-pcb", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ imageData, mimeType }),
  });

  if (!response.ok) {
    let errorMessage = "Falha no diagnóstico da placa.";
    try {
      const errorData = await response.json();
      if (errorData && errorData.error) {
        errorMessage = errorData.error;
      }
    } catch {
      // Fallback if response is not JSON
      try {
        const textData = await response.text();
        if (textData) errorMessage = textData;
      } catch {}
    }
    throw new Error(errorMessage);
  }

  return response.json();
}
