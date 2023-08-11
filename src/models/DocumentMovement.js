import { model, Schema } from "mongoose";
import paginator from "mongoose-paginate-v2";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
import { documentMovementPurpose, documentTypes, idAndNameSchema, idAndNameSchemaRequired } from "../base/request";

const schema = new Schema(
    {
        type: { type: String, enum: documentTypes, required: true },
        from: {
            ...idAndNameSchemaRequired,
            dept: { type: String, required: true },
            jobTitle: { type: String, required: true },
            email: { type: String, required: true },
            stationId: { type: String, required: true },
        },
        to: {
            ...idAndNameSchemaRequired,
            dept: { type: String, required: true },
            jobTitle: { type: String, required: true },
            email: { type: String, required: true },
            stationId: { type: String, required: true },
        },
        parentStationId: { type: String, required: true },
        purpose: { type: String, required: true, enum: documentMovementPurpose, default: "TRANSFER" },
        operator: idAndNameSchema,
        documentId: { type: Schema.Types.ObjectId, ref: "Document", required: true }
    }
)

schema.plugin(paginator);
schema.plugin(mongooseAggregatePaginate);
export default model("Document", schema);