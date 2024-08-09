import { model, Schema } from "mongoose";
import paginator from "mongoose-paginate-v2";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
import { approvalStatus, documentTypes, idAndNameSchemaRequired } from "../base/request.js";

const approvalSchema = {
    _id: "String",
    name: "String",
    dept: "String",
    jobTitle: "String",
    comment: "String",
    approvedAmount: "Number",
    status: { type: "String", default: approvalStatus.pending },
    approvalDate: { type: "Date" }
}

const schema = new Schema(
    {
        operator: idAndNameSchemaRequired,
        type: { type: "String", enum: documentTypes, default: "EXPENSE VOUCHER", required: true },
        content: { type: Map, required: true },
        documentNo: { type: "String", required: true, unique: true },
        currentLocation: { type: "String", required: true },
        approvalTrail: [approvalSchema],
        station: idAndNameSchemaRequired,
        parentStation: { type: "String", required: true },
        department: {
            name: { type: "String", required: true }, 
            subDept: "String",
        },
        attachments: [{ type: "String" }],
        status: { type: "String", default: approvalStatus.pending },
    },
    { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
)

schema.plugin(paginator);
schema.plugin(mongooseAggregatePaginate);
export default model("Document", schema);