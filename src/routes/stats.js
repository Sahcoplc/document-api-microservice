import { getDocumentStats } from "../controllers/stats/index.js";
import { Router } from "express";

const router = Router()

router.get('/', getDocumentStats)

export default router