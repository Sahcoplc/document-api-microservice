import { Router } from "express";
import { idSchema, validator } from "../base/request.js";
import { isAuthorized } from "../middlewares/isAuthorized.js";
import { createDocMovementSchema, validateDocMovement } from "../controllers/doc-movement/request.js";
import DocumentMovementControl from "../controllers/doc-movement/DocMovement.js";

const router = Router();

const docMoveControl = new DocumentMovementControl()

router.post('/', validator.body(createDocMovementSchema), isAuthorized(['super-create', 'transfer-document'], [], []), validateDocMovement, docMoveControl.sendDocument)

export default router;