import { Loader2 } from "lucide-react";
import { motion } from "motion/react";

interface GlowButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: "blue" | "green" | "purple" | "cyan" | "red";
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
  type?: "button" | "submit";
}

const VARIANTS = {
  blue: {
    bg: "bg-[#c9a87c]",
    hover: "hover:bg-[#b8956a]",
    glow: "shadow-[#c9a87c]/25",
    ring: "focus-visible:ring-[#c9a87c]/40",
  },
  green: {
    bg: "bg-[#6b9e78]",
    hover: "hover:bg-[#5a8a66]",
    glow: "shadow-[#6b9e78]/25",
    ring: "focus-visible:ring-[#6b9e78]/40",
  },
  purple: {
    bg: "bg-[#8b6914]",
    hover: "hover:bg-[#7a5c10]",
    glow: "shadow-[#8b6914]/25",
    ring: "focus-visible:ring-[#8b6914]/40",
  },
  cyan: {
    bg: "bg-[#a0845c]",
    hover: "hover:bg-[#8c724c]",
    glow: "shadow-[#a0845c]/25",
    ring: "focus-visible:ring-[#a0845c]/40",
  },
  red: {
    bg: "bg-[#c44b3f]",
    hover: "hover:bg-[#a83d33]",
    glow: "shadow-[#c44b3f]/25",
    ring: "focus-visible:ring-[#c44b3f]/40",
  },
};

const SIZES = {
  sm: "px-4 py-2 text-[13px] gap-1.5",
  md: "px-5 py-2.5 text-[14px] gap-2",
  lg: "px-6 py-3 text-[14px] gap-2",
};

export function GlowButton({
  children,
  onClick,
  disabled = false,
  loading = false,
  variant = "blue",
  size = "md",
  fullWidth = false,
  type = "button",
}: GlowButtonProps) {
  const v = VARIANTS[variant];
  const s = SIZES[size];

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      whileHover={!disabled && !loading ? { scale: 1.02 } : {}}
      whileTap={!disabled && !loading ? { scale: 0.98 } : {}}
      className={`
        inline-flex items-center justify-center font-medium rounded-lg
        text-white transition-all duration-200 cursor-pointer
        shadow-lg ${v.glow} ${v.bg} ${v.hover} ${v.ring}
        focus-visible:outline-none focus-visible:ring-2
        disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none
        ${s}
        ${fullWidth ? "w-full" : ""}
      `}
    >
      {loading ? (
        <>
          <Loader2 size={15} className="animate-spin" />
          <span>Processing...</span>
        </>
      ) : (
        children
      )}
    </motion.button>
  );
}
