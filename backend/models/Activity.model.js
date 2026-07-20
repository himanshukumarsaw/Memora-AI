const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  action: {
    type: String,
    enum: ['upload', 'delete', 'download', 'share', 'login', 'logout', 'chat', 'resume', 'autofill'],
    required: true,
  },
  target: { type: String, default: '' },
  targetId: { type: mongoose.Schema.Types.ObjectId },
  ipAddress: { type: String, default: '' },
  device: { type: String, default: '' },
}, { timestamps: true });

activitySchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('Activity', activitySchema);
