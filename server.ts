import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import pcbAnalysisHandler from "./api/analyze-pcb.js";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Body parser for base64 image data
  app.use(express.json({ limit: "50mb" }));

  // API Route for PCB analysis - routed directly to the unified handler
  app.post("/api/analyze-pcb", pcbAnalysisHandler);

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
