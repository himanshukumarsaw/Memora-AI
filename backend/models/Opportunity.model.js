const mongoose = require('mongoose');

const opportunitySchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  organization: {
    type: String,
    required: true,
    trim: true,
  },
  category: {
    type: String,
    enum: ['scholarship', 'grant', 'fellowship', 'scheme', 'competition', 'job', 'internship', 'certification'],
    required: true,
    index: true,
  },
  description: {
    type: String,
    required: true,
  },
  eligibilityCriteria: {
    minMarks: { type: Number, default: 0 },
    maxIncome: { type: Number, default: null },
    requiredDegree: { type: String, default: '' },
    maxAge: { type: Number, default: null },
    requiredSkills: [{ type: String }],
    location: { type: String, default: 'Global' },
  },
  awardValue: {
    type: String,
    default: 'Fully Funded',
  },
  deadlineDate: {
    type: Date,
    required: true,
    index: true,
  },
  applyUrl: {
    type: String,
    default: 'https://example.com/apply',
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Opportunity', opportunitySchema);
