export function errorHandler(error, _req, res, _next) {
  const status = error.status || (error.name === "ZodError" ? 400 : 500);

  res.status(status).json({
    error: {
      message: status === 500 ? "Internal server error" : error.message,
      details: status === 400 ? error.issues : undefined
    }
  });
}
