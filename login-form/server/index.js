import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Load .env.local file
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.join(__dirname, ".env.local");
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, "utf-8");
  content.split("\n").forEach((line) => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#")) {
      const [key, ...valueParts] = trimmed.split("=");
      if (key) {
        process.env[key.trim()] = valueParts.join("=").trim();
      }
    }
  });
}

const app = express();
app.use(cors());

// Get OpenAI API key from environment
const OPENAI_API_KEY = process.env.REACT_APP_OPEN_AI_KEY;
if (!OPENAI_API_KEY) {
  console.warn('Warning: REACT_APP_OPEN_AI_KEY environment variable not set');
  console.log('Hint: Create .env.local with REACT_APP_OPEN_AI_KEY=your_key or set env var before npm start');
}

app.get("/api/openai-session", async (req, res) => {
  if (!OPENAI_API_KEY) {
    return res.status(500).json({ error: "OpenAI API key not configured" });
  }

  const r = await fetch("https://api.openai.com/v1/realtime/sessions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "gpt-4o-realtime-preview",
      voice: "alloy"
    })
  });

  const data = await r.json();
  if (!r.ok) {
    console.error("OpenAI API error:", data);
    return res.status(r.status).json(data);
  }

  res.json(data);
});

app.listen(3001, () => {
  console.log("Backend running on http://localhost:3001");
});
