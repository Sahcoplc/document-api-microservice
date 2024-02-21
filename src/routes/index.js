import { Router } from "express";
import docRoutes from "./document.js"
import moveRoutes from "./docMovement.js"
import manualRoutes from './manual.js'
 import { getStats } from "../controllers/document/Document.js";

const router = Router();

router.get("/", (req, res) => {
  res.status(200).send({
    message: `Hello from SAHCO DOCS. Check the API specification for further guidance and next steps.`,
    success: 1,
  });
});

router.use('/doc', docRoutes)
router.use('/transfer', moveRoutes)
router.use('/manual', manualRoutes)

router.get('/stats', getStats)

export default router;