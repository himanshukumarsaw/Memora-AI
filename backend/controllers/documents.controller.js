const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Document = require('../models/Document.model');
const User = require('../models/User.model');
const { processDocument } = require('../services/document.service');
const { semanticSearch } = require('../services/ai.service');

// Multer config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = `${req.user._id}_${Date.now()}${ext}`;
    cb(null, name);
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg', 'image/webp', 'image/tiff'];
  if (allowed.includes(file.mimetype)) cb(null, true);
  else cb(new Error('Only PDF and image files are allowed'), false);
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 20 * 1024 * 1024 } }); // 20MB

// POST /api/documents/upload
const uploadDocument = [
  upload.single('file'),
  async (req, res) => {
    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });

    try {
      const title = req.body.title || req.file.originalname.replace(/\.[^/.]+$/, '');
      const fileUrl = `/uploads/${req.file.filename}`;

      // Create document record
      const doc = await Document.create({
        userId: req.user._id,
        title,
        originalName: req.file.originalname,
        fileUrl,
        fileType: req.file.mimetype,
        fileSize: req.file.size,
        status: 'uploading',
      });

      // Update user storage
      await User.findByIdAndUpdate(req.user._id, { $inc: { storageUsed: req.file.size } });

      // Respond immediately, process in background
      res.status(201).json({ success: true, message: 'File uploaded. Processing...', document: doc });

      // Process async (don't await in response)
      const filePath = path.join(__dirname, '../uploads', req.file.filename);
      processDocument(doc._id, filePath, req.file.mimetype).catch(err =>
        console.error('Background processing error:', err.message)
      );
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
];

// GET /api/documents
const getDocuments = async (req, res) => {
  try {
    const { category, status, search, page = 1, limit = 20 } = req.query;
    const filter = { userId: req.user._id, isDeleted: false };
    if (category) filter.category = category;
    if (status) filter.status = status;

    let documents;
    if (search) {
      // Semantic search
      const allDocs = await Document.find(filter).select('_id title documentType category aiSummary rawText embedding').lean();
      const searchable = allDocs.filter(d => d.embedding && d.embedding.length > 0);
      const results = await semanticSearch(search, searchable);
      const ids = results.map(r => r._id);
      documents = await Document.find({ _id: { $in: ids }, isDeleted: false }).sort({ createdAt: -1 });
    } else {
      documents = await Document.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(parseInt(limit));
    }

    const total = await Document.countDocuments(filter);
    res.json({ success: true, documents, total, page: parseInt(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/documents/:id
const getDocument = async (req, res) => {
  try {
    const doc = await Document.findOne({ _id: req.params.id, userId: req.user._id, isDeleted: false });
    if (!doc) return res.status(404).json({ success: false, message: 'Document not found' });
    // Increment view count
    await Document.findByIdAndUpdate(doc._id, { $inc: { viewCount: 1 }, lastViewedAt: new Date() });
    res.json({ success: true, document: doc });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/documents/:id
const deleteDocument = async (req, res) => {
  try {
    const doc = await Document.findOne({ _id: req.params.id, userId: req.user._id });
    if (!doc) return res.status(404).json({ success: false, message: 'Document not found' });
    await Document.findByIdAndUpdate(doc._id, { isDeleted: true });
    await User.findByIdAndUpdate(req.user._id, { $inc: { storageUsed: -doc.fileSize } });
    res.json({ success: true, message: 'Document deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/documents/dashboard/stats
const getDashboardStats = async (req, res) => {
  try {
    const userId = req.user._id;
    const [total, expiringSoon, expired, byCategory, recent, upcomingReminders] = await Promise.all([
      Document.countDocuments({ userId, isDeleted: false }),
      Document.countDocuments({ userId, isDeleted: false, expiryStatus: 'expiring_soon' }),
      Document.countDocuments({ userId, isDeleted: false, expiryStatus: 'expired' }),
      Document.aggregate([
        { $match: { userId, isDeleted: false } },
        { $group: { _id: '$category', count: { $sum: 1 } } },
      ]),
      Document.find({ userId, isDeleted: false }).sort({ createdAt: -1 }).limit(5).select('-rawText -embedding'),
      require('../models/Reminder.model').find({ userId, status: 'pending', dueDate: { $gte: new Date() } })
        .sort({ dueDate: 1 }).limit(5).populate('documentId', 'title documentType'),
    ]);

    res.json({
      success: true,
      stats: {
        totalDocuments: total,
        expiringSoon,
        expired,
        categoryCounts: byCategory,
        storageUsed: req.user.storageUsed,
        storageLimit: req.user.storageLimit,
      },
      recentDocuments: recent,
      upcomingReminders,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { uploadDocument, getDocuments, getDocument, deleteDocument, getDashboardStats };
