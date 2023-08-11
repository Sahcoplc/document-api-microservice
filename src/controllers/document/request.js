import { documentTypes } from "base/request"
import Joi from "joi"

export const createDocument = Joi.object({
    type: Joi.string().valid(...documentTypes).required()
    
})