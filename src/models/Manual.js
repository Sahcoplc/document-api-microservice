import { model, Schema } from "mongoose";
import paginator from "mongoose-paginate-v2";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
import { CONTRACT_TYPES, documentTypes, idAndNameSchemaRequired, manualStatus } from "../base/request.js";


const schema = new Schema(
    {
        title: { type: "String", required: true },
        type: { type: "String", enum: [documentTypes.manual, documentTypes.cert, documentTypes.contract, documentTypes.license], default: documentTypes.manual, required: true },
        issuedDate: { type: "Date", required: true },
        revisedDate: { type: "Date", required: function() { return this.type === documentTypes.manual } },
        renewalDate: { type: "Date", required: function() { return this.type === documentTypes.cert } },
        dueDate: { type: "Date", required: function() { return this.type === documentTypes.manual } },
        versionNumber: { type: "String", required: true },
        previousVersions: [{ type: "String", ref: "Manual" }],
        attachments: [{type: 'String'}],
        deptId: { type: "String", required: true },
        operator: idAndNameSchemaRequired,
        documentNo: { type: "String", required: true, unique: true },
        status: { type: "String", required: true, default: manualStatus.active },
        typeOfService: { type: "String", required: function() { return this.type === documentTypes.contract } },
        typeOfContract: { type: "String", required: function() { return this.type === documentTypes.contract }, enum: Object.values(CONTRACT_TYPES) },
        contractStatus: { type: "String", required: function() { return this.type === documentTypes.contract }, default: manualStatus.oneOff },
    },
    { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
)

schema.plugin(paginator);
schema.plugin(mongooseAggregatePaginate);
export default model("Manual", schema);