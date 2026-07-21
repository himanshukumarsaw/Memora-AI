// ─── utils/appError.js ────────────────────────────────────────────────────────
// Custom operational error class.
// Distinguishes "expected" operational errors from unexpected programmer errors
// so the global error handler can respond safely vs. loudly.

class AppError extends Error {
  /**
   * @param {string}  message     - User-safe error message (will be sent to client)
   * @param {number}  statusCode  - HTTP status code
   * @param {string}  [code]      - Machine-readable error code (optional)
   */
  constructor(message, statusCode = 500, code = 'INTERNAL_ERROR') {
    super(message);
    this.statusCode    = statusCode;
    this.code          = code;
    this.isOperational = true; // marks this as a known, handled error
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
