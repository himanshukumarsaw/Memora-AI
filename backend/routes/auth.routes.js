// ─── routes/auth.routes.js ────────────────────────────────────────────────────
// All 8 auth endpoints per 07_API_DOCUMENTATION.md

const express  = require('express');
const router   = express.Router();
const auth     = require('../controllers/auth.controller');
const protect  = require('../middleware/auth.middleware');
const validate = require('../middleware/validate.middleware');
const { authLimiter } = require('../middleware/rateLimit.middleware');
const { registerValidator, loginValidator } = require('../validators/auth.validator');
const activityMW = require('../middleware/activity.middleware');

// All auth routes get the strict rate limiter
router.use(authLimiter);

// Public
router.post('/register',         registerValidator, validate, auth.register);
router.post('/login',            loginValidator,    validate, auth.login);
router.post('/refresh',          auth.refreshToken);
router.post('/forgot-password',  auth.forgotPassword);
router.post('/reset-password',   auth.resetPassword);

// Protected
router.post('/logout',           protect, auth.logout);
router.get ('/me',               protect, auth.getMe);
router.put ('/vault-setup',      protect, activityMW('upload', 'Vault setup'), auth.setupVault);

module.exports = router;
