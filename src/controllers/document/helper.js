export const generateFilter = (req) => {

    const { user: { _id, department: { _id: deptId } }, query } = req
    let filter = { 
        $or: [
            {
                "operator._id": _id,
            },
            {
                "content.isAllStaff": true
            },
            {
                "content.to._id": _id
            },
            {
                "content.receivingDepts": { $in: [deptId] }
            },
            {
                "content.copiedReceivers": { $elemMatch: { "_id": _id } }
            }
        ]
    }

    if (query.type) {
        filter = { ...filter, type: query.type }
    }

    if (query.documentNo) filter = { ...filter, documentNo: query.documentNo }

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

export const generateDocumentNo = (form = true, deptCode, docTitle, docInteger) => `SAHCO/${deptCode}/${form ? 'F' : 'M'}/${docTitle}/${docInteger}`