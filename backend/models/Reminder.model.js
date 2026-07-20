const mongoose = require('mongoose');

const reminderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  documentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Document' },
  title: { type: String, required: true },
  description: { type: String, default: '' },
  dueDate: { type: Date, required: true },
  reminderType: {
    type: String,
    enum: ['expiry', 'renewal', 'deadline', 'payment', 'custom'],
    default: 'custom',
  },
  status: { type: String, enum: ['pending', 'snoozed', 'completed', 'dismissed'], default: 'pending' },
  priority: { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'medium' },
  notificationSent: { type: Boolean, default: false },
  snoozedUntil: { type: Date },
}, { timestamps: true });

reminderSchema.index({ userId: 1, dueDate: 1 });
reminderSchema.index({ userId: 1, status: 1 });

module.exports = mongoose.model('Reminder', reminderSchema);
