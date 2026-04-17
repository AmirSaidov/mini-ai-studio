const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const hashString = (value: string) => {
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
] as const;

const pickPalette = (prompt: string) => palette[hashString(prompt) % palette.length];

const buildTextResponse = () =>
  [
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
    "Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
    "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.",
  ].join("\n\n");

const buildImageSvg = (prompt: string) => {
  const [dark, accent, highlight] = pickPalette(prompt);

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800" role="img" aria-label="Generated image preview">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${dark}" />
      <stop offset="55%" stop-color="${accent}" />
      <stop offset="100%" stop-color="${highlight}" />
    </linearGradient>
    <linearGradient id="glass" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="rgba(255,255,255,0.22)" />
      <stop offset="100%" stop-color="rgba(255,255,255,0.06)" />
    </linearGradient>
  </defs>
  <rect width="1200" height="800" fill="url(#bg)" />
  <circle cx="970" cy="160" r="150" fill="rgba(255,255,255,0.12)" />
  <circle cx="250" cy="180" r="110" fill="rgba(255,255,255,0.10)" />
  <circle cx="1040" cy="640" r="220" fill="rgba(255,255,255,0.08)" />
  <circle cx="620" cy="410" r="190" fill="rgba(255,255,255,0.14)" />
  <rect x="90" y="110" width="1020" height="580" rx="36" fill="url(#glass)" stroke="rgba(255,255,255,0.18)" />
  <path d="M180 590C270 420 380 360 520 390C650 420 770 520 900 300" fill="none" stroke="rgba(255,255,255,0.4)" stroke-width="18" stroke-linecap="round" stroke-linejoin="round" />
  <path d="M190 520C330 470 420 520 540 590C690 680 820 650 990 470" fill="none" stroke="rgba(255,255,255,0.22)" stroke-width="12" stroke-linecap="round" stroke-linejoin="round" />
  <rect x="170" y="170" width="220" height="220" rx="40" fill="rgba(255,255,255,0.16)" />
  <circle cx="780" cy="250" r="95" fill="rgba(255,255,255,0.18)" />
  <circle cx="840" cy="520" r="130" fill="rgba(255,255,255,0.12)" />
</svg>`;
};

const svgToDataUrl = (svg: string) =>
  `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;

export const generateText = async (prompt: string): Promise<string> => {
  const trimmedPrompt = prompt.trim();

  if (!trimmedPrompt) {
    throw new Error("Prompt is required.");
  }

  await sleep(700);
  return buildTextResponse();
};

export const generateImage = async (prompt: string): Promise<string> => {
  const trimmedPrompt = prompt.trim();

  if (!trimmedPrompt) {
    throw new Error("Prompt is required.");
  }

  await sleep(900);
  return svgToDataUrl(buildImageSvg(trimmedPrompt));
};
