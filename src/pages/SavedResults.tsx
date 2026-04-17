import { useEffect } from "react";
import { Trash2, Type, ImageIcon } from "lucide-react";
import { toast } from "sonner";
import PageShell from "@/components/PageShell";
import { deleteItem } from "@/lib/storage";
import { useAppStore } from "@/store/appStore";

const SavedResults = () => {
  const { saved: items, syncSaved } = useAppStore();

  useEffect(() => {
    syncSaved();
  }, [syncSaved]);

  const remove = (id: string) => {
    deleteItem(id);
    syncSaved();
    toast("Item deleted");
  };

  return (
    <PageShell title="Saved Results">
      {items.length === 0 && (
        <div className="flex flex-col items-center gap-2 py-20 text-muted-foreground">
          <span className="text-sm">No saved items yet</span>
        </div>
      )}

      <div className="space-y-4">
        {items.map((item) => (
          <div
            key={item.id}
            className="rounded-xl border border-border bg-card p-4 shadow-sm"
          >
            <div className="mb-2 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                {item.type === "text" ? <Type size={14} /> : <ImageIcon size={14} />}
                <span className="capitalize">{item.type}</span>
                <span>·</span>
                <span>{new Date(item.createdAt).toLocaleDateString()}</span>
              </div>
              <button
                onClick={() => remove(item.id)}
                className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
              >
                <Trash2 size={15} />
              </button>
            </div>
            <p className="mb-2 text-xs font-medium text-foreground">{item.prompt}</p>
            {item.type === "text" ? (
              <p className="line-clamp-3 text-sm text-muted-foreground">{item.result}</p>
            ) : (
              <img
                src={item.result}
                alt="Saved"
                className="mt-2 w-full rounded-lg"
              />
            )}
          </div>
        ))}
      </div>
    </PageShell>
  );
};

export default SavedResults;
