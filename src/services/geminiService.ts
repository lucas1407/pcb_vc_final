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
    const errorData = await response.json().catch(() => ({}));
    if (errorData.error && errorData.error.includes("CONFIG_ERROR")) {
      throw new Error("CONFIG_ERROR");
    }
    throw new Error(errorData.error || `Erro de rede: ${response.status}`);
  }

  return response.json();
}
