import Manual from "../../models/Manual";
import { error, success } from "../../helpers/response";
import asyncWrapper from "../../middlewares/async";

export const uploadManual = asyncWrapper(async (req, res) => {
    try {
        const { locals: { manual } } = req

        const result = await Manual(manual).save()

        return success(res, 201, result)
    } catch (e) {
        return error(res, 500, e)
    }
})

export const fetch = asyncWrapper(async (req, res) => {})

