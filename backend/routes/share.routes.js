const express = require('express');
const router = express.Router();
const share = require('../controllers/share.controller');
const authMiddleware = require('../middleware/auth.middleware');

// Public route - access a shared document via token
router.get('/access/:token', share.accessShare);

// Protected routes
router.use(authMiddleware);
router.get('/', share.getShareLinks);
router.post('/', share.createShareLink);
router.delete('/:id', share.revokeShare);

module.exports = router;
