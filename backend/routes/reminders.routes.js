const express   = require('express');
const router    = express.Router();
const rem       = require('../controllers/reminders.controller');
const protect   = require('../middleware/auth.middleware');
const asyncWrap = require('../utils/asyncWrapper');
const { success } = require('../utils/responseHandler');
const AppError  = require('../utils/appError');
const Reminder  = require('../models/Reminder.model');

router.use(protect);

router.get ('/',          rem.getReminders);
router.post('/',          rem.createReminder);
router.put ('/:id',       rem.updateReminder);
router.delete('/:id',     rem.deleteReminder);
router.patch('/:id',      rem.updateReminder); // mark complete alias

// PATCH /reminders/:id/snooze — delay reminder by hours
router.patch('/:id/snooze', asyncWrap(async (req, res) => {
  const { hours = 24 } = req.body;
  const reminder = await Reminder.findOne({ _id: req.params.id, userId: req.user._id });
  if (!reminder) throw new AppError('Reminder not found.', 404, 'REMINDER_001');

  const newDueDate = new Date(reminder.dueDate);
  newDueDate.setHours(newDueDate.getHours() + Number(hours));

  const updated = await Reminder.findByIdAndUpdate(
    reminder._id,
    { dueDate: newDueDate, notificationSent: false },
    { new: true }
  );
  return success(res, { data: updated, message: `Reminder snoozed for ${hours} hour(s).` });
}));

module.exports = router;
