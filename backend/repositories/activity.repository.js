const BaseRepository = require('./base.repository');
const Activity       = require('../models/Activity.model');

class ActivityRepository extends BaseRepository {
  constructor() { super(Activity); }

  async log({ userId, action, target = '', targetId, ipAddress = '', device = '' }) {
    return Activity.create({ userId, action, target, targetId, ipAddress, device });
  }

  async findByUser(userId, limit = 20) {
    return Activity.find({ userId }).sort({ createdAt: -1 }).limit(limit);
  }
}

module.exports = new ActivityRepository();
