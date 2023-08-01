import { CustomAPIError } from "./customError";

/**
 * 
 */
class BadRequest extends CustomAPIError {
  constructor(message) {
    super(message);
    this.statusCode = 400;
  }
}

export default BadRequest;
