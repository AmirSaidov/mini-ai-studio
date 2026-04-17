const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY?.trim();
const GEMINI_TEXT_MODEL = import.meta.env.VITE_GEMINI_TEXT_MODEL?.trim();
const GEMINI_IMAGE_MODEL = import.meta.env.VITE_GEMINI_IMAGE_MODEL?.trim();
const GEMINI_BASE_URL = "https://generativelanguage.googleapis.com/v1beta";

interface GeminiTextResponse {
  candidates?: Array<{
    content?: {
      parts?: Array<{ text?: string }>;
    };
  }>;
  error?: {
    message?: string;
  };
}

interface GeminiImageResponse {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string;
        inlineData?: {
          mimeType?: string;
          data?: string;
        };
      }>;
    };
  }>;
  error?: {
    message?: string;
  };
}

interface GeminiModelsResponse {
  models?: Array<{
    name?: string;
    supportedGenerationMethods?: string[];
  }>;
  error?: {
    message?: string;
  };
}

class GeminiRequestError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "GeminiRequestError";
    this.status = status;
  }
}

const getApiKey = () => {
  if (!GEMINI_API_KEY) {
    throw new Error(
      "Gemini API key is missing. Set VITE_GEMINI_API_KEY in your .env file."
    );
  }
  return GEMINI_API_KEY;
};

let resolvedModelName: string | null = null;
let fallbackModelNames: string[] = [];

const getModelPath = (modelName: string) =>
  modelName.startsWith("models/") ? modelName : `models/${modelName}`;

const resolveTextModel = async (apiKey: string): Promise<string> => {
  if (resolvedModelName) {
    return resolvedModelName;
  }

  if (GEMINI_TEXT_MODEL) {
    resolvedModelName = getModelPath(GEMINI_TEXT_MODEL);
    return resolvedModelName;
  }

  const response = await fetch(`${GEMINI_BASE_URL}/models?key=${apiKey}`);
  const data = (await response.json()) as GeminiModelsResponse;

  if (!response.ok) {
    throw new Error(data.error?.message || "Failed to fetch available Gemini models.");
  }

  const preferredOrder = [
    "models/gemini-2.5-flash",
    "models/gemini-2.0-flash",
    "models/gemini-1.5-flash-latest",
    "models/gemini-1.5-flash",
    "models/gemini-pro",
  ];

  const generateContentModels = (data.models || []).filter((model) =>
    model.supportedGenerationMethods?.includes("generateContent")
  );

  const preferredModel = preferredOrder.find((preferred) =>
    generateContentModels.some((model) => model.name === preferred)
  );

  resolvedModelName =
    preferredModel ||
    generateContentModels.find((model) => model.name)?.name ||
    null;

  if (!resolvedModelName) {
    throw new Error("No Gemini model with generateContent support is available.");
  }

  fallbackModelNames = generateContentModels
    .map((model) => model.name)
    .filter((name): name is string => Boolean(name) && name !== resolvedModelName);

  return resolvedModelName;
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const isTransientModelOverload = (status: number, message: string) => {
  const normalized = message.toLowerCase();
  return (
    status === 429 ||
    normalized.includes("high demand") ||
    normalized.includes("try again later") ||
    normalized.includes("resource exhausted")
  );
};

const requestTextFromModel = async (
  apiKey: string,
  modelName: string,
  prompt: string
): Promise<string> => {
  const url = `${GEMINI_BASE_URL}/${modelName}:generateContent?key=${apiKey}`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
    }),
  });

  const data = (await response.json()) as GeminiTextResponse;
  const message = data.error?.message || "Failed to generate text.";

  if (!response.ok) {
    throw new GeminiRequestError(message, response.status);
  }

  const text =
    data.candidates?.[0]?.content?.parts
      ?.map((part) => part.text || "")
      .join("")
      .trim() || "";

  if (!text) {
    throw new Error("Gemini returned an empty response.");
  }

  return text;
};

export const generateText = async (prompt: string): Promise<string> => {
  const trimmedPrompt = prompt.trim();
  if (!trimmedPrompt) {
    throw new Error("Prompt is required.");
  }

  const apiKey = getApiKey();
  const modelName = await resolveTextModel(apiKey);
  const modelQueue = [modelName, ...fallbackModelNames];
  let lastError: Error | null = null;

  for (const currentModel of modelQueue) {
    for (let attempt = 0; attempt < 3; attempt += 1) {
      try {
        return await requestTextFromModel(apiKey, currentModel, trimmedPrompt);
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to generate text.";
        const status = error instanceof GeminiRequestError ? error.status : 0;
        lastError = error instanceof Error ? error : new Error(message);

        if (!isTransientModelOverload(status, message) || attempt === 2) {
          break;
        }

        // Exponential-ish backoff: 600ms, 1200ms
        await sleep(600 * (attempt + 1));
      }
    }
  }

  throw (
    lastError ||
    new Error(
      "Gemini text generation is temporarily overloaded. Please retry in a few moments."
    )
  );
};

export const generateImage = async (prompt: string): Promise<string> => {
  const trimmedPrompt = prompt.trim();
  if (!trimmedPrompt) {
    throw new Error("Prompt is required.");
  }

  const apiKey = getApiKey();
  const imageModel = getModelPath(
    GEMINI_IMAGE_MODEL || "gemini-2.0-flash-preview-image-generation"
  );
  const url = `${GEMINI_BASE_URL}/${imageModel}:generateContent?key=${apiKey}`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      contents: [{ parts: [{ text: trimmedPrompt }] }],
      generationConfig: {
        responseModalities: ["TEXT", "IMAGE"],
      },
    }),
  });

  const data = (await response.json()) as GeminiImageResponse;
  if (!response.ok) {
    throw new Error(data.error?.message || "Failed to generate image.");
  }

  const imagePart = data.candidates?.[0]?.content?.parts?.find(
    (part) => part.inlineData?.data
  );
  const base64 = imagePart?.inlineData?.data;
  const mimeType = imagePart?.inlineData?.mimeType || "image/png";

  if (!base64) {
    throw new Error(
      "Gemini did not return an image. Try another image model in VITE_GEMINI_IMAGE_MODEL."
    );
  }

  return `data:${mimeType};base64,${base64}`;
};
