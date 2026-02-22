import express from "express";
import { getPublicLandData , getLandPDF} from "../controllers/publicController.js";

const router = express.Router();

router.get("/pdf/:landId", getLandPDF);
router.get("/:landId", getPublicLandData);

export default router;