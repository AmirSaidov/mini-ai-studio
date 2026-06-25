import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import OpenAI from "openai";

dotenv.config();

const app = express();
const port = Number(process.env.PORT ?? 8787);
const textModel = process.env.OPENROUTER_TEXT_MODEL ?? "openrouter/free";
const imageMode = process.env.IMAGE_MODE ?? "demo";
const apiKey = process.env.OPENROUTER_API_KEY;

const hashString = (value) => {
  let hash = 0;

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(index);
    hash |= 0;
  }

  return Math.abs(hash);
};

const palette = [
  ["#0f172a", "#1d4ed8", "#38bdf8"],
  ["#111827", "#7c3aed", "#ec4899"],
  ["#082f49", "#0f766e", "#22c55e"],
  ["#1f2937", "#ea580c", "#facc15"],
  ["#172554", "#2563eb", "#a78bfa"],
];

const pickPalette = (prompt) => palette[hashString(prompt) % palette.length];

const buildImageSvg = (prompt) => {
  const [dark, accent, highlight] = pickPalette(prompt);

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800" role="img" aria-label="Demo generated image preview">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${dark}" />
      <stop offset="55%" stop-color="${accent}" />
      <stop offset="100%" stop-color="${highlight}" />
    </linearGradient>
  </defs>
  <rect width="1200" height="800" fill="url(#bg)" />
  <circle cx="970" cy="160" r="150" fill="rgba(255,255,255,0.12)" />
  <circle cx="250" cy="180" r="110" fill="rgba(255,255,255,0.10)" />
  <circle cx="1040" cy="640" r="220" fill="rgba(255,255,255,0.08)" />
  <rect x="90" y="110" width="1020" height="580" rx="36" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.18)" />
  <path d="M180 590C270 420 380 360 520 390C650 420 770 520 900 300" fill="none" stroke="rgba(255,255,255,0.4)" stroke-width="18" stroke-linecap="round" stroke-linejoin="round" />
  <text x="140" y="210" fill="white" font-size="46" font-family="Arial, sans-serif" font-weight="700">Demo image mode</text>
  <text x="140" y="285" fill="rgba(255,255,255,0.92)" font-size="28" font-family="Arial, sans-serif">Image preview for presentation</text>
  <foreignObject x="140" y="335" width="860" height="220">
    <div xmlns="http://www.w3.org/1999/xhtml" style="color:white;font-family:Arial,sans-serif;font-size:34px;line-height:1.35;">
      Visual demo placeholder
    </div>
  </foreignObject>
</svg>`;
};

const svgToDataUrl = (svg) => `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;

if (!apiKey) {
  throw new Error("OPENROUTER_API_KEY is missing. Add it to your .env file.");
}

const client = new OpenAI({
  apiKey,
  baseURL: "https://openrouter.ai/api/v1",
  defaultHeaders: {
    "HTTP-Referer": process.env.APP_URL ?? "http://localhost:3000",
    "X-Title": "Mini AI Studio",
  },
});

app.use(cors());
app.use(express.json({ limit: "2mb" }));

app.get("/api/health", (_request, response) => {
  response.json({
    ok: true,
    provider: "openrouter",
    textModel,
    imageMode,
  });
});

app.post("/api/text", async (request, response) => {
  const prompt = typeof request.body?.prompt === "string" ? request.body.prompt.trim() : "";

  if (!prompt) {
    response.status(400).json({ error: "Prompt is required." });
    return;
  }

  try {
    const result = await client.chat.completions.create({
      model: textModel,
      messages: [
        {
          role: "system",
          content: "You are a helpful AI assistant inside a student demo app. Keep answers clear and concise.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const text = result.choices?.[0]?.message?.content?.trim();

    if (!text) {
      response.status(502).json({ error: "OpenRouter returned an empty text response." });
      return;
    }

    response.json({ text });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to generate text.";
    response.status(500).json({ error: message });
  }
});

app.post("/api/image", async (request, response) => {
  const prompt = typeof request.body?.prompt === "string" ? request.body.prompt.trim() : "";

  if (!prompt) {
    response.status(400).json({ error: "Prompt is required." });
    return;
  }

  try {
    response.json({
      imageUrl: svgToDataUrl(buildImageSvg(prompt)),
      demoMode: imageMode === "demo",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to generate image.";
    response.status(500).json({ error: message });
  }
});

app.listen(port, () => {
  console.log(`Mini AI Studio API listening on http://localhost:${port}`);
});
