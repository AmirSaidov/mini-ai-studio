import { useState } from "react";
import { Copy, Check, Bookmark, Loader2 } from "lucide-react";
import { toast } from "sonner";
import PageShell from "@/components/PageShell";
import { saveItem } from "@/lib/storage";

const TextGenerator = () => {
  const [prompt, setPrompt] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const generate = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setResult("");
    // Simulated generation
    await new Promise((r) => setTimeout(r, 1500));
    setResult(
      `Here is a generated response for: "${prompt}"\n\nLorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.`
    );
    setLoading(false);
  };

  const copy = async () => {
    await navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const save = () => {
    saveItem({ type: "text", prompt, result });
    toast.success("Saved to your collection");
  };

  return (
    <PageShell title="Text Generator">
      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Enter your prompt…"
        rows={4}
        className="w-full resize-none rounded-xl border border-input bg-card px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
      />

      <button
        onClick={generate}
        disabled={loading || !prompt.trim()}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 font-medium text-primary-foreground transition-opacity disabled:opacity-50"
      >
        {loading ? <Loader2 size={18} className="animate-spin" /> : null}
        {loading ? "Generating…" : "Generate"}
      </button>

      {result && (
        <div className="mt-6 rounded-xl border border-border bg-card p-5 shadow-sm">
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
            {result}
          </p>
          <div className="mt-4 flex gap-2">
            <button
              onClick={copy}
              className="flex items-center gap-1.5 rounded-lg bg-secondary px-3 py-2 text-sm text-secondary-foreground transition-colors hover:bg-secondary/80"
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              {copied ? "Copied" : "Copy"}
            </button>
            <button
              onClick={save}
              className="flex items-center gap-1.5 rounded-lg bg-secondary px-3 py-2 text-sm text-secondary-foreground transition-colors hover:bg-secondary/80"
            >
              <Bookmark size={14} />
              Save
            </button>
          </div>
        </div>
      )}
    </PageShell>
  );
};

export default TextGenerator;
