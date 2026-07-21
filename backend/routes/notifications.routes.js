const express = require('express');
const router  = express.Router();
const auth    = require('../middleware/auth.middleware');
const Notification = require('../models/Notification.model');
const { getNotifications, markAllRead } = require('../controllers/notifications.controller');
const asyncWrap = require('../utils/asyncWrapper');
const { success } = require('../utils/responseHandler');
const AppError  = require('../utils/appError');

router.use(auth);

router.get('/',             getNotifications);
router.patch('/read-all',   markAllRead);

// PATCH /notifications/:id — mark single notification as read
router.patch('/:id', asyncWrap(async (req, res) => {
  const notif = await Notification.findOneAndUpdate(
    { _id: req.params.id, userId: req.user._id },
    { read: true },
    { new: true }
  );
  if (!notif) throw new AppError('Notification not found.', 404, 'NOTIF_001');
  return success(res, { data: notif, message: 'Notification marked as read.' });
}));

module.exports = router;
