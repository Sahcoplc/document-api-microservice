import { error } from "../helpers/response";

export const isAuthorized = (requiredPermissions = [], requiredLocations = [], requiredDepts = []) =>
  async function checkAuthorization(req, res, next) {
    try {
        if (!req.user) return error(res, 400, "You are not logged in");
        const { currentStation: { parent },permissions: { isController, actions, stations, departments } } = req.user;

        const isOpenToAll = requiredPermissions.length === 0;
        const isOpenToAllLocation = requiredLocations.length === 0;
        const isOpenToAllDept = requiredDepts.length === 0;

        if (actions.length === 0 || stations.length === 0 || departments.length === 0) {
            return error(res, 401, "You are not authorized");
        }

        const userHasPermission = actions.some((action) => requiredPermissions.includes(action.name));
        const userHasLocation = stations.some((action) => requiredLocations.includes(action.code));
        const userHasDept = departments.some((dept) => requiredDepts.includes(dept.name));

        if (isController && parent) {
            req.user.role = isController;
            return next();
        }

        if (isOpenToAll && isOpenToAllDept && isOpenToAllLocation) return next();

        if (userHasPermission && userHasLocation && userHasDept) {
            req.user.role = isController;
            return next();
        }

        if (isOpenToAllLocation && userHasPermission && userHasDept) {
            req.user.role = isController;
            return next();
        }

      return error(res, 401, "You are not authorized");
    } catch (err) {
      return error(res, 500, err);
    }
  };
