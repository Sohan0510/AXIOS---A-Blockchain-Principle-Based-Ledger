import Land from "../models/land.js";
import buildHashPayload from "../utils/buildPayload.js";
import { buildMerkleTree } from "../utils/merkleUtil.js";

// 🔍 Verify Land Integrity
export const verifyLandIntegrity = async (req, res) => {
  try {
    const land = await Land.findOne({
      landId: req.params.landId,
    }).lean();

    if (!land) {
      return res.status(404).json({
        message: "Land not found",
      });
    }

    const payload = buildHashPayload(land);

    const {
      merkleRoot: recalculatedRoot,
      leafHashMap: recalculatedLeafMap,
    } = buildMerkleTree(payload);

    const storedRoot = land.integrity?.merkleRoot;
    const storedLeafMap = land.integrity?.leafHashMap || {};

    const integrityVerified =
      recalculatedRoot === storedRoot;

    let tamperedBlocks = null;

    if (!integrityVerified) {
      tamperedBlocks = [];

      Object.keys(recalculatedLeafMap).forEach((key) => {
        const storedHash = typeof storedLeafMap.get === "function"
          ? storedLeafMap.get(key)
          : storedLeafMap[key];
        if (storedHash !== recalculatedLeafMap[key]) {
          tamperedBlocks.push(key);
        }
      });

      if (tamperedBlocks.length === 0) {
        tamperedBlocks = null;
      }
    }

    res.json({
      integrityVerified,
      status: integrityVerified
        ? "VALID ✅"
        : "TAMPERED ❌",
      storedMerkleRoot: storedRoot,
      recalculatedMerkleRoot: recalculatedRoot,
      tamperedBlocks,
      lastHashedAt: land.integrity?.lastHashedAt || null,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: error.message || "Internal Server Error",
    });
  }
};