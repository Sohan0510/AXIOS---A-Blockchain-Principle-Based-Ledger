import { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import {
  ShieldCheck,
  ShieldAlert,
  Search,
  Loader2,
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Link } from "react-router";
import { integrityAPI } from "../lib/api";
import { MerkleRootDisplay } from "../components/MerkleRootDisplay";

interface VerifyResult {
  integrityVerified: boolean;
  status: string;
  storedMerkleRoot: string;
  recalculatedMerkleRoot: string;
  tamperedBlocks: string[] | null;
  lastHashedAt: string;
}

const BLOCK_LABELS: Record<string, string> = {
  identity: "Identity Block",
  geo: "Geolocation Block",
  area: "Area Block",
  owner: "Owner Block",
  transfer: "Transfer Block",
  mutation: "Mutation Block",
  loan: "Loan Block",
  legal: "Legal Block",
  typeSpecific: "Type-Specific Block",
};

export function IntegrityVerify() {
  const { t } = useTranslation();
  const [landId, setLandId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<VerifyResult | null>(null);

  const handleVerify = useCallback(async () => {
    if (!landId.trim()) {
      setError(t('integrity.enterLandId'));
      return;
    }
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await integrityAPI.verify(landId.trim());
      setResult(res.data);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || t('integrity.failed');
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [landId]);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:py-16">
      {/* Back link */}
     
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-10"
      >
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-gradient-to-br from-status-blue/15 to-status-blue/5 border border-status-blue/25 mb-4">
          <ShieldCheck size={26} className="text-status-blue" />
        </div>
        <h1 className="text-text-primary mb-2">{t('integrity.title')}</h1>
        <p className="text-sm text-text-secondary max-w-md mx-auto" style={{ lineHeight: "1.6" }}>
          {t('integrity.subtitle')}
        </p>
      </motion.div>

      {/* Input */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="rounded-xl border border-surface-3 bg-surface-1 p-6 mb-6 shadow-lg shadow-black/15"
      >
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={landId}
            onChange={(e) => {
              setLandId(e.target.value);
              if (error) setError(null);
            }}
            onKeyDown={(e) => e.key === "Enter" && handleVerify()}
            placeholder={t('integrity.placeholder')}
            className="flex-1 rounded-lg border border-surface-3 bg-surface-0 px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:border-status-blue focus:ring-1 focus:ring-status-blue/30 outline-none transition-all duration-200"
          />
          <button
            onClick={handleVerify}
            disabled={loading || !landId.trim()}
            className="flex items-center justify-center gap-2 px-6 py-2.5 text-sm rounded-lg bg-status-blue text-white hover:bg-status-blue/85 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm shadow-status-blue/20"
          >
            {loading ? (
              <Loader2 size={15} className="animate-spin" />
            ) : (
              <Search size={15} />
            )}
            {t('integrity.verify')}
          </button>
        </div>

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -6, height: 0 }}
              animate={{ opacity: 1, y: 0, height: "auto" }}
              exit={{ opacity: 0, y: -6, height: 0 }}
              transition={{ duration: 0.25 }}
              className="mt-4"
            >
              <div className="flex items-center gap-2 rounded-lg border border-status-red/20 bg-status-red/5 px-4 py-3">
                <AlertCircle size={16} className="text-status-red shrink-0" />
                <span className="text-sm text-status-red">{error}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Loading */}
      <AnimatePresence mode="wait">
        {loading && (
          <motion.div
            key="verify-loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center justify-center py-16"
          >
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-status-blue/10 animate-ping" />
                <div className="relative flex items-center justify-center w-14 h-14 rounded-full bg-surface-1 border border-surface-3">
                  <Loader2 size={22} className="animate-spin text-status-blue" />
                </div>
              </div>
              <span className="text-sm text-text-muted">
                {t('integrity.recalculating')}
              </span>
            </div>
          </motion.div>
        )}

        {/* Result */}
        {result && !loading && (
          <motion.div
            key="verify-result"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            {/* Status Banner */}
            <div
              className={`rounded-xl border p-6 shadow-lg shadow-black/15 ${
                result.integrityVerified
                  ? "border-status-green/20 bg-gradient-to-br from-status-green/5 to-transparent"
                  : "border-status-red/20 bg-gradient-to-br from-status-red/5 to-transparent"
              }`}
            >
              <div className="flex items-center gap-3 mb-5">
                {result.integrityVerified ? (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200 }}
                  >
                    <CheckCircle2 size={32} className="text-status-green" />
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200 }}
                  >
                    <ShieldAlert size={32} className="text-status-red" />
                  </motion.div>
                )}
                <div>
                  <div
                    className={`text-sm ${
                      result.integrityVerified
                        ? "text-status-green"
                        : "text-status-red"
                    }`}
                    style={{ letterSpacing: "0.05em" }}
                  >
                    {result.integrityVerified
                      ? t('integrity.valid')
                      : t('integrity.tampered')}
                  </div>
                  <div className="text-xs text-text-muted">
                    {t('integrity.verifiedAt')}{new Date().toLocaleString("en-IN")}
                  </div>
                </div>
              </div>

              {/* Root Comparison */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <MerkleRootDisplay
                  root={result.storedMerkleRoot}
                  label={t('integrity.storedRoot')}
                  variant={result.integrityVerified ? "match" : "mismatch"}
                  truncate={false}
                />
                <MerkleRootDisplay
                  root={result.recalculatedMerkleRoot}
                  label={t('integrity.recalculatedRoot')}
                  variant={result.integrityVerified ? "match" : "mismatch"}
                  truncate={false}
                />
              </div>

              {/* Match Indicator */}
              <div className="flex items-center justify-center gap-2 py-3">
                <div
                  className={`h-px flex-1 ${
                    result.integrityVerified
                      ? "bg-status-green/20"
                      : "bg-status-red/20"
                  }`}
                />
                <span
                  className={`text-xs px-4 py-1.5 rounded-full ${
                    result.integrityVerified
                      ? "bg-status-green/10 text-status-green border border-status-green/20"
                      : "bg-status-red/10 text-status-red border border-status-red/20"
                  }`}
                >
                  {result.integrityVerified ? t('integrity.rootsMatch') : t('integrity.rootsMismatch')}
                </span>
                <div
                  className={`h-px flex-1 ${
                    result.integrityVerified
                      ? "bg-status-green/20"
                      : "bg-status-red/20"
                  }`}
                />
              </div>

              <div className="text-xs text-text-muted text-center mt-2">
                {t('integrity.lastHashed')}{" "}
                {result.lastHashedAt
                  ? new Date(result.lastHashedAt).toLocaleString("en-IN")
                  : "—"}
              </div>
            </div>

            {/* Tampered Blocks */}
            {!result.integrityVerified && result.tamperedBlocks?.length ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="rounded-xl border border-status-red/20 bg-surface-1 overflow-hidden shadow-lg shadow-black/15"
              >
                <div className="flex items-center gap-2 border-b border-surface-3 px-5 py-3">
                  <AlertTriangle size={15} className="text-status-red" />
                  <h4 className="text-sm text-status-red">
                    {t('integrity.tamperedBlocks')}
                  </h4>
                </div>
                <div className="p-5">
                  <p className="text-xs text-text-secondary mb-4">
                    {t('integrity.tamperedBlocksDesc')}
                  </p>
                  <div className="space-y-2">
                    {result.tamperedBlocks.map((block, idx) => (
                      <motion.div
                        key={block}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 + idx * 0.08 }}
                        className="flex items-center gap-3 rounded-lg border border-status-red/20 bg-status-red/5 px-4 py-3"
                      >
                        <AlertCircle
                          size={14}
                          className="text-status-red shrink-0"
                        />
                        <div>
                          <div className="text-sm text-status-red">
                            {BLOCK_LABELS[block] || block}
                          </div>
                          <div className="text-xs text-text-muted">
                            {t('integrity.blockKey')}{" "}
                            <code
                              style={{
                                fontFamily: "'JetBrains Mono', monospace",
                              }}
                            >
                              {block}
                            </code>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ) : null}
          </motion.div>
        )}

        {/* Empty State */}
        {!result && !loading && !error && (
          <motion.div
            key="verify-empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center py-16"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-surface-1 border border-surface-3 mb-4">
              <ShieldCheck size={24} className="text-text-muted" />
            </div>
            <p className="text-sm text-text-muted">
              {t('integrity.emptyState')}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
