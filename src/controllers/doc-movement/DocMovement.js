import DocumentMovement from "../../models/DocumentMovement.js"
import { error, success } from "../../helpers/response.js"
import asyncWrapper from "../../middlewares/async.js"
import { sendMail } from "../../services/mail.js"
import documentInbox from "../../mails/new-document.js"
import { generateMovementFilter } from "./helper.js"
import { makeRequest } from "../../helpers/fetch.js"
import { paginate } from "../../helpers/paginate.js"

class DocumentMovementControl {
    sendDocument = asyncWrapper(async (req, res) => {
        try {
            const { locals: { docMovement }, user: { apiKey } } = req

            const movement = await new DocumentMovement(docMovement).save()

            const notify = {
                title: 'Approval Request',
                body: `${movement.from.name} from ${movement.from.dept} has sent a document`,
                receiver: movement.to._id,
                isAll: false
            }

            await makeRequest('POST', 'alerts/new', apiKey, notify)

            sendMail({
                receivers: [{email: movement.to.email, name: movement.to.name}],
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
}

export default DocumentMovementControl