import { AlertTriangle, X } from "lucide-react";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "default" | "destructive";
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "default",
  onConfirm,
  onCancel,
  loading = false,
}: ConfirmDialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-lg bg-surface-1 border border-surface-3 shadow-2xl">
        <div className="flex items-center justify-between border-b border-surface-3 px-5 py-4">
          <div className="flex items-center gap-2">
            <AlertTriangle
              size={18}
              className={
                variant === "destructive"
                  ? "text-status-red"
                  : "text-status-amber"
              }
            />
            <h3 className="text-text-primary">{title}</h3>
          </div>
          <button
            onClick={onCancel}
            className="p-1 rounded hover:bg-surface-3 text-text-muted transition-colors"
          >
            <X size={16} />
          </button>
        </div>
        <div className="px-5 py-4">
          <p className="text-sm text-text-secondary">{message}</p>
        </div>
        <div className="flex justify-end gap-3 border-t border-surface-3 px-5 py-3">
          <button
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2 text-sm rounded border border-surface-3 bg-surface-2 text-text-secondary hover:bg-surface-3 transition-colors disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`px-4 py-2 text-sm rounded transition-colors disabled:opacity-50 ${
              variant === "destructive"
                ? "bg-status-red text-white hover:bg-status-red/80"
                : "bg-status-blue text-white hover:bg-status-blue/80"
            }`}
          >
            {loading ? "Processing..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
