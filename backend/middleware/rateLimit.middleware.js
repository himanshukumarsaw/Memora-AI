// ─── middleware/rateLimit.middleware.js ───────────────────────────────────────
// Tiered rate limiters — stricter on auth, generous on read endpoints.

const rateLimit = require('express-rate-limit');

const makeJsonHandler = (message) => (req, res) =>
  res.status(429).json({ success: false, message, code: 'RATE_LIMITED' });

/** Auth endpoints — 10 requests per 15 min per IP */
const authLimiter = rateLimit({
  windowMs:        15 * 60 * 1000,
  max:             10,
  standardHeaders: true,
  legacyHeaders:   false,
  handler:         makeJsonHandler('Too many login attempts. Please try again in 15 minutes.'),
});

/** Upload endpoint — 30 uploads per hour */
const uploadLimiter = rateLimit({
  windowMs:        60 * 60 * 1000,
  max:             30,
  standardHeaders: true,
  legacyHeaders:   false,
  handler:         makeJsonHandler('Upload limit reached. Please try again in 1 hour.'),
});

/** AI chat — 60 messages per 10 minutes */
const chatLimiter = rateLimit({
  windowMs:        10 * 60 * 1000,
  max:             60,
  standardHeaders: true,
  legacyHeaders:   false,
  handler:         makeJsonHandler('AI chat rate limit reached. Please slow down.'),
});

/** General API limiter — 500 requests per 15 min */
const generalLimiter = rateLimit({
  windowMs:        15 * 60 * 1000,
  max:             500,
  standardHeaders: true,
  legacyHeaders:   false,
  handler:         makeJsonHandler('Too many requests. Please try again shortly.'),
});

module.exports = { authLimiter, uploadLimiter, chatLimiter, generalLimiter };
