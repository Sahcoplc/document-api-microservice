import DocumentMovement from "../../models/DocumentMovement.js"
import { error, success } from "../../helpers/response.js"
import asyncWrapper from "../../middlewares/async.js"
import { sendMail } from "../../services/mail.js"
import documentInbox from "../../mails/new-document.js"
import { generateMovementFilter } from "./helper.js"
import { sendNotification } from "../../helpers/fetch.js"
import { paginate } from "../../helpers/paginate.js"

class DocumentMovementControl {
    sendDocument = asyncWrapper(async (req, res) => {
        try {
            const { locals: { docMovement }, user: { apiKey } } = req

            const movement = await new DocumentMovement(docMovement).save()

            const notify = {
                title: 'Approval Request',
                body: `${movement.from.name} from ${movement.from.dept} has sent a document`,
                receiver: movement.to._id,
                isAll: false
            }

            await sendNotification(apiKey, notify)

            await sendMail({
                email: movement.to.email,
                subject: "DOCUMENT APPROVAL REQUEST",
                body: documentInbox({
                    title: "DOCUMENT APPROVAL REQUEST",
                    name: movement.to.name,
                    department: movement.from.dept,
                    senderName: movement.from.name,
                    documentType: movement.type
                })
            })

            return success(res, 201, movement)
        } catch (e) {
            return error(res, 500, e)
        }
    })

    getDocumentMovement = asyncWrapper(async (req, res) => {
        try {
            const { user: { _id }, query: { page, limit } } = req

            const filter = generateMovementFilter({ ...req.query, _id })

            const modelName = "DocumentMovement"
            const options = { page, limit, filter, modelName, sort: { createdAt: -1 }, populate: [{ path: 'documentId' }] };
            const transferredDocs = await paginate(options);

            return success(res, 200, transferredDocs)
        } catch(e) {
            return error(res, 500, e)
        }
    })
}

export default DocumentMovementControl