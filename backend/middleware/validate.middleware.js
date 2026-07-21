// ─── middleware/validate.middleware.js ────────────────────────────────────────
// Reads the result of express-validator chains and short-circuits with a
// structured 422 if any rule failed.

const { validationResult } = require('express-validator');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) return next();

  const messages = errors.array().map((e) => e.msg);

  return res.status(422).json({
    success: false,
    message: messages[0],           // first error
    errors:  messages,              // all errors
    code:    'VALIDATION_ERROR',
  });
};

module.exports = validate;
