import { Router } from "express";
import docRoutes from "./document.js"
import moveRoutes from "./docMovement.js"
import manualRoutes from './manual.js'

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

export default router;