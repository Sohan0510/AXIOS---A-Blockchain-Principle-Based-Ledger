import mongoose from "mongoose";

const { Schema } = mongoose;

const landSchema = new Schema(
  {
    /* =====================================================
       BASIC IDENTIFICATION
    ===================================================== */

    landId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    landType: {
      type: String,
      enum: [
        "Agricultural",
        "Residential",
        "Commercial",
        "Industrial",
        "Converted",
      ],
      required: true,
      index: true,
    },

    usageType: String,

    surveyNumber: { type: String, required: true, index: true },
    subdivisionNumber: String,

    village: { type: String, index: true },
    hobli: String,
    taluk: { type: String, index: true },
    district: { type: String, index: true },
    state: String,

    area: {
      acres: Number,
      guntas: Number,
      sqFt: Number,
    },

    geoLatitude: Number,
    geoLongitude: Number,

    /* =====================================================
       OWNER DETAILS
    ===================================================== */

    owner: {
      _id: false,
      ownerName: { type: String, required: true },
      ownerId: String,
      fatherOrSpouseName: String,
      ownerType: {
        type: String,
        enum: ["Individual", "Joint", "Trust", "Company"],
      },
      sharePercentage: Number,
      contactNumber: String,
      address: String,
    },

    /* =====================================================
       TRANSFER DETAILS
    ===================================================== */

    transfer: {
      _id: false,
      transferType: {
        type: String,
        enum: ["Sale", "Inheritance", "Gift", "Lease", "Auction"],
      },
      transferDate: Date,
      registrationNumber: String,
      subRegistrarOffice: String,
      saleValue: Number,
    },

    /* =====================================================
       MUTATION DETAILS
    ===================================================== */

    mutation: {
      _id: false,
      status: {
        type: String,
        enum: ["Pending", "Approved", "Rejected"],
        default: "Pending",
      },
      requestDate: Date,
      approvalDate: Date,
    },

    /* =====================================================
       LOAN / MORTGAGE
    ===================================================== */

    loan: {
      _id: false,
      loanActive: { type: Boolean, default: false },
      bankName: String,
      loanAmount: Number,
    },

    /* =====================================================
       LEGAL DETAILS
    ===================================================== */

    legal: {
      _id: false,
      courtCase: { type: Boolean, default: false },
      caseNumber: String,
      caseStatus: String,
    },

    /* =====================================================
       REVENUE
    ===================================================== */

    revenue: {
      _id: false,
      landRevenueDue: { type: Number, default: 0 },
      lastPaymentDate: Date,
    },

    /* =====================================================
       LAND TYPE SPECIFIC DETAILS
    ===================================================== */

    agriculturalDetails: {
      _id: false,
      landNature: { type: String, enum: ["Wet", "Dry"] },
      soilType: String,
      irrigationSource: String,
      cropType: String,
      seasonalCrop: String,
      waterSource: String,
      governmentSchemeEnrollment: String,
      fertilityStatus: String,
    },

    residentialDetails: {
      _id: false,
      builtUpArea: Number,
      numberOfFloors: Number,
      constructionType: String,
      occupancyType: String,
      propertyTaxCategory: String,
      waterConnection: Boolean,
      electricityConnection: Boolean,
      yearOfConstruction: Number,
      parkingAvailability: Boolean,
    },

    commercialDetails: {
      _id: false,
      businessType: String,
      zoningCategory: String,
      builtUpArea: Number,
      rentalStatus: Boolean,
      tenantDetails: {
        _id: false,
        tenantName: String,
        leaseStartDate: Date,
        leaseEndDate: Date,
        rentAmount: Number,
      },
      fireSafetyClearance: Boolean,
      tradeLicense: String,
    },

    industrialDetails: {
      _id: false,
      factoryType: String,
      storageCapacity: String,
      pollutionClearance: Boolean,
      industrialLicense: String,
      powerRequirement: String,
      hazardousMaterial: Boolean,
    },

    /* =====================================================
       ADVANCED SYSTEM FIELDS
    ===================================================== */

    disputeFlag: { type: Boolean, default: false },
    fraudRiskScore: { type: Number, default: 0 },

    verificationStatus: {
      type: String,
      enum: ["Unverified", "Verified", "Flagged"],
      default: "Unverified",
    },

    /* =====================================================
       🔐 INTEGRITY BLOCK (MERKLE SYSTEM)
    ===================================================== */

    integrity: {
      _id: false,
      merkleRoot: { type: String, required: true },

      leafHashMap: {
        type: Map,
        of: String,
        required: true,
      },

      lastHashedAt: { type: Date, required: true },
    },

    /* =====================================================
       🛡 WITNESS SIGNATURES
    ===================================================== */

    witnessSignatures: [
      {
        _id: false,
        witnessId: String,
        signature: String,
        publicKey: String,
        url: String,
        signedAt: Date,
      },
    ],

    /* =====================================================
       🔄 VERSIONING & OWNERSHIP HISTORY (NEW FEATURE)
    ===================================================== */

    currentVersion: {
      type: Number,
      default: 1,
    },

    ownershipHistory: [
      {
        _id: false,

        version: Number,

        ownerSnapshot: {
          ownerName: String,
          ownerId: String,
          fatherOrSpouseName: String,
          ownerType: String,
          sharePercentage: Number,
          contactNumber: String,
          address: String,
        },

        transferDetails: {
          transferType: String,
          transferDate: Date,
          registrationNumber: String,
          subRegistrarOffice: String,
          saleValue: Number,
        },

        previousMerkleRoot: String,

        changedAt: {
          type: Date,
          default: Date.now,
        },

        changedBy: String,
      },
    ],
  },
  { timestamps: true }
);

/* =====================================================
   INDEXES
===================================================== */

landSchema.index(
  { surveyNumber: 1, village: 1, taluk: 1 },
  { unique: true }
);

landSchema.index({ district: 1, taluk: 1, village: 1 });
landSchema.index({ fraudRiskScore: -1 });
landSchema.index({ disputeFlag: 1 });

const Land = mongoose.model("Land", landSchema);

export default Land;