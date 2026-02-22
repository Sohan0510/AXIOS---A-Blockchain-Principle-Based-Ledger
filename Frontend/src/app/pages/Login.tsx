import { useState } from "react";
import { Link, useNavigate } from "react-router";
import {
  LogIn,
  Loader2,
  AlertCircle,
  Shield,
  Eye,
  EyeOff,
  ArrowLeft,
} from "lucide-react";
import { motion } from "motion/react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../lib/auth";

export function Login() {
  const { login, loading, error, clearError } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
      navigate("/dashboard");
    } catch {
      // Error handled by context
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-sm"
      >
        {/* Back link */}
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs text-text-muted hover:text-text-secondary mb-8 transition-colors"
        >
          <ArrowLeft size={13} />
          {t('login.backToSearch')}
        </Link>

        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br from-status-blue/15 to-status-blue/5 border border-status-blue/25 mb-4"
          >
            <Shield size={22} className="text-status-blue" />
          </motion.div>
          <h2 className="text-text-primary mb-1">{t('login.title')}</h2>
          <p className="text-xs text-text-muted">
            {t('login.subtitle')}
          </p>
        </div>

        <motion.form
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          onSubmit={handleSubmit}
          className="rounded-xl border border-surface-3 bg-surface-1 p-6 space-y-4 shadow-xl shadow-black/20"
        >
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 rounded-lg border border-status-red/20 bg-status-red/5 px-3 py-2.5"
            >
              <AlertCircle size={14} className="text-status-red shrink-0" />
              <span className="text-xs text-status-red">{error}</span>
            </motion.div>
          )}

          <div>
            <label className="block text-xs text-text-secondary mb-1.5">
              {t('login.email')}
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (error) clearError();
              }}
              placeholder="admin@gov.in"
              required
              className="w-full rounded-lg border border-surface-3 bg-surface-0 px-3 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:border-status-blue focus:ring-1 focus:ring-status-blue/30 outline-none transition-all duration-200"
            />
          </div>

          <div>
            <label className="block text-xs text-text-secondary mb-1.5">
              {t('login.password')}
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) clearError();
                }}
                placeholder="Enter password"
                required
                className="w-full rounded-lg border border-surface-3 bg-surface-0 px-3 py-2.5 pr-10 text-sm text-text-primary placeholder:text-text-muted focus:border-status-blue focus:ring-1 focus:ring-status-blue/30 outline-none transition-all duration-200"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-md text-text-muted hover:text-text-secondary hover:bg-surface-2 transition-all duration-200"
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !email || !password}
            className="w-full flex items-center justify-center gap-2 rounded-lg bg-status-blue text-white py-2.5 text-sm hover:bg-status-blue/85 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm shadow-status-blue/20"
          >
            {loading ? (
              <Loader2 size={15} className="animate-spin" />
            ) : (
              <LogIn size={15} />
            )}
            {loading ? t('login.submitting') : t('login.submit')}
          </button>

          <div className="text-center pt-2">
            <span className="text-xs text-text-muted">
              {t('login.noAccount')}
              <Link
                to="/register"
                className="text-status-blue hover:underline transition-colors"
              >
                {t('login.registerLink')}
              </Link>
            </span>
          </div>
        </motion.form>
      </motion.div>
    </div>
  );
}
