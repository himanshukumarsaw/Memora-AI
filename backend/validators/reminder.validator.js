// ─── validators/reminder.validator.js ───────────────────────────────────────
const { body }               = require('express-validator');
const { REMINDER_PRIORITY, REMINDER_TYPES } = require('../constants');

const createReminderValidator = [
  body('title').trim().notEmpty().withMessage('Title is required').isLength({ max: 200 }),
  body('dueDate').notEmpty().withMessage('Due date is required').isISO8601().withMessage('Invalid date format').toDate(),
  body('description').optional().trim().isLength({ max: 1000 }),
  body('reminderType').optional().isIn(REMINDER_TYPES),
  body('priority').optional().isIn(Object.values(REMINDER_PRIORITY)),
  body('documentId').optional().isMongoId(),
];

module.exports = { createReminderValidator };
