// ─── controllers/documents.controller.js ─────────────────────────────────────
// Complete document controller — 20 endpoints per 07_API_DOCUMENTATION.md

const multer     = require('multer');
const path       = require('path');
const fs         = require('fs');
const docRepo    = require('../repositories/document.repository');
const userRepo   = require('../repositories/user.repository');
const asyncWrap  = require('../utils/asyncWrapper');
const { success, paginated } = require('../utils/responseHandler');
const AppError   = require('../utils/appError');
const { processDocument } = require('../services/document.service');
const { semanticSearch }  = require('../services/ai.service');
const { ALLOWED_MIME_TYPES, MAX_FILE_SIZE_BYTES, DOC_CATEGORIES } = require('../constants');

// ─── Multer config ────────────────────────────────────────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext  = path.extname(file.originalname);
    const name = `${req.user._id}_${Date.now()}${ext}`;
    cb(null, name);
  },
});

const fileFilter = (req, file, cb) => {
  if (ALLOWED_MIME_TYPES.includes(file.mimetype)) cb(null, true);
  else cb(new AppError('Only PDF, JPG, PNG, WEBP files are allowed.', 400, 'DOC_002'), false);
};

const upload = multer({ storage, fileFilter, limits: { fileSize: MAX_FILE_SIZE_BYTES } });

// ─── POST /documents/upload ───────────────────────────────────────────────────
const uploadDocument = [
  upload.single('file'),
  asyncWrap(async (req, res) => {
    if (!req.file) throw new AppError('No file uploaded.', 400, 'DOC_002');

    const title   = req.body.title || req.file.originalname.replace(/\.[^/.]+$/, '');
    const fileUrl = `/uploads/${req.file.filename}`;

    const doc = await docRepo.create({
      userId:       req.user._id,
      title,
      originalName: req.file.originalname,
      fileUrl,
      fileType:     req.file.mimetype,
      fileSize:     req.file.size,
      category:     req.body.category || 'other',
      status:       'uploading',
    });

    await userRepo.incrementStorage(req.user._id, req.file.size);

    // Respond immediately, process asynchronously
    success(res, { status: 201, message: 'File uploaded. AI processing started.', data: doc });

    const filePath = path.join(__dirname, '../uploads', req.file.filename);
    processDocument(doc._id, filePath, req.file.mimetype).catch(err =>
      require('../utils/logger').error(`Background processing error: ${err.message}`)
    );
  }),
];

// ─── GET /documents ───────────────────────────────────────────────────────────
const getDocuments = asyncWrap(async (req, res) => {
  const { category, status, search, page = 1, limit = 20 } = req.query;
  const skip = (page - 1) * limit;

  if (search) {
    const allDocs = await docRepo.findForSearch(req.user._id);
    const results = await semanticSearch(search, allDocs.filter(d => d.embedding?.length));
    return success(res, {
      data:    { documents: results, total: results.length, page: 1, pages: 1 },
      message: 'Semantic search results.',
    });
  }

  const [documents, total] = await Promise.all([
    docRepo.findByUser(req.user._id, { category, status, skip: Number(skip), limit: Number(limit) }),
    docRepo.countByUser(req.user._id, { ...(category && { category }), ...(status && { status }) }),
  ]);

  return paginated(res, { items: documents, total, page: Number(page), limit: Number(limit), message: 'Documents fetched.' });
});

// ─── GET /documents/:id ───────────────────────────────────────────────────────
const getDocument = asyncWrap(async (req, res) => {
  const doc = await docRepo.findOne({ _id: req.params.id, userId: req.user._id, isDeleted: false });
  if (!doc) throw new AppError('Document not found.', 404, 'DOC_003');
  await docRepo.recordView(doc._id);
  return success(res, { data: doc, message: 'Document fetched.' });
});

// ─── DELETE /documents/:id ────────────────────────────────────────────────────
const deleteDocument = asyncWrap(async (req, res) => {
  const doc = await docRepo.findOne({ _id: req.params.id, userId: req.user._id, isDeleted: false });
  if (!doc) throw new AppError('Document not found.', 404, 'DOC_003');
  await docRepo.softDelete(doc._id);
  await userRepo.decrementStorage(req.user._id, doc.fileSize || 0);
  return success(res, { message: 'Document deleted.' });
});

