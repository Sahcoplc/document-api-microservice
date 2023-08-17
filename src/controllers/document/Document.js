import { sendMail } from "../../services/mail.js"
import { paginate } from "../../helpers/paginate.js"
import { error, success } from "../../helpers/response.js"
import asyncWrapper from "../../middlewares/async.js"
import Document from "../../models/Document.js"
import { generateFilter } from "./helper.js"

class DocumentController {

    createDocument = asyncWrapper(async (req, res) => {
        try {
            const { locals: { document } } = req

            const doc = await new Document({ ...document }).save()

            return success(res, 201, doc)

        } catch (e) {
            return error(res, 500, e)
        }
    })
    
    updateDocument = asyncWrapper(async (req, res) => {
        try {
            const { params: { id }, body } = req

            const doc = await Document.findOneAndUpdate({ _id: id }, { $set: { ...body } }, { new: true }).lean()

            return success(res, 200, doc)

        } catch (e) {
            return error(res, 500, e)
        }
    })

    fetchMyDocuments = asyncWrapper(async (req, res) => {
        try {
            const { query: { page, limit } } = req

            const filter = { ...generateFilter(req) };
            const modelName = "Document";
            const options = {
                page,
                limit,
                modelName,
                filter,
                sort: { updatedAt: -1 },
            };

            const documents = await paginate(options);

            return success(res, 200, documents)

        } catch (e) {
            return error(res, 500, e)
        }
    })
}

export default DocumentController