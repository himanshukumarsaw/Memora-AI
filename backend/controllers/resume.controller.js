// ─── controllers/resume.controller.js ─────────────────────────────────────────
// POST /resume         — generate resume
// GET  /resume/:id     — fetch previously generated resume (stored in-memory for MVP)

const { generateResume }  = require('../services/resume.service');
const asyncWrap           = require('../utils/asyncWrapper');
const { success }         = require('../utils/responseHandler');
const AppError            = require('../utils/appError');

// In-memory resume cache (MVP — in production use DB/Redis)
const resumeCache = new Map();

// ─── POST /resume ─────────────────────────────────────────────────────────────
const createResume = asyncWrap(async (req, res) => {
  const userId = req.user._id.toString();
  const resume = await generateResume(userId);

  const resumeId = `resume_${userId}_${Date.now()}`;
  resumeCache.set(resumeId, { ...resume, createdAt: new Date(), userId });

  return success(res, {
    status:  201,
    message: 'Resume generated successfully.',
    data:    { resumeId, preview: resume.content.substring(0, 500) + '…' },
  });
});

// ─── GET /resume/:id ─────────────────────────────────────────────────────────
const getResume = asyncWrap(async (req, res) => {
  const entry = resumeCache.get(req.params.id);
  if (!entry || entry.userId !== req.user._id.toString()) {
    throw new AppError('Resume not found.', 404, 'RESUME_001');
  }

  // Return as plain text download
  res.setHeader('Content-Type', 'text/plain');
  res.setHeader('Content-Disposition', `attachment; filename="resume_${req.user.name || 'memora'}.txt"`);
  res.send(entry.content);
});

module.exports = { createResume, getResume };
