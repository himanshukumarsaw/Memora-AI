const express     = require('express');
const router      = express.Router();
const opportunity = require('../controllers/opportunity.controller');
const protect     = require('../middleware/auth.middleware');
const activity    = require('../middleware/activity.middleware');

router.use(protect);

router.get ('/',      opportunity.getOpportunities);
router.post('/check', activity('profile', 'Evaluated opportunity eligibility'), opportunity.checkEligibility);
router.post('/seed',  opportunity.seedCatalog);

module.exports = router;
