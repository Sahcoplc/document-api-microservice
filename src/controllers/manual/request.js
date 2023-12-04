import { error } from "../../helpers/response";
import asyncWrapper from "../../middlewares/async";

export const validateUploadManual = asyncWrapper(async (req, res, next) => {
    try {

        
        
        return next()
    } catch (e) {
        return error(res, 500, e)
    }
})