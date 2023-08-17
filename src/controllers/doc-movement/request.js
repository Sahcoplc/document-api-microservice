import Joi from 'joi'
import { Types } from 'mongoose'
import asyncWrapper from '../../middlewares/async.js'
import { error } from '../../helpers/response.js'
import Document from '../../models/Document.js'
import BadRequest from '../../utils/errors/badRequest.js'
import { documentMovementPurpose, documentTypes } from '../../base/request.js'
import { getEmployee } from '../../helpers/fetch.js'

const { ObjectId } = Types

export const createDocMovementSchema = Joi.object({
    purpose: Joi.string().valid(...Object.values(documentMovementPurpose)).required(),
    type: Joi.string().valid(...Object.values(documentTypes)).required(),
    to: Joi.object({
        _id: Joi.string().required(),
        name: Joi.string().required()
    }),
    from: Joi.object({
        _id: Joi.string().required(),
        name: Joi.string().required()
    }),
    documentId: Joi.string().required()
})

export const validateDocMovement = asyncWrapper(async (req, res, next) => {
    try {
        const { user: { _id, companyEmail, fullName, jobTitle, currentStation: { _id: stationId, code }, department: { name } }, body: { type, documentId, to: { _id: receiverId } }, apiKey } = req

        const doc = await Document.findById({ _id: documentId }).lean()

        if (!doc) throw new BadRequest('Document does not exist')

        if (doc.type != type) throw new BadRequest('Wrong document to be transferred')

        const { data } = await getEmployee(apiKey, receiverId)

        req.locals = {
            ...req.locals,
            docMovement: {
                ...req.body,
                from: {
                    _id,
                    name: fullName,
                    dept: name,
                    email: companyEmail,
                    jobTitle,
                    station: {
                        _id: stationId, name: code
                    }
                },
                to: {
                    _id: data._id,
                    name: data.fullName,
                    dept: data.department.name,
                    email: data.companyEmail,
                    jobTitle: data.jobTitle,
                    station: {
                        _id: data.currentStation._id,
                        name: data.currentStation.code
                    }
                }
            }
        }

        return next()
    } catch (e) {
        return error(res, 500, e)
    }
})