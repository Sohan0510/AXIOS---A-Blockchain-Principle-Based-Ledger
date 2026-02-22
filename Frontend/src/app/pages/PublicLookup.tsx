import { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "motion/react";
import {
  Search,
  Download,
  Loader2,
  AlertCircle,
  MapPin,
  User,
  FileText,
  Globe,
  ShieldCheck,
  Scale,
  Landmark,
  Hash,
} from "lucide-react";
import { publicAPI } from "../lib/api";
import { GlowButton } from "../components/GlowButton";
import { TomTomMap } from "../components/TomTomMap";

interface PublicLandData {
  landId: string;
  landType: string;
  surveyNumber: string;
  area: { acres: number; guntas: number; sqFt: number };
  village: string;
  taluk: string;
  district: string;
  ownerName: string;
  sharePercentage: number;
  lastTransferType: string;
  transferDate: string;
  mutationStatus: string;
  geoLatitude?: number;
  geoLongitude?: number;
  loanActive: boolean;
  courtCase: boolean;
  integrity: {
    merkleRoot: string;
    integrityVerified: boolean;
    lastHashedAt: string;
  };
}

export function PublicLookup() {
  const [landId, setLandId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<PublicLandData | null>(null);
  const { t } = useTranslation();

  const handleFetch = useCallback(async () => {
    if (!landId.trim()) {
      setError(t('publicLookup.enterLandId'));
      return;
    }
    setLoading(true);
    setError(null);
    setData(null);
    try {
      const res = await publicAPI.getLandData(landId.trim());
      setData(res.data);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || t('publicLookup.notFound');
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [landId]);

  const handleDownload = useCallback(() => {
    if (!data?.landId) return;
    window.open(publicAPI.getLandPDF(data.landId), "_blank");
  }, [data]);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <p className="text-[11px] uppercase tracking-widest text-text-muted mb-2">
          Public Data
        </p>
        <h1 className="text-[28px] text-text-primary">{t('publicLookup.title')}</h1>
        
      </motion.div>

      {/* Search */}
      <div className="rounded-xl border border-border bg-card/60 p-6 mb-6">
        <div className="flex items-center gap-3">
          <div className="flex-1 relative">
            <Search
              size={16}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted"
            />
            <input
              type="text"
              value={landId}
              onChange={(e) => {
                setLandId(e.target.value);
                if (error) setError(null);
              }}
              onKeyDown={(e) => e.key === "Enter" && handleFetch()}
              placeholder={t('publicLookup.placeholder')}
              className="w-full pl-11 pr-4 py-3 rounded-lg border border-border bg-surface-0/60 text-[14px] text-text-primary placeholder-text-muted focus:border-primary/50 focus:ring-1 focus:ring-primary/20 outline-none transition-all"
            />
          </div>
          <GlowButton onClick={handleFetch} loading={loading}>
            <Search size={14} /> {t('publicLookup.search')}
          </GlowButton>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2 mt-4 px-4 py-3 rounded-lg bg-status-red/10 border border-status-red/20"
          >
            <AlertCircle size={14} className="text-status-red" />
            <p className="text-[13px] text-status-red">{error}</p>
          </motion.div>
        )}
      </div>

      {/* Results */}
      <AnimatePresence mode="wait">
        {data && (
          <motion.div
            key={data.landId}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4, ease: [0.2, 0.9, 0.25, 1] }}
            className="space-y-4"
          >
            {/* Identity */}
            <div className="rounded-xl border border-border bg-card/60 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                    <FileText size={18} className="text-primary" />
                  </div>
                  <div>
                    <h2 className="text-[16px] text-text-primary">
                      {data.landId}
                    </h2>
                    <span className="text-[12px] text-text-muted">
                      {data.landType} — Survey #{data.surveyNumber}
                    </span>
                  </div>
                </div>
                <GlowButton
                  variant="green"
                  size="sm"
                  onClick={handleDownload}
                >
                  <Download size={13} /> {t('publicLookup.pdf')}
                </GlowButton>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <InfoItem
                  icon={<MapPin size={13} className="text-status-amber" />}
                  label={t('publicLookup.location')}
                  value={`${data.village}, ${data.taluk}`}
                />
                <InfoItem
                  icon={<Globe size={13} className="text-[#06b6d4]" />}
                  label={t('publicLookup.district')}
                  value={data.district}
                />
                <InfoItem
                  icon={<Hash size={13} className="text-[#7c3aed]" />}
                  label={t('publicLookup.area')}
                  value={`${data.area.acres}ac ${data.area.guntas}g`}
                />
                <InfoItem
                  icon={<User size={13} className="text-primary" />}
                  label={t('publicLookup.owner')}
                  value={data.ownerName}
                />
                <InfoItem
                  icon={<Scale size={13} className="text-status-red" />}
                  label={t('publicLookup.transfer')}
                  value={data.lastTransferType}
                />
                <InfoItem
                  icon={<Landmark size={13} className="text-status-green" />}
                  label={t('publicLookup.mutation')}
                  value={data.mutationStatus}
                />
              </div>
            </div>

            {/* Map */}
            {data.geoLatitude != null && data.geoLongitude != null && (
              <TomTomMap
                latitude={data.geoLatitude}
                longitude={data.geoLongitude}
                label={`${data.landId} — ${data.village}, ${data.district}`}
              />
            )}

            {/* Flags */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FlagCard
                label={t('publicLookup.loanStatus')}
                active={data.loanActive}
                activeText={t('publicLookup.activeLoan')}
                inactiveText={t('publicLookup.noActiveLoan')}
                activeColor="text-status-amber"
                activeBg="bg-status-amber/10 border-status-amber/20"
                inactiveBg="bg-status-green/5 border-status-green/10"
              />
              <FlagCard
                label={t('publicLookup.courtCase')}
                active={data.courtCase}
                activeText={t('publicLookup.ongoing')}
                inactiveText={t('publicLookup.none')}
                activeColor="text-status-red"
                activeBg="bg-status-red/10 border-status-red/20"
                inactiveBg="bg-status-green/5 border-status-green/10"
              />
            </div>

            {/* Integrity */}
            <div className="rounded-xl border border-border bg-card/60 p-6">
              <div className="flex items-center gap-2 mb-4">
                <ShieldCheck
                  size={16}
                  className={
                    data.integrity.integrityVerified
                      ? "text-status-green"
                      : "text-status-red"
                  }
                />
                <h3 className="text-[14px] text-text-primary">
                  {t('publicLookup.integrityStatus')}
                </h3>
                <span
                  className={`ml-auto text-[11px] px-2 py-0.5 rounded-full ${
                    data.integrity.integrityVerified
                      ? "bg-status-green/10 text-status-green"
                      : "bg-status-red/10 text-status-red"
                  }`}
                >
                  {data.integrity.integrityVerified ? t('publicLookup.verified') : t('publicLookup.tampered')}
                </span>
              </div>
              <div className="rounded-lg bg-surface-0 p-4 border border-border">
                <span className="text-[10px] text-text-muted uppercase tracking-wider">
                  {t('publicLookup.merkleRoot')}
                </span>
                <p className="text-[12px] text-status-green font-mono mt-1 break-all">
                  {data.integrity.merkleRoot}
                </p>
              </div>
              {data.integrity.lastHashedAt && (
                <p className="text-[11px] text-muted-foreground mt-3">
                  {t('publicLookup.lastHashed')}
                  {new Date(data.integrity.lastHashedAt).toLocaleString()}
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty state */}
      {!data && !loading && !error && (
        <div className="rounded-xl border border-border bg-card/60 p-12 text-center">
          <Globe size={32} className="text-text-muted mx-auto mb-3" />
          <p className="text-[14px] text-text-muted">
            {t('publicLookup.emptyState')}
          </p>
          <p className="text-[12px] text-muted-foreground mt-1">
            {t('publicLookup.emptyHint')}
          </p>
        </div>
      )}
    </div>
  );
}

function InfoItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-2">
      <div className="mt-0.5">{icon}</div>
      <div>
        <p className="text-[10px] text-text-muted uppercase tracking-wider">
          {label}
        </p>
        <p className="text-[13px] text-text-primary">{value || "\u2014"}</p>
      </div>
    </div>
  );
}

function FlagCard({
  label,
  active,
  activeText,
  inactiveText,
  activeColor,
  activeBg,
  inactiveBg,
}: {
  label: string;
  active: boolean;
  activeText: string;
  inactiveText: string;
  activeColor: string;
  activeBg: string;
  inactiveBg: string;
}) {
  return (
    <div
      className={`rounded-xl border p-4 ${active ? activeBg : inactiveBg}`}
    >
      <p className="text-[10px] text-text-muted uppercase tracking-wider mb-1">
        {label}
      </p>
      <p
        className={`text-[14px] ${
          active ? activeColor : "text-status-green"
        }`}
      >
        {active ? activeText : inactiveText}
      </p>
    </div>
  );
}
