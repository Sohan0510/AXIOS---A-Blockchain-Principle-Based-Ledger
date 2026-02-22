import { motion, AnimatePresence } from "motion/react";
import { useState, useCallback } from "react";
import { useNavigate } from "react-router";
import {
  MapPin,
  Ruler,
  User,
  ArrowLeftRight,
  FileText,
  Landmark,
  Flag,
  Settings,
  Eye,
  ChevronLeft,
  ChevronRight,
  Check,
  Sparkles,
  AlertCircle,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { GlowButton } from "../components/GlowButton";
import { adminAPI } from "../lib/api";

/* ------------------------------------------------------------------ */
/*  Constants                                                         */
/* ------------------------------------------------------------------ */

const LAND_TYPES = [
  "Agricultural",
  "Residential",
  "Commercial",
  "Industrial",
  "Converted",
];
const OWNER_TYPES = ["Individual", "Joint", "Trust", "Company"];
const TRANSFER_TYPES = ["Sale", "Inheritance", "Gift", "Lease", "Auction"];
const MUTATION_STATUSES = ["Pending", "Approved", "Rejected"];
const VERIFICATION_STATUSES = ["Unverified", "Verified", "Flagged"];

/* ------------------------------------------------------------------ */
/*  Shared field components                                           */
/* ------------------------------------------------------------------ */

interface FieldProps {
  label: string;
  name: string;
  value: string | number | boolean | undefined;
  onChange: (e: { target: { name: string; value: string | boolean } }) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
}

function InputField({
  label,
  name,
  value,
  onChange,
  type = "text",
  placeholder = "",
  required = false,
}: FieldProps) {
  return (
    <div>
      <label className="text-[13px] text-text-secondary mb-1.5 block">
        {label} {required && <span className="text-status-red">*</span>}
      </label>
      <input
        type={type}
        name={name}
        value={(value as string) ?? ""}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full px-4 py-3 rounded-lg border border-border bg-surface-0/60 text-[14px] text-text-primary placeholder-text-muted focus:border-primary/50 focus:ring-1 focus:ring-primary/20 outline-none transition-all"
      />
    </div>
  );
}

interface SelectProps {
  label: string;
  name: string;
  value: string | undefined;
  onChange: (e: { target: { name: string; value: string } }) => void;
  options: string[];
  required?: boolean;
}

function SelectField({
  label,
  name,
  value,
  onChange,
  options,
  required = false,
}: SelectProps) {
  const { t } = useTranslation();
  return (
    <div>
      <label className="text-[13px] text-text-secondary mb-1.5 block">
        {label} {required && <span className="text-status-red">*</span>}
      </label>
      <select
        name={name}
        value={value ?? ""}
        onChange={onChange}
        title={label}
        className="w-full px-4 py-3 rounded-lg border border-border bg-surface-0/60 text-[14px] text-text-primary focus:border-primary/50 focus:ring-1 focus:ring-primary/20 outline-none transition-all appearance-none cursor-pointer"
      >
        <option value="" className="bg-card">
          {t('createLand.select')}
        </option>
        {options.map((opt) => (
          <option key={opt} value={opt} className="bg-card">
            {opt}
          </option>
        ))}
      </select>
    </div>
  );
}

interface ToggleProps {
  label: string;
  name: string;
  value: boolean | undefined;
  onChange: (e: { target: { name: string; value: boolean } }) => void;
}

function ToggleField({ label, name, value, onChange }: ToggleProps) {
  return (
    <div className="flex items-center justify-between py-2">
      <label className="text-[13px] text-text-secondary">{label}</label>
      <button
        type="button"
        aria-label={label}
        onClick={() => onChange({ target: { name, value: !value } })}
        className={`w-12 h-6 rounded-full transition-colors cursor-pointer ${
          value ? "bg-primary" : "bg-surface-2"
        }`}
      >
        <motion.div
          animate={{ x: value ? 24 : 2 }}
          transition={{ duration: 0.15 }}
          className="w-5 h-5 rounded-full bg-white shadow"
        />
      </button>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main component                                                    */
/* ------------------------------------------------------------------ */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyRecord = Record<string, any>;

const INITIAL_FORM: AnyRecord = {
  landType: "",
  owner: {},
  transfer: {},
  mutation: {},
  loan: { loanActive: false },
  legal: { courtCase: false },
  area: {},
  revenue: {},
  disputeFlag: false,
  fraudRiskScore: 0,
  verificationStatus: "Unverified",
};

export function CreateLand() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState<{
    landId: string;
    merkleRoot: string;
  } | null>(null);
  const [form, setForm] = useState<AnyRecord>({ ...INITIAL_FORM });
  const { t } = useTranslation();

  const STEPS = [
    { label: t('createLand.steps.basic'), icon: MapPin },
    { label: t('createLand.steps.area'), icon: Ruler },
    { label: t('createLand.steps.owner'), icon: User },
    { label: t('createLand.steps.transfer'), icon: ArrowLeftRight },
    { label: t('createLand.steps.mutation'), icon: FileText },
    { label: t('createLand.steps.loan'), icon: Landmark },
    { label: t('createLand.steps.flags'), icon: Flag },
    { label: t('createLand.steps.typeSpecific'), icon: Settings },
    { label: t('createLand.steps.review'), icon: Eye },
  ];

  /* ---------- handlers ---------- */

  const handleChange = useCallback(
    (e: { target: { name: string; value: string | boolean } }) => {
      const { name, value } = e.target;
      setForm((prev) => ({ ...prev, [name]: value }));
    },
    []
  );

  const handleNestedChange = useCallback(
    (section: string) =>
      (e: { target: { name: string; value: string | boolean } }) => {
        const { name, value } = e.target;
        setForm((prev) => ({
          ...prev,
          [section]: { ...prev[section], [name]: value },
        }));
      },
    []
  );

  const handleTypeSpecificChange = useCallback(
    (section: string) =>
      (e: { target: { name: string; value: string | boolean } }) => {
        const { name, value } = e.target;
        setForm((prev) => ({
          ...prev,
          [section]: { ...(prev[section] || {}), [name]: value },
        }));
      },
    []
  );

  const handleCourtCaseChange = useCallback(
    (e: { target: { name: string; value: boolean } }) => {
      const { name, value } = e.target;
      setForm((prev) => ({
        ...prev,
        legal: { ...prev.legal, [name]: value },
        disputeFlag: value ? true : prev.disputeFlag,
      }));
    },
    []
  );

  const handleDisputeFlagChange = useCallback(
    (e: { target: { name: string; value: boolean } }) => {
      // Cannot disable dispute flag if court case is true
      if (form.legal?.courtCase && !e.target.value) {
        return;
      }
      setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    },
    [form.legal?.courtCase]
  );

  /* ---------- payload builder ---------- */

  const prepareFormData = (raw: AnyRecord) => {
    const toNum = (v: unknown) => {
      if (v === "" || v === null || v === undefined) return undefined;
      const n = Number(v);
      return isNaN(n) ? undefined : n;
    };

    const data: AnyRecord = {
      ...raw,
      geoLatitude: toNum(raw.geoLatitude),
      geoLongitude: toNum(raw.geoLongitude),
      fraudRiskScore: toNum(raw.fraudRiskScore) ?? 0,
      area: {
        acres: toNum(raw.area?.acres),
        guntas: toNum(raw.area?.guntas),
        sqFt: toNum(raw.area?.sqFt),
      },
      owner: {
        ...raw.owner,
        sharePercentage: toNum(raw.owner?.sharePercentage),
      },
      transfer: {
        ...raw.transfer,
        saleValue: toNum(raw.transfer?.saleValue),
      },
      loan: {
        ...raw.loan,
        loanAmount: toNum(raw.loan?.loanAmount),
      },
      revenue: {
        ...raw.revenue,
        landRevenueDue: toNum(raw.revenue?.landRevenueDue) ?? 0,
      },
    };

    if (raw.agriculturalDetails)
      data.agriculturalDetails = { ...raw.agriculturalDetails };
    if (raw.residentialDetails) {
      data.residentialDetails = {
        ...raw.residentialDetails,
        builtUpArea: toNum(raw.residentialDetails.builtUpArea),
        numberOfFloors: toNum(raw.residentialDetails.numberOfFloors),
        yearOfConstruction: toNum(raw.residentialDetails.yearOfConstruction),
      };
    }
    if (raw.commercialDetails) {
      data.commercialDetails = {
        ...raw.commercialDetails,
        builtUpArea: toNum(raw.commercialDetails.builtUpArea),
        tenantDetails: raw.commercialDetails.tenantDetails
          ? {
              ...raw.commercialDetails.tenantDetails,
              rentAmount: toNum(
                raw.commercialDetails.tenantDetails.rentAmount
              ),
            }
          : undefined,
      };
    }
    if (raw.industrialDetails)
      data.industrialDetails = { ...raw.industrialDetails };

    // strip undefined keys
    Object.keys(data).forEach((key) => {
      if (
        data[key] &&
        typeof data[key] === "object" &&
        !Array.isArray(data[key])
      ) {
        Object.keys(data[key]).forEach((k) => {
          if (data[key][k] === undefined) delete data[key][k];
        });
      }
      if (data[key] === undefined) delete data[key];
    });
    return data;
  };

  /* ---------- submit ---------- */

  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    try {
      const payload = prepareFormData(form);
      const res = await adminAPI.createLand(payload);
      setSuccess({
        landId: res.data.landId,
        merkleRoot: res.data.merkleRoot,
      });
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string; error?: string } } };
      setError(
        e.response?.data?.message ||
          e.response?.data?.error ||
          t('createLand.failedToCreate')
      );
    } finally {
      setLoading(false);
    }
  };

  const next = () => setStep((s) => Math.min(s + 1, STEPS.length - 1));
  const prev = () => setStep((s) => Math.max(s - 1, 0));

  /* ================================================================ */
  /*  SUCCESS SCREEN                                                  */
  /* ================================================================ */

  if (success) {
    return (
      <div className="flex items-center justify-center p-4 min-h-[70vh]">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, ease: [0.2, 0.9, 0.25, 1] }}
          className="w-full max-w-lg"
        >
          <div className="rounded-2xl border border-status-green/20 bg-card p-8 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
              className="w-20 h-20 rounded-full bg-status-green/10 flex items-center justify-center mx-auto mb-6"
            >
              <Sparkles size={32} className="text-status-green" />
            </motion.div>

            <h2 className="text-[24px] text-text-primary mb-2">
              {t('createLand.successTitle')}
            </h2>
            <p className="text-[14px] text-text-muted mb-6">
              {t('createLand.successDesc')}
            </p>

            <div className="space-y-3 text-left mb-6">
              <div className="rounded-lg bg-surface-0 p-4 border border-border">
                <span className="text-[10px] text-text-muted uppercase tracking-wider">
                  Land ID
                </span>
                <p className="text-[16px] text-primary font-mono mt-1">
                  {success.landId}
                </p>
              </div>
              <div className="rounded-lg bg-surface-0 p-4 border border-border">
                <span className="text-[10px] text-text-muted uppercase tracking-wider">
                  Merkle Root
                </span>
                <p className="text-[13px] text-status-green font-mono mt-1 break-all">
                  {success.merkleRoot}
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <GlowButton
                onClick={() =>
                  navigate(`/dashboard/land/${success.landId}`)
                }
                fullWidth
              >
                {t('createLand.viewRecord')}
              </GlowButton>
              <GlowButton
                onClick={() => {
                  setSuccess(null);
                  setStep(0);
                  setForm({ ...INITIAL_FORM });
                }}
                variant="purple"
                fullWidth
              >
                {t('createLand.createAnother')}
              </GlowButton>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  /* ================================================================ */
  /*  PER-STEP RENDERERS                                              */
  /* ================================================================ */

  const renderStep = () => {
    switch (step) {
      /* ---- 0  Basic Information ---- */
      case 0:
        return (
          <div className="grid sm:grid-cols-2 gap-4">
            <InputField label={t('createLand.fields.landId')} name="landId" value={form.landId} onChange={handleChange} placeholder="LND-2025-001" required />
            <SelectField label={t('createLand.fields.landType')} name="landType" value={form.landType} onChange={handleChange} options={LAND_TYPES} required />
            <InputField label={t('createLand.fields.surveyNumber')} name="surveyNumber" value={form.surveyNumber} onChange={handleChange} placeholder="123/A" required />
            <InputField label={t('createLand.fields.subdivisionNumber')} name="subdivisionNumber" value={form.subdivisionNumber} onChange={handleChange} placeholder="2B" />
            <InputField label={t('createLand.fields.usageType')} name="usageType" value={form.usageType} onChange={handleChange} placeholder="Farming" />
            <InputField label={t('createLand.fields.village')} name="village" value={form.village} onChange={handleChange} placeholder="Doddaballapur" required />
            <InputField label={t('createLand.fields.hobli')} name="hobli" value={form.hobli} onChange={handleChange} placeholder="Kasaba" />
            <InputField label={t('createLand.fields.taluk')} name="taluk" value={form.taluk} onChange={handleChange} placeholder="Doddaballapur" required />
            <InputField label={t('createLand.fields.district')} name="district" value={form.district} onChange={handleChange} placeholder="Bangalore Rural" required />
            <InputField label={t('createLand.fields.state')} name="state" value={form.state} onChange={handleChange} placeholder="Karnataka" required />
          </div>
        );

      /* ---- 1  Area & Geo ---- */
      case 1:
        return (
          <div className="grid sm:grid-cols-2 gap-4">
            <InputField label={t('createLand.fields.acres')} name="acres" value={form.area?.acres} onChange={handleNestedChange("area")} type="number" placeholder="2" />
            <InputField label={t('createLand.fields.guntas')} name="guntas" value={form.area?.guntas} onChange={handleNestedChange("area")} type="number" placeholder="10" />
            <InputField label={t('createLand.fields.sqFt')} name="sqFt" value={form.area?.sqFt} onChange={handleNestedChange("area")} type="number" placeholder="108900" />
            <div className="sm:col-span-2" />
            <InputField label={t('createLand.fields.geoLatitude')} name="geoLatitude" value={form.geoLatitude} onChange={handleChange} type="number" placeholder="13.2946" />
            <InputField label={t('createLand.fields.geoLongitude')} name="geoLongitude" value={form.geoLongitude} onChange={handleChange} type="number" placeholder="77.5365" />
          </div>
        );

      /* ---- 2  Owner ---- */
      case 2:
        return (
          <div className="grid sm:grid-cols-2 gap-4">
            <InputField label={t('createLand.fields.ownerName')} name="ownerName" value={form.owner?.ownerName} onChange={handleNestedChange("owner")} placeholder="Suresh Gowda" required />
            <InputField label={t('createLand.fields.ownerId')} name="ownerId" value={form.owner?.ownerId} onChange={handleNestedChange("owner")} placeholder="KA-ADR-1234" required />
            <InputField label={t('createLand.fields.fatherSpouseName')} name="fatherOrSpouseName" value={form.owner?.fatherOrSpouseName} onChange={handleNestedChange("owner")} placeholder="Ramaiah Gowda" />
            <SelectField label={t('createLand.fields.ownerType')} name="ownerType" value={form.owner?.ownerType} onChange={handleNestedChange("owner")} options={OWNER_TYPES} />
            <InputField label={t('createLand.fields.sharePercentage')} name="sharePercentage" value={form.owner?.sharePercentage} onChange={handleNestedChange("owner")} type="number" placeholder="100" />
            <InputField label={t('createLand.fields.contactNumber')} name="contactNumber" value={form.owner?.contactNumber} onChange={handleNestedChange("owner")} placeholder="9876543210" />
            <div className="sm:col-span-2">
              <InputField label={t('createLand.fields.address')} name="address" value={form.owner?.address} onChange={handleNestedChange("owner")} placeholder="123, Main Road" />
            </div>
          </div>
        );

      /* ---- 3  Transfer ---- */
      case 3:
        return (
          <div className="grid sm:grid-cols-2 gap-4">
            <SelectField label={t('createLand.fields.transferType')} name="transferType" value={form.transfer?.transferType} onChange={handleNestedChange("transfer")} options={TRANSFER_TYPES} />
            <InputField label={t('createLand.fields.transferDate')} name="transferDate" value={form.transfer?.transferDate} onChange={handleNestedChange("transfer")} type="date" />
            <InputField label={t('createLand.fields.registrationNumber')} name="registrationNumber" value={form.transfer?.registrationNumber} onChange={handleNestedChange("transfer")} placeholder="REG-2020-456" />
            <InputField label={t('createLand.fields.subRegistrarOffice')} name="subRegistrarOffice" value={form.transfer?.subRegistrarOffice} onChange={handleNestedChange("transfer")} placeholder="Doddaballapur SRO" />
            <InputField label={t('createLand.fields.saleValue')} name="saleValue" value={form.transfer?.saleValue} onChange={handleNestedChange("transfer")} type="number" placeholder="500000" />
          </div>
        );

      /* ---- 4  Mutation & Legal ---- */
      case 4:
        return (
          <div className="space-y-6">
            <div>
              <h4 className="text-[14px] text-primary mb-4">{t('createLand.sections.mutation')}</h4>
              <div className="grid sm:grid-cols-2 gap-4">
                <SelectField label={t('createLand.fields.mutationStatus')} name="status" value={form.mutation?.status} onChange={handleNestedChange("mutation")} options={MUTATION_STATUSES} />
                <InputField label={t('createLand.fields.requestDate')} name="requestDate" value={form.mutation?.requestDate} onChange={handleNestedChange("mutation")} type="date" />
                <InputField label={t('createLand.fields.approvalDate')} name="approvalDate" value={form.mutation?.approvalDate} onChange={handleNestedChange("mutation")} type="date" />
              </div>
            </div>
            <div className="border-t border-border pt-6">
              <h4 className="text-[14px] text-status-red mb-4">{t('createLand.sections.legal')}</h4>
              <div className="grid sm:grid-cols-2 gap-4">
                <ToggleField label={t('createLand.fields.courtCase')} name="courtCase" value={form.legal?.courtCase} onChange={handleCourtCaseChange} />
                {form.legal?.courtCase && (
                  <>
                    <InputField label={t('createLand.fields.caseNumber')} name="caseNumber" value={form.legal?.caseNumber} onChange={handleNestedChange("legal")} placeholder="CASE-2024-001" />
                    <InputField label={t('createLand.fields.caseStatus')} name="caseStatus" value={form.legal?.caseStatus} onChange={handleNestedChange("legal")} placeholder="Under Hearing" />
                  </>
                )}
              </div>
            </div>
          </div>
        );

      /* ---- 5  Loan & Revenue ---- */
      case 5:
        return (
          <div className="space-y-6">
            <div>
              <h4 className="text-[14px] text-status-amber mb-4">{t('createLand.sections.loan')}</h4>
              <div className="grid sm:grid-cols-2 gap-4">
                <ToggleField label={t('createLand.fields.loanActive')} name="loanActive" value={form.loan?.loanActive} onChange={handleNestedChange("loan")} />
                {form.loan?.loanActive && (
                  <>
                    <InputField label={t('createLand.fields.bankName')} name="bankName" value={form.loan?.bankName} onChange={handleNestedChange("loan")} placeholder="State Bank of India" />
                    <InputField label={t('createLand.fields.loanAmount')} name="loanAmount" value={form.loan?.loanAmount} onChange={handleNestedChange("loan")} type="number" placeholder="500000" />
                  </>
                )}
              </div>
            </div>
            <div className="border-t border-border pt-6">
              <h4 className="text-[14px] text-status-green mb-4">{t('createLand.sections.revenue')}</h4>
              <div className="grid sm:grid-cols-2 gap-4">
                <InputField label={t('createLand.fields.landRevenueDue')} name="landRevenueDue" value={form.revenue?.landRevenueDue} onChange={handleNestedChange("revenue")} type="number" placeholder="0" />
                <InputField label={t('createLand.fields.lastPaymentDate')} name="lastPaymentDate" value={form.revenue?.lastPaymentDate} onChange={handleNestedChange("revenue")} type="date" />
              </div>
            </div>
          </div>
        );

      /* ---- 6  Flags & Verification ---- */
      case 6:
        return (
          <div className="grid sm:grid-cols-2 gap-4">
            <ToggleField label={t('createLand.fields.disputeFlag')} name="disputeFlag" value={form.disputeFlag} onChange={handleDisputeFlagChange} />
            <InputField label={t('createLand.fields.fraudRiskScore')} name="fraudRiskScore" value={form.fraudRiskScore} onChange={handleChange} type="number" placeholder="0" />
            <SelectField label={t('createLand.fields.verificationStatus')} name="verificationStatus" value={form.verificationStatus} onChange={handleChange} options={VERIFICATION_STATUSES} />
          </div>
        );

      /* ---- 7  Type-Specific Fields ---- */
      case 7:
        return renderTypeSpecificFields();

      /* ---- 8  Review ---- */
      case 8:
        return renderReview();

      default:
        return null;
    }
  };

  /* ---------- type-specific step ---------- */

  const renderTypeSpecificFields = () => {
    if (!form.landType) {
      return (
        <div className="text-center py-12">
          <Settings size={40} className="text-muted-foreground mx-auto mb-4" />
          <p className="text-[14px] text-text-muted">
            {t('createLand.selectLandTypeFirst')}
          </p>
        </div>
      );
    }
    switch (form.landType) {
      case "Agricultural":
        return (
          <div>
            <h4 className="text-[14px] text-status-green mb-4">{t('createLand.sections.agricultural')}</h4>
            <div className="grid sm:grid-cols-2 gap-4">
              <SelectField label={t('createLand.fields.landNature')} name="landNature" value={form.agriculturalDetails?.landNature} onChange={handleTypeSpecificChange("agriculturalDetails")} options={["Wet", "Dry"]} />
              <SelectField label={t('createLand.fields.soilType')} name="soilType" value={form.agriculturalDetails?.soilType} onChange={handleTypeSpecificChange("agriculturalDetails")} options={["Red", "Black", "Alluvial", "Laterite"]} />
              <SelectField label={t('createLand.fields.irrigationSource')} name="irrigationSource" value={form.agriculturalDetails?.irrigationSource} onChange={handleTypeSpecificChange("agriculturalDetails")} options={["Canal", "Borewell", "Rain-fed", "River", "Tank"]} />
              <InputField label={t('createLand.fields.cropType')} name="cropType" value={form.agriculturalDetails?.cropType} onChange={handleTypeSpecificChange("agriculturalDetails")} placeholder="Rice" />
              <InputField label={t('createLand.fields.seasonalCrop')} name="seasonalCrop" value={form.agriculturalDetails?.seasonalCrop} onChange={handleTypeSpecificChange("agriculturalDetails")} placeholder="Rabi" />
              <InputField label={t('createLand.fields.waterSource')} name="waterSource" value={form.agriculturalDetails?.waterSource} onChange={handleTypeSpecificChange("agriculturalDetails")} placeholder="Borewell" />
              <InputField label={t('createLand.fields.govtSchemeEnrollment')} name="governmentSchemeEnrollment" value={form.agriculturalDetails?.governmentSchemeEnrollment} onChange={handleTypeSpecificChange("agriculturalDetails")} placeholder="PM-KISAN" />
              <SelectField label={t('createLand.fields.fertilityStatus')} name="fertilityStatus" value={form.agriculturalDetails?.fertilityStatus} onChange={handleTypeSpecificChange("agriculturalDetails")} options={["Fertile", "Moderately Fertile", "Barren"]} />
            </div>
          </div>
        );

      case "Residential":
        return (
          <div>
            <h4 className="text-[14px] text-primary mb-4">{t('createLand.sections.residential')}</h4>
            <div className="grid sm:grid-cols-2 gap-4">
              <InputField label={t('createLand.fields.builtUpArea')} name="builtUpArea" value={form.residentialDetails?.builtUpArea} onChange={handleTypeSpecificChange("residentialDetails")} type="number" placeholder="1500" />
              <InputField label={t('createLand.fields.numberOfFloors')} name="numberOfFloors" value={form.residentialDetails?.numberOfFloors} onChange={handleTypeSpecificChange("residentialDetails")} type="number" placeholder="2" />
              <SelectField label={t('createLand.fields.constructionType')} name="constructionType" value={form.residentialDetails?.constructionType} onChange={handleTypeSpecificChange("residentialDetails")} options={["RCC", "Steel", "Wood", "Mixed"]} />
              <SelectField label={t('createLand.fields.occupancyType')} name="occupancyType" value={form.residentialDetails?.occupancyType} onChange={handleTypeSpecificChange("residentialDetails")} options={["Owner", "Tenant", "Vacant"]} />
              <InputField label={t('createLand.fields.propertyTaxCategory')} name="propertyTaxCategory" value={form.residentialDetails?.propertyTaxCategory} onChange={handleTypeSpecificChange("residentialDetails")} placeholder="A" />
              <InputField label={t('createLand.fields.yearOfConstruction')} name="yearOfConstruction" value={form.residentialDetails?.yearOfConstruction} onChange={handleTypeSpecificChange("residentialDetails")} type="number" placeholder="2010" />
              <ToggleField label={t('createLand.fields.waterConnection')} name="waterConnection" value={form.residentialDetails?.waterConnection} onChange={handleTypeSpecificChange("residentialDetails")} />
              <ToggleField label={t('createLand.fields.electricityConnection')} name="electricityConnection" value={form.residentialDetails?.electricityConnection} onChange={handleTypeSpecificChange("residentialDetails")} />
              <ToggleField label={t('createLand.fields.parkingAvailability')} name="parkingAvailability" value={form.residentialDetails?.parkingAvailability} onChange={handleTypeSpecificChange("residentialDetails")} />
            </div>
          </div>
        );

      case "Commercial":
        return (
          <div className="space-y-6">
            <div>
              <h4 className="text-[14px] text-[#7c3aed] mb-4">{t('createLand.sections.commercial')}</h4>
              <div className="grid sm:grid-cols-2 gap-4">
                <SelectField label={t('createLand.fields.businessType')} name="businessType" value={form.commercialDetails?.businessType} onChange={handleTypeSpecificChange("commercialDetails")} options={["Retail", "Office", "Hospitality", "Mixed-use"]} />
                <InputField label={t('createLand.fields.builtUpArea')} name="builtUpArea" value={form.commercialDetails?.builtUpArea} onChange={handleTypeSpecificChange("commercialDetails")} type="number" placeholder="3000" />
                <InputField label={t('createLand.fields.zoningCategory')} name="zoningCategory" value={form.commercialDetails?.zoningCategory} onChange={handleTypeSpecificChange("commercialDetails")} placeholder="C1" />
                <InputField label={t('createLand.fields.tradeLicense')} name="tradeLicense" value={form.commercialDetails?.tradeLicense} onChange={handleTypeSpecificChange("commercialDetails")} placeholder="TL-2024-001" />
                <ToggleField label={t('createLand.fields.rentalStatus')} name="rentalStatus" value={form.commercialDetails?.rentalStatus} onChange={handleTypeSpecificChange("commercialDetails")} />
                <ToggleField label={t('createLand.fields.fireSafetyClearance')} name="fireSafetyClearance" value={form.commercialDetails?.fireSafetyClearance} onChange={handleTypeSpecificChange("commercialDetails")} />
              </div>
            </div>
            {form.commercialDetails?.rentalStatus && (
              <div className="border-t border-border pt-6">
                <h4 className="text-[14px] text-[#a78bfa] mb-4">{t('createLand.sections.tenant')}</h4>
                <div className="grid sm:grid-cols-2 gap-4">
                  <InputField
                    label={t('createLand.fields.tenantName')}
                    name="tenantName"
                    value={form.commercialDetails?.tenantDetails?.tenantName}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        commercialDetails: {
                          ...prev.commercialDetails,
                          tenantDetails: {
                            ...(prev.commercialDetails?.tenantDetails || {}),
                            [e.target.name]: e.target.value,
                          },
                        },
                      }))
                    }
                    placeholder="ABC Corp"
                  />
                  <InputField
                    label={t('createLand.fields.rentAmount')}
                    name="rentAmount"
                    value={form.commercialDetails?.tenantDetails?.rentAmount}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        commercialDetails: {
                          ...prev.commercialDetails,
                          tenantDetails: {
                            ...(prev.commercialDetails?.tenantDetails || {}),
                            [e.target.name]: e.target.value,
                          },
                        },
                      }))
                    }
                    type="number"
                    placeholder="50000"
                  />
                  <InputField
                    label={t('createLand.fields.leaseStartDate')}
                    name="leaseStartDate"
                    value={form.commercialDetails?.tenantDetails?.leaseStartDate}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        commercialDetails: {
                          ...prev.commercialDetails,
                          tenantDetails: {
                            ...(prev.commercialDetails?.tenantDetails || {}),
                            [e.target.name]: e.target.value,
                          },
                        },
                      }))
                    }
                    type="date"
                  />
                  <InputField
                    label={t('createLand.fields.leaseEndDate')}
                    name="leaseEndDate"
                    value={form.commercialDetails?.tenantDetails?.leaseEndDate}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        commercialDetails: {
                          ...prev.commercialDetails,
                          tenantDetails: {
                            ...(prev.commercialDetails?.tenantDetails || {}),
                            [e.target.name]: e.target.value,
                          },
                        },
                      }))
                    }
                    type="date"
                  />
                </div>
              </div>
            )}
          </div>
        );

      case "Industrial":
        return (
          <div>
            <h4 className="text-[14px] text-status-amber mb-4">{t('createLand.sections.industrial')}</h4>
            <div className="grid sm:grid-cols-2 gap-4">
              <SelectField label={t('createLand.fields.factoryType')} name="factoryType" value={form.industrialDetails?.factoryType} onChange={handleTypeSpecificChange("industrialDetails")} options={["Manufacturing", "Processing", "Assembly", "Warehouse"]} />
              <InputField label={t('createLand.fields.storageCapacity')} name="storageCapacity" value={form.industrialDetails?.storageCapacity} onChange={handleTypeSpecificChange("industrialDetails")} placeholder="5000 sqft" />
              <InputField label={t('createLand.fields.industrialLicense')} name="industrialLicense" value={form.industrialDetails?.industrialLicense} onChange={handleTypeSpecificChange("industrialDetails")} placeholder="IL-2024-001" />
              <InputField label={t('createLand.fields.powerRequirement')} name="powerRequirement" value={form.industrialDetails?.powerRequirement} onChange={handleTypeSpecificChange("industrialDetails")} placeholder="500 KVA" />
              <ToggleField label={t('createLand.fields.pollutionClearance')} name="pollutionClearance" value={form.industrialDetails?.pollutionClearance} onChange={handleTypeSpecificChange("industrialDetails")} />
              <ToggleField label={t('createLand.fields.hazardousMaterial')} name="hazardousMaterial" value={form.industrialDetails?.hazardousMaterial} onChange={handleTypeSpecificChange("industrialDetails")} />
            </div>
          </div>
        );

      case "Converted":
        return (
          <div className="text-center py-12">
            <ArrowLeftRight size={40} className="text-[#06b6d4] mx-auto mb-4" />
            <p className="text-[14px] text-text-muted">
              {t('createLand.convertedNoFields')}
            </p>
            <p className="text-[12px] text-muted-foreground mt-1">
              {t('createLand.convertedHint')}
            </p>
          </div>
        );

      default:
        return null;
    }
  };

  /* ---------- review step ---------- */

  const renderReview = () => (
    <div className="space-y-4">
      <div className="rounded-lg border border-border bg-surface-0/60 p-4">
        <h4 className="text-[12px] text-primary uppercase tracking-wider mb-3">
          {t('createLand.steps.basic')}
        </h4>
        <div className="grid grid-cols-2 gap-2 text-[13px]">
          <span className="text-text-muted">Land ID:</span>
          <span className="text-text-primary">{form.landId || "\u2014"}</span>
          <span className="text-text-muted">Type:</span>
          <span className="text-text-primary">{form.landType || "\u2014"}</span>
          <span className="text-text-muted">Survey:</span>
          <span className="text-text-primary">{form.surveyNumber || "\u2014"}</span>
          <span className="text-text-muted">Village:</span>
          <span className="text-text-primary">{form.village || "\u2014"}</span>
          <span className="text-text-muted">District:</span>
          <span className="text-text-primary">{form.district || "\u2014"}</span>
          <span className="text-text-muted">State:</span>
          <span className="text-text-primary">{form.state || "\u2014"}</span>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-surface-0/60 p-4">
        <h4 className="text-[12px] text-status-green uppercase tracking-wider mb-3">
          {t('createLand.steps.owner')}
        </h4>
        <div className="grid grid-cols-2 gap-2 text-[13px]">
          <span className="text-text-muted">Name:</span>
          <span className="text-text-primary">{form.owner?.ownerName || "\u2014"}</span>
          <span className="text-text-muted">ID:</span>
          <span className="text-text-primary">{form.owner?.ownerId || "\u2014"}</span>
          <span className="text-text-muted">Type:</span>
          <span className="text-text-primary">{form.owner?.ownerType || "\u2014"}</span>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-surface-0/60 p-4">
        <h4 className="text-[12px] text-[#7c3aed] uppercase tracking-wider mb-3">
          {t('createLand.review.areaTransfer')}
        </h4>
        <div className="grid grid-cols-2 gap-2 text-[13px]">
          <span className="text-text-muted">Area:</span>
          <span className="text-text-primary">
            {form.area?.acres || "\u2014"} acres, {form.area?.guntas || "\u2014"} guntas
          </span>
          <span className="text-text-muted">Transfer:</span>
          <span className="text-text-primary">{form.transfer?.transferType || "\u2014"}</span>
        </div>
      </div>

      <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
        <p className="text-[12px] text-primary">
          {t('createLand.reviewNote')}
        </p>
      </div>
    </div>
  );

  /* ================================================================ */
  /*  MAIN RENDER                                                     */
  /* ================================================================ */

  const progressPercent = ((step + 1) / STEPS.length) * 100;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <button
          onClick={() => navigate("/dashboard")}
          className="flex items-center gap-1 text-[13px] text-text-muted hover:text-text-primary transition-colors mb-4 cursor-pointer"
        >
          <ChevronLeft size={14} /> {t('createLand.backToDashboard')}
        </button>
        <h1 className="text-[28px] text-text-primary">{t('createLand.title')}</h1>
        <p className="text-[14px] text-text-muted mt-1">
          {t('createLand.apiLabel')}
        </p>
      </motion.div>

      {/* Stepper */}
      <div className="mb-8 overflow-x-auto">
        <div className="flex items-center gap-1 min-w-max pb-2">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            const isActive = i === step;
            const isDone = i < step;
            return (
              <button
                key={s.label}
                onClick={() => setStep(i)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-[12px] transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? "bg-primary/10 text-primary border border-primary/20"
                    : isDone
                    ? "text-status-green"
                    : "text-muted-foreground hover:text-text-secondary"
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] shrink-0 ${
                    isActive
                      ? "bg-primary text-white"
                      : isDone
                      ? "bg-status-green/20 text-status-green"
                      : "bg-surface-2 text-muted-foreground"
                  }`}
                >
                  {isDone ? <Check size={10} /> : i + 1}
                </div>
                <span className="hidden md:inline">{s.label}</span>
              </button>
            );
          })}
        </div>
        {/* Progress bar */}
        <div className="mt-2 h-1 w-full rounded-full bg-surface-2">
          <motion.div
            className="h-full rounded-full bg-primary"
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.35, ease: "easeInOut" }}
          />
        </div>
      </div>

      {/* Form Content */}
      <div className="rounded-xl border border-border bg-card/60 p-6 md:p-8 mb-6 min-h-[400px]">
        <div className="flex items-center gap-3 mb-6">
          {(() => {
            const Icon = STEPS[step].icon;
            return <Icon size={20} className="text-primary" />;
          })()}
          <h2 className="text-[18px] text-text-primary">{STEPS[step].label}</h2>
          <span className="text-[12px] text-muted-foreground ml-auto">
            {t('createLand.stepOf', { current: step + 1, total: STEPS.length })}
          </span>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2 px-4 py-3 rounded-lg bg-status-red/10 border border-status-red/20 mb-6"
          >
            <AlertCircle size={16} className="text-status-red" />
            <p className="text-[13px] text-status-red">{error}</p>
          </motion.div>
        )}

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3, ease: [0.2, 0.9, 0.25, 1] }}
          >
            {renderStep()}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <GlowButton onClick={prev} disabled={step === 0} variant="cyan" size="sm">
          <ChevronLeft size={14} /> {t('createLand.previous')}
        </GlowButton>

        {step === STEPS.length - 1 ? (
          <GlowButton
            onClick={handleSubmit}
            loading={loading}
            variant="green"
            size="lg"
          >
            <Check size={14} /> {t('createLand.submitButton')}
          </GlowButton>
        ) : (
          <GlowButton onClick={next} size="sm">
            {t('createLand.next')} <ChevronRight size={14} />
          </GlowButton>
        )}
      </div>
    </div>
  );
}