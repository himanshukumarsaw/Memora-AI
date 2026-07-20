const Document = require('../models/Document.model');

// GET /api/profile
const getProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const documents = await Document.find({ userId, isDeleted: false, status: 'ready' })
      .select('extractedData documentType category aiSummary')
      .lean();

    // Aggregate profile from all documents
    const profile = {
      personal: {},
      identity: [],
      education: [],
      professional: [],
      medical: [],
      financial: [],
      property: [],
      vehicle: [],
      other: [],
    };

    const names = new Set();
    const dobs = new Set();
    const addresses = new Set();

    documents.forEach(doc => {
      const { extractedData, documentType, category, aiSummary } = doc;
      if (!extractedData) return;

      if (extractedData.name) names.add(extractedData.name);
      if (extractedData.dob) dobs.add(extractedData.dob);
      if (extractedData.address) addresses.add(extractedData.address);

      const entry = { documentType, category, ...extractedData, aiSummary };
      if (profile[category]) profile[category].push(entry);
      else profile.other.push(entry);
    });

    profile.personal = {
      name: [...names][0] || req.user.name,
      email: req.user.email,
      dob: [...dobs][0] || '',
      address: [...addresses][0] || '',
      allNames: [...names],
    };

    res.json({ success: true, profile, user: req.user.toJSON() });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getProfile };
