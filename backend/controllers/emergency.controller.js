// ─── controllers/emergency.controller.js ─────────────────────────────────────
// Emergency Medical History & Public QR Profile Controller per Feature 1 Spec

const EmergencyProfile = require('../models/EmergencyProfile.model');
const User             = require('../models/User.model');
const asyncWrap        = require('../utils/asyncWrapper');
const { success }      = require('../utils/responseHandler');
const AppError         = require('../utils/appError');
const logger           = require('../utils/logger');

// ─── GET /api/v1/emergency/profile (Protected) ───────────────────────────────
const getEmergencyProfile = asyncWrap(async (req, res) => {
  let profile = await EmergencyProfile.findOne({ userId: req.user._id });

  if (!profile) {
    profile = await EmergencyProfile.create({ userId: req.user._id });
  }

  return success(res, {
    data: {
      profile,
      user: {
        name:  req.user.name,
        email: req.user.email,
      },
      publicUrl: `http://localhost:3000/emergency/view/${profile.qrToken}`,
    },
    message: 'Emergency medical profile fetched.',
  });
});

// ─── PUT /api/v1/emergency/profile (Protected) ───────────────────────────────
const updateEmergencyProfile = asyncWrap(async (req, res) => {
  const {
    bloodGroup,
    allergies,
    currentMedications,
    chronicDiseases,
    previousSurgeries,
    medicalConditions,
    emergencyContacts,
    isPublic,
  } = req.body;

  let profile = await EmergencyProfile.findOne({ userId: req.user._id });
  if (!profile) {
    profile = new EmergencyProfile({ userId: req.user._id });
  }

  if (bloodGroup)          profile.bloodGroup         = bloodGroup;
  if (allergies)           profile.allergies          = allergies;
  if (currentMedications)  profile.currentMedications = currentMedications;
  if (chronicDiseases)     profile.chronicDiseases    = chronicDiseases;
  if (previousSurgeries)   profile.previousSurgeries  = previousSurgeries;
  if (medicalConditions)   profile.medicalConditions  = medicalConditions;
  if (emergencyContacts)   profile.emergencyContacts  = emergencyContacts;
  if (typeof isPublic === 'boolean') profile.isPublic = isPublic;

  await profile.save();
  logger.info(`[Emergency Profile] Updated profile for user ${req.user._id}`);

  return success(res, {
    data: profile,
    message: 'Emergency medical profile updated successfully.',
  });
});

// ─── GET /api/v1/emergency/public/:qrToken (Unauthenticated / Public) ────────
const getPublicEmergencyProfile = asyncWrap(async (req, res) => {
  const { qrToken } = req.params;

  const profile = await EmergencyProfile.findOne({ qrToken, isPublic: true })
    .populate('userId', 'name')
    .lean();

  if (!profile) {
    throw new AppError('Emergency medical record not found or access disabled.', 404, 'NOT_FOUND');
  }

  // Strict Data Privacy Guard — Return ONLY life-saving emergency medical data
  const emergencyData = {
    patientName:        profile.userId?.name || 'Patient',
    bloodGroup:         profile.bloodGroup,
    allergies:          profile.allergies,
    currentMedications: profile.currentMedications,
    chronicDiseases:    profile.chronicDiseases,
    previousSurgeries:  profile.previousSurgeries,
    medicalConditions:  profile.medicalConditions,
    emergencyContacts:  profile.emergencyContacts,
    lastUpdated:        profile.updatedAt,
  };

  logger.info(`[Emergency QR Scan] First responder scanned QR token: ${qrToken}`);

  return success(res, {
    data: emergencyData,
    message: 'Emergency medical record retrieved.',
  });
});

module.exports = {
  getEmergencyProfile,
  updateEmergencyProfile,
  getPublicEmergencyProfile,
};
