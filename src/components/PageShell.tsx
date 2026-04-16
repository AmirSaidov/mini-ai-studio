import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface PageShellProps {
  title: string;
  children: React.ReactNode;
  showBack?: boolean;
}

const PageShell = ({ title, children, showBack = true }: PageShellProps) => {
  const navigate = useNavigate();
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.25 }}
      className="min-h-screen bg-background"
    >
      <header className="sticky top-0 z-10 border-b border-border bg-background/80 backdrop-blur-lg">
        <div className="mx-auto flex max-w-2xl items-center gap-3 px-5 py-4">
          {showBack && (
            <button
              onClick={() => navigate("/")}
              className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              <ArrowLeft size={20} />
            </button>
          )}
          <h1 className="text-lg font-semibold text-foreground">{title}</h1>
        </div>
      </header>
      <main className="mx-auto max-w-2xl px-5 py-6">{children}</main>
    </motion.div>
  );
};

export default PageShell;
