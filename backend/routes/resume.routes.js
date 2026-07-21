const express  = require('express');
const router   = express.Router();
const resume   = require('../controllers/resume.controller');
const protect  = require('../middleware/auth.middleware');
const activity = require('../middleware/activity.middleware');

router.use(protect);
router.post('/',    activity('resume', 'Resume generated'), resume.createResume);
router.get ('/:id', resume.getResume);

module.exports = router;
