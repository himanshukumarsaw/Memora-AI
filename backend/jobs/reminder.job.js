// ─── jobs/reminder.job.js ─────────────────────────────────────────────────────
// Cron job — runs daily at 09:00.
// Per spec §15: checks expiring documents, creates reminders + notifications.

const cron             = require('node-cron');
const documentRepo     = require('../repositories/document.repository');
const reminderRepo     = require('../repositories/reminder.repository');
const notificationSvc  = require('../notifications/notification.service');
const logger           = require('../utils/logger');
const { EXPIRY_WARNING_DAYS } = require('../constants');

/**
 * Core check — finds documents expiring within EXPIRY_WARNING_DAYS,
 * creates a reminder if one doesn't already exist, and fires a notification.
 */
const runExpiryCheck = async () => {
  logger.info('[ReminderJob] Starting daily expiry check…');

  try {
    const expiring = await documentRepo.findExpiringSoon(EXPIRY_WARNING_DAYS);
    logger.info(`[ReminderJob] Found ${expiring.length} documents expiring within ${EXPIRY_WARNING_DAYS} days`);

    for (const doc of expiring) {
      const daysLeft = Math.ceil((new Date(doc.expiryDate) - new Date()) / (1000 * 60 * 60 * 24));

      // Check if an active reminder already exists for this document
      const existing = await reminderRepo.findOne({
        userId:     doc.userId,
        documentId: doc._id,
        status:     'pending',
      });

      if (!existing) {
        await reminderRepo.create({
          userId:          doc.userId,
          documentId:      doc._id,
          title:           `${doc.title} expires in ${daysLeft} day${daysLeft !== 1 ? 's' : ''}`,
          message:         `Your ${doc.documentType || 'document'} "${doc.title}" is expiring soon. Please renew it.`,
          type:            'expiry',
          dueDate:         doc.expiryDate,
          priority:        daysLeft <= 7 ? 'critical' : daysLeft <= 15 ? 'high' : 'medium',
          notificationSent: false,
        });

        logger.info(`[ReminderJob] Created reminder for doc=${doc._id} (${daysLeft} days left)`);
      }

      // Always send a notification for documents due very soon (≤7 days)
      if (daysLeft <= 7) {
        await notificationSvc.sendExpiryWarning(doc.userId, doc.title, daysLeft);
      }
    }

    // Mark pending-today reminders as notified
    const todayReminders = await reminderRepo.findPendingDueToday();
    for (const rem of todayReminders) {
      await notificationSvc.send({
        userId:      rem.userId._id || rem.userId,
        title:       `Reminder due today: ${rem.title}`,
        description: rem.message || '',
        type:        'reminder',
        link:        '/reminders',
      });
      await reminderRepo.markNotificationSent(rem._id);
    }

    logger.info(`[ReminderJob] Finished. Processed ${expiring.length} expiring docs, ${todayReminders.length} today reminders.`);
  } catch (err) {
    logger.error(`[ReminderJob] Error: ${err.message}`, { stack: err.stack });
  }
};

/**
 * Schedules the cron job. Called once at server startup.
 * Schedule: "0 9 * * *" = every day at 09:00 (server time)
 */
const scheduleReminderJob = () => {
  // Daily at 9 AM
  cron.schedule('0 9 * * *', runExpiryCheck, {
    scheduled: true,
    timezone:  'Asia/Kolkata', // IST
  });

  logger.info('[ReminderJob] Scheduled: daily at 09:00 IST');

  // Also run immediately on startup in development for testing
  if (process.env.NODE_ENV === 'development') {
    logger.info('[ReminderJob] Running initial check immediately (dev mode)…');
    setTimeout(runExpiryCheck, 5000); // 5 s after server starts
  }
};

module.exports = { scheduleReminderJob, runExpiryCheck };
