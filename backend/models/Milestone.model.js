const mongoose = require('mongoose');

const milestoneSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    default: '',
    trim: true,
  },
  eventDate: {
    type: Date,
    required: true,
  },
  milestoneYear: {
    type: Number,
    required: true,
    index: true,
  },
  category: {
    type: String,
    enum: ['education', 'career', 'identity', 'financial', 'property', 'medical', 'personal', 'other'],
    default: 'personal',
  },
  documentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Document',
    default: null,
  },
  icon: {
    type: String,
    default: 'Calendar',
  },
  isAutoExtracted: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

milestoneSchema.index({ userId: 1, milestoneYear: -1 });

module.exports = mongoose.model('Milestone', milestoneSchema);