// ─── PATCH /documents/:id/name ────────────────────────────────────────────────
const renameDocument = asyncWrap(async (req, res) => {
  const { title } = req.body;
  if (!title?.trim()) throw new AppError('Title is required.', 400, 'VALIDATION_ERROR');
  const doc = await docRepo.updateOne({ _id: req.params.id, userId: req.user._id, isDeleted: false }, { title: title.trim() });
  if (!doc) throw new AppError('Document not found.', 404, 'DOC_003');
  return success(res, { data: doc, message: 'Document renamed.' });
});

// ─── PATCH /documents/:id/category ───────────────────────────────────────────
const updateCategory = asyncWrap(async (req, res) => {
  const { category } = req.body;
  if (!DOC_CATEGORIES.includes(category)) throw new AppError('Invalid category.', 400, 'VALIDATION_ERROR');
  const doc = await docRepo.updateOne({ _id: req.params.id, userId: req.user._id, isDeleted: false }, { category });
  if (!doc) throw new AppError('Document not found.', 404, 'DOC_003');
  return success(res, { data: doc, message: 'Category updated.' });
});

// ─── PATCH /documents/:id/favorite ───────────────────────────────────────────
const toggleFavorite = asyncWrap(async (req, res) => {
  const existing = await docRepo.findOne({ _id: req.params.id, userId: req.user._id, isDeleted: false });
  if (!existing) throw new AppError('Document not found.', 404, 'DOC_003');
  const doc = await docRepo.updateById(existing._id, { isFavorite: !existing.isFavorite });
  return success(res, { data: doc, message: doc.isFavorite ? 'Added to favourites.' : 'Removed from favourites.' });
});

// ─── PATCH /documents/:id/archive ────────────────────────────────────────────
const toggleArchive = asyncWrap(async (req, res) => {
  const existing = await docRepo.findOne({ _id: req.params.id, userId: req.user._id, isDeleted: false });
  if (!existing) throw new AppError('Document not found.', 404, 'DOC_003');
  const doc = await docRepo.updateById(existing._id, { isArchived: !existing.isArchived });
  return success(res, { data: doc, message: doc.isArchived ? 'Document archived.' : 'Document unarchived.' });
});

// ─── GET /documents/:id/download ─────────────────────────────────────────────
const downloadDocument = asyncWrap(async (req, res) => {
  const doc = await docRepo.findOne({ _id: req.params.id, userId: req.user._id, isDeleted: false });
  if (!doc) throw new AppError('Document not found.', 404, 'DOC_003');

  const filePath = path.join(__dirname, '..', doc.fileUrl);
  if (!fs.existsSync(filePath)) throw new AppError('File not found on server.', 404, 'DOC_003');

  await docRepo.recordView(doc._id);
  res.download(filePath, doc.originalName || doc.title);
});

// ─── GET /documents/:id/preview ──────────────────────────────────────────────
const previewDocument = asyncWrap(async (req, res) => {
  const doc = await docRepo.findOne({ _id: req.params.id, userId: req.user._id, isDeleted: false });
  if (!doc) throw new AppError('Document not found.', 404, 'DOC_003');
  // Return file URL for frontend to render
  return success(res, {
    data:    { fileUrl: `http://localhost:${process.env.PORT || 5000}${doc.fileUrl}`, fileType: doc.fileType, title: doc.title },
    message: 'Preview URL fetched.',
  });
});

// ─── GET /documents/dashboard/stats ──────────────────────────────────────────
const getDashboardStats = asyncWrap(async (req, res) => {
  const userId = req.user._id;
  const Reminder = require('../models/Reminder.model');

  const [stats, recent, upcomingReminders] = await Promise.all([
    docRepo.getDashboardStats(userId),
    docRepo.findRecent(userId, 5),
    Reminder.find({ userId, status: 'pending', dueDate: { $gte: new Date() } })
      .sort({ dueDate: 1 }).limit(5)
      .populate('documentId', 'title documentType'),
  ]);

  return success(res, {
    data: {
      stats: {
        ...stats,
        storageUsed:  req.user.storageUsed,
        storageLimit: req.user.storageLimit,
      },
      recentDocuments:    recent,
      upcomingReminders,
    },
    message: 'Dashboard stats fetched.',
  });
});

module.exports = {
  uploadDocument, getDocuments, getDocument, deleteDocument,
  renameDocument, updateCategory, toggleFavorite, toggleArchive,
  downloadDocument, previewDocument, getDashboardStats,
};
