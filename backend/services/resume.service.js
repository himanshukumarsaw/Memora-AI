// ─── services/resume.service.js ───────────────────────────────────────────────
// Resume generation — builds structured resume from Profile + Documents using Gemini

const { getGemini }    = require('../config/gemini');
const { resumePrompt } = require('../prompts');
const Profile          = require('../models/Profile.model');
const Document         = require('../models/Document.model');
const logger           = require('../utils/logger');

const generateResume = async (userId) => {
  // Gather data
  const [profile, docs] = await Promise.all([
    Profile.findOne({ userId }).lean(),
    Document.find({ userId, isDeleted: false, status: 'ready' })
      .select('title documentType category extractedData aiSummary')
      .lean(),
  ]);

  if (!profile && docs.length === 0) {
    return {
      content: 'Insufficient profile data. Please upload more documents and allow AI to process them.',
      format:  'text',
    };
  }

  // Build structured input for prompt
  const profileData = {
    name:       profile?.fullName  || '',
    email:      profile?.email     || '',
    phone:      profile?.phone     || '',
    address:    profile?.address   || {},
    education:  profile?.education || [],
    experience: profile?.experience || [],
    skills:     profile?.skills    || [],
    governmentIds: profile?.governmentIds || {},
    documents:  docs.map(d => ({
      type:    d.documentType,
      summary: d.aiSummary,
      name:    d.extractedData?.name,
      id:      d.extractedData?.idNumber,
    })),
  };

  const gemini = getGemini();

  if (!gemini) {
    // Mock resume
    return {
      content: buildMockResume(profileData),
      format:  'text',
    };
  }

  try {
    const model  = gemini.getGenerativeModel({ model: 'gemini-1.5-pro' });
    const result = await model.generateContent(resumePrompt(profileData));
    return { content: result.response.text().trim(), format: 'text' };
  } catch (err) {
    logger.error(`Resume generation failed: ${err.message}`);
    return { content: buildMockResume(profileData), format: 'text' };
  }
};

const buildMockResume = (p) => `
${p.name || 'Name not found'}
${p.email || ''} | ${p.phone || ''}
${[p.address?.city, p.address?.country].filter(Boolean).join(', ')}

SUMMARY
Experienced professional with expertise in various domains.

EDUCATION
${p.education.length > 0
  ? p.education.map(e => `• ${e.degree} — ${e.institution} (${e.year || ''})`).join('\n')
  : '• Please upload your certificates for AI to extract education details.'}

EXPERIENCE
${p.experience.length > 0
  ? p.experience.map(e => `• ${e.role} at ${e.company} (${e.startDate || ''} – ${e.endDate || 'Present'})`).join('\n')
  : '• Please upload employment documents.'}

SKILLS
${p.skills.length > 0 ? p.skills.join(', ') : 'Upload certificates and employment letters for AI to extract skills.'}

DOCUMENTS ON FILE
${p.documents.map(d => `• ${d.type}: ${d.name || ''}`).join('\n')}
`.trim();

module.exports = { generateResume };
