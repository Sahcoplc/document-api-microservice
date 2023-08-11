import { createValidator } from "express-joi-validation"
import Joi from "joi"

export const openRoutes = [
    { method: "GET", path: "/" },
    { method: "GET", path: "/api"}
]

export const validator = createValidator()

export const idSchema = Joi.object({
    id: Joi.string().required()
})

export const idAndNameSchema = {
    _id: { type: String },
    name: { type: String },
}

export const idAndNameSchemaRequired = {
    _id: { type: String, required: true },
    name: { type: String, required: true },
}

export const approvalStatus = {
    pending: "PENDING",
    approved: "APPROVED",
    declined: "DECLINED"
}

export const documentTypes = {
    expenseVoucher: "EXPENSE VOUCHER",
    touringAdvance: "TOURING ADVANCE REQUEST",
    transportVoucher: "TRANSPORT VOUCHER",
    cashAdvance: "CASH ADVANCE FORM",
    facilitiesRepair: "FACILITIES REPAIR/MAINTENANCE REQUEST FORM",
    cashAdvanceRetirement: "CASH ADVANCE REQUIREMENT VOUCHER",
    leaveApplication: "LEAVE APPLICATION"
}

export const documentMovementPurpose = {
    transfer: "TRANSFER",
    approval: "APPROVAL"
}