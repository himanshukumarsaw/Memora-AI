const express   = require('express');
const router    = express.Router();
const emergency = require('../controllers/emergency.controller');
const protect   = require('../middleware/auth.middleware');
const activity  = require('../middleware/activity.middleware');

// Public route for First Responders / Doctors (scanned via QR)
router.get('/public/:qrToken', emergency.getPublicEmergencyProfile);

// Protected routes for User management
router.get('/profile', protect, emergency.getEmergencyProfile);
router.put('/profile', protect, activity('profile', 'Updated emergency medical history'), emergency.updateEmergencyProfile);

module.exports = router;
