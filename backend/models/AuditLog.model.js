const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
  action: { type: String, required: true }, // 'SECURITY_ALERT', 'FAILED_LOGIN', 'PERMISSION_CHANGE', 'DOCUMENT_DELETED'
  details: { type: mongoose.Schema.Types.Mixed },
  ipAddress: { type: String, default: '' },
  userAgent: { type: String, default: '' },
}, { timestamps: true });

auditLogSchema.index({ createdAt: -1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);
