import { sendMail } from "../../services/mail.js"
import { paginate } from "../../helpers/paginate.js"
import { error, success } from "../../helpers/response.js"
import asyncWrapper from "../../middlewares/async.js"
import Document from "../../models/Document.js"
import DocumentMovement from "../../models/DocumentMovement.js"
import { generateFilter } from "./helper.js"
import { getEmployee, sendNotification } from "../../helpers/fetch.js"
import { startSession } from 'mongoose'
import documentApproval from "../../mails/document-approval.js"
import { documentMovementStatus } from "../../base/request.js"
import { Types } from "mongoose"

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

    fetchSingleDocument = asyncWrapper(async (req, res) => {
        try {
            const { params: { id } } = req

            const document = await Document.aggregate([
                {
                    $match: {
                        _id: new Types.ObjectId(id)
                    }
                },
                {
                    $lookup: {
                        from: "documentmovements",
                        localField: "_id",
                        foreignField: "documentId",
                        as: "movements"
                    }
                }
            ])
            
            return success(res, 200, document[0])
        } catch (e) {
            return error(res, 500, e)
        }
    })

    approveDocument = asyncWrapper(async (req, res) => {
        try {
            const { locals: { approvalRequest }, params: { id, movementId }, user: { apiKey, fullName, department: { name } }, body: { status } } = req

            let approval = null
            let transfer = null
            const session = await startSession()
            await session.withTransaction(async () => {
                approval = await Document.findByIdAndUpdate({ _id: id }, { $set: { approvalTrail: approvalRequest, status }}, { new: true, session })
                transfer = await DocumentMovement.findByIdAndUpdate({ _id: movementId }, { $set: { status: documentMovementStatus.completed }}, { new: true, session })
            })
            session.endSession()

            const notify = {
                title: 'Document Approval',
                body: `${fullName} from ${name} has ${approvalRequest.status} your document`,
                receiver: approval.operator._id,
                isAll: false
            }

            const { data } = await getEmployee(apiKey, approval.operator._id)

            await sendNotification(apiKey, notify)

            await sendMail({
                receivers: [{email: data.companyEmail, name: data.fullName}],
                subject: "DOCUMENT APPROVAL",
                body: documentApproval({
                    title: "DOCUMENT APPROVAL",
                    name: approval.name,
                    department: transfer.to.dept,
                    senderName: transfer.to.name,
                    documentType: transfer.type,
                    status: approvalRequest.status,
                    url: `${process.env.SAHCO_INTERNALS}/docs/documents/view/${id}/${movementId}/${transfer.to._id}`
                })
            })

            return success(res, 200, approval)
        } catch (e) {
            return error(res, 500, e)
        }
    })
}

// Get dcoument statistics
export const getStats = asyncWrapper(async (req, res) => {
    try {
        const { user: { id } } = req;
    
         
       const totalCount = await Document.countDocuments({_id: id}).exec();

       const totalSent = await DocumentMovement.countDocuments({'from._id' : _id}).exec();

       const totalReceived = await DocumentMovement.countDocuments({'to._id' : _id}).exec()


       return success(res, 200, totalCount, totalSent, totalReceived)

          
    } catch (e) {
        return error(res, 500, e);
    }

})


export default DocumentController