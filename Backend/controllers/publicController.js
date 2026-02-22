import Land from "../models/land.js";
import buildHashPayload from "../utils/buildPayload.js";
import { buildMerkleTree } from "../utils/merkleUtil.js";
import { generateLandPDF } from "../services/pdfService.js";

export const getLandPDF = async (req, res) => {
  try {
    const land = await Land.findOne({ landId: req.params.landId });

    if (!land) {
      return res.status(404).json({ message: "Land not found" });
    }

    await generateLandPDF(land, res);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


export const getPublicLandData = async (req, res) => {
  try {
    const land = await Land.findOne({ landId: req.params.landId });

    if (!land) {
      return res.status(404).json({ message: "Land not found" });
    }

    // 🔐 Recalculate integrity for public trust
    const payload = buildHashPayload(land);
    const { merkleRoot: recalculatedRoot } = buildMerkleTree(payload);

    const storedRoot = land.integrity?.merkleRoot;
    const integrityVerified = recalculatedRoot === storedRoot;

    const publicData = {
      landId: land.landId,
      landType: land.landType,
      surveyNumber: land.surveyNumber,
      area: land.area,
      village: land.village,
      taluk: land.taluk,
      district: land.district,

      geoLatitude: land.geoLatitude,
      geoLongitude: land.geoLongitude,

      ownerName: land.owner?.ownerName,
      sharePercentage: land.owner?.sharePercentage,

      lastTransferType: land.transfer?.transferType,
      transferDate: land.transfer?.transferDate,

      mutationStatus: land.mutation?.status,
      loanActive: land.loan?.loanActive,
      courtCase: land.legal?.courtCase,

      // 🔐 Integrity (public safe)
      integrity: {
        merkleRoot: storedRoot,
        integrityVerified,
        lastHashedAt: land.integrity?.lastHashedAt,
      }
    };

    res.json(publicData);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};