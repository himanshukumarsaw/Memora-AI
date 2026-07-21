const express  = require('express');
const router   = express.Router();
const autofill = require('../controllers/autofill.controller');
const protect  = require('../middleware/auth.middleware');
const activity = require('../middleware/activity.middleware');

router.use(protect);

router.post('/analyze', activity('autofill', 'Form analyzed'), autofill.analyzeForm);
router.get ('/:id',     autofill.getSuggestedFields);
router.post('/export',  activity('autofill', 'Form exported'), autofill.exportFilledForm);

module.exports = router;
