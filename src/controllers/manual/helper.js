import { manualStatus } from "../../base/request.js";
import Manual from "../../models/Manual.js";
import { getDifferenceInMonths } from "../../utils/index.js";

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

export const composeManual = async (manualsToExpire) => {

    const composedMan = await Promise.all(
        manualsToExpire.map(async (manual) => {
            let doc;
            const daysToExpire = manual.dueDate ? getDifferenceInMonths(manual.dueDate) : getDifferenceInMonths(manual.renewalDate);
            console.log({daysToExpire})
            
            if (daysToExpire > 0 && daysToExpire <= 6) {
                doc = await Manual.findOneAndUpdate(
                    { documentNo: manual.documentNo },
                    { $set: { status: manualStatus.expireSoon(daysToExpire) } },
                    { new: true }
                );
                const manual_cert = {
                    dept: doc.deptId,
                    title: doc.title,
                    documentNo: doc.documentNo,
                    status: doc.status,
                    expiryDate: doc.dueDate ?? doc.renewalDate,
                };
                return manual_cert;
            } else if (!daysToExpire || daysToExpire < 0) {
                doc = await Manual.findOneAndUpdate(
                    { documentNo: manual.documentNo },
                    { $set: { status: manualStatus.expired } },
                    { new: true }
                );
                return {
                    dept: doc.deptId,
                    title: doc.title,
                    documentNo: doc.documentNo,
                    status: doc.status,
                    expiryDate: doc.dueDate ?? doc.renewalDate,
                };
            }
            console.lo({doc})
        })
    );
    console.log({composedMan})

    return composedMan
}