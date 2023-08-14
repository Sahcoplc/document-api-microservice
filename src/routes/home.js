import { Router } from "express";
import docRoutes from "./document.js"

const router = Router();

router.get("/", (req, res) => {
  res.status(200).send({
    message: `Hello from homepage. Check the API specification for further guidance and next steps.`,
    success: 1,
  });
});

router.use('/doc', docRoutes)

export default router;