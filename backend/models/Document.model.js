const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  title: { type: String, required: true, trim: true },
  originalName: { type: String },
  fileUrl: { type: String, required: true },
  fileType: { type: String }, // application/pdf, image/jpeg, etc.
  fileSize: { type: Number, default: 0 },
  thumbnailUrl: { type: String, default: '' },

  // AI-determined fields
  category: {
    type: String,
    enum: ['identity', 'education', 'professional', 'medical', 'financial', 'property', 'vehicle', 'legal', 'other'],
    default: 'other',
  },
  documentType: { type: String, default: '' }, // e.g., "Passport", "PAN Card", "Degree Certificate"

  // AI-extracted structured data
  extractedData: {
    name: { type: String, default: '' },
    dob: { type: String, default: '' },
    expiryDate: { type: String, default: '' },
    issueDate: { type: String, default: '' },
    idNumber: { type: String, default: '' },
    issuingAuthority: { type: String, default: '' },
    address: { type: String, default: '' },
    nationality: { type: String, default: '' },
    additionalFields: { type: Map, of: String },
  },

  rawText: { type: String, default: '' },
  aiSummary: { type: String, default: '' },
  tags: [{ type: String }],

  // Vector embedding stored as array of numbers
  embedding: [{ type: Number }],

  status: { type: String, enum: ['uploading', 'processing', 'ready', 'failed'], default: 'uploading' },
  processingError: { type: String, default: '' },

  // Expiry tracking
  hasExpiry: { type: Boolean, default: false },
  expiryDate: { type: Date },
  expiryStatus: { type: String, enum: ['valid', 'expiring_soon', 'expired', 'unknown'], default: 'unknown' },

  // Access tracking
  viewCount: { type: Number, default: 0 },
  lastViewedAt: { type: Date },
  isDeleted: { type: Boolean, default: false },
}, { timestamps: true });

documentSchema.index({ userId: 1, category: 1 });
documentSchema.index({ userId: 1, status: 1 });
documentSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('Document', documentSchema);
