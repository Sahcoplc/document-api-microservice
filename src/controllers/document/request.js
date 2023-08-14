import Joi from "joi"
import { approvalStatus, documentTypes } from "../../base/request.js"
import { error } from "../../helpers/response.js"
import Document from "../../models/Document.js"
import BadRequest from "../../utils/errors/badRequest.js"

export const createDocumentSchema = Joi.object({
    type: Joi.string().valid(...Object.values(documentTypes)).required(),
    content: Joi.any().required(),
    attachments: Joi.any()
})

export const filterDocSchema = Joi.object({
    page: Joi.string(),
    limit: Joi.string(),
    startDate: Joi.date(),
    endDate: Joi.date().greater(Joi.ref("startDate")),
    type: Joi.string().valid(...Object.values(documentTypes)),
    documentNo: Joi.string()
})

export const validateCreateDocument = async (req, res, next) => {
    try {
        const { file, user: { _id, fullName, subDept, department: { name: deptName }, currentStation: { _id: stationId, name, code, parentStation: { _id: parentId, name: parentName } } }, body } = req

        let attachments = []

        file.forEach(f => {
            if (f.location) attachments.push(f.location)
        });

        req.locals = {
            ...req.locals,
            document: {
                ...body,
                operator: { _id, name: fullName },
                currentLocation: name,
                parentStation: { _id: parentId, name: parentName },
                station: { name: code, _id: stationId },
                department: { name: deptName, subDept },
                attachments
            }
        }

        return next()
    } catch (e) {
        return error(res, 500, e)
    }
}

export const validateUpdateDocument = async (req, res, next) => {
    try {

        const { params: { id }, body: { type }, user: { _id } } = req

        const doc = await Document.findById({ _id: id }).select('approvalTrail operator').lean()

        if (!doc) throw BadRequest(`Document: ${type} does not exist`)

        if (doc.operator._id != _id) throw BadRequest('Document not created or owned by you')

        if (doc.approvalTrail.length > 0 && doc.approvalTrail[doc.approvalTrail.length - 1].status != approvalStatus.declined) {
            throw BadRequest(`Document: ${type} has recently been approved`)
        }

        return next()

    } catch (e) {
        return error(res, e?.statusCode, e)
    }
}