const BaseRepository = require('./base.repository');
const Document = require('../models/Document.model');

class DocumentRepository extends BaseRepository {
  constructor() {
    super(Document);
  }

  /** All non-deleted documents for a user with optional filters */
  async findByUser(userId, { category, status, skip = 0, limit = 20 } = {}) {
    const filter = { userId, isDeleted: false };
    if (category) filter.category = category;
    if (status)   filter.status   = status;
    return Document.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('-rawText -embedding'); // exclude heavy fields by default
  }

  async countByUser(userId, extraFilter = {}) {
    return Document.countDocuments({ userId, isDeleted: false, ...extraFilter });
  }

  /** Retrieve only the fields needed for semantic search */
  async findForSearch(userId) {
    return Document.find({ userId, isDeleted: false, status: 'ready' })
      .select('_id title documentType category aiSummary rawText embedding')
      .lean();
  }

  /** Recent N documents (for dashboard widget) */
  async findRecent(userId, limit = 5) {
    return Document.find({ userId, isDeleted: false })
      .sort({ createdAt: -1 })
      .limit(limit)
      .select('-rawText -embedding');
  }

  /** Soft-delete a document */
  async softDelete(docId) {
    return Document.findByIdAndUpdate(docId, { isDeleted: true }, { new: true });
  }

  /** Update document status + processing fields after AI pipeline */
  async markReady(docId, updates = {}) {
    return Document.findByIdAndUpdate(
      docId,
      { status: 'ready', ...updates },
      { new: true }
    );
  }

  async markFailed(docId, errorMsg) {
    return Document.findByIdAndUpdate(
      docId,
      { status: 'failed', processingError: errorMsg },
      { new: true }
    );
  }

  /** Dashboard aggregation */
  async getDashboardStats(userId) {
    const [total, expiringSoon, expired, byCategory] = await Promise.all([
      Document.countDocuments({ userId, isDeleted: false }),
      Document.countDocuments({ userId, isDeleted: false, expiryStatus: 'expiring_soon' }),
      Document.countDocuments({ userId, isDeleted: false, expiryStatus: 'expired' }),
      Document.aggregate([
        { $match: { userId, isDeleted: false } },
        { $group: { _id: '$category', count: { $sum: 1 } } },
      ]),
    ]);
    return { total, expiringSoon, expired, byCategory };
  }

  /** Bump view counter */
  async recordView(docId) {
    return Document.findByIdAndUpdate(docId, {
      $inc: { viewCount: 1 },
      lastViewedAt: new Date(),
    });
  }

  /** Find docs expiring within N days (for cron job) */
  async findExpiringSoon(days = 30) {
    const future = new Date();
    future.setDate(future.getDate() + days);
    return Document.find({
      isDeleted: false,
      hasExpiry: true,
      expiryDate: { $lte: future, $gte: new Date() },
    }).populate('userId', 'name email');
  }
}

module.exports = new DocumentRepository();
