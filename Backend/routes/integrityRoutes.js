
import express from "express";
import { verifyLandIntegrity } from "../controllers/integrityController.js";

const router = express.Router();

router.get("/verify/:landId", verifyLandIntegrity);

export default router;
