const express  = require('express');
const router   = express.Router();
const search   = require('../controllers/search.controller');
const protect  = require('../middleware/auth.middleware');
const { chatLimiter } = require('../middleware/rateLimit.middleware'); // reuse 60/10min

router.use(protect);

router.post('/',        chatLimiter, search.semanticSearchHandler);
router.get ('/filter',  search.getSearchFilters);

module.exports = router;
