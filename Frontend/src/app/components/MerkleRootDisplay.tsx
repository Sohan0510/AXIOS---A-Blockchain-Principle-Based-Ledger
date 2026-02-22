import { Copy, Check } from "lucide-react";
import { useState, useCallback } from "react";

interface MerkleRootDisplayProps {
  root: string;
  label?: string;
  truncate?: boolean;
  variant?: "default" | "match" | "mismatch";
}

export function MerkleRootDisplay({
  root,
  label,
  truncate = true,
  variant = "default",
}: MerkleRootDisplayProps) {
  const [copied, setCopied] = useState(false);

  const display = truncate && root.length > 20
    ? `${root.slice(0, 10)}...${root.slice(-10)}`
    : root;

  const borderClass = {
    default: "border-surface-3",
    match: "border-status-green/30",
    mismatch: "border-status-red/30",
  }[variant];

  const bgClass = {
    default: "bg-surface-1",
    match: "bg-status-green/5",
    mismatch: "bg-status-red/5",
  }[variant];

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(root).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [root]);

  return (
    <div className={`rounded border ${borderClass} ${bgClass} p-3`}>
      {label && (
        <div className="text-xs text-text-muted mb-1.5">{label}</div>
      )}
      <div className="flex items-center justify-between gap-2">
        <code
          className="text-xs text-text-secondary break-all"
          style={{ fontFamily: "'JetBrains Mono', monospace" }}
          title={root}
        >
          {display}
        </code>
        <button
          onClick={handleCopy}
          className="shrink-0 p-1 rounded hover:bg-surface-3 text-text-muted hover:text-text-secondary transition-colors"
          title="Copy full hash"
        >
          {copied ? <Check size={14} className="text-status-green" /> : <Copy size={14} />}
        </button>
      </div>
    </div>
  );
}
