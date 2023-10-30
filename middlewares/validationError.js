import mongoose from "mongoose";

const ValidationError = mongoose.Error.ValidationError;

function validationErrorMiddleware(err, req, res, next) {
  if (err instanceof ValidationError) {
    // Validation errors occurred
    const errorMessages = {};

    for (const field in err.errors) {
      errorMessages[field] = err.errors[field].message;
    }

    res.status(400).json({
      message: "Validation failed",
      errors: errorMessages,
    });
  } else {
    // If it's not a validation error, pass it to the next error handler
    next(err);
  }
}

export default validationErrorMiddleware;
