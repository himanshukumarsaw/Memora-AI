const BaseRepository = require('./base.repository');
const ShareLink      = require('../models/ShareLink.model');

class ShareRepository extends BaseRepository {
  constructor() { super(ShareLink); }

  async findByToken(token) {
    return ShareLink.findOne({ token }).populate('documentId');
  }

  async findByUser(userId) {
    return ShareLink.find({ userId, isActive: true })
      .sort({ createdAt: -1 })
      .populate('documentId', 'title documentType');
  }

  async recordAccess(shareId, ip) {
    return ShareLink.findByIdAndUpdate(shareId, {
      $inc: { accessCount: 1 },
      $push: { accessLog: { accessedAt: new Date(), ip } },
    });
  }

  async revoke(shareId, userId) {
    return ShareLink.findOneAndUpdate(
      { _id: shareId, userId },
      { isActive: false },
      { new: true }
    );
  }
}

module.exports = new ShareRepository();
