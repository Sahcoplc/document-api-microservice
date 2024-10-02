import Manual from "../../models/Manual.js";
import { error, success } from "../../helpers/response.js";
import asyncWrapper from "../../middlewares/async.js";
import { composeManual, generateFilter, populate } from "./helper.js";
import { paginate } from "../../helpers/paginate.js";
import { makeRequest } from "../../helpers/fetch.js";
import { sendBulkMail, sendMail } from "../../services/mail.js";
import expiredCertificate from "../../mails/expired-certificate.js";
import { createOutlookEvent } from "./event.js";

export const uploadManual = asyncWrapper(async (req, res) => {
    try {
        const { locals: { manual } } = req

        const result = await Manual(manual).save()

        return success(res, 201, result)
    } catch (e) {
        let message = 'Something went wrong'
        if ((e.message || e).includes("E11000 duplicate key error collection")) 
            message = "Document updated version already exist"
        return error(res, 500, message)
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

        const manuals = await composeManual(manualsToExpire)

        const response = await Promise.all(
            manuals?.forEach(async (manual) => {
                const apikey = headers['x-sahcoapi-key']
                try {
                    const query =  { department: manual.dept, page: 1, limit: 2000 } // update to senior
                    const { data: { docs: employees } } = await makeRequest('GET', 'employees', apikey, {}, query)
                    const { data: dept } = await makeRequest('GET', `depts/${manual.dept}`, apikey, {}, {})
                    const filteredEmployees = employees.map(employee => ({ email: employee.companyEmail, name: employee.fullName }))
                    const attendees = employees.map(employee => ({ address: employee.companyEmail, name: employee.fullName }))
        
                    employees.forEach(async (filtered) => {
                        const notification = {
                            title: 'Document Expiring Soon',
                            body: `${manual.title} from your department is ${manual.status}`,
                            receiver: filtered._id,
                            deptId: [manual.dept],
                            isAll: false
                        }
                        await makeRequest('POST', 'alerts/new', apikey, notification)
                    })
    
                    await createOutlookEvent(manual, attendees)
                    
                    sendBulkMail({
                        receivers: filteredEmployees,
                        subject: 'DOCUMENT EXPIRING SOON',
                        body: expiredCertificate({
                            title: 'DOCUMENT EXPIRING SOON',
                            expireDate: manual.status,
                            docName: manual.title,
                        })
                    })
                    
                    sendMail({
                        receivers: [{ email: dept.email, name: dept.name }],
                        subject: 'DOCUMENT EXPIRING SOON',
                        body: expiredCertificate({
                            title: 'DOCUMENT EXPIRING SOON',
                            expireDate: manual.status,
                            docName: manual.title,
                        })
                    })
                } catch (e) {
                    console.log("NZSD:: ", e)
                }
            })
        )

        console.log('MAQ:: ', response)

        return success(res, 200, manuals)
    } catch (e) {
        console.log("BEWQ:: ", e)
        return error(res, 500, e)
    }
})
