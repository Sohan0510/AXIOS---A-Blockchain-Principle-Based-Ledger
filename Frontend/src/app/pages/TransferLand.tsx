import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowLeftRight,
  Search,
  User,
  FileText,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  ArrowLeft,
  Loader2,
  MapPin,
  ShieldAlert,
} from "lucide-react";
import { adminAPI } from "../lib/api";
import { useAuth } from "../lib/auth";
import { GlowButton } from "../components/GlowButton";
import { toast } from "sonner";

/* ── Types ── */
interface LandData {
  landId: string;
  landType: string;
  surveyNumber: string;
  village?: string;
  taluk?: string;
  district?: string;
  owner: {
    ownerName: string;
    ownerId?: string;
    fatherOrSpouseName?: string;
    ownerType?: string;
    sharePercentage?: number;
    contactNumber?: string;
    address?: string;
  };
  area?: { acres?: number; guntas?: number; sqFt?: number };
}

const TRANSFER_TYPES = ["Sale", "Inheritance", "Gift", "Lease", "Auction"] as const;
const OWNER_TYPES = ["Individual", "Joint", "Trust", "Company"] as const;

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

export function TransferLand() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { adminName } = useAuth();
  const { t } = useTranslation();

  /* ── Step tracking ── */
  const [step, setStep] = useState<"search" | "form" | "result">(
    searchParams.get("landId") ? "form" : "search"
  );

  /* ── Search state ── */
  const [searchId, setSearchId] = useState(searchParams.get("landId") || "");
  const [searching, setSearching] = useState(false);
  const [landData, setLandData] = useState<LandData | null>(null);

  /* ── Form state ── */
  const [newOwner, setNewOwner] = useState({
    ownerName: "",
    ownerId: "",
    fatherOrSpouseName: "",
    ownerType: "Individual" as string,
    sharePercentage: 100,
    contactNumber: "",
    address: "",
  });

  const [transferDetails, setTransferDetails] = useState({
    transferType: "Sale" as string,
    transferDate: new Date().toISOString().split("T")[0],
    registrationNumber: "",
    subRegistrarOffice: "",
    saleValue: "",
  });

  const [submitting, setSubmitting] = useState(false);

  /* ── Tamper detection state ── */
  const [tamperInfo, setTamperInfo] = useState<{
    integrityVerified: boolean;
    tamperedFields: string[] | null;
    tamperedData: Record<string, Record<string, unknown>> | null;
    storedMerkleRoot: string;
    recalculatedMerkleRoot: string;
  } | null>(null);

  /* ── Result state ── */
  const [result, setResult] = useState<{
    message: string;
    newVersion: number;
    newOwner: string;
    newMerkleRoot: string;
    integrityStatus: string;
  } | null>(null);

  /* ── Search handler ── */
  const handleSearch = async () => {
    if (!searchId.trim()) return;
    setSearching(true);
    setTamperInfo(null);
    try {
      const res = await adminAPI.fetchLand(searchId.trim());
      const { land, integrityCheck } = res.data;
      setLandData(land);

      if (!integrityCheck.integrityVerified) {
        // Data is tampered — block transfer, show details
        setTamperInfo(integrityCheck);
        toast.error("Data integrity compromised! Transfer blocked.");
        // Stay on "search" step — do NOT proceed to form
      } else {
        setTamperInfo(null);
        setStep("form");
      }
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || t('transferLand.landNotFound');
      toast.error(msg);
    } finally {
      setSearching(false);
    }
  };

  /* ── Submit handler ── */
  const handleTransfer = async () => {
    if (!landData) return;

    if (!newOwner.ownerName.trim()) {
      toast.error(t('transferLand.ownerRequired'));
      return;
    }
    if (!transferDetails.registrationNumber.trim()) {
      toast.error(t('transferLand.regRequired'));
      return;
    }

    setSubmitting(true);
    try {
      const res = await adminAPI.transferLand(landData.landId, {
        newOwner: {
          ...newOwner,
          sharePercentage: Number(newOwner.sharePercentage),
        },
        transferDetails: {
          ...transferDetails,
          transferDate: new Date(transferDetails.transferDate),
          saleValue: transferDetails.saleValue
            ? Number(transferDetails.saleValue)
            : undefined,
        },
        changedBy: adminName || "admin",
      });
      setResult(res.data);
      setStep("result");
      toast.success(t('transferLand.success'));
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string; error?: string } } })
          ?.response?.data?.message ||
        (err as { response?: { data?: { error?: string } } })?.response?.data
          ?.error ||
        t('transferLand.failedTransfer');
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  /* ── Shared field styles ── */
  const inputClass =
    "w-full px-4 py-3 rounded-lg border border-border bg-surface-0/60 text-[14px] text-text-primary placeholder-text-muted focus:border-primary/50 focus:ring-1 focus:ring-primary/20 outline-none transition-all";
  const labelClass = "block text-[12px] text-text-muted mb-1.5";

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
          <ArrowLeft size={14} /> {t('transferLand.backToDashboard')}
        </button>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-status-amber/10 border border-status-amber/20 flex items-center justify-center">
            <ArrowLeftRight size={18} className="text-status-amber" />
          </div>
          <div>
            <h1 className="text-[24px] text-text-primary">{t('transferLand.title')}</h1>
            <p className="text-[13px] text-text-muted">
              {t('transferLand.subtitle')}
            </p>
          </div>
        </div>
      </motion.div>

      {/* ── Step Indicator ── */}
      <div className="flex items-center gap-2 mb-8">
        {[
          { key: "search", label: t('transferLand.steps.search') },
          { key: "form", label: t('transferLand.steps.form') },
          { key: "result", label: t('transferLand.steps.result') },
        ].map((s, i) => {
          const isActive = step === s.key;
          const isDone =
            (s.key === "search" && step !== "search") ||
            (s.key === "form" && step === "result");
          return (
            <div key={s.key} className="flex items-center gap-2">
              {i > 0 && (
                <div
                  className={`w-8 h-px ${isDone || isActive ? "bg-primary" : "bg-border"}`}
                />
              )}
              <div
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] border transition-colors ${
                  isActive
                    ? "border-primary/40 bg-primary/10 text-primary"
                    : isDone
                      ? "border-status-green/40 bg-status-green/10 text-status-green"
                      : "border-border bg-card/40 text-text-muted"
                }`}
              >
                {isDone ? <CheckCircle2 size={12} /> : null}
                {s.label}
              </div>
            </div>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        {/* ══════════════════════════════════════════
           STEP 1 — SEARCH
        ══════════════════════════════════════════ */}
        {step === "search" && (
          <motion.div
            key="search"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            className="rounded-xl border border-border bg-card/60 p-8"
          >
            <div className="flex items-center gap-2 mb-6">
              <Search size={16} className="text-primary" />
              <h2 className="text-[16px] text-text-primary">
                {t('transferLand.searchTitle')}
              </h2>
            </div>
            <p className="text-[13px] text-text-muted mb-6">
              {t('transferLand.searchDesc')}
            </p>
            <div className="flex gap-3">
              <input
                type="text"
                value={searchId}
                onChange={(e) => {
                  setSearchId(e.target.value);
                  if (tamperInfo) setTamperInfo(null);
                }}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder={t('transferLand.searchPlaceholder')}
                autoFocus
                className={inputClass + " flex-1"}
              />
              <GlowButton
                onClick={handleSearch}
                loading={searching}
                disabled={!searchId.trim()}
              >
                <Search size={14} /> {t('transferLand.search')}
              </GlowButton>
            </div>

            {/* ── Tamper Warning ── */}
            <AnimatePresence>
              {tamperInfo && !tamperInfo.integrityVerified && (
                <motion.div
                  initial={{ opacity: 0, y: -8, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: "auto" }}
                  exit={{ opacity: 0, y: -8, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="mt-6 rounded-xl border border-status-red/30 bg-status-red/5 p-6"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-status-red/10 border border-status-red/20 flex items-center justify-center">
                      <ShieldAlert size={20} className="text-status-red" />
                    </div>
                    <div>
                      <h3 className="text-[15px] text-status-red font-medium">
                        Data Integrity Compromised
                      </h3>
                      <p className="text-[12px] text-text-muted">
                        Transfer is blocked until integrity is restored.
                      </p>
                    </div>
                  </div>

                  <p className="text-[13px] text-text-secondary mb-4">
                    The stored Merkle root does not match the recalculated root.
                    This record may have been tampered with outside of the system.
                  </p>

                  {/* Tampered Blocks */}
                  {tamperInfo.tamperedFields && tamperInfo.tamperedFields.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="mb-4 rounded-xl border border-status-red/20 bg-surface-1 overflow-hidden shadow-lg shadow-black/15"
                    >
                      <div className="flex items-center gap-2 border-b border-surface-3 px-5 py-3">
                        <AlertTriangle size={15} className="text-status-red" />
                        <h4 className="text-sm text-status-red">
                          Tampered Blocks Detected
                        </h4>
                      </div>
                      <div className="p-5">
                        <p className="text-xs text-text-secondary mb-4">
                          The following data blocks have been modified outside of the system.
                          Each block shows the current (tampered) values.
                        </p>
                        <div className="space-y-3">
                          {tamperInfo.tamperedFields.map((block, idx) => {
                            const sectionData = tamperInfo.tamperedData?.[block];
                            return (
                              <motion.div
                                key={block}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.3 + idx * 0.08 }}
                                className="rounded-lg border border-status-red/20 bg-status-red/5 overflow-hidden"
                              >
                                {/* Block header */}
                                <div className="flex items-center gap-3 px-4 py-3 border-b border-status-red/10 bg-status-red/10">
                                  <AlertCircle size={14} className="text-status-red shrink-0" />
                                  <div className="flex-1 min-w-0">
                                    <div className="text-sm text-status-red font-medium">
                                      {BLOCK_LABELS[block] || block}
                                    </div>
                                    <div className="text-xs text-text-muted">
                                      Block key:{" "}
                                      <code className="font-mono text-[11px]">
                                        {block}
                                      </code>
                                    </div>
                                  </div>
                                </div>
                                {/* Field-level data */}
                                {sectionData && typeof sectionData === "object" && (
                                  <div className="px-4 py-3">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5">
                                      {Object.entries(sectionData).map(([key, value]) => {
                                        const displayValue =
                                          value === null || value === undefined
                                            ? "—"
                                            : typeof value === "boolean"
                                              ? value ? "Yes" : "No"
                                              : String(value);
                                        return (
                                          <div
                                            key={key}
                                            className="flex justify-between items-baseline gap-2 py-1.5 border-b border-border/30 last:border-0"
                                          >
                                            <span className="text-[11px] text-text-muted capitalize whitespace-nowrap">
                                              {key.replace(/([A-Z])/g, " $1").trim()}
                                            </span>
                                            <span
                                              className="text-[12px] text-text-primary font-mono text-right truncate max-w-[200px]"
                                              title={displayValue}
                                            >
                                              {displayValue}
                                            </span>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </div>
                                )}
                              </motion.div>
                            );
                          })}
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Merkle root comparison */}
                  <div className="rounded-lg border border-border bg-card/60 p-4 text-[12px] space-y-2">
                    <div>
                      <span className="text-text-muted">Stored Merkle Root:</span>
                      <p className="font-mono text-[11px] text-text-secondary break-all mt-0.5">
                        {tamperInfo.storedMerkleRoot || "—"}
                      </p>
                    </div>
                    <div>
                      <span className="text-text-muted">Recalculated Merkle Root:</span>
                      <p className="font-mono text-[11px] text-status-red break-all mt-0.5">
                        {tamperInfo.recalculatedMerkleRoot || "—"}
                      </p>
                    </div>
                  </div>

                  <p className="text-[12px] text-text-muted mt-4">
                    To fix, go to the land record and use <strong>Recompute Integrity</strong> to
                    re-hash the current data, then try the transfer again.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* ══════════════════════════════════════════
           STEP 2 — FORM
        ══════════════════════════════════════════ */}
        {step === "form" && landData && (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            className="space-y-6"
          >
            {/* Current Land Summary */}
            <div className="rounded-xl border border-border bg-card/60 p-6">
              <div className="flex items-center gap-2 mb-4">
                <MapPin size={16} className="text-primary" />
                <h2 className="text-[16px] text-text-primary">
                  {t('transferLand.currentRecord')}
                </h2>
                <span className="ml-auto text-[11px] font-mono px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                  {landData.landId}
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-[13px]">
                <div>
                  <p className="text-text-muted text-[11px]">{t('transferLand.owner')}</p>
                  <p className="text-text-primary">{landData.owner.ownerName}</p>
                </div>
                <div>
                  <p className="text-text-muted text-[11px]">{t('transferLand.type')}</p>
                  <p className="text-text-primary">{landData.landType}</p>
                </div>
                <div>
                  <p className="text-text-muted text-[11px]">{t('transferLand.surveyNumber')}</p>
                  <p className="text-text-primary">{landData.surveyNumber}</p>
                </div>
                <div>
                  <p className="text-text-muted text-[11px]">{t('transferLand.location')}</p>
                  <p className="text-text-primary">
                    {[landData.village, landData.taluk, landData.district]
                      .filter(Boolean)
                      .join(", ") || "—"}
                  </p>
                </div>
              </div>
            </div>

            {/* New Owner */}
            <div className="rounded-xl border border-border bg-card/60 p-6">
              <div className="flex items-center gap-2 mb-5">
                <User size={16} className="text-status-green" />
                <h2 className="text-[16px] text-text-primary">{t('transferLand.newOwner')}</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>
                    {t('transferLand.ownerName')} <span className="text-status-red">*</span>
                  </label>
                  <input
                    className={inputClass}
                    placeholder={t('transferLand.ownerNamePlaceholder')}
                    value={newOwner.ownerName}
                    onChange={(e) =>
                      setNewOwner({ ...newOwner, ownerName: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className={labelClass}>{t('transferLand.ownerId')}</label>
                  <input
                    className={inputClass}
                    placeholder={t('transferLand.ownerIdPlaceholder')}
                    value={newOwner.ownerId}
                    onChange={(e) =>
                      setNewOwner({ ...newOwner, ownerId: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className={labelClass}>{t('transferLand.fatherSpouse')}</label>
                  <input
                    className={inputClass}
                    placeholder={t('transferLand.fatherSpousePlaceholder')}
                    value={newOwner.fatherOrSpouseName}
                    onChange={(e) =>
                      setNewOwner({
                        ...newOwner,
                        fatherOrSpouseName: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <label className={labelClass}>{t('transferLand.ownerType')}</label>
                  <select
                    title="Owner Type"
                    className={inputClass}
                    value={newOwner.ownerType}
                    onChange={(e) =>
                      setNewOwner({ ...newOwner, ownerType: e.target.value })
                    }
                  >
                    {OWNER_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>{t('transferLand.sharePercentage')}</label>
                  <input
                    type="number"
                    placeholder="100"
                    className={inputClass}
                    value={newOwner.sharePercentage}
                    onChange={(e) =>
                      setNewOwner({
                        ...newOwner,
                        sharePercentage: Number(e.target.value),
                      })
                    }
                  />
                </div>
                <div>
                  <label className={labelClass}>{t('transferLand.contactNumber')}</label>
                  <input
                    className={inputClass}
                    placeholder={t('transferLand.contactPlaceholder')}
                    value={newOwner.contactNumber}
                    onChange={(e) =>
                      setNewOwner({
                        ...newOwner,
                        contactNumber: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className={labelClass}>{t('transferLand.address')}</label>
                  <input
                    className={inputClass}
                    placeholder={t('transferLand.addressPlaceholder')}
                    value={newOwner.address}
                    onChange={(e) =>
                      setNewOwner({ ...newOwner, address: e.target.value })
                    }
                  />
                </div>
              </div>
            </div>

            {/* Transfer Details */}
            <div className="rounded-xl border border-border bg-card/60 p-6">
              <div className="flex items-center gap-2 mb-5">
                <FileText size={16} className="text-status-amber" />
                <h2 className="text-[16px] text-text-primary">
                  {t('transferLand.transferDetails')}
                </h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>{t('transferLand.transferType')}</label>
                  <select
                    title="Transfer Type"
                    className={inputClass}
                    value={transferDetails.transferType}
                    onChange={(e) =>
                      setTransferDetails({
                        ...transferDetails,
                        transferType: e.target.value,
                      })
                    }
                  >
                    {TRANSFER_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>{t('transferLand.transferDate')}</label>
                  <input
                    type="date"
                    title="Transfer Date"
                    className={inputClass}
                    value={transferDetails.transferDate}
                    onChange={(e) =>
                      setTransferDetails({
                        ...transferDetails,
                        transferDate: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <label className={labelClass}>
                    {t('transferLand.registrationNumber')}{" "}
                    <span className="text-status-red">*</span>
                  </label>
                  <input
                    className={inputClass}
                    placeholder={t('transferLand.registrationPlaceholder')}
                    value={transferDetails.registrationNumber}
                    onChange={(e) =>
                      setTransferDetails({
                        ...transferDetails,
                        registrationNumber: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <label className={labelClass}>{t('transferLand.subRegistrarOffice')}</label>
                  <input
                    className={inputClass}
                    placeholder={t('transferLand.officePlaceholder')}
                    value={transferDetails.subRegistrarOffice}
                    onChange={(e) =>
                      setTransferDetails({
                        ...transferDetails,
                        subRegistrarOffice: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <label className={labelClass}>{t('transferLand.saleValue')}</label>
                  <input
                    type="number"
                    className={inputClass}
                    placeholder={t('transferLand.saleValuePlaceholder')}
                    value={transferDetails.saleValue}
                    onChange={(e) =>
                      setTransferDetails({
                        ...transferDetails,
                        saleValue: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-between items-center">
              <GlowButton
                variant="cyan"
                onClick={() => {
                  setStep("search");
                  setLandData(null);
                }}
              >
                <ArrowLeft size={14} /> {t('transferLand.back')}
              </GlowButton>
              <GlowButton
                variant="green"
                onClick={handleTransfer}
                loading={submitting}
                disabled={
                  !newOwner.ownerName.trim() ||
                  !transferDetails.registrationNumber.trim()
                }
              >
                <ArrowLeftRight size={14} /> {t('transferLand.execute')}
              </GlowButton>
            </div>
          </motion.div>
        )}

        {/* ══════════════════════════════════════════
           STEP 3 — RESULT
        ══════════════════════════════════════════ */}
        {step === "result" && result && (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            className="rounded-xl border border-status-green/30 bg-status-green/5 p-8 text-center"
          >
            <CheckCircle2
              size={48}
              className="text-status-green mx-auto mb-4"
            />
            <h2 className="text-[20px] text-text-primary mb-2">
              {result.message}
            </h2>
            <p className="text-[14px] text-text-muted mb-6">
              {t('transferLand.ownerTransferredTo')}{" "}
              <span className="text-text-primary font-medium">
                {result.newOwner}
              </span>
            </p>

            <div className="max-w-sm mx-auto rounded-lg border border-border bg-card/60 p-4 text-left text-[13px] space-y-2 mb-6">
              <div className="flex justify-between">
                <span className="text-text-muted">{t('transferLand.version')}</span>
                <span className="text-text-primary font-mono">
                  v{result.newVersion}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">{t('transferLand.integrityLabel')}</span>
                <span className="text-status-green">
                  {result.integrityStatus}
                </span>
              </div>
              <div>
                <span className="text-text-muted block mb-1">
                  {t('transferLand.newMerkleRoot')}
                </span>
                <span className="text-text-primary font-mono text-[11px] break-all">
                  {result.newMerkleRoot}
                </span>
              </div>
            </div>

            <div className="flex justify-center gap-3">
              <GlowButton
                variant="cyan"
                onClick={() => navigate("/dashboard")}
              >
                Dashboard
              </GlowButton>
              <GlowButton
                variant="blue"
                onClick={() =>
                  navigate(`/dashboard/land/${landData?.landId}`)
                }
              >
                {t('transferLand.viewRecord')}
              </GlowButton>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Warning banner ── */}
      {step === "form" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-6 flex items-start gap-3 rounded-lg border border-status-amber/20 bg-status-amber/5 p-4"
        >
          <AlertTriangle
            size={16}
            className="text-status-amber shrink-0 mt-0.5"
          />
          <div className="text-[12px] text-text-muted">
            <p className="text-status-amber font-medium mb-1">
              {t('transferLand.confirmTitle')}
            </p>
            <p>
              {t('transferLand.confirmMessage')}
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
}
