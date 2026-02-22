import { Globe } from "lucide-react";
import { useTranslation } from "react-i18next";
import { motion } from "motion/react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "./ui/dropdown-menu";

const languages = [
  { code: "en", label: "English", flag: "EN" },
  { code: "kn", label: "ಕನ್ನಡ", flag: "KN" },
  { code: "hi", label: "हिन्दी", flag: "HI" },
] as const;

export function LanguageToggle() {
  const { i18n } = useTranslation();
  const current = languages.find((l) => l.code === i18n.language) ?? languages[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="relative w-9 h-9 rounded-lg border border-border bg-surface-1 flex items-center justify-center text-text-secondary hover:text-text-primary hover:bg-surface-2 transition-all duration-200 cursor-pointer"
          title="Change language"
          aria-label="Change language"
        >
          <Globe size={15} />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="min-w-[140px]">
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => i18n.changeLanguage(lang.code)}
            className="flex items-center justify-between gap-3 cursor-pointer"
          >
            <span>{lang.label}</span>
            {current.code === lang.code && (
              <motion.div
                layoutId="lang-check"
                className="h-1.5 w-1.5 rounded-full bg-status-blue"
              />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
