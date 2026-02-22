import express from "express";
import { createLand, fetchLandData, recomputeIntegrity, countLands, witnessStatus, transferLand, getTransferredLands, getLandTransferHistory } from "../controllers/landController.js";
import { protect } from "../middleware/authMiddleware.js";


const router = express.Router();

router.post("/create", protect, createLand);
router.post("/recompute-integrity/:landId", protect, recomputeIntegrity);
router.get("/count", countLands);
router.get("/witnesses", witnessStatus);
router.get("/fetch/:landId", fetchLandData);
router.get("/transferred", protect, getTransferredLands);
router.get("/history/:landId", protect, getLandTransferHistory);
router.post("/transfer/:landId", protect, transferLand);

export default router;