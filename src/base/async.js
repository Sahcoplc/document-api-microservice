import asyncWrapper from "../middlewares/async";
import { getEmployee, getPermission } from "../helpers/fetch";
import { createCustomError } from "../utils/errors/customError";
import { openRoutes } from "./request";

/**
 * * authMiddleware
 * @async
 */

const authMiddleware = asyncWrapper(async (req, res, next) => {
  try {
    const isOpenRoute = openRoutes.some(
      (route) => req.method === route.method && req.path === route.path
    );
    if (isOpenRoute) return next();
    const apiKey = req.headers["x-sahcoapi-key"];
    const { data: user } = await getEmployee(apiKey);
    const { data: permissions } = await getPermission(user.permissions, apiKey);

    req.user = { ...user, permissions };

    return next();
  } catch (err) {
    throw createCustomError(err?.message || "Network Error", 500);
  }
});

export default authMiddleware;
