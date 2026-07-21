const BaseRepository = require('./base.repository');
const Reminder = require('../models/Reminder.model');

class ReminderRepository extends BaseRepository {
  constructor() { super(Reminder); }

  async findByUser(userId, status) {
    const filter = { userId };
    if (status) filter.status = status;
    return Reminder.find(filter)
      .sort({ dueDate: 1 })
      .populate('documentId', 'title documentType fileUrl');
  }

  async findUpcoming(userId, limit = 5) {
    return Reminder.find({ userId, status: 'pending', dueDate: { $gte: new Date() } })
      .sort({ dueDate: 1 })
      .limit(limit)
      .populate('documentId', 'title documentType');
  }

  /** Used by cron job to find all overdue-but-not-notified reminders */
  async findPendingDueToday() {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);
    return Reminder.find({
      status: 'pending',
      dueDate: { $gte: start, $lte: end },
      notificationSent: false,
    }).populate('userId', 'name email');
  }

  async markNotificationSent(id) {
    return Reminder.findByIdAndUpdate(id, { notificationSent: true });
  }
}

module.exports = new ReminderRepository();
