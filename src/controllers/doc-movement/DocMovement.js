import DocumentMovement from "../../models/DocumentMovement.js"
import { error, success } from "../../helpers/response.js"
import asyncWrapper from "../../middlewares/async.js"
import { sendMail } from "../../services/mail.js"
import documentInbox from "mails/new-document.js"

class DocumentMovementControl {
    sendDocument = asyncWrapper(async (req, res) => {
        try {
            const { locals: { docMovement } } = req

            const movement = await new DocumentMovement(docMovement).save()

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
}

export default DocumentMovementControl