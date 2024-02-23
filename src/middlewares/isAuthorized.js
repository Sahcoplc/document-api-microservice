import { error } from "../helpers/response.js";

export const isAuthorized = (requiredPermissions = [], requiredLocations = [], requiredDepts = []) =>
  async function checkAuthorization(req, res, next) {
    try {
      if (!req.user) return error(res, 400, "You are not logged in");
      const { currentStation: { parent },permissions: { isController, actions, stations, departments, modules } } = req.user;

      const module = modules.find((module) => module.section === "sahco-docs")
      
      if (actions.length === 0 || stations.length === 0 || departments.length === 0 || !module) {
        return error(res, 401, "You are not authorized")
      }

      const isOpenToAll = requiredPermissions.length === 0;
      const isOpenToAllLocation = requiredLocations.length === 0;
      const isOpenToAllDept = requiredDepts.length === 0;
      
      const userHasPermission = actions.some((action) => requiredPermissions.includes(action.name)) || isOpenToAll
      const userHasLocation = stations.some((action) => requiredLocations.includes(action.code)) || isOpenToAllLocation
      const userHasDept = departments.some((dept) => requiredDepts.includes(dept.name)) || isOpenToAllDept

      if (isController && parent) return next()

      if (userHasPermission && userHasLocation && userHasDept) return next()

      return error(res, 401, "You are not authorized");
      
    } catch (err) {
      return error(res, 500, err);
    }
  };
