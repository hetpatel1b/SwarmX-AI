export const notFoundHandler = (req, res) => {
  return res.status(404).json({
    success: false,
    error: {
      name: "NotFound",
      message: `Route ${req.method} ${req.originalUrl} does not exist`
    }
  });
};

export const errorHandler = (error, _req, res, _next) => {
  const statusCode = error.statusCode || 500;
  const isProduction = process.env.NODE_ENV === "production";

  return res.status(statusCode).json({
    success: false,
    error: {
      name: error.name || "InternalServerError",
      message:
        statusCode === 500 && isProduction
          ? "An unexpected server error occurred"
          : error.message
    }
  });
};
