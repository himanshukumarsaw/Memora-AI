// ─── controllers/knowledgeGraph.controller.js ────────────────────────────────
// Memora AI: The Life Operating System (Knowledge Graph & Graph-RAG) per Feature 3 Spec

const EntityRelation = require('../models/EntityRelation.model');
const Document       = require('../models/Document.model');
const asyncWrap      = require('../utils/asyncWrapper');
const { success }    = require('../utils/responseHandler');
const AppError       = require('../utils/appError');
const { ragChat }    = require('../services/ai.service');

// ─── GET /api/v1/graph/nodes (Protected) ──────────────────────────────────────
const getGraphNodes = asyncWrap(async (req, res) => {
  const userId = req.user._id;

  const [entityRelations, userDocs] = await Promise.all([
    EntityRelation.find({ userId }).populate('connectedDocumentIds', 'title documentType category fileUrl').lean(),
    Document.find({ userId, isDeleted: false, status: 'ready' }).select('title documentType category fileUrl').lean(),
  ]);

  // Build nodes & edges representation
  const nodes = [];
  const edges = [];
  const addedNodeIds = new Set();

  // Document Nodes
  userDocs.forEach(d => {
    const id = `doc_${d._id}`;
    if (!addedNodeIds.has(id)) {
      nodes.push({ id, label: d.title, type: 'document', category: d.category, docId: d._id });
      addedNodeIds.add(id);
    }
  });

  // Entity Nodes & Connection Edges
  entityRelations.forEach(rel => {
    const entityId = `ent_${rel._id}`;
    if (!addedNodeIds.has(entityId)) {
      nodes.push({ id: entityId, label: rel.entityName, type: 'entity', entityType: rel.entityType });
      addedNodeIds.add(entityId);
    }

    rel.connectedDocumentIds.forEach(doc => {
      if (doc) {
        edges.push({
          source: entityId,
          target: `doc_${doc._id || doc}`,
          label: rel.relationshipLabel || 'connected_to',
        });
      }
    });
  });

  return success(res, {
    data: {
      totalEntities: entityRelations.length,
      totalConnectedDocs: userDocs.length,
      nodes,
      edges,
      entityRelations,
    },
    message: 'Life OS Knowledge Graph nodes fetched.',
  });
});

// ─── POST /api/v1/graph/query (Protected) ────────────────────────────────────
const queryGraph = asyncWrap(async (req, res) => {
  const { question } = req.body;
  if (!question?.trim()) {
    throw new AppError('Question is required.', 400, 'VALIDATION_ERROR');
  }

  const userId = req.user._id;

  // Search entity relations for query keywords
  const qLower = question.toLowerCase();
  const matchedEntities = await EntityRelation.find({
    userId,
    entityName: { $regex: qLower.split(' ').filter(w => w.length > 3).join('|') || qLower, $options: 'i' },
  }).populate('connectedDocumentIds');

  let relevantDocIds = new Set();
  matchedEntities.forEach(ent => {
    ent.connectedDocumentIds.forEach(d => {
      if (d) relevantDocIds.add(d._id ? d._id.toString() : d.toString());
    });
  });

  let docs = [];
  if (relevantDocIds.size > 0) {
    docs = await Document.find({ _id: { $in: Array.from(relevantDocIds) }, isDeleted: false });
  } else {
    docs = await Document.find({ userId, isDeleted: false, status: 'ready' }).limit(10);
  }

  const answer = await ragChat(question, docs);

  return success(res, {
    data: {
      question,
      answer,
      connectedEntities: matchedEntities.map(e => ({ name: e.entityName, type: e.entityType })),
      documentsUsed: docs.map(d => ({ id: d._id, title: d.title, documentType: d.documentType })),
    },
    message: 'Life OS query answered.',
  });
});

module.exports = {
  getGraphNodes,
  queryGraph,
};
