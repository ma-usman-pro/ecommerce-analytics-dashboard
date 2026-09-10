module.exports = function errorHandler(err, req, res, next) { // eslint-disable-line no-unused-vars
  let statusCode = Number.isInteger(err.statusCode) ? err.statusCode : 500;

  // Malformed ObjectId cast errors from Mongoose surface as 400s, not 500s.
  if (err.name === "CastError") statusCode = 400;

  const isServerError = statusCode >= 500;
  const message = isServerError && process.env.NODE_ENV === "production"
    ? "Internal server error"
    : err.message || "Internal server error";

  if (isServerError) {
    console.error("[error]", err);
  }

  res.status(statusCode).json({ success: false, message });
};
