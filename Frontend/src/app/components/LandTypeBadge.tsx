import { Wheat, Home, Building2, Factory, RefreshCcw } from "lucide-react";

const typeConfig: Record<
  string,
  { icon: React.ElementType; className: string }
> = {
  Agricultural: {
    icon: Wheat,
    className: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  },
  Residential: {
    icon: Home,
    className: "bg-sky-500/10 text-sky-400 border-sky-500/20",
  },
  Commercial: {
    icon: Building2,
    className: "bg-violet-500/10 text-violet-400 border-violet-500/20",
  },
  Industrial: {
    icon: Factory,
    className: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  },
  Converted: {
    icon: RefreshCcw,
    className: "bg-gray-500/10 text-gray-400 border-gray-500/20",
  },
};

interface LandTypeBadgeProps {
  type: string;
}

export function LandTypeBadge({ type }: LandTypeBadgeProps) {
  const config = typeConfig[type] || typeConfig["Converted"];
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded px-2.5 py-1 text-xs border ${config.className}`}
    >
      <Icon size={12} />
      {type}
    </span>
  );
}
