import { ShieldCheck, ShieldAlert, Loader2 } from "lucide-react";

interface IntegrityBadgeProps {
  verified: boolean | null;
  loading?: boolean;
  size?: "sm" | "md" | "lg";
}

export function IntegrityBadge({
  verified,
  loading = false,
  size = "md",
}: IntegrityBadgeProps) {
  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs gap-1",
    md: "px-3 py-1 text-sm gap-1.5",
    lg: "px-4 py-1.5 text-sm gap-2",
  };

  const iconSize = { sm: 12, md: 14, lg: 16 };

  if (loading) {
    return (
      <span
        className={`inline-flex items-center rounded ${sizeClasses[size]} bg-surface-3 text-text-secondary`}
      >
        <Loader2
          size={iconSize[size]}
          className="animate-spin"
        />
        Verifying
      </span>
    );
  }

  if (verified === null) {
    return (
      <span
        className={`inline-flex items-center rounded ${sizeClasses[size]} bg-surface-3 text-text-muted`}
      >
        Unknown
      </span>
    );
  }

  if (verified) {
    return (
      <span
        className={`inline-flex items-center rounded ${sizeClasses[size]} bg-status-green/10 text-status-green border border-status-green/20`}
      >
        <ShieldCheck size={iconSize[size]} />
        Integrity Valid
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center rounded ${sizeClasses[size]} bg-status-red/10 text-status-red border border-status-red/20`}
    >
      <ShieldAlert size={iconSize[size]} />
      Integrity Tampered
    </span>
  );
}
