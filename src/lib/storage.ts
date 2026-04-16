export interface SavedItem {
  id: string;
  type: "text" | "image";
  prompt: string;
  result: string;
  createdAt: number;
}

const KEY = "ai-mini-eps-saved";

export const getSavedItems = (): SavedItem[] => {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
};

export const saveItem = (item: Omit<SavedItem, "id" | "createdAt">) => {
  const items = getSavedItems();
  items.unshift({ ...item, id: crypto.randomUUID(), createdAt: Date.now() });
  localStorage.setItem(KEY, JSON.stringify(items));
};

export const deleteItem = (id: string) => {
  const items = getSavedItems().filter((i) => i.id !== id);
  localStorage.setItem(KEY, JSON.stringify(items));
};
