import { model, Schema } from "mongoose";
import paginator from "mongoose-paginate-v2";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
import { documentMovementPurpose, documentMovementStatus, documentTypes, idAndNameSchema, idAndNameSchemaRequired } from "../base/request.js";

const schema = new Schema(
    {
        type: { type: String, default: documentTypes.expenseVoucher, required: true },
        from: {
            ...idAndNameSchemaRequired,
            dept: { type: String, required: true },
            jobTitle: { type: String, required: true },
            email: { type: String, required: true },
            station: idAndNameSchemaRequired,
        },
        to: {
            ...idAndNameSchemaRequired,
            dept: { type: String, required: true },
            jobTitle: { type: String, required: true },
            email: { type: String, required: true },
            station: idAndNameSchemaRequired,
        },
        parentStationId: { type: String, required: true },
        purpose: { type: String, required: true, default: documentMovementPurpose.transfer },
        operator: idAndNameSchema,
        documentId: { type: Schema.Types.ObjectId, ref: "Document", required: true },
        status: { type: "String", required: true, default: documentMovementStatus.pending }
    },
    { toJSON: { virtuals: true }, toObject: { virtuals: true }, timestamps: true }
)

schema.plugin(paginator);
schema.plugin(mongooseAggregatePaginate);
export default model("DocumentMovement", schema);