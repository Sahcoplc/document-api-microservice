import Manual from "../../models/Manual.js";
import { error, success } from "../../helpers/response.js";
import asyncWrapper from "../../middlewares/async.js";
import { generateFilter, populate } from "./helper.js";
import { paginate } from "../../helpers/paginate.js";
import { manualStatus } from "../../base/request.js";
import { getDifferenceInMonths } from "../../utils/index.js";
import { makeRequest } from "../../helpers/fetch.js";
import { sendBulkMail } from "../../services/mail.js";
import expiredCertificate from "../../mails/expired-certificate.js";

export const uploadManual = asyncWrapper(async (req, res) => {
    try {
        const { locals: { manual } } = req

        const result = await Manual(manual).save()

        return success(res, 201, result)
    } catch (e) {
        return error(res, 500, e)
    }
})

export const fetch = asyncWrapper(async (req, res) => {
    
    try {
        const { user: { department: { _id } }, query: { page, limit } } = req
    
        const filter = generateFilter({ ...req.query, deptId: _id })

        const modelName = "Manual"

        const options = { page, limit, filter, modelName, sort: { createdAt: -1 }, populate: populate() };
        
        const manuals = await paginate(options)

        return success(res, 200, manuals)
    } catch (e) {
        return error(res, 500, e)
    }
})

export const fetchSingleManual = asyncWrapper(async (req, res) => {
    try {
        const { user: { department: { _id: deptId } }, params: { id } } = req

        const manual = await Manual.findOne({ _id: id, deptId }).populate(populate()).lean()

        return success(res, 200, manual)
    } catch (e) {
        return error(res, 500, e)
    }
})

export const updateManualOrCertificationStatus = asyncWrapper(async (req, res) => {
    try {
        const { locals: { manualsToExpire }, headers } = req

        let manuals = []
        await Promise.all(
            manualsToExpire.map(async manual => {
                let doc
                const daysToExpire = manual.dueDate ? getDifferenceInMonths(manual.dueDate) : getDifferenceInMonths(manual.renewalDate)
                if (daysToExpire > 0 && daysToExpire <= 6) {
                    doc = await Manual.findOneAndUpdate({ documentNo: manual.documentNo }, { $set: { status: manualStatus.expireSoon(daysToExpire) } }, { new: true })
                    const manual_cert = {
                        dept: doc.deptId,
                        title: doc.title,
                        documentNo: doc.documentNo,
                        expiryDate: doc.status
                    }
                    manuals.push(manual_cert)
                } else if (!daysToExpire || daysToExpire < 0){
                    doc = await Manual.findOneAndUpdate({ documentNo: manual.documentNo }, { $set: { status: manualStatus.expired } }, { new: true })
                }
            })
        )

        manuals.forEach(async (manual) => {
            const apikey = headers['x-sahcoapi-key']
            try {
                const query =  { department: manual.dept, page: 1, limit: 2000 }
                const { data: { docs: employees } } = await makeRequest('GET', 'employees', apikey, {}, query)
                const filteredEmployees = employees.map(employee => ({ email: employee.companyEmail, name: employee.fullName }))
    
                employees.forEach(async (filtered) => {
                    const notification = {
                        title: 'Document Expiring Soon',
                        body: `${manual.title} from your department is ${manual.expiryDate}`,
                        receiver: filtered._id,
                        deptId: [manual.dept],
                        isAll: false
                    }
                    await makeRequest('POST', 'alerts/new', apikey, notification)
                })
                
                await sendBulkMail({
                    receivers: filteredEmployees,
                    subject: 'DOCUMENT EXPIRING SOON',
                    body: expiredCertificate({
                        title: 'DOCUMENT EXPIRING SOON',
                        expireDate: manual.expiryDate,
                        docName: manual.title,
                    })
                })
            } catch (e) {
                //
            }

        })

        return success(res, 200, manuals)
    } catch (e) {
        return error(res, 500, e)
    }
})
