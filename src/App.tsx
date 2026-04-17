import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AnimatePresence } from "framer-motion";
import Index from "./pages/Index.tsx";
import TextGenerator from "./pages/TextGenerator.tsx";
import ImageGenerator from "./pages/ImageGenerator.tsx";
import SavedResults from "./pages/SavedResults.tsx";
import NotFound from "./pages/NotFound.tsx";

const App = () => (
  <TooltipProvider>
    <Sonner />
    <BrowserRouter>
      <AnimatePresence mode="wait">
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/text" element={<TextGenerator />} />
          <Route path="/image" element={<ImageGenerator />} />
          <Route path="/saved" element={<SavedResults />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AnimatePresence>
    </BrowserRouter>
  </TooltipProvider>
);

export default App;
