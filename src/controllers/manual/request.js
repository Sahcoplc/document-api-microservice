import { error } from "../../helpers/response";
import asyncWrapper from "../../middlewares/async";

export const validateUploadManual = asyncWrapper(async (req, res, next) => {
    try {

        // Upload files attached to AWS SE storage

        // Update previous versions if previous manual type or name exists

            // Find Manual by type
            // Create an array and push the ids into the array
        
        return next()
    } catch (e) {
        return error(res, 500, e)
    }
})