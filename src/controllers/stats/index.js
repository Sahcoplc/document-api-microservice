import Document from "../../models/Document.js";
import { error, success } from "../../helpers/response.js";
import asyncWrapper from "../../middlewares/async.js";
import DocumentMovement from "../../models/DocumentMovement.js";
import { approvalStatus } from "../../base/request.js";

export const getDocumentStats = asyncWrapper(async (req, res) => {
    try {
        const { user: { _id, department: { _id: deptId } } } = req

        const staffDocs = await Document.aggregate([
            {
                $match: { "operator._id": _id }
            },
            {
                $group: {
                    _id: null,
                    totalDocuments: { $sum: 1 }, // Count of all user documents
                    noOfApprovedDocs: {
                        $sum: {
                            $cond: {
                                if: {
                                    $eq: [
                                        { $arrayElemAt: ["$approvalTrail.isApproved", -1] },
                                        true,
                                    ],
                                },
                                then: 1,
                                else: 0,
                            },
                        },
                    },
                    noOfPendingApprovalDocs: {
                        $sum: {
                            $cond: {
                                if: {
                                    $eq: [
                                    { $arrayElemAt: ["$approvalTrail.status", -1] },
                                    approvalStatus.pending,
                                    ],
                                },
                                then: 1,
                                else: 0,
                            },
                        },
                    },
                    noOfRejectedDocs: {
                        $sum: {
                            $cond: {
                                if: {
                                    $eq: [
                                    { $arrayElemAt: ["$approvalTrail.status", -1] },
                                    approvalStatus.declined,
                                    ],
                                },
                                then: 1,
                                else: 0,
                            },
                        },
                    },
                },
            },
            {
                $project: {
                    _id: 0,
                    totalDocuments: 1,
                    noOfApprovedDocs: 1,
                    noOfPendingApprovalDocs: 1,
                    noOfRejectedDocs: 1
                }
            }
        ])

        const movedDocs = await DocumentMovement.aggregate([
            { 
                $match: { "from._id": _id }
            },
            {
                $group: {
                    _id: null,
                    noOfSentDocs: { $sum: 1 }
                }
            },
            {
                $project: {
                    noOfSentDocs: 1
                }
            }
        ])

        const noOfReceivedDocs = await DocumentMovement.find({ "to._id": _id }).countDocuments()

        console.log({staffDocs, movedDocs})

        const result = { staffDocs, noOfSentDocs: movedDocs, noOfReceivedDocs }

        console.log({result})

        return success(res, 200, result)
    } catch (e) {
        console.log('ERR:: ', e)
        return error(res, 500, e)
    }
})