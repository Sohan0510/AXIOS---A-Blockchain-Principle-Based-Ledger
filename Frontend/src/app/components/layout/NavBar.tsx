import { Link, useNavigate, useLocation } from "react-router";
import {
  LogIn,
  UserPlus,
  LogOut,
  LayoutDashboard,
  Search,
  ShieldCheck,
  Menu,
  X,
} from "lucide-react";
import logo1 from "../../../assets/images/logo1.jpg";
import { useAuth } from "../../lib/auth";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ThemeToggle } from "../ThemeToggle";
import { LanguageToggle } from "../LanguageToggle";
import { useTranslation } from "react-i18next";

export function NavBar() {
  const { isAuthenticated, adminName, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { t } = useTranslation();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-surface-3 bg-surface-0/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        {/* Logo */}
        <Link
          to="/"
          className="flex items-center transition-transform hover:scale-105"
        >
          <div className="flex h-12 w-36 items-center justify-center rounded-xl overflow-hidden bg-white/90 backdrop-blur-sm border border-surface-3 shadow-sm">
            <img src={logo1} alt="AXIOS Logo" className="h-full w-full object-cover" />
          </div>
        </Link>

        {/* Center Navigation */}
        <nav className="hidden md:flex items-center gap-1 absolute left-1/2 -translate-x-1/2">
          <Link
            to="/"
            className={`flex items-center gap-2 px-4 py-2 text-sm rounded-lg transition-all duration-200 ${
              isActive("/")
                ? "bg-surface-2 text-text-primary border border-surface-3"
                : "text-text-secondary hover:text-text-primary hover:bg-surface-1"
            }`}
          >
            <Search size={14} />
            {t('nav.publicSearch')}
          </Link>
          <Link
            to={isAuthenticated ? "/dashboard/verify" : "/verify"}
            className={`flex items-center gap-2 px-4 py-2 text-sm rounded-lg transition-all duration-200 ${
              isActive("/verify") || isActive("/dashboard/verify")
                ? "bg-surface-2 text-text-primary border border-surface-3"
                : "text-text-secondary hover:text-text-primary hover:bg-surface-1"
            }`}
          >
            <ShieldCheck size={14} />
            {t('nav.integrityPortal')}
          </Link>
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          {/* Theme toggle */}
          <ThemeToggle />
          {/* Language toggle */}
          <LanguageToggle />

          {isAuthenticated ? (
            <>
              <span className="hidden lg:block text-xs text-text-muted mr-1 px-2 py-1 rounded bg-surface-1 border border-surface-3">
                {adminName}
              </span>
              <Link
                to="/dashboard"
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs rounded-lg border border-surface-3 bg-surface-1 text-text-secondary hover:bg-surface-2 hover:text-text-primary transition-all duration-200"
              >
                <LayoutDashboard size={13} />
                <span className="hidden sm:inline">{t('nav.dashboard')}</span>
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs rounded-lg border border-surface-3 bg-surface-1 text-text-secondary hover:bg-surface-2 hover:text-status-red transition-all duration-200"
              >
                <LogOut size={13} />
                <span className="hidden sm:inline">{t('nav.logout')}</span>
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="hidden sm:flex items-center gap-1.5 px-4 py-2 text-xs rounded-lg border border-surface-3 bg-surface-1 text-text-secondary hover:bg-surface-2 hover:text-text-primary transition-all duration-200"
              >
                <LogIn size={13} />
                {t('nav.login')}
              </Link>
              <Link
                to="/register"
                className="hidden sm:flex items-center gap-1.5 px-4 py-2 text-xs rounded-lg bg-status-blue text-white hover:bg-status-blue/85 transition-all duration-200 shadow-sm shadow-status-blue/20"
              >
                <UserPlus size={13} />
                {t('nav.register')}
              </Link>
            </>
          )}

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden flex items-center justify-center h-9 w-9 rounded-lg border border-surface-3 bg-surface-1 text-text-secondary hover:bg-surface-2 transition-colors"
          >
            {mobileMenuOpen ? <X size={16} /> : <Menu size={16} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="md:hidden border-t border-surface-3 bg-surface-0 overflow-hidden"
          >
            <div className="px-4 py-3 space-y-1">
              <Link
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-text-secondary hover:bg-surface-1 hover:text-text-primary transition-colors"
              >
                <Search size={15} />
                {t('nav.publicSearch')}
              </Link>
              <Link
                to="/verify"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-text-secondary hover:bg-surface-1 hover:text-text-primary transition-colors"
              >
                <ShieldCheck size={15} />
                {t('nav.integrityPortal')}
              </Link>
              {!isAuthenticated && (
                <div className="flex gap-2 pt-2 border-t border-surface-3 mt-2">
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 text-sm rounded-lg border border-surface-3 bg-surface-1 text-text-secondary hover:bg-surface-2 transition-colors"
                  >
                    <LogIn size={14} />
                    {t('nav.login')}
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 text-sm rounded-lg bg-status-blue text-white hover:bg-status-blue/85 transition-colors"
                  >
                    <UserPlus size={14} />
                    {t('nav.register')}
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
