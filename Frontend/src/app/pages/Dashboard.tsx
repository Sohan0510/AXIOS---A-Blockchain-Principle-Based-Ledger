import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router";
import { motion } from "motion/react";
import {
  FileText,
  Server,
  Plus,
  Search,
  ShieldCheck,
  Globe,
  RefreshCw,
  Download,
  ArrowRight,
  ArrowLeftRight,
  Zap,
} from "lucide-react";
import { adminAPI } from "../lib/api";
import { useAuth } from "../lib/auth";
import { useTranslation } from "react-i18next";
import { GlowButton } from "../components/GlowButton";

interface WitnessData {
  url: string;
  status: string;
  info?: { status: string };
  latency?: number;
  error?: string;
}

export function Dashboard() {
  const navigate = useNavigate();
  const { adminName } = useAuth();
  const { t } = useTranslation();
  const [landCount, setLandCount] = useState<number | null>(null);
  const [witnesses, setWitnesses] = useState<{
    total: number;
    active: number;
    witnesses: WitnessData[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(new Date());

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      const [countRes, witnessRes] = await Promise.allSettled([
        adminAPI.getLandCount(),
        adminAPI.getWitnesses(),
      ]);
      if (countRes.status === "fulfilled") setLandCount(countRes.value.data.count);
      if (witnessRes.status === "fulfilled") setWitnesses(witnessRes.value.data);
    } catch {
      /* silently fail — cards show placeholders */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  /* live clock */
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const dateStr = now.toLocaleDateString("en-US", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const timeStr = now.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
  });

  /* ── Quick-action definitions ── */
  const quickActions = [
    {
      title: "Create New Land Record",
      desc: "Register a new land parcel in the blockchain ledger",  
      icon: Plus,
      iconBg: "bg-status-green/10 border-status-green/20",
      iconColor: "text-status-green",
      to: "/dashboard/create",
    },
    {
      title: "Search Land Record",
      desc: "Look up any land record by ID",
      
      icon: Search,
      iconBg: "bg-primary/10 border-primary/20",
      iconColor: "text-primary",
      action: "search",
    },
    {
      title: "Verify Integrity",
      desc: "Check Merkle tree integrity for any record",
      
      icon: ShieldCheck,
      iconBg: "bg-status-green/10 border-status-green/20",
      iconColor: "text-status-green",
      to: "/dashboard/verify",
    },
    {
      title: "Public Lookup",
      desc: "View public-facing land data",
      
      icon: Globe,
      iconBg: "bg-status-amber/10 border-status-amber/20",
      iconColor: "text-status-amber",
      to: "/dashboard/public",
    },
    {
      title: "Recompute Integrity",
      desc: "Re-hash and re-sign an existing record (search first)",
      
      icon: RefreshCw,
      iconBg: "bg-[#06b6d4]/10 border-[#06b6d4]/20",
      iconColor: "text-[#06b6d4]",
      action: "search",
    },
    {
      title: "Download Certificate",
      desc: "Generate and download a PDF certificate (search first)",
      icon: Download,
      iconBg: "bg-status-red/10 border-status-red/20",
      iconColor: "text-status-red",
      action: "search",
    },
  ];

  /* ── search prompt state ── */
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchId, setSearchId] = useState("");
  const [searchTarget, setSearchTarget] = useState<string | null>(null);

  const handleActionClick = (
    action: (typeof quickActions)[number]
  ) => {
    if (action.to) {
      navigate(action.to);
    } else if (action.action === "search") {
      setSearchTarget(action.title);
      setSearchOpen(true);
    }
  };

  const handleSearchSubmit = () => {
    if (!searchId.trim()) return;
    const id = searchId.trim();
    setSearchOpen(false);
    setSearchId("");

    if (searchTarget === "Search Land Record") {
      navigate(`/dashboard/land/${id}`);
    } else if (searchTarget === "Recompute Integrity") {
      // navigate to land detail where recompute can be triggered
      navigate(`/dashboard/land/${id}`);
    } else if (searchTarget === "Download Certificate") {
      // open PDF download URL
      // use publicAPI helper which respects API_BASE_URL
      window.open(
        publicAPI.getLandPDF(id),
        "_blank"
      );
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* ── Welcome Header ── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 flex flex-wrap items-start justify-between gap-4"
      >
        <div>
          <p className="text-[11px] uppercase tracking-widest text-text-muted mb-2">
            {t('dashboard.label')}
          </p>
          <h1 className="text-[28px] text-text-primary">
            {t('dashboard.welcome')}{" "}
            <span className="bg-gradient-to-r from-[#7c3aed] to-primary bg-clip-text text-transparent">
              {adminName || "Admin"}
            </span>
          </h1>
          <p className="text-[13px] text-text-muted mt-1">
            {dateStr} &bull; {timeStr}
          </p>
        </div>
        <div className="flex gap-3">
        <GlowButton onClick={() => navigate("/dashboard/transferred")} variant="purple">
          <ArrowLeftRight size={14} /> {t('dashboard.transferredLands')}
        </GlowButton>
        <GlowButton onClick={() => navigate("/dashboard/transfer")} variant="purple">
          <ArrowLeftRight size={14} /> {t('dashboard.transfer')}
        </GlowButton>
        <GlowButton onClick={() => navigate("/dashboard/create")} variant="blue">
          <Plus size={14} /> {t('dashboard.newRecord')}
        </GlowButton>
        </div>
      </motion.div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
        {/* Total Records */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-xl border border-border bg-card/60 p-5"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="w-10 h-10 rounded-lg bg-status-green/10 border border-status-green/20 flex items-center justify-center">
              <FileText size={18} className="text-status-green" />
            </div>
            <span className="text-[10px] uppercase tracking-widest text-status-green/80">
              {t('dashboard.live')}
            </span>
          </div>
          <div className="text-[32px] text-text-primary leading-none mb-1">
            {loading ? (
              <div className="h-9 w-12 rounded bg-surface-2/30 animate-pulse" />
            ) : (
              landCount ?? 0
            )}
          </div>
          <p className="text-[13px] text-text-muted">{t('dashboard.totalRecords')}</p>
        </motion.div>

        {/* Witness Servers */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="rounded-xl border border-border bg-card/60 p-5"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Server size={18} className="text-primary" />
            </div>
            <span className="text-[10px] uppercase tracking-widest text-primary/80">
              {t('dashboard.live')}
            </span>
          </div>
          <div className="text-[32px] text-text-primary leading-none mb-1">
            {loading ? (
              <div className="h-9 w-16 rounded bg-surface-2/30 animate-pulse" />
            ) : (
              `${witnesses?.active ?? 0}/${witnesses?.total ?? 3}`
            )}
          </div>
          <p className="text-[13px] text-text-muted">{t('dashboard.witnessServers')}</p>
        </motion.div>
      </div>

      {/* ── Quick Actions ── */}
      <div className="mb-10">
        <div className="flex items-center gap-2 mb-5">
          <h2 className="text-[18px] text-text-primary">{t('dashboard.quickActions')}</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickActions.map((qa, i) => {
            const Icon = qa.icon;
            return (
              <motion.button
                key={qa.title}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.04 }}
                onClick={() => handleActionClick(qa)}
                className="group text-left rounded-xl border border-border bg-card/60 p-5 hover:border-border/80 hover:bg-card/80 transition-all cursor-pointer"
              >
                <div className="flex items-start justify-between mb-4">
                  <div
                    className={`w-10 h-10 rounded-lg border flex items-center justify-center ${qa.iconBg}`}
                  >
                    <Icon size={18} className={qa.iconColor} />
                  </div>
                  <ArrowRight
                    size={14}
                    className="text-text-muted group-hover:text-text-secondary transition-colors mt-1"
                  />
                </div>
                <h3 className="text-[14px] text-text-primary mb-1">{qa.title}</h3>
                <p className="text-[12px] text-text-muted mb-3">{qa.desc}</p>
                <p className="text-[11px] text-muted-foreground font-mono">{qa.api}</p>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* ── Search Modal ── */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-md rounded-xl border border-border bg-card p-6"
          >
            <h3 className="text-[16px] text-text-primary mb-1">{searchTarget}</h3>
            <p className="text-[12px] text-text-muted mb-4">
              {t('dashboard.enterLandId')}
            </p>
            <input
              type="text"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearchSubmit()}
              placeholder={t('dashboard.landIdPlaceholder')}
              autoFocus
              className="w-full px-4 py-3 rounded-lg border border-border bg-surface-0/60 text-[14px] text-text-primary placeholder-text-muted focus:border-primary/50 focus:ring-1 focus:ring-primary/20 outline-none transition-all mb-4"
            />
            <div className="flex justify-end gap-3">
              <GlowButton
                variant="cyan"
                size="sm"
                onClick={() => {
                  setSearchOpen(false);
                  setSearchId("");
                }}
              >
                {t('dashboard.cancel')}
              </GlowButton>
              <GlowButton
                size="sm"
                onClick={handleSearchSubmit}
                disabled={!searchId.trim()}
              >
                <Search size={13} />
                {t('dashboard.go')}
              </GlowButton>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
