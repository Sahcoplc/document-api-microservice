import Joi from "joi"
import { error } from "../../helpers/response.js";
import asyncWrapper from "../../middlewares/async.js";
import { uploadFiles } from "../../services/storage.js";
import Manual from "../../models/Manual.js";
import { generateDocumentNo } from "../../controllers/document/helper.js";
import { documentTypes, manualStatus } from "../../base/request.js";
import { createCustomError } from "../../utils/errors/customError.js";
import moment from "moment";

export const uploadManualSchema = Joi.object({
    title: Joi.string().required(),
    type: Joi.string().valid(documentTypes.manual, documentTypes.cert).required(),
    revisedDate: Joi.date().when('type', {
        is: documentTypes.manual,
        then: Joi.required()
    }),
    renewalDate: Joi.date().when('type', {
        is: documentTypes.cert,
        then: Joi.required()
    }),
    issuedDate: Joi.date().required(),
    dueDate: Joi.date().when('type', {
        is: documentTypes.manual,
        then: Joi.required()
    }),
    attachments: Joi.any().required()
})

export const fetchManualSchema = Joi.object({
    title: Joi.string(),
    type: Joi.string().valid(documentTypes.manual, documentTypes.cert).required(),
    dueDate: Joi.date(),
    issuedDate: Joi.date(),
    renewalDate: Joi.date(),
    deptId: Joi.string(),
    page: Joi.number().required(),
    limit: Joi.number(),
    startDate: Joi.date(),
    endDate: Joi.date().greater(Joi.ref("startDate")),
})

export const validateUploadManualOrCertifications = asyncWrapper(async (req, res, next) => {
    try {

        const { user: { _id, fullName, department: { _id: deptId, name } }, body } = req
        // Upload files attached to AWS SE storage
        const folder = body.type === documentTypes.manual ? 'manuals' : 'certificates'

        if (body.attachments) body.attachments = await uploadFiles(body.attachments, folder)
        const matches = body.title.match(/\b(\w)/g).join('');

        let docNo = '001'
        // Update previous versions if previous manual type or name exists

        // Find Manual by type
        const manuals = await Manual.find({ title: body.title, type: body.type }).sort({ createdAt: -1 }).select('documentNo').lean()
        // Create an array and push the ids into the array

        const previousVersions = []
        let versionNumber = '1.0'

        if (manuals.length) {
            let no = manuals[0].documentNo.split('/')[4]
            if (typeof no === 'undefined') no = docNo
            no = parseInt(no)
            no += 1
            docNo = `00${no}`
            versionNumber = parseFloat(no)
            let versions = manuals.map(manual => manual._id)
            previousVersions.push(...versions)
        }

        const revisedDate = body.revisedDate ? new Date(body.revisedDate) : null
        const dueDate = body.dueDate ? new Date(body.dueDate) : null
        const renewalDate = body.renewalDate ? new Date(body.renewalDate) : null

        const manual = {
            ...body,
            issuedDate: new Date(body.issuedDate),
            deptId,
            operator: { _id, name: fullName },
            documentNo: generateDocumentNo(false, name.match(/\b(\w)/g).join(''), matches, docNo),
            previousVersions,
            versionNumber: `${versionNumber}.0`
        }

        if (renewalDate) manual.renewalDate = renewalDate
        if (dueDate) manual.dueDate = dueDate
        if (revisedDate) manual.revisedDate = revisedDate
        
        req.locals = {
            ...req.locals,
            manual
        }

        return next()
    } catch (e) {
        return error(res, 500, e)
    }
})

export const validateExpiredManualsOrCertifications = asyncWrapper(async (req, res, next) => {
    try {
        const filter = { 
            status: { $ne: manualStatus.expired },
            $or: [
                { dueDate: { $lte: moment().add(6, 'months') } },
                { renewalDate: { $lte: moment().add(6, 'months') } },
            ] 
        }
        const manualsToExpire = await Manual.find(filter).lean()

        if (!manualsToExpire.length) throw createCustomError('No manuals or certicates expiring soon', 404)

        req.locals = {
            ...req.locals,
            manualsToExpire
        }
        return next()
    } catch (e) {
        return error(res, e.statusCode ?? 500, e)
    }
})