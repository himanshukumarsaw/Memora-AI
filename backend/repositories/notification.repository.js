const BaseRepository = require('./base.repository');
const Notification   = require('../models/Notification.model');

class NotificationRepository extends BaseRepository {
  constructor() { super(Notification); }

  async findByUser(userId, { unreadOnly = false, limit = 20 } = {}) {
    const filter = { userId };
    if (unreadOnly) filter.read = false;
    return Notification.find(filter).sort({ createdAt: -1 }).limit(limit);
  }

  async countUnread(userId) {
    return Notification.countDocuments({ userId, read: false });
  }

  async markAllRead(userId) {
    return Notification.updateMany({ userId, read: false }, { read: true });
  }

  async createNotification({ userId, title, description, type, link }) {
    return Notification.create({ userId, title, description, type, link });
  }
}

module.exports = new NotificationRepository();
