// ─── controllers/admin.controller.js ─────────────────────────────────────────
// Admin module per 07_API_DOCUMENTATION.md
// GET /admin/dashboard | /admin/users | /admin/documents | /admin/analytics

const User      = require('../models/User.model');
const Document  = require('../models/Document.model');
const Activity  = require('../models/Activity.model');
const asyncWrap = require('../utils/asyncWrapper');
const { success, paginated } = require('../utils/responseHandler');

// ─── GET /admin/dashboard ─────────────────────────────────────────────────────
const getAdminDashboard = asyncWrap(async (req, res) => {
  const [totalUsers, totalDocuments, activeUsers, storageStats, recentUploads] = await Promise.all([
    User.countDocuments(),
    Document.countDocuments({ isDeleted: false }),
    User.countDocuments({ status: 'active' }),
    Document.aggregate([
      { $match: { isDeleted: false } },
      { $group: { _id: null, totalStorage: { $sum: '$fileSize' } } },
    ]),
    Document.find({ isDeleted: false }).sort({ createdAt: -1 }).limit(10)
      .populate('userId', 'name email').select('-rawText -embedding'),
  ]);

  return success(res, {
    data: {
      totalUsers,
      totalDocuments,
      activeUsers,
      totalStorageBytes: storageStats[0]?.totalStorage || 0,
      recentUploads,
    },
    message: 'Admin dashboard fetched.',
  });
});

// ─── GET /admin/users ─────────────────────────────────────────────────────────
const getUsers = asyncWrap(async (req, res) => {
  const { page = 1, limit = 20, search } = req.query;
  const filter = {};
  if (search) filter.$or = [
    { name:  { $regex: search, $options: 'i' } },
    { email: { $regex: search, $options: 'i' } },
  ];

  const [users, total] = await Promise.all([
    User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit)),
    User.countDocuments(filter),
  ]);

  return paginated(res, { items: users, total, page: Number(page), limit: Number(limit), message: 'Users fetched.' });
});

// ─── GET /admin/documents ─────────────────────────────────────────────────────
const getAdminDocuments = asyncWrap(async (req, res) => {
  const { page = 1, limit = 20, category, status } = req.query;
  const filter = { isDeleted: false };
  if (category) filter.category = category;
  if (status)   filter.status   = status;

  const [documents, total] = await Promise.all([
    Document.find(filter)
      .select('-rawText -embedding')
      .populate('userId', 'name email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit)),
    Document.countDocuments(filter),
  ]);

  return paginated(res, { items: documents, total, page: Number(page), limit: Number(limit), message: 'Documents fetched.' });
});

// ─── GET /admin/analytics ─────────────────────────────────────────────────────
const getAnalytics = asyncWrap(async (req, res) => {
  const [docsByCategory, docsByStatus, userGrowth, activityBreakdown] = await Promise.all([
    Document.aggregate([
      { $match: { isDeleted: false } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]),
    Document.aggregate([
      { $match: { isDeleted: false } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]),
    User.aggregate([
      { $project: { month: { $month: '$createdAt' }, year: { $year: '$createdAt' } } },
      { $group: { _id: { month: '$month', year: '$year' }, count: { $sum: 1 } } },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 12 },
    ]),
    Activity.aggregate([
      { $group: { _id: '$action', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]),
  ]);

  return success(res, {
    data: { docsByCategory, docsByStatus, userGrowth, activityBreakdown },
    message: 'Analytics fetched.',
  });
});

module.exports = { getAdminDashboard, getUsers, getAdminDocuments, getAnalytics };
