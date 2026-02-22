import { useState, useCallback, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  Search,
  Download,
  Loader2,
  AlertCircle,
  MapPin,
  User,
  FileText,
  Hash,
  ShieldCheck,
  Scale,
  Landmark,
  ArrowRight,
  CheckCircle2,
  Lock,
  Globe,
  ChevronDown,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { publicAPI } from "../lib/api";
import { TomTomMap } from "../components/TomTomMap";
import { IntegrityBadge } from "../components/IntegrityBadge";
import { LandTypeBadge } from "../components/LandTypeBadge";
import { StatusBadge } from "../components/StatusBadge";
import { MerkleRootDisplay } from "../components/MerkleRootDisplay";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import vid1 from "../../assets/images/vid1.jpg";
import vid2 from "../../assets/images/vid2.jpg";
import vid3 from "../../assets/images/vid3.jpg";

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

export function PublicLanding() {
  const [landId, setLandId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<PublicLandData | null>(null);
  const [searched, setSearched] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const resultsRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation();

  // Array of carousel images from assets folder
  const carouselImages = [vid1, vid2, vid3];

  // Auto-rotate carousel every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % carouselImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [carouselImages.length]);

  const features = [
    {
      icon: ShieldCheck,
      title: t('landing.features.merkleTitle'),
      description: t('landing.features.merkleDesc'),
      iconBg: "bg-status-green/10 border-status-green/20",
      iconColor: "text-status-green",
    },
    {
      icon: Lock,
      title: t('landing.features.rsaTitle'),
      description: t('landing.features.rsaDesc'),
      iconBg: "bg-status-blue/10 border-status-blue/20",
      iconColor: "text-status-blue",
    },
    {
      icon: Globe,
      title: t('landing.features.publicTitle'),
      description: t('landing.features.publicDesc'),
      iconBg: "bg-status-amber/10 border-status-amber/20",
      iconColor: "text-status-amber",
    },
  ];

  const handleFetch = useCallback(async () => {
    if (!landId.trim()) {
      setError("Please enter a valid Land ID.");
      return;
    }
    setLoading(true);
    setError(null);
    setData(null);
    setSearched(true);
    try {
      const res = await publicAPI.getLandData(landId.trim());
      setData(res.data);
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 100);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Record not found or server unavailable.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [landId]);

  const handleDownload = useCallback(() => {
    if (!data?.landId) return;
    window.open(publicAPI.getLandPDF(data.landId), "_blank");
  }, [data]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleFetch();
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background gradient effects */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-status-blue/[0.04] rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-status-green/[0.02] rounded-full blur-3xl" />
        </div>

        {/* Carousel Background Images */}
        <div className="absolute inset-0 overflow-hidden opacity-75">
          <AnimatePresence mode="wait">
            <motion.img
              key={currentImageIndex}
              src={carouselImages[currentImageIndex]}
              alt="Carousel"
              initial={{ x: 1000, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -1000, opacity: 0 }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
              className="absolute inset-0 w-full h-full object-cover"
            />
          </AnimatePresence>
        </div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 pt-16 sm:pt-24 pb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="text-center max-w-3xl mx-auto"
          >
            {/* Pill badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1, duration: 0.4 }}
              className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full bg-surface-1 border border-surface-3"
            >
              <div className="h-1.5 w-1.5 rounded-full bg-status-green animate-pulse" />
              <span className="text-xs text-text-muted">
                {t('landing.badge')}
              </span>
            </motion.div>

            {/* Main headline with glassy background */}
            <div className="relative mb-4 px-4 py-4 rounded-2xl backdrop-blur-xl bg-white/30 border border-white/40 shadow-lg shadow-black/5 w-fit mx-auto">
              <h1
                style={{
                  fontSize: "clamp(28px, 5vw, 48px)",
                  lineHeight: "1.15",
                  letterSpacing: "-0.02em",
                  color: "#1a1410",
                  textShadow: "0 1px 4px rgba(255, 255, 255, 0.3)",
                }}
              >
                {t('landing.headline1')}
                <br />
                <span style={{ color: "#5c3d1a", fontFamily: "'Playfair Display', serif", textShadow: "0 1px 4px rgba(255, 255, 255, 0.25)" }}>
                  {t('landing.headline2')}
                </span>
              </h1>
            </div>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="text-text-secondary max-w-xl mx-auto mb-10"
              style={{ fontSize: "15px", lineHeight: "1.6" }}
            >
              {t('landing.subtitle')}
            </motion.p>

            {/* Search Bar */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="max-w-xl mx-auto"
            >
              <div className="relative flex items-center rounded-xl border border-surface-3 bg-surface-1 p-1.5 shadow-lg shadow-black/20 focus-within:border-status-blue/40 focus-within:shadow-status-blue/10 transition-all duration-300">
                <div className="flex items-center pl-3 pr-2 text-text-muted">
                  <Search size={18} />
                </div>
                <input
                  type="text"
                  value={landId}
                  onChange={(e) => {
                    setLandId(e.target.value);
                    if (error) setError(null);
                  }}
                  onKeyDown={handleKeyDown}
                  placeholder={t('landing.searchPlaceholder')}
                  className="flex-1 bg-transparent py-3 px-2 text-sm text-text-primary placeholder:text-text-muted outline-none"
                />
                <button
                  onClick={handleFetch}
                  disabled={loading || !landId.trim()}
                  className="flex items-center gap-2 px-6 py-3 text-sm rounded-lg bg-status-blue text-white hover:bg-status-blue/85 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm shadow-status-blue/25"
                >
                  {loading ? (
                    <Loader2 size={15} className="animate-spin" />
                  ) : (
                    <Search size={15} />
                  )}
                  <span className="hidden sm:inline">{t('landing.searchButton')}</span>
                  <span className="sm:hidden">{t('landing.searchButtonMobile')}</span>
                </button>
              </div>

              {/* Error */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: "auto" }}
                    exit={{ opacity: 0, y: -8, height: 0 }}
                    transition={{ duration: 0.25 }}
                    className="mt-3"
                  >
                    <div className="flex items-center gap-2 rounded-lg border border-status-red/20 bg-status-red/5 px-4 py-3">
                      <AlertCircle
                        size={15}
                        className="text-status-red shrink-0"
                      />
                      <span className="text-sm text-status-red">{error}</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </motion.div>

          {/* Scroll hint */}
          {!searched && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1, duration: 0.5 }}
              className="flex justify-center mt-12"
            >
              <motion.div
                animate={{ y: [0, 6, 0] }}
                transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
              >
                <ChevronDown size={20} className="text-text-muted/50" />
              </motion.div>
            </motion.div>
          )}

          {/* Carousel Indicators */}
          <div className="flex justify-center gap-2 mt-8 relative z-10">
            {carouselImages.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentImageIndex(idx)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  idx === currentImageIndex
                    ? "bg-status-blue w-8"
                    : "bg-surface-3 w-2 hover:bg-surface-2"
                }`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Results Section */}
      <div ref={resultsRef}>
        <AnimatePresence mode="wait">
          {/* Loading */}
          {loading && (
            <motion.section
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mx-auto max-w-4xl px-4 sm:px-6 py-8"
            >
              <div className="flex flex-col items-center justify-center py-16">
                <div className="relative">
                  <div className="absolute inset-0 rounded-full bg-status-blue/10 animate-ping" />
                  <div className="relative flex items-center justify-center w-16 h-16 rounded-full bg-surface-1 border border-surface-3">
                    <Loader2
                      size={24}
                      className="animate-spin text-status-blue"
                    />
                  </div>
                </div>
                <p className="mt-4 text-sm text-text-muted">
                  {t('landing.fetchingRecord')}
                </p>
                <div className="mt-3 flex gap-1">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      className="h-1 w-8 rounded-full bg-status-blue/30"
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{
                        repeat: Infinity,
                        duration: 1.2,
                        delay: i * 0.2,
                      }}
                    />
                  ))}
                </div>
              </div>
            </motion.section>
          )}

          {/* Results */}
          {data && !loading && (
            <motion.section
              key="results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="mx-auto max-w-4xl px-4 sm:px-6 py-8"
            >
              <div
                className={`rounded-xl border overflow-hidden shadow-xl shadow-black/20 ${
                  data.integrity.integrityVerified
                    ? "border-status-green/20"
                    : "border-status-red/20"
                }`}
              >
                {/* Result Header */}
                <div
                  className={`px-6 py-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 ${
                    data.integrity.integrityVerified
                      ? "bg-gradient-to-r from-status-green/5 to-transparent border-b border-status-green/10"
                      : "bg-gradient-to-r from-status-red/5 to-transparent border-b border-status-red/10"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-11 w-11 items-center justify-center rounded-lg ${
                        data.integrity.integrityVerified
                          ? "bg-status-green/10 border border-status-green/20"
                          : "bg-status-red/10 border border-status-red/20"
                      }`}
                    >
                      {data.integrity.integrityVerified ? (
                        <CheckCircle2 size={20} className="text-status-green" />
                      ) : (
                        <AlertCircle size={20} className="text-status-red" />
                      )}
                    </div>
                    <div>
                      <div className="text-text-primary" style={{ fontSize: "15px" }}>
                        {data.landId}
                      </div>
                      <div className="text-xs text-text-muted">
                        Survey No. {data.surveyNumber}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <LandTypeBadge type={data.landType} />
                    <IntegrityBadge
                      verified={data.integrity.integrityVerified}
                    />
                  </div>
                </div>

                {/* Result Body */}
                <div className="bg-surface-1 p-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-5">
                    <DataField
                      icon={<Hash size={14} />}
                      label="Land ID"
                      value={data.landId}
                    />
                    <DataField
                      icon={<FileText size={14} />}
                      label="Land Type"
                      value={data.landType}
                    />
                    <DataField
                      icon={<Hash size={14} />}
                      label="Survey Number"
                      value={data.surveyNumber}
                    />
                    <DataField
                      icon={<MapPin size={14} />}
                      label="Area"
                      value={`${data.area.acres} Acres, ${data.area.guntas} Guntas (${data.area.sqFt.toLocaleString()} sq.ft)`}
                    />
                    <DataField
                      icon={<MapPin size={14} />}
                      label="Village"
                      value={data.village}
                    />
                    <DataField
                      icon={<MapPin size={14} />}
                      label="Taluk"
                      value={data.taluk}
                    />
                    <DataField
                      icon={<MapPin size={14} />}
                      label="District"
                      value={data.district}
                    />
                    <DataField
                      icon={<User size={14} />}
                      label="Owner Name"
                      value={data.ownerName}
                    />
                    <DataField
                      icon={<Scale size={14} />}
                      label="Mutation Status"
                      value={
                        <StatusBadge
                          status={data.mutationStatus}
                          variant="mutation"
                        />
                      }
                    />
                    <DataField
                      icon={<Landmark size={14} />}
                      label="Loan Active"
                      value={
                        <StatusBadge
                          status={data.loanActive ? "Yes" : "No"}
                          variant="boolean"
                        />
                      }
                    />
                    <DataField
                      icon={<Scale size={14} />}
                      label="Court Case"
                      value={
                        <StatusBadge
                          status={data.courtCase ? "Yes" : "No"}
                          variant="boolean"
                        />
                      }
                    />
                    <DataField
                      icon={<ShieldCheck size={14} />}
                      label="Last Hashed"
                      value={
                        data.integrity.lastHashedAt
                          ? new Date(
                              data.integrity.lastHashedAt
                            ).toLocaleDateString("en-IN", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })
                          : "—"
                      }
                    />
                  </div>

                  {/* Merkle Root */}
                  <div className="mt-6">
                    <MerkleRootDisplay
                      root={data.integrity.merkleRoot}
                      label="Merkle Root"
                      variant={
                        data.integrity.integrityVerified ? "match" : "mismatch"
                      }
                    />
                  </div>

                  {/* Tampered Warning */}
                  {!data.integrity.integrityVerified && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="mt-4 rounded-lg border border-status-red/20 bg-status-red/5 p-4"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <AlertCircle size={16} className="text-status-red" />
                        <span className="text-sm text-status-red">
                          {t('landing.integrityWarning')}
                        </span>
                      </div>
                      <p className="text-xs text-text-secondary">
                        {t('landing.integrityWarningDesc')}
                      </p>
                    </motion.div>
                  )}

                  {/* Land Location Map */}
                  {data.geoLatitude != null && data.geoLongitude != null && (
                    <div className="mt-6">
                      <TomTomMap
                        latitude={data.geoLatitude}
                        longitude={data.geoLongitude}
                        label={`${data.landId} — ${data.village}, ${data.district}`}
                        height="220px"
                      />
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="mt-6 flex flex-wrap gap-3">
                    <button
                      onClick={handleDownload}
                      className="flex items-center gap-2 px-5 py-2.5 text-sm rounded-lg bg-status-blue text-white hover:bg-status-blue/85 transition-all duration-200 shadow-sm shadow-status-blue/20"
                    >
                      <Download size={15} />
                      {t('landing.downloadCert')}
                    </button>
                    <button
                      onClick={() => {
                        setData(null);
                        setSearched(false);
                        setLandId("");
                      }}
                      className="flex items-center gap-2 px-5 py-2.5 text-sm rounded-lg border border-surface-3 bg-surface-2 text-text-secondary hover:bg-surface-3 hover:text-text-primary transition-all duration-200"
                    >
                      {t('landing.searchAnother')}
                    </button>
                  </div>
                </div>
              </div>
            </motion.section>
          )}

          {/* Empty State after failed search */}
          {searched && !data && !loading && error && (
            <motion.section
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mx-auto max-w-4xl px-4 sm:px-6 py-8"
            >
              <div className="text-center py-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-surface-1 border border-surface-3 mb-4">
                  <Search size={24} className="text-text-muted" />
                </div>
                <p className="text-sm text-text-muted">
                  {t('landing.noRecordsFound')}
                </p>
              </div>
            </motion.section>
          )}
        </AnimatePresence>
      </div>

      {/* Feature Cards Section */}
      {!searched && (
        <section className="mx-auto max-w-7xl px-4 sm:px-6 py-16">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {features.map((feature, idx) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + idx * 0.12, duration: 0.5 }}
                className="group rounded-xl border border-surface-3 bg-surface-1 p-6 hover:border-surface-3/80 hover:bg-surface-1/80 transition-all duration-300"
              >
                <div
                  className={`flex h-11 w-11 items-center justify-center rounded-lg mb-4 border ${feature.iconBg}`}
                >
                  <feature.icon
                    size={20}
                    className={feature.iconColor}
                  />
                </div>
                <h3
                  className="text-text-primary mb-2"
                  style={{ fontSize: "15px" }}
                >
                  {feature.title}
                </h3>
                <p
                  className="text-text-secondary"
                  style={{ fontSize: "13px", lineHeight: "1.6" }}
                >
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* Trust / Stats Section */}
      {!searched && (
        <section className="mx-auto max-w-7xl px-4 sm:px-6 py-12 sm:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            {/* Left content */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
            >
              <h2
                className="text-text-primary mb-4"
                style={{
                  fontSize: "clamp(22px, 3vw, 30px)",
                  lineHeight: "1.2",
                  letterSpacing: "-0.01em",
                }}
              >
                {t('landing.trustTitle1')}
                <br />
                {t('landing.trustTitle2')}
              </h2>
              <p
                className="text-text-secondary mb-8 max-w-md"
                style={{ fontSize: "14px", lineHeight: "1.7" }}
              >
                {t('landing.trustDesc')}
              </p>

              {/* Stats */}
              <div className="flex gap-10 mb-8">
                <div>
                  <div
                    className="text-status-blue"
                    style={{
                      fontSize: "clamp(24px, 3vw, 36px)",
                      lineHeight: "1",
                      letterSpacing: "-0.02em",
                    }}
                  >
                    2.4M+
                  </div>
                  <div
                    className="text-text-muted mt-1 tracking-wider"
                    style={{ fontSize: "10px" }}
                  >
                    {t('landing.secureRecords')}
                  </div>
                </div>
                <div>
                  <div
                    className="text-status-green"
                    style={{
                      fontSize: "clamp(24px, 3vw, 36px)",
                      lineHeight: "1",
                      letterSpacing: "-0.02em",
                    }}
                  >
                    0.00s
                  </div>
                  <div
                    className="text-text-muted mt-1 tracking-wider"
                    style={{ fontSize: "10px" }}
                  >
                    {t('landing.verificationTime')}
                  </div>
                </div>
              </div>

              <a
                href="/verify"
                className="inline-flex items-center gap-2 text-status-blue hover:underline transition-colors group"
                style={{ fontSize: "13px" }}
              >
                {t('landing.learnMore')}
                <ArrowRight
                  size={14}
                  className="group-hover:translate-x-1 transition-transform"
                />
              </a>
            </motion.div>

            {/* Right image */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7, duration: 0.6 }}
              className="relative"
            >
              <div className="relative rounded-xl overflow-hidden border border-surface-3 shadow-2xl shadow-black/30">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1767334851794-e414a1f30101?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhZXJpYWwlMjBjaXR5JTIwc2t5bGluZSUyMGJ1aWxkaW5nc3xlbnwxfHx8fDE3NzE1NzgwNjl8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                  alt="Aerial city view"
                  className="w-full h-64 sm:h-80 object-cover"
                  style={{ filter: "brightness(0.6) saturate(0.8)" }}
                />
                {/* Overlay info */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <div className="flex items-center gap-2 mb-2">
                    <ShieldCheck size={16} className="text-status-green" />
                    <span className="text-sm text-white">
                      {t('landing.integrity100')}
                    </span>
                  </div>
                  {/* Context removed per request: keep only Integrity: 100% */}
                </div>
              </div>
              {/* Floating badge removed per request */}
            </motion.div>
          </div>
        </section>
      )}
    </div>
  );
}

function DataField({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex items-start gap-2.5 p-3 rounded-lg bg-surface-0/50 border border-surface-3/50"
    >
      <span className="mt-0.5 text-text-muted shrink-0">{icon}</span>
      <div className="min-w-0">
        <div className="text-text-muted mb-0.5" style={{ fontSize: "10px" }}>
          {label}
        </div>
        <div className="text-sm text-text-primary break-words">
          {value || "—"}
        </div>
      </div>
    </motion.div>
  );
}