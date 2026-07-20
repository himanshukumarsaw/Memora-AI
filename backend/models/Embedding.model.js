const mongoose = require('mongoose');

const embeddingSchema = new mongoose.Schema({
  documentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Document', required: true, index: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  vectorId: { type: String, required: true },
  embeddingModel: { type: String, default: 'text-embedding-004' },
  dimensions: { type: Number, default: 768 },
}, { timestamps: true });

module.exports = mongoose.model('Embedding', embeddingSchema);
