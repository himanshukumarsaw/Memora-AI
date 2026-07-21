// ─── notifications/notification.service.js ────────────────────────────────────
// Creates in-app notifications.
// Future: add email / push channel here without touching callers.

const notificationRepo = require('../repositories/notification.repository');
const logger           = require('../utils/logger');

class NotificationService {
  /**
   * Create a notification for a user.
   * @param {object} options
   * @param {string} options.userId
   * @param {string} options.title
   * @param {string} [options.description]
   * @param {string} [options.type]        - reminder | upload | share | login | warning | security
   * @param {string} [options.link]        - relative URL for frontend routing
   */
  async send({ userId, title, description = '', type = 'reminder', link = '' }) {
    try {
      const notification = await notificationRepo.createNotification({ userId, title, description, type, link });
      logger.info(`Notification sent → user=${userId} type=${type}: ${title}`);
      return notification;
    } catch (err) {
      logger.error(`Failed to create notification: ${err.message}`);
    }
  }

  async sendUploadComplete(userId, documentTitle) {
    return this.send({
      userId,
      title: `Document ready: ${documentTitle}`,
      description: 'AI has finished processing your document. It is now searchable.',
      type: 'upload',
      link: '/vault',
    });
  }

  async sendExpiryWarning(userId, documentTitle, daysLeft) {
    return this.send({
      userId,
      title: `${documentTitle} expires in ${daysLeft} day${daysLeft !== 1 ? 's' : ''}`,
      description: 'Please renew this document before it expires.',
      type: 'reminder',
      link: '/reminders',
    });
  }

  async sendShareAccessed(userId, documentTitle) {
    return this.send({
      userId,
      title: `Shared document accessed: ${documentTitle}`,
      description: 'Someone accessed your shared document link.',
      type: 'share',
      link: '/vault',
    });
  }

  async sendSecurityAlert(userId, detail) {
    return this.send({
      userId,
      title: 'Security alert',
      description: detail,
      type: 'security',
      link: '/profile',
    });
  }
}

module.exports = new NotificationService();
