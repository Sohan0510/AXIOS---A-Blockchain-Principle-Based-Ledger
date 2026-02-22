import { useState, useCallback } from "react";
import { useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "motion/react";
import {
  Search,
  Loader2,
  AlertCircle,
  ArrowLeft,
  ArrowLeftRight,
  Clock,
  User,
  FileText,
  ExternalLink,
} from "lucide-react";
import { adminAPI } from "../lib/api";
import { GlowButton } from "../components/GlowButton";
import { LandTypeBadge } from "../components/LandTypeBadge";
import { toast } from "sonner";

/* ── Types matching backend response ── */
interface TransferHistory {
  version: number;
  action: string;
  timestamp: string;
  owner: Record<string, unknown>;
  details: string;
  previousOwner?: string;
  changedBy?: string;
}

interface LandHistoryData {
  landId: string;
  landType: string;
  surveyNumber: string;
  location: string;
  totalVersions: number;
  history: TransferHistory[];
}

export default function TransferredLands() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [searchId, setSearchId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [historyData, setHistoryData] = useState<LandHistoryData | null>(null);

  const handleSearch = useCallback(async () => {
    if (!searchId.trim()) {
      setError(t('transferHistory.enterLandId'));
      return;
    }
    setLoading(true);
    setError(null);
    setHistoryData(null);
    try {
      const res = await adminAPI.getLandTransferHistory(searchId.trim());
      setHistoryData(res.data);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || t('transferHistory.notFound');
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [searchId]);

  const handleClear = () => {
    setSearchId("");
    setHistoryData(null);
    setError(null);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* ── Header ── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <button
          onClick={() => navigate("/dashboard")}
          className="flex items-center gap-1.5 text-[13px] text-text-muted hover:text-text-secondary transition-colors mb-4"
        >
          <ArrowLeft size={14} /> {t('transferHistory.backToDashboard')}
        </button>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#7c3aed]/10 border border-[#7c3aed]/20 flex items-center justify-center">
            <ArrowLeftRight size={18} className="text-[#7c3aed]" />
          </div>
          <div>
            <h1 className="text-[24px] text-text-primary">{t('transferHistory.title')}</h1>
            <p className="text-[13px] text-text-muted">
              {t('transferHistory.subtitle')}
            </p>
          </div>
        </div>
      </motion.div>

      {/* ── Search Box ── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.5 }}
        className="rounded-xl border border-surface-3 bg-surface-1 p-6 mb-6 shadow-lg shadow-black/15"
      >
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={searchId}
            onChange={(e) => {
              setSearchId(e.target.value);
              if (error) setError(null);
            }}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder={t('transferHistory.placeholder')}
            className="flex-1 rounded-lg border border-surface-3 bg-surface-0 px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:border-status-blue focus:ring-1 focus:ring-status-blue/30 outline-none transition-all duration-200"
          />
          <button
            onClick={handleSearch}
            disabled={loading || !searchId.trim()}
            className="flex items-center justify-center gap-2 px-6 py-2.5 text-sm rounded-lg bg-status-blue text-white hover:bg-status-blue/85 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm shadow-status-blue/20"
          >
            {loading ? (
              <Loader2 size={15} className="animate-spin" />
            ) : (
              <Search size={15} />
            )}
            {t('transferHistory.search')}
          </button>
        </div>

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 rounded-lg border border-status-red/20 bg-status-red/5 p-4 flex items-center gap-2"
            >
              <AlertCircle size={16} className="text-status-red shrink-0" />
              <p className="text-sm text-status-red">{error}</p>
            </motion.div>
          )}
        </AnimatePresence>

        <p className="text-[12px] text-text-muted mt-3">
          {t('transferHistory.hint')}
        </p>
      </motion.div>

      {/* ── Loading State ── */}
      {loading && (
        <div className="flex items-center justify-center min-h-[30vh]">
          <div className="flex flex-col items-center gap-3">
            <Loader2 size={24} className="animate-spin text-status-blue" />
            <span className="text-sm text-text-muted">{t('transferHistory.fetching')}</span>
          </div>
        </div>
      )}

      {/* ── History Results ── */}
      <AnimatePresence>
        {!loading && historyData && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.4 }}
          >
            {/* Land summary card */}
            <div className="rounded-xl border border-surface-3 bg-surface-1 p-5 mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h2 className="text-text-primary">{historyData.landId}</h2>
                    <LandTypeBadge type={historyData.landType || "Unknown"} />
                  </div>
                  <p className="text-sm text-text-muted">
                    {t('transferHistory.surveyNo')} {historyData.surveyNumber} &middot; {historyData.location}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] px-3 py-1 rounded-full border border-[#7c3aed]/20 bg-[#7c3aed]/10 text-[#7c3aed]">
                    {historyData.totalVersions} {historyData.totalVersions !== 1 ? t('transferHistory.versions') : t('transferHistory.version')}
                  </span>
                  <GlowButton
                    size="sm"
                    onClick={() => navigate(`/dashboard/land/${historyData.landId}`)}
                  >
                    <ExternalLink size={13} /> {t('transferHistory.viewFullRecord')}
                  </GlowButton>
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className="space-y-0">
              {historyData.history.map((entry, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + idx * 0.08 }}
                  className="flex gap-4"
                >
                  {/* Timeline line + dot */}
                  <div className="flex flex-col items-center pt-1">
                    <div
                      className={`w-3 h-3 rounded-full border-2 shrink-0 ${
                        idx === historyData.history.length - 1
                          ? "border-status-blue bg-status-blue"
                          : "border-surface-3 bg-surface-2"
                      }`}
                    />
                    {idx < historyData.history.length - 1 && (
                      <div className="w-px flex-1 bg-surface-3 mt-1" />
                    )}
                  </div>

                  {/* Entry card */}
                  <div className="flex-1 pb-6">
                    <div className="rounded-xl border border-surface-3 bg-surface-1 overflow-hidden">
                      {/* Header bar */}
                      <div className="flex items-center justify-between border-b border-surface-3 px-5 py-3">
                        <div className="flex items-center gap-2">
                          <Clock size={14} className="text-text-muted" />
                          <h3 className="text-sm text-text-primary">{entry.action}</h3>
                        </div>
                        <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-status-blue/10 border border-status-blue/20 text-status-blue">
                          v{entry.version}
                        </span>
                      </div>

                      {/* Body */}
                      <div className="p-5 space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <div className="text-[11px] text-text-muted mb-0.5">{t('transferHistory.timestamp')}</div>
                            <div className="text-sm text-text-primary">
                              {new Date(entry.timestamp).toLocaleString("en-IN")}
                            </div>
                          </div>
                          <div>
                            <div className="text-[11px] text-text-muted mb-0.5">{t('transferHistory.details')}</div>
                            <div className="text-sm text-text-primary">{entry.details}</div>
                          </div>
                          {entry.previousOwner && (
                            <div>
                              <div className="text-[11px] text-text-muted mb-0.5">{t('transferHistory.previousOwner')}</div>
                              <div className="text-sm text-status-amber">{entry.previousOwner}</div>
                            </div>
                          )}
                          {entry.changedBy && (
                            <div>
                              <div className="text-[11px] text-text-muted mb-0.5">{t('transferHistory.changedBy')}</div>
                              <div className="text-sm text-text-primary">{entry.changedBy}</div>
                            </div>
                          )}
                        </div>

                        {/* Owner info */}
                        {entry.owner && Object.keys(entry.owner).length > 0 && (
                          <OwnerBlock owner={entry.owner} />
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Clear & back */}
            <div className="flex justify-end mt-4">
              <GlowButton variant="cyan" size="sm" onClick={handleClear}>
                {t('transferHistory.clearResults')}
              </GlowButton>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Empty state (no results, no loading, no error) ── */}
      {!loading && !historyData && !error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="rounded-xl border border-surface-3 bg-surface-1 p-12 text-center"
        >
          <FileText size={28} className="text-text-muted mx-auto mb-3" />
          <p className="text-sm text-text-muted">
            {t('transferHistory.emptyState')}
          </p>
        </motion.div>
      )}
    </div>
  );
}

/* ── Owner block for history entries ── */
function OwnerBlock({ owner }: { owner: Record<string, unknown> }) {
  const { t } = useTranslation();
  const get = (key: string) => (owner[key] as string) || "";
  const fields = [
    { label: t('transferHistory.name'), key: "ownerName" },
    { label: t('transferHistory.ownerId'), key: "ownerId" },
    { label: t('transferHistory.fatherSpouse'), key: "fatherOrSpouseName" },
    { label: t('transferHistory.type'), key: "ownerType" },
    { label: t('transferHistory.contact'), key: "contactNumber" },
  ];
  const address = get("address");

  return (
    <div className="rounded-lg border border-surface-3 bg-surface-0 p-4">
      <div className="flex items-center gap-2 mb-3">
        <User size={13} className="text-text-muted" />
        <span className="text-[11px] text-text-muted uppercase tracking-wider">
          {t('transferHistory.ownerDetails')}
        </span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {fields.map(
          (f) =>
            get(f.key) && (
              <HistoryField key={f.key} label={f.label} value={get(f.key)} />
            )
        )}
        {address && <HistoryField label={t('transferHistory.address')} value={address} full />}
      </div>
    </div>
  );
}

/* ── Small helper for history fields ── */
function HistoryField({
  label,
  value,
  full,
}: {
  label: string;
  value: string;
  full?: boolean;
}) {
  return (
    <div className={full ? "sm:col-span-2" : ""}>
      <div className="text-[11px] text-text-muted mb-0.5">{label}</div>
      <div className="text-sm text-text-primary">{value}</div>
    </div>
  );
}
