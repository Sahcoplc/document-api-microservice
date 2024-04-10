class CustomAPIError extends Error {
    constructor(message, statusCode) {
      super(message);
      this.statusCode = statusCode;
    }
}
  
const createCustomError = (msg, statusCode) => new CustomAPIError(msg, statusCode);
  
export { createCustomError, CustomAPIError };
  