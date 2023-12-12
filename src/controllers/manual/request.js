import Joi from "joi"
import { error } from "../../helpers/response";
import asyncWrapper from "../../middlewares/async";
import { uploadFiles } from "../../services/storage";
import Manual from "../../models/Manual";
import { generateDocumentNo } from "../../controllers/document/helper";

export const uploadManualSchema = Joi.object({
    title: Joi.string().required(),
    revisedDate: Joi.date().required(),
    issuedDate: Joi.date().required(),
    dueDate: Joi.date().required(),
    attachments: Joi.any().required()
})

export const validateUploadManual = asyncWrapper(async (req, res, next) => {
    try {

        const { user: { _id, fullName, department: { name } }, body } = req
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
                dept: name,
                operator: { _id, name: fullName },
                documentNo: generateDocumentNo(false, docDeptTitle[body.title], matches, docNo),
                previousVersions,
                versionNumber
            }
        }

        return next()
    } catch (e) {
        return error(res, 500, e)
    }
})