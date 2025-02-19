import Manual from "../../models/Manual.js";
import { error, success } from "../../helpers/response.js";
import asyncWrapper from "../../middlewares/async.js";
import { composeManual, generateFilter, populate } from "./helper.js";
import { paginate } from "../../helpers/paginate.js";
import { makeRequest } from "../../helpers/fetch.js";
import { sendBulkMail, sendBrevoMail } from "../../services/mail.js";
import expiredCertificate from "../../mails/expired-certificate.js";
import { documentTypes } from "../../base/request.js";
import { uploadFiles } from "../../services/storage.js";

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

export const editManual = asyncWrapper(async (req, res) => {
    try {
        console.log("here")
        const { body, params: { id } } = req;
        const found = await Manual.findById(id).lean()
        if (!found) {
            return error(res, 400, 'Document does not exist')
        }

        // Upload files attached to AWS SE storage
        const folder = body.type === documentTypes.manual ? 'manuals' : 'certificates'

        if (body.files) {
            const newattach = await uploadFiles(body.files, folder)
            body.attachments.push(...newattach)
            delete body.files
        }

        const result = await Manual.findByIdAndUpdate({ _id: id }, { $set: body }, { new: true })

        return success(res, 200, result)
    } catch (e) {
        console.log(e)
        return error(res, 500, "internal server error", null)
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
        const { locals: { manualsToExpire } } = req

        const manuals = await composeManual(manualsToExpire)
        // const response = await Promise.all(
            manuals?.forEach(async (manual) => {
                try {
                    const query =  { department: manual.dept, page: 1, limit: 2000 } // update to senior
                    const { data: { docs: employees } } = await makeRequest('GET', 'employees', '', {}, query)
                    const { data: depts } = await makeRequest('GET', `depts`, '', {}, {})
                    const filteredEmployees = employees.map(employee => ({ email: employee.companyEmail, name: employee.fullName }))
                    // const attendees = employees.map(employee => ({ address: employee.companyEmail, name: employee.fullName }))
                    const dept = depts.find(d => d._id === manual.dept)
                    employees.forEach(async (filtered) => {
                        const notification = {
                            title: 'Document Expiring Soon',
                            body: `${manual.title} from your department is ${manual.status}`,
                            receiver: filtered._id,
                            deptId: [manual.dept],
                            isAll: false
                        }
                        await makeRequest('POST', 'alerts/new', '', notification, {})
                    })
    
                    // await createOutlookEvent(manual, attendees)
                    
                    sendBulkMail({
                        receivers: filteredEmployees,
                        subject: 'DOCUMENT EXPIRING SOON',
                        body: expiredCertificate({
                            title: 'DOCUMENT EXPIRING SOON',
                            expireDate: manual.status,
                            docName: manual.title,
                        })
                    })
                    
                    sendBrevoMail({
                        email: dept.email,
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
        // )

        return success(res, 200, manuals)
    } catch (e) {
        return error(res, 500, e)
    }
})
