import { motion } from "framer-motion";
import { Type, ImageIcon, Bookmark } from "lucide-react";
import { useNavigate } from "react-router-dom";

const cards = [
  { label: "Text Generation", icon: Type, path: "/text", desc: "Generate text with AI" },
  { label: "Image Generation", icon: ImageIcon, path: "/image", desc: "Create images from prompts" },
  { label: "Saved", icon: Bookmark, path: "/saved", desc: "View your saved results" },
] as const;

const Index = () => {
  const navigate = useNavigate();
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex min-h-screen flex-col items-center justify-center bg-background px-5"
    >
      <h1 className="mb-2 text-3xl font-bold tracking-tight text-foreground">
        AI Mini EPS
      </h1>
      <p className="mb-10 text-muted-foreground">Your pocket AI toolkit</p>

      <div className="grid w-full max-w-md gap-4">
        {cards.map((c, i) => (
          <motion.button
            key={c.path}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            onClick={() => navigate(c.path)}
            className="group flex items-center gap-4 rounded-2xl border border-border bg-card p-5 text-left shadow-sm transition-all hover:border-primary/40 hover:shadow-md"
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
              <c.icon size={22} />
            </div>
            <div>
              <span className="font-medium text-foreground">{c.label}</span>
              <p className="text-sm text-muted-foreground">{c.desc}</p>
            </div>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
};

export default Index;
