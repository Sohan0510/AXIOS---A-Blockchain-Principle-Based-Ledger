import { Loader2 } from "lucide-react";

interface LoadingOverlayProps {
  visible: boolean;
  message?: string;
}

export function LoadingOverlay({
  visible,
  message = "Processing...",
}: LoadingOverlayProps) {
  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-3 rounded-lg bg-surface-1 border border-surface-3 px-8 py-6">
        <Loader2 size={28} className="animate-spin text-status-blue" />
        <span className="text-sm text-text-secondary">{message}</span>
      </div>
    </div>
  );
}
