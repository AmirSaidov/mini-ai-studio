import { useState } from "react";
import { Download, Bookmark, Loader2, ImageIcon } from "lucide-react";
import { toast } from "sonner";
import PageShell from "@/components/PageShell";
import { saveItem } from "@/lib/storage";
import { useAppStore } from "@/store/appStore";
import { generateImage } from "@/services/gemini";

const ImageGenerator = () => {
  const [imageUrl, setImageUrl] = useState("");
  const { prompt, loading, setPrompt, setLoading, syncSaved } = useAppStore();

  const generate = async () => {
    if (!prompt.trim()) {
      toast.error("Please enter a prompt");
      return;
    }

    setLoading(true);
    setImageUrl("");
    try {
      const generatedImageUrl = await generateImage(prompt);
      setImageUrl(generatedImageUrl);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to generate image";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const download = () => {
    const a = document.createElement("a");
    a.href = imageUrl;
    a.download = "ai-generated.png";
    a.target = "_blank";
    a.click();
  };

  const save = () => {
    if (!imageUrl) return;
    saveItem({ type: "image", prompt, result: imageUrl });
    syncSaved();
    toast.success("Saved to your collection");
  };

  return (
    <PageShell title="Image Generator">
      <input
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Describe the image you want…"
        className="w-full rounded-xl border border-input bg-card px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
      />

      <button
        onClick={generate}
        disabled={loading || !prompt.trim()}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 font-medium text-primary-foreground transition-opacity disabled:opacity-50"
      >
        {loading ? <Loader2 size={18} className="animate-spin" /> : null}
        {loading ? "Generating…" : "Generate"}
      </button>

      {loading && (
        <div className="mt-8 flex flex-col items-center gap-3 text-muted-foreground">
          <Loader2 size={32} className="animate-spin" />
          <span className="text-sm">Creating your image…</span>
        </div>
      )}

      {imageUrl && !loading && (
        <div className="mt-6 overflow-hidden rounded-xl border border-border bg-card shadow-sm">
          <img src={imageUrl} alt="Generated" className="w-full" />
          <div className="flex gap-2 p-4">
            <button
              onClick={download}
              className="flex items-center gap-1.5 rounded-lg bg-secondary px-3 py-2 text-sm text-secondary-foreground transition-colors hover:bg-secondary/80"
            >
              <Download size={14} />
              Download
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

      {!imageUrl && !loading && (
        <div className="mt-12 flex flex-col items-center gap-2 text-muted-foreground">
          <ImageIcon size={40} strokeWidth={1.2} />
          <span className="text-sm">Your generated image will appear here</span>
        </div>
      )}
    </PageShell>
  );
};

export default ImageGenerator;
