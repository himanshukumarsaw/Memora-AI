// ─── utils/asyncWrapper.js ────────────────────────────────────────────────────
// Eliminates try/catch boilerplate in every controller.
// Wraps an async route handler and forwards any rejection to Express's
// next(err) — picked up by the global error middleware.

/**
 * @param {Function} fn  - async (req, res, next) => {}
 * @returns {Function}   - Express-compatible middleware
 */
const asyncWrapper = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncWrapper;
