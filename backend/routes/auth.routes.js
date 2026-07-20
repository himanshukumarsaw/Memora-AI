const express = require('express');
const router = express.Router();
const auth = require('../controllers/auth.controller');
const authMiddleware = require('../middleware/auth.middleware');

router.post('/register', auth.register);
router.post('/login', auth.login);
router.get('/me', authMiddleware, auth.getMe);
router.put('/vault-setup', authMiddleware, auth.setupVault);

module.exports = router;
