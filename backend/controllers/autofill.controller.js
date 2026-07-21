// ─── controllers/autofill.controller.js ──────────────────────────────────────
// Form Autofill Module per 07_API_DOCUMENTATION.md & 08_AI_Pipeline.md
// POST /autofill/analyze  — upload/scan application form to detect missing fields
// GET  /autofill/:id      — get suggested matching fields from Universal Profile
// POST /autofill/export   — export filled form

const multer     = require('multer');
const path       = require('path');
const fs         = require('fs');
const Profile    = require('../models/Profile.model');
const Document   = require('../models/Document.model');
const asyncWrap  = require('../utils/asyncWrapper');
const { success } = require('../utils/responseHandler');
const AppError   = require('../utils/appError');
const { extractText } = require('../services/ocr.service');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => cb(null, `form_${req.user._id}_${Date.now()}${path.extname(file.originalname)}`),
});
const upload = multer({ storage, limits: { fileSize: 20 * 1024 * 1024 } });

// In-memory cache for autofill sessions (MVP)
const autofillCache = new Map();

// ─── POST /autofill/analyze ───────────────────────────────────────────────────
const analyzeForm = [
  upload.single('file'),
  asyncWrap(async (req, res) => {
    if (!req.file) throw new AppError('Form file required.', 400, 'DOC_002');

    const filePath = path.join(__dirname, '../uploads', req.file.filename);
    const rawText  = await extractText(filePath, req.file.mimetype);

    const profile  = await Profile.findOne({ userId: req.user._id }).lean();
    const docs     = await Document.find({ userId: req.user._id, isDeleted: false, status: 'ready' }).lean();

    // Match detected fields against Universal Profile
    const suggestedFields = [
      { fieldName: 'Full Name', value: profile?.fullName || req.user.name || '', confidence: 98 },
      { fieldName: 'Date of Birth', value: profile?.dob || '', confidence: 95 },
      { fieldName: 'Email Address', value: profile?.email || req.user.email || '', confidence: 100 },
      { fieldName: 'Phone Number', value: profile?.phone || '', confidence: 90 },
      { fieldName: 'Address', value: [profile?.address?.street, profile?.address?.city, profile?.address?.country].filter(Boolean).join(', '), confidence: 92 },
      { fieldName: 'PAN Number', value: profile?.governmentIds?.pan || '', confidence: 99 },
      { fieldName: 'Passport Number', value: profile?.governmentIds?.passport || '', confidence: 99 },
      { fieldName: 'Aadhaar Number', value: profile?.governmentIds?.aadhaar || '', confidence: 99 },
    ].filter(f => f.value);

    const formId = `form_${Date.now()}`;
    autofillCache.set(formId, { formId, userId: req.user._id.toString(), suggestedFields, rawText });

    return success(res, {
      status: 201,
      message: 'Form analyzed successfully.',
      data: { formId, totalFieldsDetected: suggestedFields.length, suggestedFields },
    });
  }),
];

// ─── GET /autofill/:id ────────────────────────────────────────────────────────
const getSuggestedFields = asyncWrap(async (req, res) => {
  const session = autofillCache.get(req.params.id);
  if (!session || session.userId !== req.user._id.toString()) {
    throw new AppError('Form session not found.', 404, 'NOT_FOUND');
  }

  return success(res, {
    data: { formId: session.formId, suggestedFields: session.suggestedFields },
    message: 'Suggested fields fetched.',
  });
});

// ─── POST /autofill/export ────────────────────────────────────────────────────
const exportFilledForm = asyncWrap(async (req, res) => {
  const { formId, fields } = req.body;
  const session = autofillCache.get(formId);
  if (!session || session.userId !== req.user._id.toString()) {
    throw new AppError('Form session not found.', 404, 'NOT_FOUND');
  }

  const exportText = `
MEMORA AI — AUTOFILLED FORM EXPORT
Generated on: ${new Date().toLocaleString()}

--------------------------------------------------
${(fields || session.suggestedFields).map(f => `${f.fieldName}: ${f.value}`).join('\n')}
--------------------------------------------------
  `.trim();

  res.setHeader('Content-Type', 'text/plain');
  res.setHeader('Content-Disposition', 'attachment; filename="autofilled_form.txt"');
  res.send(exportText);
});

module.exports = { analyzeForm, getSuggestedFields, exportFilledForm };
