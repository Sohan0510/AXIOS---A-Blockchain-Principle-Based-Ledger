import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "motion/react";
import {
  Server,
  Radio,
  WifiOff,
  Clock,
  RefreshCw,
  Loader2,
  ShieldCheck,
  Activity,
} from "lucide-react";
import { adminAPI } from "../lib/api";
import { GlowButton } from "../components/GlowButton";

interface WitnessData {
  url: string;
  status: string;
  info?: { status: string };
  latency?: number;
  error?: string;
}

export function Witnesses() {
  const { t } = useTranslation();
  const [witnesses, setWitnesses] = useState<{
    total: number;
    active: number;
    witnesses: WitnessData[];
  } | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchWitnesses = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminAPI.getWitnesses();
      setWitnesses(res.data);
    } catch {
      /* silent */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWitnesses();
  }, [fetchWitnesses]);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 flex flex-wrap items-start justify-between gap-4"
      >
        <div>
          <p className="text-[11px] uppercase tracking-widest text-text-muted mb-2">
            {t('witnesses.title')}
          </p>
          <h1 className="text-[28px] text-text-primary">Witness Servers</h1>
          <p className="text-[13px] text-text-muted mt-1">
            {t('witnesses.subtitle')}
          </p>
        </div>
        <GlowButton
          onClick={fetchWitnesses}
          variant="cyan"
          loading={loading}
        >
          <RefreshCw size={14} /> {t('witnesses.refresh')}
        </GlowButton>
      </motion.div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="rounded-xl border border-border bg-card/60 p-5"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Server size={14} className="text-primary" />
            </div>
            <span className="text-[12px] text-text-secondary">{t('witnesses.totalServers')}</span>
          </div>
          <p className="text-[24px] text-text-primary">
            {loading ? (
              <span className="inline-block h-7 w-8 rounded bg-surface-2/30 animate-pulse" />
            ) : (
              witnesses?.total ?? 0
            )}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-xl border border-status-green/10 bg-card/60 p-5"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-lg bg-status-green/10 border border-status-green/20 flex items-center justify-center">
              <Activity size={14} className="text-status-green" />
            </div>
            <span className="text-[12px] text-text-secondary">{t('witnesses.active')}</span>
          </div>
          <p className="text-[24px] text-status-green">
            {loading ? (
              <span className="inline-block h-7 w-8 rounded bg-surface-2/30 animate-pulse" />
            ) : (
              witnesses?.active ?? 0
            )}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="rounded-xl border border-status-red/10 bg-card/60 p-5"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-lg bg-status-red/10 border border-status-red/20 flex items-center justify-center">
              <WifiOff size={14} className="text-status-red" />
            </div>
            <span className="text-[12px] text-text-secondary">{t('witnesses.offline')}</span>
          </div>
          <p className="text-[24px] text-status-red">
            {loading ? (
              <span className="inline-block h-7 w-8 rounded bg-surface-2/30 animate-pulse" />
            ) : (
              (witnesses?.total ?? 0) - (witnesses?.active ?? 0)
            )}
          </p>
        </motion.div>
      </div>

      {/* Witness Server List */}
      <div>
        <div className="flex items-center gap-2 mb-5">
          <ShieldCheck size={18} className="text-[#7c3aed]" />
          <h2 className="text-[18px] text-text-primary">{t('witnesses.serverDetails')}</h2>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="rounded-xl border border-border bg-card/60 p-5 animate-pulse"
              >
                <div className="h-5 w-24 bg-surface-2/30 rounded mb-4" />
                <div className="h-4 w-40 bg-surface-2/30 rounded mb-2" />
                <div className="h-4 w-32 bg-surface-2/30 rounded" />
              </div>
            ))}
          </div>
        ) : witnesses?.witnesses?.length ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {witnesses.witnesses.map((w, i) => {
              const isActive = w.status === "active";
              return (
                <motion.div
                  key={w.url}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.3,
                    delay: i * 0.08,
                    ease: [0.2, 0.9, 0.25, 1],
                  }}
                  className={`rounded-xl border p-5 ${
                    isActive
                      ? "border-status-green/15 bg-card/60"
                      : "border-status-red/15 bg-card/60"
                  }`}
                >
                  {/* Status header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      {isActive ? (
                        <div className="w-8 h-8 rounded-full bg-status-green/10 flex items-center justify-center">
                          <Radio size={14} className="text-status-green" />
                        </div>
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-status-red/10 flex items-center justify-center">
                          <WifiOff size={14} className="text-status-red" />
                        </div>
                      )}
                      <div>
                        <p className="text-[13px] text-text-primary">
                          {t('witnesses.server')} #{i + 1}
                        </p>
                        <span
                          className={`text-[10px] uppercase tracking-wider ${
                            isActive ? "text-status-green" : "text-status-red"
                          }`}
                        >
                          {isActive ? t('witnesses.online') : t('witnesses.offline')}
                        </span>
                      </div>
                    </div>
                    {isActive && w.latency !== undefined && (
                      <div className="flex items-center gap-1 text-[11px] text-text-secondary">
                        <Clock size={10} />
                        {w.latency}ms
                      </div>
                    )}
                  </div>

                  {/* URL */}
                  <div className="rounded-lg bg-surface-0 p-3 mb-3">
                    <span className="text-[10px] text-text-muted uppercase tracking-wider">
                      {t('witnesses.endpoint')}
                    </span>
                    <p className="text-[12px] text-primary font-mono mt-1">
                      {w.url}
                    </p>
                  </div>

                  {/* Info or Error */}
                  {isActive && w.info && (
                    <div className="rounded-lg bg-status-green/5 border border-status-green/10 px-3 py-2">
                      <p className="text-[11px] text-status-green">
                        {w.info.status}
                      </p>
                    </div>
                  )}
                  {!isActive && w.error && (
                    <div className="rounded-lg bg-status-red/5 border border-status-red/10 px-3 py-2">
                      <p className="text-[11px] text-status-red">{w.error}</p>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-xl border border-border bg-card/60 p-12 text-center">
            <Server size={32} className="text-text-muted mx-auto mb-3" />
            <p className="text-[14px] text-text-muted">
              {t('witnesses.noData')}
            </p>
            <p className="text-[12px] text-muted-foreground mt-1">
              {t('witnesses.noDataHint')}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
