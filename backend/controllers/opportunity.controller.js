// ─── controllers/opportunity.controller.js ────────────────────────────────────
// Personal Opportunity Engine Controller per Feature 4 Spec

const asyncWrap   = require('../utils/asyncWrapper');
const { success } = require('../utils/responseHandler');
const { matchUserOpportunities, seedOpportunitiesIfEmpty } = require('../services/opportunity.service');

// ─── GET /api/v1/opportunities (Protected) ───────────────────────────────────
const getOpportunities = asyncWrap(async (req, res) => {
  const matches = await matchUserOpportunities(req.user._id);

  return success(res, {
    data: {
      totalOpportunities: matches.length,
      eligibleOpportunities: matches.filter(m => m.isEligible),
      matches,
    },
    message: 'Matched opportunities fetched.',
  });
});

// ─── POST /api/v1/opportunities/check (Protected) ───────────────────────────
const checkEligibility = asyncWrap(async (req, res) => {
  const matches = await matchUserOpportunities(req.user._id);

  return success(res, {
    data: matches,
    message: 'Manual eligibility evaluation complete.',
  });
});

// ─── POST /api/v1/opportunities/seed (Dev / Admin) ──────────────────────────
const seedCatalog = asyncWrap(async (req, res) => {
  await seedOpportunitiesIfEmpty();
  return success(res, { message: 'Opportunity catalog seeded.' });
});

module.exports = {
  getOpportunities,
  checkEligibility,
  seedCatalog,
};
