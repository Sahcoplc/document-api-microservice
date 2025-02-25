import DocumentMovement from "../../models/DocumentMovement.js"
import { error, success } from "../../helpers/response.js"
import asyncWrapper from "../../middlewares/async.js"
import { sendBrevoMail } from "../../services/mail.js"
import documentInbox from "../../mails/new-document.js"
import { generateMovementFilter } from "./helper.js"
import { makeRequest } from "../../helpers/fetch.js"
import { paginate } from "../../helpers/paginate.js"
import BadRequest from "../../utils/errors/badRequest.js"
import { documentMovementStatus } from "../../base/request.js"
import { createCustomError } from "../../utils/errors/customError.js"

class DocumentMovementControl {
    sendDocument = asyncWrapper(async (req, res) => {
        try {
            const { locals: { docMovement }, user: { apiKey, department: { email, name } } } = req

            const movement = await new DocumentMovement(docMovement).save()

            const notify = {
                title: 'Approval Request',
                body: `${movement.from.name} from ${movement.from.dept} has sent a document`,
                receiver: movement.to._id,
                isAll: false
            }

            await makeRequest('POST', 'alerts/new', apiKey, notify, {})

            sendBrevoMail({
                email: movement.to.email,
                subject: "DOCUMENT APPROVAL REQUEST",
                body: documentInbox({
                    title: "DOCUMENT APPROVAL REQUEST",
                    name: movement.to.name,
                    department: movement.from.dept,
                    senderName: movement.from.name,
                    documentType: movement.type,
                    url: `${process.env.SAHCO_INTERNALS}/docs/documents/view/${movement.documentId}/${movement._id}/${movement.to._id}`
                })
            })
            
            sendBrevoMail({
                email,
                subject: "DOCUMENT APPROVAL REQUEST",
                body: documentInbox({
                    title: "DOCUMENT APPROVAL REQUEST",
                    name: name,
                    department: movement.from.dept,
                    senderName: movement.from.name,
                    documentType: movement.type,
                    url: `${process.env.SAHCO_INTERNALS}/docs/documents/view/${movement.documentId}/${movement._id}/${movement.to._id}`
                })
            })

            return success(res, 201, movement)
        } catch (e) {
            return error(res, 500, e)
        }
    })

    getDocumentMovement = asyncWrapper(async (req, res) => {
        try {
            const { user: { _id }, query: { page, limit } } = req

            const filter = generateMovementFilter({ ...req.query, _id })

            const secondGradeFilter = {}

            if (req.query.documentNo) {
                secondGradeFilter.documents = { $elemMatch: { "documentNo": req.query.documentNo } }
            }
            if (req.query.documentStatus) {
                secondGradeFilter.documents = { $elemMatch: { "status": req.query.documentStatus } }
            }

            const pipeline = [
                {
                    $match: filter
                },
                {
                    $lookup: {
                        from: "documents",
                        localField: "documentId",
                        foreignField: "_id",
                        as: "documents"
                    }
                },
                {
                    $match: secondGradeFilter
                },
                {
                    $project: {
                        _id: 1,
                        type: 1,
                        from: 1,
                        to: 1,
                        copiedReceivers: 1,
                        parentStationId: 1,
                        purpose: 1,
                        documentId: 1,
                        status: 1,
                        createdAt: 1,
                        updatedAt: 1,
                        document: {
                          $arrayElemAt: ["$documents", 0]
                        }
                      }
                }
            ]

            const modelName = "DocumentMovement"
            const options = { page, limit, modelName, pipeline, sort: { createdAt: -1 } };
            const transferredDocs = await paginate(options);

            return success(res, 200, transferredDocs)
        } catch(e) {
            return error(res, e?.statusCode || 500, e)
        }
    })

    cancelDocumentMovement = asyncWrapper(async (req, res) => {
        try {
            const { user: { _id }, body: { documentId, movementId } } = req;
            const filter = {
                documentId,
                _id: movementId,
                "from._id": _id
            }

            const movement = await DocumentMovement.findOne(filter).populate('documentId')

            if (!movement) {
                throw createCustomError('Document Transfer does not exist', 404) 
            }
            
            // check if doc has been approved
            if (movement.status === documentMovementStatus.completed) {
                throw new BadRequest('Document has been attended to')
            }

            // cancel movement
            await DocumentMovement.findOneAndUpdate({ _id: movementId }, { $set: { status: documentMovementStatus.canceled }})
            
            return success(res, 200);
        } catch (e) {
            return error(res, e?.statusCode || 500, e)
        }
    })
}

export default DocumentMovementControl