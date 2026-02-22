import { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router";
import {
  Loader2,
  AlertCircle,
  Download,
  RefreshCw,
  Hash,
  MapPin,
  User,
  Scale,
  FileText,
  Landmark,
  Key,
  ShieldCheck,
} from "lucide-react";
import { adminAPI, publicAPI } from "../lib/api";
import { IntegrityBadge } from "../components/IntegrityBadge";
import { LandTypeBadge } from "../components/LandTypeBadge";
import { StatusBadge } from "../components/StatusBadge";
import { MerkleRootDisplay } from "../components/MerkleRootDisplay";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { toast } from "sonner";

interface LandData {
  land: Record<string, unknown>;
  integrityCheck: {
    integrityVerified: boolean;
    storedMerkleRoot: string;
    recalculatedMerkleRoot: string;
    lastHashedAt: string;
  };
  witnessSignatures: Array<{
    signature: string;
    publicKey: string;
    url?: string;
  }>;
}

export function LandDetail() {
  const { landId } = useParams();
  const [data, setData] = useState<LandData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [recomputing, setRecomputing] = useState(false);
  const [showRecomputeDialog, setShowRecomputeDialog] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "integrity" | "witnesses">("overview");

  const fetchData = useCallback(async () => {
    if (!landId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await adminAPI.fetchLand(landId);
      setData(res.data);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Failed to fetch land record.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [landId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleRecompute = useCallback(async () => {
    if (!landId) return;
    setRecomputing(true);
    setShowRecomputeDialog(false);
    try {
      await adminAPI.recomputeIntegrity(landId);
      toast.success("Integrity recomputed and re-signed.");
      fetchData();
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Recompute failed.";
      toast.error(msg);
    } finally {
      setRecomputing(false);
    }
  }, [landId, fetchData]);

  const handleDownload = useCallback(() => {
    if (!landId) return;
    window.open(publicAPI.getLandPDF(landId), "_blank");
  }, [landId]);

  if (loading) {
    return (
      <div className="p-6 lg:p-8 flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 size={24} className="animate-spin text-status-blue" />
          <span className="text-sm text-text-muted">Loading record...</span>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-6 lg:p-8 max-w-2xl">
        <div className="rounded border border-status-red/20 bg-status-red/5 p-6 text-center">
          <AlertCircle size={24} className="text-status-red mx-auto mb-2" />
          <p className="text-sm text-status-red mb-3">{error || "Record not found."}</p>
          <button
            onClick={fetchData}
            className="px-4 py-2 text-sm rounded bg-status-blue text-white hover:bg-status-blue/80 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const land = data.land as Record<string, unknown>;
  const ic = data.integrityCheck;
  const owner = land.owner as Record<string, unknown> | undefined;
  const transfer = land.transfer as Record<string, unknown> | undefined;
  const mutation = land.mutation as Record<string, unknown> | undefined;
  const loan = land.loan as Record<string, unknown> | undefined;
  const legal = land.legal as Record<string, unknown> | undefined;
  const area = land.area as Record<string, unknown> | undefined;

  const tabs = [
    { key: "overview" as const, label: "Overview" },
    { key: "integrity" as const, label: "Integrity" },
    { key: "witnesses" as const, label: `Witnesses (${data.witnessSignatures?.length || 0})` },
  ];

  return (
    <div className="p-6 lg:p-8 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-text-primary">{landId}</h1>
            <LandTypeBadge type={(land.landType as string) || "Unknown"} />
          </div>
          <p className="text-sm text-text-muted">
            Survey No. {(land.surveyNumber as string) || "—"} &middot;{" "}
            {(land.village as string) || "—"}, {(land.district as string) || "—"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <IntegrityBadge verified={ic.integrityVerified} size="lg" />
          <button
            onClick={() => setShowRecomputeDialog(true)}
            disabled={recomputing}
            className="flex items-center gap-1.5 px-3 py-2 text-xs rounded border border-surface-3 bg-surface-2 text-text-secondary hover:bg-surface-3 transition-colors disabled:opacity-50"
          >
            {recomputing ? <Loader2 size={13} className="animate-spin" /> : <RefreshCw size={13} />}
            Recompute
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-3 py-2 text-xs rounded bg-status-blue text-white hover:bg-status-blue/80 transition-colors"
          >
            <Download size={13} />
            PDF
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-surface-3">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2.5 text-sm transition-colors border-b-2 -mb-px ${
              activeTab === tab.key
                ? "border-status-blue text-status-blue"
                : "border-transparent text-text-muted hover:text-text-secondary"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab: Overview */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          <Section title="Land Identity" icon={<Hash size={15} />}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <Field label="Land ID" value={land.landId as string} />
              <Field label="Land Type" value={land.landType as string} />
              <Field label="Survey Number" value={land.surveyNumber as string} />
              <Field label="Subdivision" value={land.subdivisionNumber as string} />
              <Field label="Usage Type" value={land.usageType as string} />
              <Field label="State" value={land.state as string} />
            </div>
          </Section>

          <Section title="Location" icon={<MapPin size={15} />}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <Field label="Village" value={land.village as string} />
              <Field label="Hobli" value={land.hobli as string} />
              <Field label="Taluk" value={land.taluk as string} />
              <Field label="District" value={land.district as string} />
              <Field label="Area" value={area ? `${area.acres} ac, ${area.guntas} g, ${(area.sqFt as number)?.toLocaleString()} sqft` : "—"} />
              <Field label="Coordinates" value={land.geoLatitude ? `${land.geoLatitude}, ${land.geoLongitude}` : "—"} />
            </div>
          </Section>

          <Section title="Owner" icon={<User size={15} />}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <Field label="Name" value={owner?.ownerName as string} />
              <Field label="Owner ID" value={owner?.ownerId as string} />
              <Field label="Father/Spouse" value={owner?.fatherOrSpouseName as string} />
              <Field label="Type" value={owner?.ownerType as string} />
              <Field label="Share %" value={owner?.sharePercentage?.toString()} />
              <Field label="Contact" value={owner?.contactNumber as string} />
            </div>
          </Section>

          <Section title="Transfer & Mutation" icon={<Scale size={15} />}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <Field label="Transfer Type" value={transfer?.transferType as string} />
              <Field label="Transfer Date" value={transfer?.transferDate ? new Date(transfer.transferDate as string).toLocaleDateString("en-IN") : "—"} />
              <Field label="Reg. Number" value={transfer?.registrationNumber as string} />
              <Field label="Mutation Status" value={<StatusBadge status={(mutation?.status as string) || "—"} variant="mutation" />} />
            </div>
          </Section>

          <Section title="Financial & Legal" icon={<Landmark size={15} />}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <Field label="Loan Active" value={<StatusBadge status={loan?.loanActive ? "Active" : "Inactive"} variant="boolean" />} />
              {loan?.loanActive && <Field label="Bank" value={loan?.bankName as string} />}
              <Field label="Court Case" value={<StatusBadge status={legal?.courtCase ? "Yes" : "No"} variant="boolean" />} />
              <Field label="Verification" value={<StatusBadge status={(land.verificationStatus as string) || "—"} variant="verification" />} />
            </div>
          </Section>
        </div>
      )}

      {/* Tab: Integrity */}
      {activeTab === "integrity" && (
        <div className="space-y-6">
          <div className={`rounded-lg border p-5 ${ic.integrityVerified ? "border-status-green/20 bg-status-green/5" : "border-status-red/20 bg-status-red/5"}`}>
            <div className="flex items-center gap-2 mb-4">
              <ShieldCheck size={18} className={ic.integrityVerified ? "text-status-green" : "text-status-red"} />
              <span className={`text-sm ${ic.integrityVerified ? "text-status-green" : "text-status-red"}`}>
                {ic.integrityVerified ? "Integrity Verified — Roots Match" : "Integrity Failed — Root Mismatch Detected"}
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <MerkleRootDisplay root={ic.storedMerkleRoot} label="Stored Merkle Root" variant={ic.integrityVerified ? "match" : "mismatch"} />
              <MerkleRootDisplay root={ic.recalculatedMerkleRoot} label="Recalculated Merkle Root" variant={ic.integrityVerified ? "match" : "mismatch"} />
            </div>
            <div className="mt-4 text-xs text-text-muted">
              Last hashed: {ic.lastHashedAt ? new Date(ic.lastHashedAt).toLocaleString("en-IN") : "—"}
            </div>
          </div>

          {!ic.integrityVerified && (
            <div className="rounded border border-status-red/20 bg-status-red/5 p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle size={16} className="text-status-red" />
                <span className="text-sm text-status-red">Tamper Warning</span>
              </div>
              <p className="text-xs text-text-secondary mb-3">
                The stored Merkle root does not match the recalculated hash.
                One or more data blocks may have been modified outside the system.
                Use the Recompute action to re-hash and re-sign if the changes are authorized.
              </p>
              <button
                onClick={() => setShowRecomputeDialog(true)}
                className="flex items-center gap-1.5 px-4 py-2 text-xs rounded bg-status-amber text-white hover:bg-status-amber/80 transition-colors"
              >
                <RefreshCw size={13} />
                Recompute Integrity
              </button>
            </div>
          )}
        </div>
      )}

      {/* Tab: Witnesses */}
      {activeTab === "witnesses" && (
        <div className="space-y-4">
          {data.witnessSignatures?.length ? (
            data.witnessSignatures.map((ws, i) => (
              <div key={i} className="rounded-lg border border-surface-3 bg-surface-1 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Key size={14} className="text-status-blue" />
                  <span className="text-xs text-text-secondary">
                    Witness {i + 1}
                    {ws.url && (
                      <span className="text-text-muted ml-2" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                        {ws.url}
                      </span>
                    )}
                  </span>
                </div>
                <div className="space-y-3">
                  <div>
                    <div className="text-[10px] text-text-muted mb-1">RSA Signature</div>
                    <div className="rounded bg-surface-0 border border-surface-3 p-2 overflow-x-auto">
                      <code className="text-[10px] text-text-secondary break-all" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                        {ws.signature.length > 100
                          ? `${ws.signature.slice(0, 100)}...`
                          : ws.signature}
                      </code>
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-text-muted mb-1">Public Key</div>
                    <div className="rounded bg-surface-0 border border-surface-3 p-2 overflow-x-auto">
                      <code className="text-[10px] text-text-secondary break-all whitespace-pre-wrap" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                        {ws.publicKey.length > 200
                          ? `${ws.publicKey.slice(0, 200)}...`
                          : ws.publicKey}
                      </code>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="rounded border border-surface-3 bg-surface-1 p-8 text-center">
              <Key size={24} className="text-text-muted mx-auto mb-2" />
              <p className="text-sm text-text-muted">No witness signatures recorded.</p>
            </div>
          )}
        </div>
      )}

      <ConfirmDialog
        open={showRecomputeDialog}
        title="Recompute Integrity"
        message="This will rebuild the Merkle tree from current data and request new RSA signatures from all witness servers. Proceed?"
        confirmLabel="Recompute & Sign"
        onConfirm={handleRecompute}
        onCancel={() => setShowRecomputeDialog(false)}
        loading={recomputing}
      />
    </div>
  );
}

function Section({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-surface-3 bg-surface-1 overflow-hidden">
      <div className="flex items-center gap-2 border-b border-surface-3 px-5 py-3">
        <span className="text-text-muted">{icon}</span>
        <h4 className="text-sm text-text-primary">{title}</h4>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

function Field({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div>
      <div className="text-[11px] text-text-muted mb-0.5">{label}</div>
      <div className="text-sm text-text-primary">{value || "—"}</div>
    </div>
  );
}
