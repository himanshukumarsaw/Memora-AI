// ─── controllers/search.controller.js ────────────────────────────────────────
// Dedicated semantic search module per 07_API_DOCUMENTATION.md
// POST /search          — full semantic search
// GET  /search/filter   — available filters (categories, tags, years, types)

const docRepo        = require('../repositories/document.repository');
const { semanticSearch } = require('../services/ai.service');
const asyncWrap      = require('../utils/asyncWrapper');
const { success }    = require('../utils/responseHandler');
const AppError       = require('../utils/appError');
const Document       = require('../models/Document.model');

// ─── POST /search ─────────────────────────────────────────────────────────────
const semanticSearchHandler = asyncWrap(async (req, res) => {
  const { query, category, year, documentType, limit = 20 } = req.body;
  if (!query?.trim() || query.trim().length < 2) {
    throw new AppError('Search query must be at least 2 characters.', 400, 'SEARCH_002');
  }

  const userId = req.user._id;

  // Get all ready docs for this user
  let allDocs = await docRepo.findForSearch(userId);

  // Apply pre-filters
  if (category)     allDocs = allDocs.filter(d => d.category === category);
  if (documentType) allDocs = allDocs.filter(d => d.documentType === documentType);
  if (year) {
    allDocs = allDocs.filter(d => {
      if (!d.createdAt) return false;
      return new Date(d.createdAt).getFullYear() === Number(year);
    });
  }

  // Semantic search over filtered set
  const withEmbeddings = allDocs.filter(d => d.embedding?.length > 0);
  const results = withEmbeddings.length > 0
    ? await semanticSearch(query, withEmbeddings)
    : allDocs.filter(d => {
        const text = `${d.title} ${d.documentType} ${d.aiSummary} ${d.rawText}`.toLowerCase();
        return text.includes(query.toLowerCase());
      });

  return success(res, {
    data: {
      query,
      results:      results.slice(0, Number(limit)),
      total:        results.length,
      searchType:   withEmbeddings.length > 0 ? 'semantic' : 'keyword',
    },
    message: results.length > 0 ? `Found ${results.length} result(s).` : 'No results found.',
  });
});

// ─── GET /search/filter ───────────────────────────────────────────────────────
const getSearchFilters = asyncWrap(async (req, res) => {
  const userId = req.user._id;

  const [categories, tags, years, types] = await Promise.all([
    // Distinct categories
    Document.distinct('category', { userId, isDeleted: false }),
    // Distinct tags (flatten array)
    Document.aggregate([
      { $match: { userId, isDeleted: false } },
      { $unwind: '$tags' },
      { $group: { _id: '$tags' } },
      { $limit: 50 },
    ]).then(r => r.map(x => x._id)),
    // Distinct years
    Document.aggregate([
      { $match: { userId, isDeleted: false } },
      { $project: { year: { $year: '$createdAt' } } },
      { $group: { _id: '$year' } },
      { $sort: { _id: -1 } },
    ]).then(r => r.map(x => x._id)),
    // Distinct document types
    Document.distinct('documentType', { userId, isDeleted: false }),
  ]);

  return success(res, {
    data: { categories, tags, years, documentTypes: types.filter(Boolean) },
    message: 'Search filters fetched.',
  });
});

module.exports = { semanticSearchHandler, getSearchFilters };
