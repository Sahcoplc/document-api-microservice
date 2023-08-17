import { Router } from "express";
import { idSchema, validator } from "../base/request.js";
import { isAuthorized } from "../middlewares/isAuthorized.js";

const router = Router();

router.post('/transfer')

export default router;