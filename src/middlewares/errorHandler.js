import { error } from "../helpers/response.js";
import { CustomAPIError } from "../utils/errors/customError.js";


// eslint-disable-next-line no-unused-vars
const errorHandlerMiddleware = (err, req, res, next) => {
  if (err instanceof CustomAPIError) {
    return error(res, err.statusCode, err.message);
  } if (err.name === "ValidationError") {
    let msg = "";
    Object.keys(err.errors).forEach((key) => {
      msg += `${err.errors[key].message}.`;
    });

    return error(res, 400, msg);
  } if (err.name === "TokenExpiredError") {
    return error(res, 401, "Not authorized: token expired");
  }
  // eslint-disable-next-line no-console
  console.log(err);
  return error(res, 500, "Something went wrong, please try again");
};

export default errorHandlerMiddleware;
