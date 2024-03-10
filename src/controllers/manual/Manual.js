import Manual from "../../models/Manual.js";
import { error, success } from "../../helpers/response.js";
import asyncWrapper from "../../middlewares/async.js";
import { generateFilter } from "./helper.js";
import { paginate } from "../../helpers/paginate.js";
import { manualStatus } from "../../base/request.js";

export const uploadManual = asyncWrapper(async (req, res) => {
    try {
        const { locals: { manual } } = req

        const result = await Manual(manual).save()

        return success(res, 201, result)
    } catch (e) {
        return error(res, 500, e)
    }
})

export const fetch = asyncWrapper(async (req, res) => {
    
    try {
        const { user: { department: { _id } }, query: { page, limit } } = req
    
        const filter = generateFilter({ ...req.query, deptId: _id })

        const modelName = "Manual"

        const options = { page, limit, filter, modelName, sort: { createdAt: -1 }, populate: [{ path: 'previousVersions' }] };
        
        const manuals = await paginate(options)

        return success(res, 200, manuals)
    } catch (e) {
        return error(res, 500, e)
    }
})

export const fetchSingleManual = asyncWrapper(async (req, res) => {
    try {
        const { user: { department: { _id: deptId } }, params: { id } } = req

        const manual = await Manual.findOne({ _id: id, deptId }).lean()

        return success(res, 200, manual)
    } catch (e) {
        return error(res, 500, e)
    }
})

export const updateManualOrCertificationStatus = asyncWrapper(async (req, res) => {
    try {
        const { locals: { manualsToExpire } } = req

        let manuals = []
        await Promise.all(
            manualsToExpire.map(async manual => {
                const doc = await Manual.findOneAndUpdate({ documentNo: manual.documentNo }, { $set: { status: manualStatus.expired } }, { new: true })
                console.log({doc})
                manuals.push(doc.documentNo)
            })
        )

        return success(res, 200, manuals)
    } catch (e) {
        return error(res, 500, e)
    }
})
