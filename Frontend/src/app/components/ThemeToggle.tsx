import { Sun, Moon } from "lucide-react";
import { useTheme } from "../lib/theme";
import { motion } from "motion/react";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      onClick={toggleTheme}
      className="relative w-9 h-9 rounded-lg border border-border bg-surface-1 flex items-center justify-center text-text-secondary hover:text-text-primary hover:bg-surface-2 transition-all duration-200 cursor-pointer"
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      <motion.div
        key={theme}
        initial={{ scale: 0.5, opacity: 0, rotate: -90 }}
        animate={{ scale: 1, opacity: 1, rotate: 0 }}
        exit={{ scale: 0.5, opacity: 0, rotate: 90 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
      >
        {isDark ? <Sun size={15} /> : <Moon size={15} />}
      </motion.div>
    </button>
  );
}
