import { documentMovementStatus } from "../../base/request.js"
import { Types } from "mongoose"

export const generateMovementFilter = (query) => {
    let filter = { 
        $or: [
            { 
                "to._id": query._id
            },
            {
                copiedReceivers: { $elemMatch: { "_id": query._id } }
            }
        ]
    }

    if (query.type) {
        filter = { ...filter, type: query.type }
    }

    if (query.sender) {
        const regex = new RegExp(`${query.sender}`, 'i');
        filter = { ...filter, "from.name": { $regex: regex } }
    }

    if (query.sentByMe) {
        filter = { 
            ...filter, 
            $or: [
                {
                    copiedReceivers: { $elemMatch: { "_id": query._id } }
                },
                {
                    'from._id': query._id
                }
            ],
            status: { $in: Object.values(documentMovementStatus) }
        }
    }

    if (query.startDate) {
        filter = {
            ...filter,
            createdAt: { $gte: new Date(query.startDate)}
        }
    }

    if (query.endDate) {
        filter = {
            ...filter,
            createdAt: { $gte: new Date(query.startDate), $lte: new Date(query.endDate) }
        }
    }

    if (query.documentId) {
        filter = {
            ...filter,
            documentId: new Types.ObjectId(query.documentId)
        }
    }

    console.log('F22:: ', filter)

    return filter
}