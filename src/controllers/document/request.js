import Joi from "joi"
import { approvalStatus, documentTypes } from "../../base/request.js"
import { error } from "../../helpers/response.js"
import Document from "../../models/Document.js"
import BadRequest from "../../utils/errors/badRequest.js"
import { generateDocumentNo } from "../../utils/index.js"
import asyncWrapper from "../../middlewares/async.js"
import { uploadFiles } from "services/storage.js"

const touringAdvance = {
    tripDetails: Joi.object({
        nameOfTrip: Joi.string().required(),
        fullName: Joi.string().required(),
        staffId: Joi.string().required(),
        destination: Joi.array().items(Joi.string()),
        dateOfTravel: Joi.date(),
        from: Joi.date(),
        to: Joi.date(),
        noOfDays: Joi.number()
    }).required(),
    purpose: Joi.string().required(),
    itinerary: Joi.array().items(
        Joi.object({
            date: Joi.date(),
            days: Joi.number(),
            meetings: Joi.string()
        })
    ).required(),
    estimatedExpenses: Joi.object({
        airFare: Joi.number(),
        classBooked: Joi.string(),
        localShuttle: Joi.string(),
        subTotalTravelfare: Joi.number(),
        taxiOrBus: Joi.number(),
        hotel: Joi.string(),
        noOfDays: Joi.number(),
        currency: Joi.string().valid('NGN', 'USD', 'EURO'),
        pricePerNight: Joi.number(),
        meals: Joi.number(),
        otherExpenses: Joi.string(),
        totalEstimatedExpenses: Joi.number()
    }).required()
}

const expenseVoucher = {
    payeeName: Joi.string().required(),
    department: Joi.string().required(),
    staffId: Joi.string().required(),
    amountInFigure: Joi.number().required(),
    amountInWords: Joi.string().required(),
    purpose: Joi.string().required(),
    payeeSign: Joi.object({
        _id: Joi.string(),
        name: Joi.string()
    }).required()
}

const cashAdvanceRetirement = {
    payeeName: Joi.string().required(),
    department: Joi.string().required(),
    items: Joi.array().items(
        Joi.object({
            date: Joi.date(),
            description: Joi.string(),
            amount: Joi.number()
        })
    ).required(),
    totalAmtExpended: Joi.number().required(),
    deductAmtCollected: Joi.number().required(),
    refundAmtToStaff: Joi.number(),
    refundAmtByStaff: Joi.number(),
    payeeSign: Joi.object({
        _id: Joi.string(),
        name: Joi.string()
    }).required()
}

const allowanceExpenses = {
    staffId: Joi.string().required(),
    month: Joi.string().required(),
    chequeNo: Joi.string(),
    payeeName: Joi.string().required(),
    rank: Joi.string(),
    items: Joi.array().items(
        Joi.object({
            date: Joi.date(),
            description: Joi.string().required(),
            allowanceAmt: Joi.number().min(0).required(),
            expensesAmt: Joi.number().min(0).required()
        })
    ).required(),
    totalAllowanceAmt: Joi.number(),
    totalExpenseAmt: Joi.number(),
    totalInWords: Joi.string().required(),
    payeeSign: Joi.object({
        _id: Joi.string().required(),
        name: Joi.string().required()
    }).required() 
}

export const createDocumentSchema = Joi.object({
    type: Joi.string().valid(...Object.values(documentTypes)).required(),
    content: Joi.alternatives().conditional('type', {
        switch: [
            { 
                is: documentTypes.expenseVoucher,
                then: Joi.object({
                    ...expenseVoucher
                })
            },
            {
                is: documentTypes.touringAdvance,
                then: Joi.object({
                    ...touringAdvance
                })
            },
            {
                is: documentTypes.transportVoucher,
                then: Joi.object({
                    ...expenseVoucher
                })
            },
            {
                is: documentTypes.cashAdvance,
                then: Joi.object({
                    ...expenseVoucher,
                    purpose: Joi.array().items(
                        Joi.object({
                            name: Joi.string().required(),
                            amount: Joi.number().required()
                        })
                    )
                })
            },
            {
                is: documentTypes.cashAdvanceRetirement,
                then: Joi.object({
                    ...cashAdvanceRetirement
                })
            },
            {
                is: documentTypes.allowanceExpensesClaims,
                then: Joi.object({
                    ...allowanceExpenses
                })
            }
        ]
    }).required(),
    attachments: Joi.any()
})

export const filterDocSchema = Joi.object({
    page: Joi.string().required(),
    limit: Joi.string(),
    startDate: Joi.date(),
    endDate: Joi.date().greater(Joi.ref("startDate")),
    type: Joi.string().valid(...Object.values(documentTypes)),
    documentNo: Joi.string()
})

export const validateCreateDocument = asyncWrapper(async (req, res, next) => {
    try {

        const { user: { _id, fullName, subDept, department: { name: deptName }, currentStation: { _id: stationId, name, code, parent, parentStation } }, body } = req

        if (body.attachments) body.attachments = await uploadFiles(body.attachments, 'docs-attachments')

        req.locals = {
            ...req.locals,
            document: {
                ...body,
                operator: { _id, name: fullName },
                currentLocation: name,
                parentStation: parent ? stationId : parentStation._id,
                station: { name: code, _id: stationId },
                department: { name: deptName, subDept },
                documentNo: await generateDocumentNo(),
            }
        }

        return next()
    } catch (e) {
        return error(res, 500, e)
    }
})

export const validateUpdateDocument = asyncWrapper(async (req, res, next) => {
    try {

        const { params: { id }, body: { type, attachments }, user: { _id } } = req

        const doc = await Document.findById({ _id: id }).select('approvalTrail operator').lean()

        if (!doc) throw BadRequest(`Document: ${type} does not exist`)

        if (doc.operator._id != _id) throw BadRequest('Document not created or owned by you')

        if (doc.approvalTrail.length > 0 && doc.approvalTrail[doc.approvalTrail.length - 1].status != approvalStatus.declined) {
            throw BadRequest(`Document: ${type} has recently been approved`)
        }

        if (attachments) req.body.attachments = await uploadFiles(attachments, 'docs-attachments')

        return next()

    } catch (e) {
        return error(res, 500, e)
    }
})