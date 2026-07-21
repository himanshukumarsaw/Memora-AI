const express  = require('express');
const router   = express.Router();
const timeline = require('../controllers/timeline.controller');
const protect  = require('../middleware/auth.middleware');
const activity = require('../middleware/activity.middleware');

router.use(protect);

router.get ('/',     timeline.getTimeline);
router.post('/',     activity('profile', 'Added custom life milestone'), timeline.createMilestone);
router.delete('/:id', timeline.deleteMilestone);

module.exports = router;
