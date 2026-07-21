const express = require('express');
const router  = express.Router();
const ai      = require('../controllers/ai.controller');
const protect = require('../middleware/auth.middleware');
const activity = require('../middleware/activity.middleware');

router.use(protect);

router.get ('/status/:documentId',   ai.getProcessingStatus);
router.get ('/summary/:documentId',  ai.getAISummary);
router.get ('/metadata/:documentId', ai.getAIMetadata);
router.post('/redact',              activity('chat', 'Document redacted'), ai.redactDocument);

module.exports = router;
