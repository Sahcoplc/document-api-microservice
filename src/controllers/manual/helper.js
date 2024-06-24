export const generateFilter = (query) => {
    let filter = { deptId: query.deptId }

    if (query.title) {
        const regex = new RegExp(`${query.title}`, 'i');
        filter = { ...filter, title: { $regex: regex } }
    }
    
    if (query.type) {
        filter = { ...filter, type: query.type }
    }

    if (query.typeOfContract) {
        filter = { ...filter, typeOfContract: query.typeOfContract }
    }

    if (query.contractStatus) {
        filter = { ...filter, contractStatus: query.contractStatus }
    }

    if (query.dueDate) {
        filter = {
            ...filter,
            dueDate: { $gte: new Date(query.dueDate)}
        }
    }

    if (query.issuedDate) {
        filter = {
            ...filter,
            issuedDate: { $eq: new Date(query.issuedDate) }
        }
    }
    
    if (query.renewalDate) {
        filter = {
            ...filter,
            renewalDate: { $eq: new Date(query.renewalDate) }
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

    return filter
}

export const populate = () => [
    {
        path: "previousVersions",
        select: "-previousVersions"
    }
]