import { create } from "zustand";
import { SavedItem, getSavedItems } from "@/lib/storage";

interface AppState {
  prompt: string;
  result: string;
  loading: boolean;
  saved: SavedItem[];
  setPrompt: (prompt: string) => void;
  setResult: (result: string) => void;
  setLoading: (loading: boolean) => void;
  syncSaved: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  prompt: "",
  result: "",
  loading: false,
  saved: getSavedItems(),
  setPrompt: (prompt) => set({ prompt }),
  setResult: (result) => set({ result }),
  setLoading: (loading) => set({ loading }),
  syncSaved: () => set({ saved: getSavedItems() }),
}));
