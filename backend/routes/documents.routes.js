// ─── routes/documents.routes.js ───────────────────────────────────────────────
// All document endpoints per 07_API_DOCUMENTATION.md

const express    = require('express');
const router     = express.Router();
const docs       = require('../controllers/documents.controller');
const protect    = require('../middleware/auth.middleware');
const activity   = require('../middleware/activity.middleware');
const { uploadLimiter } = require('../middleware/rateLimit.middleware');

router.use(protect);

// Dashboard stats — must come before /:id routes
router.get('/dashboard/stats', docs.getDashboardStats);

// CRUD
router.get  ('/',           docs.getDocuments);
router.post ('/upload',     uploadLimiter, activity('upload', 'Document upload'), docs.uploadDocument);
router.get  ('/:id',        docs.getDocument);
router.delete('/:id',       activity('delete', 'Document delete'), docs.deleteDocument);

// Document actions
router.patch('/:id/name',     docs.renameDocument);
router.patch('/:id/category', docs.updateCategory);
router.patch('/:id/favorite', docs.toggleFavorite);
router.patch('/:id/archive',  docs.toggleArchive);

// File delivery
router.get('/:id/download', activity('download', 'Document download'), docs.downloadDocument);
router.get('/:id/preview',  docs.previewDocument);

module.exports = router;
