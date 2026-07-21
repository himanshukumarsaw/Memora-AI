// ─── controllers/dashboard.controller.js ─────────────────────────────────────
// Dedicated dashboard endpoint per 07_API_DOCUMENTATION.md
// GET /dashboard

const docRepo          = require('../repositories/document.repository');
const activityRepo     = require('../repositories/activity.repository');
const notificationRepo = require('../repositories/notification.repository');
const reminderRepo     = require('../repositories/reminder.repository');
const asyncWrap        = require('../utils/asyncWrapper');
const { success }      = require('../utils/responseHandler');

const getDashboard = asyncWrap(async (req, res) => {
  const userId = req.user._id;

  const [stats, recent, upcoming, recentActivity, unreadCount] = await Promise.all([
    docRepo.getDashboardStats(userId),
    docRepo.findRecent(userId, 6),
    reminderRepo.findUpcoming(userId, 5),
    activityRepo.findByUser(userId, 8),
    notificationRepo.countUnread(userId),
  ]);

  // AI suggestions — documents expiring within 30 days
  const expiringSoon = await docRepo.findMany(
    { userId, isDeleted: false, expiryStatus: { $in: ['expiring_soon', 'expired'] } },
    { sort: { expiryDate: 1 }, limit: 5, projection: 'title documentType expiryDate expiryStatus' }
  );

  return success(res, {
    data: {
      stats: {
        ...stats,
        storageUsed:       req.user.storageUsed,
        storageLimit:      req.user.storageLimit,
        storagePercentage: Math.round((req.user.storageUsed / req.user.storageLimit) * 100),
        unreadNotifications: unreadCount,
      },
      recentDocuments:  recent,
      upcomingReminders: upcoming,
      recentActivity,
      aiSuggestions:    expiringSoon,
      user: {
        name:         req.user.name,
        email:        req.user.email,
        vaultCreated: req.user.vaultCreated,
        plan:         req.user.plan,
      },
    },
    message: 'Dashboard data fetched.',
  });
});

module.exports = { getDashboard };
