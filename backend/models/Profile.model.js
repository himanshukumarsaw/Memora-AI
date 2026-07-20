const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
  fullName: { type: String, default: '' },
  dob: { type: String, default: '' },
  gender: { type: String, default: '' },
  phone: { type: String, default: '' },
  email: { type: String, default: '' },
  bloodGroup: { type: String, default: '' },
  address: {
    street: { type: String, default: '' },
    city: { type: String, default: '' },
    state: { type: String, default: '' },
    country: { type: String, default: '' },
    pin: { type: String, default: '' },
  },
  education: [{
    degree: String,
    institution: String,
    year: String,
    grade: String,
    documentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Document' },
  }],
  skills: [{ type: String }],
  experience: [{
    company: String,
    role: String,
    startDate: String,
    endDate: String,
    documentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Document' },
  }],
  governmentIds: {
    pan: { type: String, default: '' },
    aadhaar: { type: String, default: '' },
    passport: { type: String, default: '' },
    drivingLicense: { type: String, default: '' },
    voterId: { type: String, default: '' },
  },
  medical: {
    bloodType: { type: String, default: '' },
    allergies: [{ type: String }],
    diseases: [{ type: String }],
    insurancePolicy: { type: String, default: '' },
    emergencyContact: { type: String, default: '' },
  },
  bankAccounts: [{
    bankName: String,
    accountType: String,
    accountNumberMasked: String,
    ifsc: String,
  }],
}, { timestamps: true });

module.exports = mongoose.model('Profile', profileSchema);
