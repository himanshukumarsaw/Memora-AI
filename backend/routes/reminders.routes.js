const express = require('express');
const router = express.Router();
const rem = require('../controllers/reminders.controller');
const authMiddleware = require('../middleware/auth.middleware');

router.use(authMiddleware);
router.get('/', rem.getReminders);
router.post('/', rem.createReminder);
router.put('/:id', rem.updateReminder);
router.delete('/:id', rem.deleteReminder);

module.exports = router;
