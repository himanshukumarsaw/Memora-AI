const express  = require('express');
const router   = express.Router();
const admin    = require('../controllers/admin.controller');
const protect  = require('../middleware/auth.middleware');
const adminOnly = require('../middleware/admin.middleware');

router.use(protect, adminOnly);

router.get('/dashboard',  admin.getAdminDashboard);
router.get('/users',      admin.getUsers);
router.get('/documents',  admin.getAdminDocuments);
router.get('/analytics',  admin.getAnalytics);

module.exports = router;
