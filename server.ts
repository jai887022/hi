import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route for Gemini Chat
  app.post("/api/chat", async (req, res) => {
    try {
      const { history } = req.body;
      
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({
          error: "API Key Missing",
          message: "Please configure your GEMINI_API_KEY in the Settings > Secrets panel of Google AI Studio."
        });
      }

      // Initialize GoogleGenAI SDK safely
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });

      // Format custom history into GoogleGenAI content schema
      // Format must be { role: 'user' | 'model', parts: [{ text: string }] }
      const contents = (history || []).map((msg: any) => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }],
      }));

      // Fallback if empty history is sent
      if (contents.length === 0) {
        return res.status(400).json({ error: "Empty chat history" });
      }

      // Query Gemini model
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents,
        config: {
          systemInstruction: "You are Aura, an elegant, encouraging, personal productivity workspace companion. You are integrated directly into the 'Aura Workspace' application, which includes a Kanban Task Board, a Markdown Note Scratchpad, and a Pomodoro clock. Assist users with scheduling, task optimization, brainstorms, or drafting copy. Keep answers beautifully structured in crisp, short paragraphs. You can use markdown tables or bullets to make statements visual. Keep a supportive, calm, intellectual tone.",
        },
      });

      res.json({ text: response.text || "I was unable to formulate a response." });
    } catch (err: any) {
      console.error("Gemini API server error:", err);
      res.status(500).json({
        error: "Failed to generate AI response",
        message: err.message || "An unknown error occurred while communicating with Gemini."
      });
    }
  });

  // Serve static files & Vite middleware
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server starting on http://localhost:${PORT}`);
  });
}

startServer();
