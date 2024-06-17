import Joi from "joi"
import { error } from "../../helpers/response.js";
import asyncWrapper from "../../middlewares/async.js";
import { uploadFiles } from "../../services/storage.js";
import Manual from "../../models/Manual.js";
import { generateDocumentNo, pickRandomCharacters } from "../../controllers/document/helper.js";
import { CONTRACT_TYPES, documentTypes, manualStatus } from "../../base/request.js";
import { createCustomError } from "../../utils/errors/customError.js";
import moment from "moment";

export const uploadManualSchema = Joi.object({
    title: Joi.string().required(),
    recentVersion: Joi.string(),
    type: Joi.string().valid(documentTypes.manual, documentTypes.cert, documentTypes.license, documentTypes.contract).required(),
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
    typeOfService: Joi.string().when('type', {
        is: documentTypes.contract,
        then: Joi.required()
    }),
    typeOfContract: Joi.string().valid(...Object.values(CONTRACT_TYPES)).when('type', {
        is: documentTypes.contract,
        then: Joi.required()
    }),
    contractStatus: Joi.string().valid(manualStatus.oneOff, manualStatus.retainer).when('type', {
        is: documentTypes.contract,
        then: Joi.required()
    }),
    attachments: Joi.any().required()
})

export const fetchManualSchema = Joi.object({
    title: Joi.string(),
    type: Joi.string().valid(documentTypes.manual, documentTypes.cert, documentTypes.license, documentTypes.contract).required(),
    typeOfContract: Joi.string().valid(...Object.values(CONTRACT_TYPES)),
    contractStatus: Joi.string().valid(manualStatus.oneOff, manualStatus.retainer),
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
        const docType = body.type[0];
        const matches = pickRandomCharacters(body.title, 3)

        let docNo = '001'
        let manuals = []
        // Check if previous versions if recentVersion id was sent
        if (body.recentVersion) {
            manuals = await Manual.find({ _id: body.recentVersion })
        }

        // Find Manual by type
        // manuals = await Manual.find({ title: body.title, type: body.type }).sort({ createdAt: -1 }).select('documentNo').lean()
        // Create an array and push the ids into the array

        const previousVersions = []
        let versionNumber = '1.0'
        let documentNo = ''

        if (manuals.length) {
            documentNo = manuals[0].documentNo
            let no = documentNo.split('/')[4]
            const replace = documentNo.split('/')[4]
            no = parseInt(no)
            no += 1
            docNo = `00${no}`
            versionNumber = `${parseFloat(no)}.0`
            documentNo = documentNo.replace(replace, docNo)
            let versions = manuals[0].previousVersions
            previousVersions.push(...versions)
            previousVersions.unshift(manuals[0]._id)
        } else {
            documentNo = generateDocumentNo(false, docType, name.match(/\b(\w)/g).join(''), matches, docNo)
        }

        const revisedDate = body.revisedDate ? new Date(body.revisedDate) : null
        const dueDate = body.dueDate ? new Date(body.dueDate) : null
        const renewalDate = body.renewalDate ? new Date(body.renewalDate) : null

        const manual = {
            ...body,
            issuedDate: new Date(body.issuedDate),
            deptId,
            operator: { _id, name: fullName },
            documentNo,
            previousVersions,
            versionNumber
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