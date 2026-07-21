const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const emergencyContactSchema = new mongoose.Schema({
  name:     { type: String, required: true, trim: true },
  relation: { type: String, required: true, trim: true },
  phone:    { type: String, required: true, trim: true },
}, { _id: false });

const emergencyProfileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
    index: true,
  },
  bloodGroup: {
    type: String,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown'],
    default: 'Unknown',
  },
  allergies:          [{ type: String, trim: true }],
  currentMedications: [{ type: String, trim: true }],
  chronicDiseases:    [{ type: String, trim: true }],
  previousSurgeries:  [{ type: String, trim: true }],
  medicalConditions:  [{ type: String, trim: true }],
  emergencyContacts:  [emergencyContactSchema],
  qrToken: {
    type: String,
    required: true,
    unique: true,
    default: () => uuidv4(),
    index: true,
  },
  isPublic: {
    type: Boolean,
    default: true,
  },
  lastUpdatedFromDoc: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Document',
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('EmergencyProfile', emergencyProfileSchema);
