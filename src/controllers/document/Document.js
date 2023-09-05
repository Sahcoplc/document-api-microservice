import { sendMail } from "../../services/mail.js"
import { paginate } from "../../helpers/paginate.js"
import { error, success } from "../../helpers/response.js"
import asyncWrapper from "../../middlewares/async.js"
import Document from "../../models/Document.js"
import DocumentMovement from "../../models/DocumentMovement.js"
import { generateFilter } from "./helper.js"
import { sendNotification } from "../../helpers/fetch.js"
import { documentMovementStatus } from "../../base/request.js"
import { startSession } from 'mongoose'
import documentApproval from "../../mails/document-approval.js"

class DocumentController {

    createDocument = asyncWrapper(async (req, res) => {
        try {
            const { locals: { document } } = req

            const doc = await new Document({ ...document }).save()

            return success(res, 201, doc)

        } catch (e) {
            return error(res, 500, e)
        }
    })
    
    updateDocument = asyncWrapper(async (req, res) => {
        try {
            const { params: { id }, body } = req

            const doc = await Document.findOneAndUpdate({ _id: id }, { $set: { ...body } }, { new: true }).lean()

            return success(res, 200, doc)

        } catch (e) {
            return error(res, 500, e)
        }
    })

    fetchMyDocuments = asyncWrapper(async (req, res) => {
        try {
            const { query: { page, limit } } = req

            const filter = generateFilter(req);
            const modelName = "Document";
            const options = {
                page,
                limit,
                modelName,
                filter,
                sort: { updatedAt: -1 },
            };

            const documents = await paginate(options);

            return success(res, 200, documents)

        } catch (e) {
            return error(res, 500, e)
        }
    })

    approveDocument = asyncWrapper(async (req, res) => {
        try {
            const { locals: { approvalRequest }, query: { id, movementId }, user: { apiKey, fullName, department: { name }, _id } } = req

            let approval = null
            const session = await startSession()
            await session.withTransaction(async () => {

                approval = await Document.findByIdAndUpdate({ _id: id }, { $set: { approvalTrail: approvalRequest }}, { new: true, session })
                const transfer = await DocumentMovement.findOneAndUpdate({ _id: movementId }, { $set: { status: documentMovementStatus.completed }}, { new: true, session })
                const notify = {
                    title: 'Document Approval',
                    body: `${fullName} from ${name} has ${approvalRequest.status} your document`,
                    sender: _id,
                    receiver: approval.operator._id,
                    isAll: false
                }
    
                await sendNotification(apiKey, notify)
                await sendMail({
                    email: transfer.from.email,
                    subject: "DOCUMENT APPROVAL",
                    body: documentApproval({
                        title: "DOCUMENT APPROVAL",
                        name: transfer.from.name,
                        department: transfer.to.dept,
                        senderName: transfer.to.name,
                        documentType: transfer.type
                    })
                })
            })

            session.endSession()

            return success(res, 200, approval)
        } catch (e) {
            return error(res, 500, e)
        }
    })
}

export default DocumentController