const express = require('express');
const router = express.Router();
const docs = require('../controllers/documents.controller');
const authMiddleware = require('../middleware/auth.middleware');

router.use(authMiddleware);
router.get('/dashboard/stats', docs.getDashboardStats);
router.get('/', docs.getDocuments);
router.get('/:id', docs.getDocument);
router.post('/upload', docs.uploadDocument);
router.delete('/:id', docs.deleteDocument);

module.exports = router;
