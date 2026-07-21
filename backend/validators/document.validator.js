// ─── validators/document.validator.js ───────────────────────────────────────
const { body, query, param } = require('express-validator');
const { DOC_CATEGORIES }     = require('../constants');

const uploadValidator = [
  body('title')
    .optional()
    .trim()
    .isLength({ max: 200 }).withMessage('Title too long (max 200 chars)'),
];

const searchValidator = [
  query('search').optional().trim().isLength({ max: 500 }),
  query('category').optional().isIn([...DOC_CATEGORIES, '']),
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
];

const docIdValidator = [
  param('id').isMongoId().withMessage('Invalid document ID'),
];

module.exports = { uploadValidator, searchValidator, docIdValidator };
