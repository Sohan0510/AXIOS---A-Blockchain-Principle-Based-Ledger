interface StatusBadgeProps {
  status: string;
  variant?: "default" | "mutation" | "verification" | "boolean";
}

const variantMap: Record<string, Record<string, string>> = {
  mutation: {
    Approved: "bg-status-green/10 text-status-green border-status-green/20",
    Pending: "bg-status-amber/10 text-status-amber border-status-amber/20",
    Rejected: "bg-status-red/10 text-status-red border-status-red/20",
  },
  verification: {
    Verified: "bg-status-green/10 text-status-green border-status-green/20",
    Unverified: "bg-surface-3 text-text-muted border-surface-3",
    Flagged: "bg-status-red/10 text-status-red border-status-red/20",
  },
  boolean: {
    Yes: "bg-status-red/10 text-status-red border-status-red/20",
    No: "bg-surface-3 text-text-secondary border-surface-3",
    Active: "bg-status-amber/10 text-status-amber border-status-amber/20",
    Inactive: "bg-surface-3 text-text-secondary border-surface-3",
    true: "bg-status-amber/10 text-status-amber border-status-amber/20",
    false: "bg-surface-3 text-text-secondary border-surface-3",
  },
  default: {},
};

export function StatusBadge({ status, variant = "default" }: StatusBadgeProps) {
  const map = variantMap[variant] || {};
  const cls =
    map[status] || "bg-surface-3 text-text-secondary border-surface-3";

  return (
    <span
      className={`inline-flex items-center rounded px-2 py-0.5 text-xs border ${cls}`}
    >
      {status}
    </span>
  );
}
