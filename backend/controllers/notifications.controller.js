// ─── controllers/notifications.controller.js ─────────────────────────────────
// Controller handles: GET /api/notifications, PATCH /api/notifications/read-all

const notificationRepo = require('../repositories/notification.repository');
const { success }      = require('../utils/responseHandler');
const asyncWrapper     = require('../utils/asyncWrapper');

/** GET /api/notifications */
const getNotifications = asyncWrapper(async (req, res) => {
  const { unread } = req.query;
  const [notifications, unreadCount] = await Promise.all([
    notificationRepo.findByUser(req.user._id, { unreadOnly: unread === 'true', limit: 30 }),
    notificationRepo.countUnread(req.user._id),
  ]);
  return success(res, { data: { notifications, unreadCount }, message: 'Notifications fetched' });
});

/** PATCH /api/notifications/read-all */
const markAllRead = asyncWrapper(async (req, res) => {
  await notificationRepo.markAllRead(req.user._id);
  return success(res, { message: 'All notifications marked as read' });
});

module.exports = { getNotifications, markAllRead };
