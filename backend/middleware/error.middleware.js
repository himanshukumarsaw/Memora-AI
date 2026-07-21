// ─── middleware/error.middleware.js ───────────────────────────────────────────
// Centralised, production-safe error handler.
// Per spec §21: never expose internal errors to the client.

const logger   = require('../utils/logger');
const AppError = require('../utils/appError');

/**
 * Mongoose validation error → AppError
 */
const handleMongooseValidation = (err) =>
  new AppError(
    Object.values(err.errors).map((e) => e.message).join('. '),
    400,
    'VALIDATION_ERROR'
  );

/**
 * Mongoose duplicate key → AppError
 */
const handleDuplicateKey = (err) => {
  const field = Object.keys(err.keyValue)[0];
  return new AppError(`${field} already exists.`, 409, 'DUPLICATE_KEY');
};

/**
 * JWT errors → AppError
 */
const handleJWT = () => new AppError('Invalid or expired session. Please log in again.', 401, 'AUTH_ERROR');

/**
 * express-validator result — not actually thrown, handled inline.
 * But keeping here for completeness.
 */

const errorMiddleware = (err, req, res, next) => {
  // Normalise operational errors
  let error = err;

  if (err.name === 'ValidationError')    error = handleMongooseValidation(err);
  if (err.code === 11000)                error = handleDuplicateKey(err);
  if (err.name === 'JsonWebTokenError')  error = handleJWT();
  if (err.name === 'TokenExpiredError')  error = handleJWT();

  // Cast errors (invalid Mongo ID)
  if (err.name === 'CastError') {
    error = new AppError(`Invalid ID: ${err.value}`, 400, 'INVALID_ID');
  }

  const statusCode = error.statusCode || 500;
  const message    = error.isOperational ? error.message : 'Something went wrong. Please try again.';

  // Log — full stack for unexpected errors, brief for operational ones
  if (!error.isOperational) {
    logger.error(`[UNHANDLED] ${req.method} ${req.originalUrl} — ${err.message}`, { stack: err.stack });
  } else {
    logger.warn(`[APP_ERROR] ${req.method} ${req.originalUrl} — ${statusCode} ${message}`);
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(error.code ? { code: error.code } : {}),
    // Only expose stack in development
    ...(process.env.NODE_ENV === 'development' ? { stack: err.stack } : {}),
  });
};

module.exports = errorMiddleware;
