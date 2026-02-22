import { Outlet, Navigate, NavLink, useLocation, useNavigate } from "react-router";
import { useAuth } from "../../lib/auth";
import { motion, AnimatePresence } from "motion/react";
import {
  LayoutDashboard,
  Server,
  ShieldCheck,
  Globe,
  Search,
  LogOut,
} from "lucide-react";
import logo1 from "../../../assets/images/logo1.jpg";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ThemeToggle } from "../ThemeToggle";
import { LanguageToggle } from "../LanguageToggle";

export function DashboardLayout() {
  const { isAuthenticated, adminName, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchId, setSearchId] = useState("");

  const navLinks = [
    { to: "/dashboard", label: t('dashboard.label'), icon: LayoutDashboard, end: true },
    { to: "/dashboard/witnesses", label: t('witnesses.title'), icon: Server },
    { to: "/dashboard/verify", label: t('integrity.title'), icon: ShieldCheck },
    { to: "/dashboard/public", label: t('publicLookup.label'), icon: Globe },
  ];

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleSearch = () => {
    if (searchId.trim()) {
      navigate(`/dashboard/land/${searchId.trim()}`);
      setSearchOpen(false);
      setSearchId("");
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Top NavBar */}
      <header className="sticky top-0 z-40 border-b border-border bg-surface-1/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          {/* Logo */}
          <NavLink
            to="/dashboard"
            end
            className="flex items-center gap-3 shrink-0"
          >
            <div className="flex h-12 w-36 items-center justify-center rounded-xl overflow-hidden bg-white/90 backdrop-blur-sm border border-surface-3 shadow-sm">
              <img src={logo1} alt="AXIOS Logo" className="h-full w-full object-cover" />
            </div>
          </NavLink>

          {/* Center Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.end}
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-4 py-2 text-[13px] rounded-lg transition-all duration-200 ${
                      isActive
                        ? "bg-primary/10 text-primary border border-primary/20"
                        : "text-text-secondary hover:text-text-primary hover:bg-surface-2/50 border border-transparent"
                    }`
                  }
                >
                  <Icon size={14} />
                  {link.label}
                </NavLink>
              );
            })}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            {/* Search */}
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="w-9 h-9 rounded-lg border border-border bg-surface-1 flex items-center justify-center text-text-secondary hover:text-text-primary hover:bg-surface-2 transition-all cursor-pointer"
              title="Search Land ID"
            >
              <Search size={15} />
            </button>

            {/* Theme toggle */}
            <ThemeToggle />
            {/* Language toggle */}
            <LanguageToggle />

            {/* User badge */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#7c3aed]/10 border border-[#7c3aed]/20">
              <div className="w-6 h-6 rounded-full bg-[#7c3aed] flex items-center justify-center">
                <span className="text-[11px] text-white font-medium">
                  {(adminName || "A")[0].toUpperCase()}
                </span>
              </div>
              <span className="text-[12px] text-[#c4b5fd]">
                {adminName || "Admin"}
              </span>
            </div>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="w-9 h-9 rounded-lg border border-border bg-surface-1 flex items-center justify-center text-text-secondary hover:text-status-red hover:bg-status-red/5 transition-all cursor-pointer"
              title="Sign out"
            >
              <LogOut size={15} />
            </button>
          </div>
        </div>

        {/* Search bar (conditional) */}
        <AnimatePresence>
          {searchOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="border-t border-border/50 overflow-hidden"
            >
              <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-3">
                <Search size={14} className="text-text-muted" />
                <input
                  type="text"
                  value={searchId}
                  onChange={(e) => setSearchId(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  placeholder={t('sidebar.searchPlaceholder')}
                  autoFocus
                  className="flex-1 bg-transparent text-[13px] text-text-primary placeholder-text-muted outline-none"
                />
                <button
                  onClick={handleSearch}
                  disabled={!searchId.trim()}
                  className="px-3 py-1.5 rounded-lg bg-primary text-[12px] text-primary-foreground hover:bg-primary/80 transition-colors disabled:opacity-30 cursor-pointer"
                >
                  {t('dashboard.go')}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Page content */}
      <main className="flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="min-h-full"
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
