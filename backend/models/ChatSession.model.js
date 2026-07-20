const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  role: { type: String, enum: ['user', 'assistant'], required: true },
  content: { type: String, required: true },
  documentRefs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Document' }],
  timestamp: { type: Date, default: Date.now },
});

const chatSessionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  title: { type: String, default: 'New Chat' },
  messages: [messageSchema],
  contextDocuments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Document' }],
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('ChatSession', chatSessionSchema);
