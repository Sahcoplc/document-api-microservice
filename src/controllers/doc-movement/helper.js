import { documentMovementStatus } from "../../base/request.js"

export const generateMovementFilter = (query) => {
    let filter = { 
        $or: [
            { 
                "to._id": query._id
            }, 
            {
                status: documentMovementStatus.pending 
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
        delete filter['to._id']
        filter = { ...filter, status: { $in: Object.values(documentMovementStatus) }, 'from._id': query._id }
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

    return filter
}