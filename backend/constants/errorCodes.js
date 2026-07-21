// ─── constants/errorCodes.js ──────────────────────────────────────────────────
// Machine-readable error codes per 07_API_DOCUMENTATION.md §ERROR CODES

const ERROR_CODES = Object.freeze({
  // Auth
  AUTH_001: 'Invalid password',
  AUTH_002: 'Email already exists',
  AUTH_003: 'Token invalid or expired',
  AUTH_004: 'Account blocked',
  AUTH_005: 'Not authenticated',
  AUTH_006: 'Forbidden — insufficient role',

  // Documents
  DOC_001: 'File too large (max 20 MB)',
  DOC_002: 'Invalid file format',
  DOC_003: 'Document not found',
  DOC_004: 'Document already deleted',

  // AI
  AI_001: 'OCR failed',
  AI_002: 'Field extraction failed',
  AI_003: 'Summary generation failed',
  AI_004: 'Classification failed',
  AI_005: 'Embedding generation failed',

  // Chat
  CHAT_001: 'Conversation not found',
  CHAT_002: 'Question too long (max 2000 chars)',

  // Search
  SEARCH_001: 'No results found',
  SEARCH_002: 'Query too short',

  // Share
  SHARE_001: 'Share link not found or expired',
  SHARE_002: 'Invalid OTP',
  SHARE_003: 'Share link revoked',

  // Reminder
  REMINDER_001: 'Reminder not found',

  // Notification
  NOTIF_001: 'Notification not found',

  // Resume
  RESUME_001: 'Insufficient profile data to generate resume',

  // Validation
  VALIDATION_ERROR: 'Validation failed',

  // Generic
  NOT_FOUND:       'Resource not found',
  INTERNAL_ERROR:  'Internal server error',
  RATE_LIMITED:    'Rate limit exceeded',
});

module.exports = ERROR_CODES;
