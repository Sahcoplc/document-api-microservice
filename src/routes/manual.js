import { Router } from "express";
import { idSchema, validator } from "../base/request.js";
import { fetchManualSchema, uploadManualSchema, validateExpiredManualsOrCertifications, validateUploadManualOrCertifications } from "../controllers/manual/request.js";
import { fetch, fetchSingleManual, updateManualOrCertificationStatus, uploadManual } from "../controllers/manual/Manual.js";

const router = Router()

router.get('/:id', validator.params(idSchema), fetchSingleManual)
router.post('/', validator.body(uploadManualSchema), validateUploadManualOrCertifications, uploadManual)
router.get('/', validator.query(fetchManualSchema), fetch)
router.patch('/update-status', validateExpiredManualsOrCertifications, updateManualOrCertificationStatus)

export default router