import { errorResponse } from "../utils/apiResponse.js";

export const errorHandler = (err, req, res, next) => {
  const status = err.statusCode || 500;
  const message = err.message || "Internal server error";

  if (process.env.NODE_ENV === "production") {
    return errorResponse(res, message, status);
  }
  return errorResponse(res, message, status, err.stack);
};
