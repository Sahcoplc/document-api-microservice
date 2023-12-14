import { model, Schema } from "mongoose";
import paginator from "mongoose-paginate-v2";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
import { idAndNameSchemaRequired } from "../base/request.js";


const schema = new Schema(
    {
        title: { type: "String", required: true },
        issuedDate: { type: "Date", required: true },
        revisedDate: { type: "Date", required: true },
        dueDate: { type: "Date", required: true },
        versionNumber: { type: "String", required: true },
        previousVersions: [{ type: "String" }],
        attachments: [{type: 'String'}],
        deptId: { type: "String", required: true },
        operator: idAndNameSchemaRequired,
        documentNo: { type: "String", required: true, unique: true },
    },
    { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
)

schema.plugin(paginator);
schema.plugin(mongooseAggregatePaginate);
export default model("Manual", schema);