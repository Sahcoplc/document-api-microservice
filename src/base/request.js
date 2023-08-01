import { createValidator } from "express-joi-validation"
import Joi from "joi"

export const openRoutes = [
    { method: "GET", path: "/" },
    { method: "GET", path: "/api"}
]

export const validator = createValidator()

export const idSchema = Joi.object({
    id: Joi.string().required()
})