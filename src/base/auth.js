import asyncWrapper from "../middlewares/async.js";
import { getPermission, makeRequest } from "../helpers/fetch.js";
import { createCustomError } from "../utils/errors/customError.js";
import { openRoutes } from "./request.js";

/**
 * * authMiddleware
 * @async
 */

const authMiddleware = asyncWrapper(async (req, res, next) => {
  try {
    const isOpenRoute = openRoutes.some((route) => req.method === route.method && req.path === route.path);
    if (isOpenRoute) return next();
    const apiKey = req.headers["x-sahcoapi-key"];
    const { data: user } = await makeRequest('GET', 'auth/profile', apiKey);
    const { data: permissions } = await getPermission(user.permissions, apiKey);

    req.user = { ...user, permissions };

    return next();
  } catch (err) {
    throw createCustomError(err?.message || "Network Error", 500);
  }
});

export default authMiddleware;
