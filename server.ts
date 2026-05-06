import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '1mb' }));

  // Mock Prediction Endpoint (Node.js fallback for the scikit-learn one)
  app.post("/api/predict", (req, res) => {
    const { data } = req.body;
    
    // In a real scenario, this could spawn a python process or use a WASM model
    // For this demonstration, we'll provide a high-confidence mock
    // or the user can use the Gemini API directly from the frontend.
    const prediction = Math.floor(Math.random() * 10);
    const confidence = 0.85 + Math.random() * 0.14;
    
    res.json({
      prediction: prediction.toString(),
      confidence: confidence
    });
  });

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", engine: "Node.js/Express" });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Production serving
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running at http://localhost:${PORT}`);
    console.log(`Note: This Node.js server is serving the React frontend.`);
    console.log(`The Python files (app.py, model_train.py) are provided as requested for external deployment.`);
  });
}

startServer();
