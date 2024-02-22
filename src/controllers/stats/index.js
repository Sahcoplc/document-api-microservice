import Document from "../../models/Document.js";
import { error, success } from "../../helpers/response.js";
import asyncWrapper from "../../middlewares/async.js";
import DocumentMovement from "../../models/DocumentMovement.js";
import { approvalStatus } from "../../base/request.js";

export const getDocumentStats = asyncWrapper(async (req, res) => {
    try {
        const { user: { _id } } = req;

        const noOfReceivedDocs = await DocumentMovement.countDocuments({ "to._id": _id }).exec()
        const noOfSentDocs = await DocumentMovement.countDocuments({ "from._id": _id }).exec()
        const docs = await Document.find({ "operator._id": _id }).lean()
        const noOfStaffDocs = docs.length
        const approvalsCount = {
            noOfApprovedDocs: 0,
            noOfPendingDocs: 0,
            noOfDeclinedDocs: 0
        }

        for (const doc of docs) {
            const { approvalTrail } = doc
            const lastApproval = approvalTrail[approvalTrail.length - 1]
            const isApproved = lastApproval.isApproved && lastApproval.status === approvalStatus.approved
            const isPending = !lastApproval.isApproved && lastApproval.status === approvalStatus.pending
            const isDeclined = !lastApproval.isApproved && lastApproval.status === approvalStatus.declined
            
            if (isApproved) approvalsCount.noOfApprovedDocs += 1
            if (isPending) approvalsCount.noOfPendingDocs += 1
            if (isDeclined) approvalsCount.noOfDeclinedDocs += 1
        }

        const result = { noOfStaffDocs, noOfSentDocs, noOfReceivedDocs, approvalsCount }

        return success(res, 200, result)
    } catch (e) {
        return error(res, 500, e)
    }
})