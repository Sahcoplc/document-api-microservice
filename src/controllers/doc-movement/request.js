import Joi from 'joi'
import asyncWrapper from '../../middlewares/async.js'
import { error } from '../../helpers/response.js'
import Document from '../../models/Document.js'
import BadRequest from '../../utils/errors/badRequest.js'
import { approvalStatus, documentMovementPurpose, documentMovementStatus, documentTypes } from '../../base/request.js'
import { makeRequest } from '../../helpers/fetch.js'
import DocumentMovement from '../../models/DocumentMovement.js'

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
    copiedReceivers: Joi.array().items(
        Joi.object({
            _id: Joi.string().required(),
            name: Joi.string().required()
        })
    ),
    documentId: Joi.string().required()
})

export const fetchTransferSchema = Joi.object({
    page: Joi.number().required(),
    limit: Joi.number(),
    type: Joi.string().valid(...Object.values(documentTypes)),
    sender: Joi.string(),
    documentId: Joi.string(),
    documentNo: Joi.string(),
    documentStatus: Joi.string().valid(...Object.values(approvalStatus)),
    sentByMe: Joi.bool().default(false),
    startDate: Joi.date(),
    endDate: Joi.date().greater(Joi.ref("startDate"))
})

export const validateDocMovement = asyncWrapper(async (req, res, next) => {
    try {
        const { user: { _id, companyEmail, fullName, jobTitle, apiKey, currentStation: { _id: stationId, code, parent, parentStationId }, department: { name } }, body: { type, documentId, to: { _id: receiverId } } } = req

        const doc = await Document.findById({ _id: documentId }).lean()

        const docTransfer = await DocumentMovement.findOne({ documentId, status: documentMovementStatus.pending }).lean()

        if (!doc) throw new BadRequest('Document does not exist')

        if (doc.type != type) throw new BadRequest('Wrong document to be transferred')

        if (docTransfer) {
            await DocumentMovement.updateOne({ _id: docTransfer._id }, { $set: { status: documentMovementStatus.completed } }, { new: true })
        }

        const { data } = await makeRequest('GET', `employees/${receiverId}`, apiKey, {}, {})

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
                    jobTitle: data?.jobTitle || data?.jobDesignation || data?.jobTitleCode,
                    station: {
                        _id: data.currentStation._id,
                        name: data.currentStation.code
                    }
                },
                parentStationId: parent ? stationId : parentStationId
            }
        }

        return next()
    } catch (e) {
        return error(res, 500, e)
    }
})