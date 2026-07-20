const express = require('express');
const router = express.Router();
const profile = require('../controllers/profile.controller');
const authMiddleware = require('../middleware/auth.middleware');

router.use(authMiddleware);
router.get('/', profile.getProfile);

module.exports = router;
