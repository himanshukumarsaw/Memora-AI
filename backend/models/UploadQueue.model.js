const mongoose = require('mongoose');

const uploadQueueSchema = new mongoose.Schema({
  documentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Document', required: true, index: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  status: {
    type: String,
    enum: ['waiting', 'ocr', 'extraction', 'embedding', 'completed', 'failed'],
    default: 'waiting',
  },
  attempt: { type: Number, default: 1 },
  errorMessage: { type: String, default: '' },
  completedAt: { type: Date },
}, { timestamps: true });

module.exports = mongoose.model('UploadQueue', uploadQueueSchema);
