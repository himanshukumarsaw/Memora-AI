const mongoose = require('mongoose');

const entityRelationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  entityName: {
    type: String,
    required: true,
    trim: true,
  },
  entityType: {
    type: String,
    enum: ['property', 'insurance', 'person', 'organization', 'treatment', 'vehicle', 'project', 'other'],
    default: 'other',
  },
  connectedDocumentIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Document',
  }],
  relationshipLabel: {
    type: String,
    default: 'connected_to',
  },
  confidenceScore: {
    type: Number,
    default: 0.95,
  },
}, {
  timestamps: true,
});

entityRelationSchema.index({ userId: 1, entityName: 1 });

module.exports = mongoose.model('EntityRelation', entityRelationSchema);
