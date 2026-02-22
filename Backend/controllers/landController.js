import Land from "../models/land.js";
import buildHashPayload from "../utils/buildPayload.js";
import { buildMerkleTree } from "../utils/merkleUtil.js";
import { collectWitnessSignatures, getWitnessServers } from "../services/witnessService.js";
import axios from "axios";

export const createLand = async (req, res) => {
  try {
    const landData = req.body;

    const payload = buildHashPayload(landData);

    const { merkleRoot, leafHashMap } =
      buildMerkleTree(payload);

    const signatures =
      await collectWitnessSignatures(merkleRoot);

    landData.integrity = {
      merkleRoot,
      leafHashMap,
      lastHashedAt: new Date(),
    };

    landData.witnessSignatures = signatures;

    const land = await Land.create(landData);

    res.status(201).json({
      message: "Land Created & Multi-Signed",
      merkleRoot,
      landId: land.landId,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: error.message || "Internal Server Error",
    });
  }
};

// 🔁 Recompute & persist integrity for an existing land (migration)
export const recomputeIntegrity = async (req, res) => {
  try {
    const { landId } = req.params;

    const land = await Land.findOne({ landId });
    if (!land) {
      return res.status(404).json({ message: "Land not found" });
    }

    // Build deterministic payload and Merkle tree
    const payload = buildHashPayload(land);
    const { merkleRoot, leafHashes } = buildMerkleTree(payload);

    // Try to collect witness signatures, but don't fail the migration if witnesses are down
    let signatures = [];
    try {
      signatures = await collectWitnessSignatures(merkleRoot);
    } catch (err) {
      console.warn("collectWitnessSignatures failed during migration:", err.message || err);
      signatures = [];
    }

    const updated = await Land.findOneAndUpdate(
      { landId },
      {
        $set: {
          integrity: {
            merkleRoot,
            leafHashes,
            lastHashedAt: new Date(),
          },
          witnessSignatures: signatures,
        },
      },
      { new: true }
    );

    res.json({ message: "Integrity recomputed", merkleRoot, signatures, land: updated });

  } catch (error) {
    console.error("recomputeIntegrity error:", error);
    res.status(500).json({ error: error.message || String(error) });
  }
};

export const countLands = async (req, res) => {
  try {
    const count = await Land.countDocuments();
    console.log("[countLands] Total documents in 'lands' collection:", count);
    res.json({ count });
  } catch (error) {
    console.error("[countLands] Error:", error.message);
    res.status(500).json({ error: error.message });
  }
};

