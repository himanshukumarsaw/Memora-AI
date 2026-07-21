// ─── middleware/admin.middleware.js ───────────────────────────────────────────
// Ensures the requesting user has the 'admin' role.
// Always runs after the auth middleware (protect).

const AppError = require('../utils/appError');

const adminOnly = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return next(new AppError('Access denied. Admin role required.', 403, 'AUTH_006'));
  }
  next();
};

module.exports = adminOnly;
