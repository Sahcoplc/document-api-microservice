import Joi from "joi"
import { error } from "../../helpers/response.js";
import asyncWrapper from "../../middlewares/async.js";
import { uploadFiles } from "../../services/storage.js";
import Manual from "../../models/Manual.js";
import { generateDocumentNo } from "../../controllers/document/helper.js";

export const uploadManualSchema = Joi.object({
    title: Joi.string().required(),
    revisedDate: Joi.date().required(),
    issuedDate: Joi.date().required(),
    dueDate: Joi.date().required(),
    attachments: Joi.any().required()
})

export const fetchManualSchema = Joi.object({
    title: Joi.string(),
    dueDate: Joi.date(),
    issuedDate: Joi.date(),
    deptId: Joi.string(),
    page: Joi.number().required(),
    limit: Joi.number(),
    startDate: Joi.date(),
    endDate: Joi.date().greater(Joi.ref("startDate")),
})

export const validateUploadManual = asyncWrapper(async (req, res, next) => {
    try {

        const { user: { _id, fullName, department: { _id: deptId, name } }, body } = req
        // Upload files attached to AWS SE storage

        if (body.attachments) body.attachments = await uploadFiles(body.attachments, 'manuals')
        const matches = body.title.match(/\b(\w)/g).join('');

        let docNo = '001'
        // Update previous versions if previous manual type or name exists

        // Find Manual by type
        const manuals = await Manual.find({ title: body.title }).sort({ createdAt: -1 }).select('documentNo').lean()
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

        req.locals = {
            ...req.locals,
            manual: {
                ...body,
                issuedDate: new Date(body.issuedDate),
                revisedDate: new Date(body.revisedDate),
                dueDate: new Date(body.dueDate),
                deptId,
                operator: { _id, name: fullName },
                documentNo: generateDocumentNo(false, name.match(/\b(\w)/g).join(''), matches, docNo),
                previousVersions,
                versionNumber: `${versionNumber}.0`
            }
        }

        return next()
    } catch (e) {
        return error(res, 500, e)
    }
})