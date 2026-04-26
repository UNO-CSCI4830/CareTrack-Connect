export const httpResponse = {
  success: (res, data, statusCode = 200, message = "Success") => {
    res.status(statusCode).json({
      success: true,
      message,
      data,
    });
  },

  error: (res, error, statusCode = 500, message = "Error") => {
    res.status(statusCode).json({
      success: false,
      message,
      error: error?.message || error || "Unknown error",
    });
  },

  created: (res, data, message = "Created successfully") => {
    res.status(201).json({
      success: true,
      message,
      data,
    });
  },

  notFound: (res, message = "Resource not found") => {
    res.status(404).json({
      success: false,
      message,
    });
  },

  badRequest: (res, message = "Bad request") => {
    res.status(400).json({
      success: false,
      message,
    });
  },

  unauthorized: (res, message = "Unauthorized") => {
    res.status(401).json({
      success: false,
      message,
    });
  },

  conflict: (res, message = "Conflict") => {
    res.status(409).json({
      success: false,
      message,
    });
  },
};
