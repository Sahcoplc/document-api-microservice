import { Router } from "express";
import { validator } from "../base/request.js";
import { createDocMovementSchema, fetchTransferSchema, validateDocMovement } from "../controllers/doc-movement/request.js";
import DocumentMovementControl from "../controllers/doc-movement/DocMovement.js";

const router = Router();

const docMoveControl = new DocumentMovementControl()

router.post('/', validator.body(createDocMovementSchema), validateDocMovement, docMoveControl.sendDocument)
router.get('/', validator.query(fetchTransferSchema), docMoveControl.getDocumentMovement)

export default router;