export const witnessStatus = async (req, res) => {
  try {
    const servers = getWitnessServers();
    const results = await Promise.allSettled(
      servers.map(async (url) => {
        const start = Date.now();
        const r = await axios.get(url, { timeout: 3000 });
        const latency = Date.now() - start;
        return { url, status: "active", data: r.data, latency };
      })
    );

    const witnesses = results.map((r, i) => {
      if (r.status === "fulfilled") {
        return {
          url: servers[i],
          status: "active",
          info: r.value.data,
          latency: r.value.latency,
        };
      }
      return {
        url: servers[i],
        status: "offline",
        error: r.reason?.message || "Unreachable",
        latency: 0,
      };
    });

    const active = witnesses.filter((w) => w.status === "active").length;
    res.json({ total: witnesses.length, active, witnesses });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const fetchLandData = async (req, res) => {
  try {
    const land = await Land.findOne({ landId: req.params.landId }).lean();

    if (!land) {
      return res.status(404).json({ message: "Land not found" });
    }

    // Rebuild payload
    const payload = buildHashPayload(land);

    // Recalculate Merkle
    const { merkleRoot: recalculatedMerkleRoot, leafHashMap: recalculatedLeafMap } =
      buildMerkleTree(payload);

    const storedMerkleRoot = land.integrity?.merkleRoot;
    const storedLeafMap = land.integrity?.leafHashMap || {};

    const integrityVerified =
      recalculatedMerkleRoot === storedMerkleRoot;

    // Field-level tamper detection with actual data
    let tamperedFields = null;
    let tamperedData = null;
    if (!integrityVerified) {
      tamperedFields = [];
      tamperedData = {};
      Object.keys(recalculatedLeafMap).forEach((key) => {
        const storedHash = typeof storedLeafMap.get === "function"
          ? storedLeafMap.get(key)
          : storedLeafMap[key];
        if (storedHash !== recalculatedLeafMap[key]) {
          tamperedFields.push(key);
          // Include the current values of the tampered section
          tamperedData[key] = payload[key];
        }
      });
      if (tamperedFields.length === 0) {
        tamperedFields = null;
        tamperedData = null;
      }
    }

    res.json({
      land, // 🔥 FULL DOCUMENT
      integrityCheck: {
        integrityVerified,
        storedMerkleRoot,
        recalculatedMerkleRoot,
        tamperedFields,
        tamperedData,
        lastHashedAt: land.integrity?.lastHashedAt || null,
      },
      witnessSignatures: land.witnessSignatures || []
    });

  } catch (error) {
    console.error("fetchLandData error:", error);
    res.status(500).json({
      error: error.message || "Internal Server Error",
    });
  }
};

// 📋 Get all transferred lands (with transfer records)
export const getTransferredLands = async (req, res) => {
  try {
    // Find lands that have transfer records
    const transferredLands = await Land.find({
      "transfer.transferType": { $exists: true, $ne: null }
    })
      .select("landId landType surveyNumber village district owner transfer lastUpdatedBy createdAt")
      .sort({ "transfer.transferDate": -1 }) // Most recent transfers first
      .lean();

    res.json({
      total: transferredLands.length,
      lands: transferredLands
    });

  } catch (error) {
    console.error("getTransferredLands error:", error);
    res.status(500).json({ error: error.message });
  }
};

// 📜 Get transfer history for a specific land
export const getLandTransferHistory = async (req, res) => {
  try {
    const { landId } = req.params;

    const land = await Land.findOne({ landId })
      .select("landId landType surveyNumber village district owner transfer ownershipHistory currentVersion createdAt updatedAt")
      .lean();

    if (!land) {
      return res.status(404).json({ message: "Land not found" });
    }

    const history = [];

    // If there is ownership history, the first entry's snapshot is the ORIGINAL owner
    // Each ownershipHistory entry = snapshot of the owner BEFORE that transfer happened
    if (land.ownershipHistory && land.ownershipHistory.length > 0) {
      // Sort history by version
      const sorted = [...land.ownershipHistory].sort((a, b) => a.version - b.version);

      // Version 1 = original creation with the first snapshot's owner
      history.push({
        version: 1,
        action: "Created",
        timestamp: land.createdAt,
        owner: sorted[0].ownerSnapshot,
        details: "Original record creation",
      });

      // Each subsequent history entry represents a transfer
      sorted.forEach((entry, idx) => {
        const td = entry.transferDetails || {};
        // The NEW owner after this transfer is either the next snapshot's owner, or the current owner (for the last transfer)
        const newOwner = idx < sorted.length - 1
          ? sorted[idx + 1].ownerSnapshot
          : land.owner;

        history.push({
          version: entry.version + 1,
          action: `Transferred (${td.transferType || "Unknown"})`,
          timestamp: td.transferDate || entry.changedAt || land.updatedAt,
          owner: newOwner,
          details: `Registration: ${td.registrationNumber || "N/A"}, Office: ${td.subRegistrarOffice || "N/A"}`,
          previousOwner: entry.ownerSnapshot?.ownerName || "N/A",
          changedBy: entry.changedBy || "N/A",
        });
      });
    } else {
      // No transfer history — just the creation record
      history.push({
        version: 1,
        action: "Created",
        timestamp: land.createdAt,
        owner: land.owner,
        details: "Original record creation",
      });

      // If there's a transfer block but no ownershipHistory (legacy data)
      if (land.transfer?.transferType) {
        history.push({
          version: 2,
          action: `Transferred (${land.transfer.transferType})`,
          timestamp: land.transfer.transferDate || land.updatedAt,
          owner: land.owner,
          details: `Registration: ${land.transfer.registrationNumber || "N/A"}, Office: ${land.transfer.subRegistrarOffice || "N/A"}`,
        });
      }
    }

    res.json({
      landId,
      landType: land.landType,
      surveyNumber: land.surveyNumber,
      location: `${land.village}, ${land.district}`,
      totalVersions: land.currentVersion || history.length,
      history: history.sort((a, b) => b.version - a.version),
    });

  } catch (error) {
    console.error("getLandTransferHistory error:", error);
    res.status(500).json({ error: error.message });
  }
};

export const transferLand = async (req, res) => {
  try {
    const { landId } = req.params;
    const { newOwner, transferDetails, changedBy } = req.body;

    const land = await Land.findOne({ landId });

    if (!land) {
      return res.status(404).json({ message: "Land not found" });
    }

    /* =====================================================
       🔐 STEP 1: VERIFY INTEGRITY BEFORE TRANSFER
    ===================================================== */

    const payload = buildHashPayload(land.toObject());
    const { merkleRoot: recalculatedRoot } =
      buildMerkleTree(payload);

    const storedRoot = land.integrity?.merkleRoot;

    if (recalculatedRoot !== storedRoot) {
      return res.status(400).json({
        message: "Land record is TAMPERED. Transfer blocked.",
        integrityStatus: "TAMPERED ❌",
        storedMerkleRoot: storedRoot,
        recalculatedMerkleRoot: recalculatedRoot
      });
    }

    /* =====================================================
       🔄 STEP 2: SAVE HISTORY SNAPSHOT
    ===================================================== */

    land.ownershipHistory.push({
      version: land.currentVersion,
      ownerSnapshot: land.owner,
      transferDetails,
      previousMerkleRoot: storedRoot,
      changedBy,
    });

    /* =====================================================
       🔁 STEP 3: UPDATE OWNER & VERSION
    ===================================================== */

    land.currentVersion += 1;
    land.owner = newOwner;
    land.transfer = transferDetails;

    /* =====================================================
       🔐 STEP 4: REHASH AFTER UPDATE
    ===================================================== */

    const updatedPayload = buildHashPayload(land.toObject());
    const { merkleRoot, leafHashMap } =
      buildMerkleTree(updatedPayload);

    land.integrity = {
      merkleRoot,
      leafHashMap,
      lastHashedAt: new Date(),
    };

    await land.save();

    res.json({
      message: "Land transferred successfully",
      newVersion: land.currentVersion,
      newOwner: land.owner.ownerName,
      newMerkleRoot: merkleRoot,
      integrityStatus: "VALID ✅"
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};