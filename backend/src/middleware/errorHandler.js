import { httpResponse } from "../utils/httpResponse.js";

export const errorHandler = (err, req, res, next) => {
  console.error("Error:", err);

  if (err.message && err.message.includes("JWT")) {
    return httpResponse.unauthorized(res, "Invalid or expired token");
  }

  if (err.message && err.message.includes("not found")) {
    return httpResponse.notFound(res, err.message);
  }

  return httpResponse.error(res, err, 500, "Internal server error");
};

export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
