const express = require('express');
const router  = express.Router();
const graph   = require('../controllers/knowledgeGraph.controller');
const protect = require('../middleware/auth.middleware');
const activity = require('../middleware/activity.middleware');

router.use(protect);

router.get ('/nodes', graph.getGraphNodes);
router.post('/query', activity('chat', 'Life OS Graph Query'), graph.queryGraph);

module.exports = router;
