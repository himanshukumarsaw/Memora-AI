const mongoose = require('mongoose');

const vaultSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
  vaultName: { type: String, default: 'My Secure Vault' },
  storageUsed: { type: Number, default: 0 }, // in bytes
  storageLimit: { type: Number, default: 1073741824 }, // 1GB in bytes
  encryptionEnabled: { type: Boolean, default: true },
  documentCount: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Vault', vaultSchema);
