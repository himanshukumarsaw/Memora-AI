const mongoose = require('mongoose');
const crypto = require('crypto');

const shareLinkSchema = new mongoose.Schema({
  documentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Document', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  token: { type: String, unique: true, default: () => crypto.randomBytes(32).toString('hex') },
  expiresAt: { type: Date, required: true },
  accessType: { type: String, enum: ['view', 'download'], default: 'view' },
  maxAccess: { type: Number, default: null }, // null = unlimited
  accessCount: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  otp: { type: String, default: null },
  otpExpires: { type: Date, default: null },
  accessLog: [{
    accessedAt: { type: Date, default: Date.now },
    ip: { type: String },
  }],
}, { timestamps: true });

module.exports = mongoose.model('ShareLink', shareLinkSchema);
