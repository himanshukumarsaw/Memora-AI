// ─── controllers/activity.controller.js ──────────────────────────────────────
const activityRepo = require('../repositories/activity.repository');
const { success }  = require('../utils/responseHandler');
const asyncWrapper = require('../utils/asyncWrapper');

/** GET /api/activity */
const getActivity = asyncWrapper(async (req, res) => {
  const limit = parseInt(req.query.limit) || 20;
  const activities = await activityRepo.findByUser(req.user._id, limit);
  return success(res, { data: activities, message: 'Activity log fetched' });
});

module.exports = { getActivity };
