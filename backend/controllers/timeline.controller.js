// ─── controllers/timeline.controller.js ───────────────────────────────────────
// Digital Life History & Chronological Timeline Engine per Feature 2 Spec

const Milestone   = require('../models/Milestone.model');
const Document    = require('../models/Document.model');
const asyncWrap   = require('../utils/asyncWrapper');
const { success } = require('../utils/responseHandler');
const AppError    = require('../utils/appError');
const logger      = require('../utils/logger');

// ─── GET /api/v1/timeline (Protected) ─────────────────────────────────────────
const getTimeline = asyncWrap(async (req, res) => {
  const { year, category, search } = req.query;
  const filter = { userId: req.user._id };

  if (year)     filter.milestoneYear = Number(year);
  if (category) filter.category      = category;
  if (search)   filter.$or = [
    { title:       { $regex: search, $options: 'i' } },
    { description: { $regex: search, $options: 'i' } },
  ];

  const milestones = await Milestone.find(filter)
    .populate('documentId', 'title documentType fileUrl fileType')
    .sort({ milestoneYear: -1, eventDate: -1 })
    .lean();

  // Group milestones by Year and Decade for interactive timeline rendering
  const yearGroups = {};
  const decadeGroups = {};

  milestones.forEach(m => {
    const yr = m.milestoneYear || new Date(m.eventDate).getFullYear();
    const decade = `${Math.floor(yr / 10) * 10}s`;

    if (!yearGroups[yr]) yearGroups[yr] = [];
    yearGroups[yr].push(m);

    if (!decadeGroups[decade]) decadeGroups[decade] = [];
    decadeGroups[decade].push(m);
  });

  return success(res, {
    data: {
      totalMilestones: milestones.length,
      milestones,
      yearGroups,
      decadeGroups,
      availableYears: Object.keys(yearGroups).sort((a, b) => b - a),
    },
    message: 'Digital Life History timeline fetched.',
  });
});

// ─── POST /api/v1/timeline/milestone (Protected) ──────────────────────────────
const createMilestone = asyncWrap(async (req, res) => {
  const { title, description, eventDate, category, documentId, icon } = req.body;

  if (!title || !eventDate) {
    throw new AppError('Title and eventDate are required.', 400, 'VALIDATION_ERROR');
  }

  const parsedDate = new Date(eventDate);
  if (isNaN(parsedDate.getTime())) {
    throw new AppError('Invalid eventDate format.', 400, 'VALIDATION_ERROR');
  }

  const milestoneYear = parsedDate.getFullYear();

  const milestone = await Milestone.create({
    userId: req.user._id,
    title: title.trim(),
    description: description || '',
    eventDate: parsedDate,
    milestoneYear,
    category: category || 'personal',
    documentId: documentId || null,
    icon: icon || 'Calendar',
    isAutoExtracted: false,
  });

  logger.info(`[Digital Life History] User created custom milestone: ${title} (${milestoneYear})`);

  return success(res, {
    status: 201,
    data: milestone,
    message: 'Life milestone created.',
  });
});

// ─── DELETE /api/v1/timeline/milestone/:id (Protected) ───────────────────────
const deleteMilestone = asyncWrap(async (req, res) => {
  const milestone = await Milestone.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
  if (!milestone) throw new AppError('Milestone not found.', 404, 'NOT_FOUND');

  return success(res, { message: 'Milestone removed from timeline.' });
});

module.exports = {
  getTimeline,
  createMilestone,
  deleteMilestone,
};
