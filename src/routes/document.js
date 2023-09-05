import { Router } from "express";
import { idSchema, validator } from "../base/request.js";
import DocumentController from "../controllers/document/Document.js";
import { approveDocSchema, approveIdsSchema, createDocumentSchema, filterDocSchema, validateApproveDocument, validateCreateDocument, validateUpdateDocument } from "../controllers/document/request.js";
import { isAuthorized } from "../middlewares/isAuthorized.js";
import { uploadImage } from "../services/storage.js";

const router = Router();

const docController = new DocumentController()

router.post('/new', validator.body(createDocumentSchema), uploadImage.array('attachments'), isAuthorized(['super-create', 'create-document'], [], []), validateCreateDocument, docController.createDocument)
router.patch('/:id', validator.params(idSchema), validator.body(createDocumentSchema), uploadImage.array('attachments'), isAuthorized(['super-edit', 'edit-document'], [], []), validateUpdateDocument, docController.updateDocument)
router.get('/mine', validator.query(filterDocSchema), isAuthorized(['super-view', 'view-document'], [], []), docController.fetchMyDocuments)
router.patch('/approve/:id/:movementId', validator.params(approveIdsSchema), validator.body(approveDocSchema), isAuthorized(['super-edit', 'approve-document'], [], []), validateApproveDocument, docController.approveDocument)

export default router;