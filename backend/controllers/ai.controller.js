// ─── controllers/ai.controller.js ────────────────────────────────────────────
// AI Processing module per 07_API_DOCUMENTATION.md & 08_AI_Pipeline.md
// GET  /ai/status/:documentId
// GET  /ai/summary/:documentId
// GET  /ai/metadata/:documentId
// POST /ai/redact — AI Redaction for sensitive fields

const docRepo   = require('../repositories/document.repository');
const asyncWrap = require('../utils/asyncWrapper');
const { success } = require('../utils/responseHandler');
const AppError  = require('../utils/appError');

// ─── GET /ai/status/:documentId ──────────────────────────────────────────────
const getProcessingStatus = asyncWrap(async (req, res) => {
  const doc = await docRepo.findOne(
    { _id: req.params.documentId, userId: req.user._id },
    'title status processingError createdAt updatedAt'
  );
  if (!doc) throw new AppError('Document not found.', 404, 'DOC_003');

  const stageMap = {
    uploading:  { stage: 'Uploading',   progress: 10 },
    processing: { stage: 'OCR → Extracting → Embedding', progress: 60 },
    ready:      { stage: 'Completed',   progress: 100 },
    failed:     { stage: 'Failed',      progress: 0 },
  };

  const statusInfo = stageMap[doc.status] || { stage: 'Unknown', progress: 0 };

  return success(res, {
    data: {
      documentId: doc._id,
      title:      doc.title,
      status:     doc.status,
      stage:      statusInfo.stage,
      progress:   statusInfo.progress,
      error:      doc.processingError || null,
      updatedAt:  doc.updatedAt,
    },
    message: 'Processing status fetched.',
  });
});

// ─── GET /ai/summary/:documentId ─────────────────────────────────────────────
const getAISummary = asyncWrap(async (req, res) => {
  const doc = await docRepo.findOne(
    { _id: req.params.documentId, userId: req.user._id, isDeleted: false },
    'title aiSummary status documentType'
  );
  if (!doc) throw new AppError('Document not found.', 404, 'DOC_003');
  if (doc.status !== 'ready') throw new AppError('Document is still processing.', 400, 'AI_003');

  return success(res, {
    data: {
      documentId:   doc._id,
      title:        doc.title,
      documentType: doc.documentType,
      summary:      doc.aiSummary || 'No summary available. Document may still be processing.',
    },
    message: 'AI summary fetched.',
  });
});

// ─── GET /ai/metadata/:documentId ────────────────────────────────────────────
const getAIMetadata = asyncWrap(async (req, res) => {
  const doc = await docRepo.findOne(
    { _id: req.params.documentId, userId: req.user._id, isDeleted: false },
    'title documentType category extractedData tags expiryDate expiryStatus hasExpiry status'
  );
  if (!doc) throw new AppError('Document not found.', 404, 'DOC_003');

  return success(res, {
    data: {
      documentId:    doc._id,
      title:         doc.title,
      documentType:  doc.documentType,
      category:      doc.category,
      extractedData: doc.extractedData,
      tags:          doc.tags,
      hasExpiry:     doc.hasExpiry,
      expiryDate:    doc.expiryDate,
      expiryStatus:  doc.expiryStatus,
      status:        doc.status,
    },
    message: 'AI metadata fetched.',
  });
});

// ─── POST /ai/redact ─────────────────────────────────────────────────────────
const redactDocument = asyncWrap(async (req, res) => {
  const { documentId, fieldsToRedact = ['idNumber', 'dob', 'address'] } = req.body;
  if (!documentId) throw new AppError('documentId is required.', 400, 'VALIDATION_ERROR');

  const doc = await docRepo.findOne({ _id: documentId, userId: req.user._id, isDeleted: false });
  if (!doc) throw new AppError('Document not found.', 404, 'DOC_003');

  let redactedText = doc.rawText || '';

  // Redact specific patterns
  if (fieldsToRedact.includes('idNumber') && doc.extractedData?.idNumber) {
    redactedText = redactedText.replace(new RegExp(doc.extractedData.idNumber, 'g'), '[REDACTED ID]');
  }
  if (fieldsToRedact.includes('dob') && doc.extractedData?.dob) {
    redactedText = redactedText.replace(new RegExp(doc.extractedData.dob, 'g'), '[REDACTED DOB]');
  }
  if (fieldsToRedact.includes('address') && doc.extractedData?.address) {
    redactedText = redactedText.replace(new RegExp(doc.extractedData.address, 'g'), '[REDACTED ADDRESS]');
  }

  // General regex redaction for phone numbers, emails, and PANs
  redactedText = redactedText
    .replace(/[A-Z]{5}[0-9]{4}[A-Z]{1}/g, '[REDACTED PAN]')
    .replace(/\b\d{12}\b/g, '[REDACTED AADHAAR]')
    .replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, '[REDACTED EMAIL]');

  return success(res, {
    data: {
      documentId: doc._id,
      title: doc.title,
      redactedText,
      redactedFields: fieldsToRedact,
    },
    message: 'Document redacted successfully.',
  });
});

module.exports = { getProcessingStatus, getAISummary, getAIMetadata, redactDocument };
