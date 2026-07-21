// ─── constants/index.js ───────────────────────────────────────────────────────
// Central repository of all application-wide constants.
// Nothing business-logic should need a magic string or number.

const ROLES = Object.freeze({ USER: 'user', ADMIN: 'admin' });

const USER_STATUS = Object.freeze({ ACTIVE: 'active', BLOCKED: 'blocked', DELETED: 'deleted' });

const DOC_STATUS = Object.freeze({
  UPLOADING:  'uploading',
  PROCESSING: 'processing',
  READY:      'ready',
  FAILED:     'failed',
});

const EXPIRY_STATUS = Object.freeze({
  VALID:         'valid',
  EXPIRING_SOON: 'expiring_soon',
  EXPIRED:       'expired',
  UNKNOWN:       'unknown',
});

const DOC_CATEGORIES = Object.freeze([
  'identity', 'education', 'professional', 'medical',
  'financial', 'property', 'vehicle', 'legal', 'other',
]);

const DOC_TYPES = Object.freeze([
  'Passport', 'PAN Card', 'Aadhaar Card', 'Driving License',
  'Voter ID', 'Degree Certificate', 'Marksheet', 'Health Insurance',
  'Life Insurance', 'Vehicle Insurance', 'Bank Statement', 'Tax Return',
  'Salary Slip', 'Property Deed', 'Rental Agreement', 'Vehicle Registration',
  'Medical Report', 'Prescription', 'Utility Bill', 'Other',
]);

const REMINDER_PRIORITY = Object.freeze({ LOW: 'low', MEDIUM: 'medium', HIGH: 'high', CRITICAL: 'critical' });
const REMINDER_STATUS   = Object.freeze({ PENDING: 'pending', COMPLETED: 'completed', EXPIRED: 'expired' });
const REMINDER_TYPES    = Object.freeze(['expiry', 'renewal', 'deadline', 'payment', 'custom']);

const NOTIFICATION_TYPES = Object.freeze(['reminder', 'upload', 'share', 'login', 'warning', 'security']);

const ACTIVITY_ACTIONS = Object.freeze([
  'upload', 'delete', 'download', 'share', 'login', 'logout', 'chat', 'resume', 'autofill',
]);

const UPLOAD_QUEUE_STATUS = Object.freeze({
  WAITING:    'waiting',
  OCR:        'ocr',
  EXTRACTION: 'extraction',
  EMBEDDING:  'embedding',
  COMPLETED:  'completed',
  FAILED:     'failed',
});

const SHARE_PERMISSIONS = Object.freeze({ VIEW: 'view', DOWNLOAD: 'download', EDIT: 'edit' });
const SHARE_STATUS      = Object.freeze({ ACTIVE: 'active', EXPIRED: 'expired', REVOKED: 'revoked' });

const ALLOWED_MIME_TYPES = Object.freeze([
  'application/pdf',
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/tiff',
]);

const MAX_FILE_SIZE_BYTES  = 20 * 1024 * 1024; // 20 MB
const DEFAULT_STORAGE_LIMIT = 1073741824;        // 1 GB

const EXPIRY_WARNING_DAYS = 30; // flag as expiring_soon if ≤ 30 days away

const PAGINATION_DEFAULT_LIMIT = 20;
const PAGINATION_MAX_LIMIT     = 100;

const JWT_EXPIRES_IN         = '7d';
const JWT_REFRESH_EXPIRES_IN = '30d';

module.exports = {
  ROLES,
  USER_STATUS,
  DOC_STATUS,
  EXPIRY_STATUS,
  DOC_CATEGORIES,
  DOC_TYPES,
  REMINDER_PRIORITY,
  REMINDER_STATUS,
  REMINDER_TYPES,
  NOTIFICATION_TYPES,
  ACTIVITY_ACTIONS,
  UPLOAD_QUEUE_STATUS,
  SHARE_PERMISSIONS,
  SHARE_STATUS,
  ALLOWED_MIME_TYPES,
  MAX_FILE_SIZE_BYTES,
  DEFAULT_STORAGE_LIMIT,
  EXPIRY_WARNING_DAYS,
  PAGINATION_DEFAULT_LIMIT,
  PAGINATION_MAX_LIMIT,
  JWT_EXPIRES_IN,
  JWT_REFRESH_EXPIRES_IN,
};
