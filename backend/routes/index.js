const express = require('express');
const router = express.Router();

router.use('/auth', require('./auth.routes'));
router.use('/documents', require('./documents.routes'));
router.use('/chat', require('./chat.routes'));
router.use('/reminders', require('./reminders.routes'));
router.use('/share', require('./share.routes'));
router.use('/profile', require('./profile.routes'));

module.exports = router;
