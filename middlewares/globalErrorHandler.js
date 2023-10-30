export const globalErrorHandler = (err, req, res, next) => {
  console.error(err);
  const stack = process.env.NODE_ENV === "development" ? err.stack : null;
  const status = err.status || 500;
  const message = err.message || "Something went wrong";
  res.status(status).json({ status, message, stack });
};

export const notFound = (req, res, next) => {
  const error = new Error(`Not found - ${req.originalUrl}`);
  error.status = 404;
  next(error);
};
