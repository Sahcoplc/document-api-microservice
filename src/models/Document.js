import { model, Schema } from "mongoose";
import paginator from "mongoose-paginate-v2";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
import { documentTypes, idAndNameSchemaRequired } from "../base/request";
import { generateDocumentNo } from "utils";

const approvalSchema = {
    _id: "String",
    name: "String",
    department: "String",
    jobTitle: "String",
    comment: "String",
    isApproved: Boolean,
    status: { type: "String" },
    date: Date
}

const schema = new Schema(
    {
        operator: idAndNameSchemaRequired,
        type: { type: "String", enum: documentTypes, default: "EXPENSE VOUCHER", required: true },
        content: { type: Map, required: true },
        documentNo: { 
            type: "String", 
            required: true, 
            default: async function () {
                return await generateDocumentNo();
            } 
        },
        currentLocation: { type: "String", required: true },
        approvalTrail: [approvalSchema],
        stationId: { type: "String", required: true },
        parentStationId: "String",
        department: {
            name: { type: "String", required: true }, 
            subDept: "String",
        }
    },
    { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true }, }
)

schema.plugin(paginator);
schema.plugin(mongooseAggregatePaginate);
export default model("Document", schema);