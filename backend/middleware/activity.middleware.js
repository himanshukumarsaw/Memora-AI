// ─── middleware/activity.middleware.js ────────────────────────────────────────
// Auto-logs user activity after successful responses.
// Usage:  router.post('/upload', activityMiddleware('upload', 'Document'), controller)

const activityRepo = require('../repositories/activity.repository');
const logger       = require('../utils/logger');

/**
 * @param {string} action  - activity action key (see constants/ACTIVITY_ACTIONS)
 * @param {string} target  - human-readable target description
 */
const activityMiddleware = (action, target = '') => (req, res, next) => {
  // Wrap res.json to hook after a successful response
  const originalJson = res.json.bind(res);
  res.json = (body) => {
    originalJson(body);
    // Only log if request succeeded (2xx)
    if (res.statusCode >= 200 && res.statusCode < 300 && req.user) {
      const ip     = req.ip || req.connection.remoteAddress || '';
      const device = req.headers['user-agent'] || '';
      activityRepo
        .log({ userId: req.user._id, action, target, ipAddress: ip, device })
        .catch((err) => logger.error(`Activity log failed: ${err.message}`));
    }
  };
  next();
};

module.exports = activityMiddleware;
