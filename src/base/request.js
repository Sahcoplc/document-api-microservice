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
    allowanceExpensesClaims: "ALLOWANCES AND EXPENSES CLAIMS REINBURSEMENT/RETIREMENT",
    memo: "INTERNAL MEMO"
}

export const docDeptTitle = {
    "EXPENSE VOUCHER": "FIN",
    "TOURING ADVANCE REQUEST": "FIN",
    "TRANSPORT VOUCHER": "FIN",
    "CASH ADVANCE FORM": "FIN",
    "FACILITIES REPAIR/MAINTENANCE REQUEST FORM": "ADM",
    "CASH ADVANCE REQUIREMENT VOUCHER": "FIN",
    "ALLOWANCES AND EXPENSES CLAIMS REINBURSEMENT/RETIREMENT": "HR"
}

export const documentMovementPurpose = {
    transfer: "TRANSFER",
    approval: "APPROVAL"
}

export const documentMovementStatus = {
    pending: 'PENDING',
    completed: 'COMPLETED'
}