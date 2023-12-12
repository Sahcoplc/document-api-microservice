import { Router } from "express";
import { idSchema, validator } from "../base/request.js";
import { isAuthorized } from "../middlewares/isAuthorized.js";
import { uploadManualSchema, validateUploadManual } from "../controllers/manual/request.js";
import { uploadManual } from "../controllers/manual/Manual.js";

const router = Router()

router.post('/', validator.body(uploadManualSchema), isAuthorized(['upload-manual'], [], []), validateUploadManual, uploadManual)
router.get('/')

export default router