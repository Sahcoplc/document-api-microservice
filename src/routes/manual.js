import { Router } from "express";
import { idSchema, validator } from "../base/request.js";
import { isAuthorized } from "../middlewares/isAuthorized.js";
import { fetchManualSchema, uploadManualSchema, validateUploadManual } from "../controllers/manual/request.js";
import { fetch, fetchSingleManual, uploadManual } from "../controllers/manual/Manual.js";

const router = Router()

router.get('/:id', validator.params(idSchema), fetchSingleManual)
router.post('/', validator.body(uploadManualSchema), isAuthorized(['upload-manual'], [], []), validateUploadManual, uploadManual)
router.get('/', validator.query(fetchManualSchema), fetch)

export default router