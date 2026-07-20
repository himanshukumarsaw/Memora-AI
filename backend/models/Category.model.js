const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  name: { type: String, required: true },
  slug: { type: String, required: true },
  color: { type: String, default: '#7C6FF7' },
  icon: { type: String, default: 'FileText' },
  documentCount: { type: Number, default: 0 },
}, { timestamps: true });

categorySchema.index({ userId: 1, slug: 1 }, { unique: true });

module.exports = mongoose.model('Category', categorySchema);
