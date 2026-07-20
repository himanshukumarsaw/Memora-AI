# 📄 06 — Backend Architecture

> **Memora AI** | Node.js + Express.js Backend — Routes, Controllers, Services & Middleware
> *The engine behind every upload, extraction, chat, and reminder.*

---

## 📌 Table of Contents

| # | Section |
|---|---------|
| 1 | [Backend Overview](#1-backend-overview) |
| 2 | [Project Structure](#2-project-structure) |
| 3 | [Server Entry Point](#3-server-entry-point) |
| 4 | [Configuration & Environment](#4-configuration--environment) |
| 5 | [Middleware Stack](#5-middleware-stack) |
| 6 | [Authentication Module](#6-authentication-module) |
| 7 | [Document Module](#7-document-module) |
| 8 | [AI Service Module](#8-ai-service-module) |
| 9 | [Chat Module](#9-chat-module) |
| 10 | [Reminder Module](#10-reminder-module) |
| 11 | [Secure Share Module](#11-secure-share-module) |
| 12 | [Profile Module](#12-profile-module) |
| 13 | [Search Module](#13-search-module) |
| 14 | [Background Jobs](#14-background-jobs) |
| 15 | [Error Handling](#15-error-handling) |
| 16 | [Security Implementation](#16-security-implementation) |
| 17 | [Backend Data Flow Diagrams](#17-backend-data-flow-diagrams) |

---

## 1. Backend Overview

### Technology

```
Runtime      : Node.js 20 LTS
Framework    : Express.js 4.x
Language     : JavaScript (ES2023, CommonJS)
Auth         : Clerk SDK (@clerk/clerk-sdk-node)
ODM          : Mongoose 8.x (MongoDB)
File Upload  : Multer + Cloudinary SDK
AI           : @google/generative-ai (Gemini) + OpenAI SDK
OCR          : @google-cloud/vision
Vector DB    : @pinecone-database/pinecone
Jobs         : node-cron
Email        : Nodemailer + SendGrid
Validation   : express-validator
Security     : helmet, cors, express-rate-limit
Logging      : morgan + winston
Testing      : Jest + Supertest
```

### Responsibilities

| Module | Responsibility |
|--------|---------------|
| `auth` | User registration sync, JWT verification, profile creation |
| `documents` | Upload, retrieve, update, delete documents |
| `ai` | OCR, extraction, embedding, classification |
| `chat` | RAG-powered AI chat sessions |
| `reminders` | Expiry reminders, CRUD, scheduling |
| `share` | OTP-protected temporary link generation |
| `profile` | Universal profile aggregation |
| `search` | Semantic search via Pinecone |
| `jobs` | Background cron tasks (reminder dispatch) |

---

## 2. Project Structure

```
backend/
│
├── server.js                      ← Express app + server startup
│
├── config/
│   ├── db.js                      ← MongoDB connection
│   ├── cloudinary.js              ← Cloudinary SDK setup
│   ├── pinecone.js                ← Pinecone client setup
│   ├── gemini.js                  ← Gemini API client
│   └── env.js                     ← Environment variable validation
│
├── routes/
│   ├── index.js                   ← Aggregates all routers
│   ├── auth.routes.js
│   ├── documents.routes.js
│   ├── chat.routes.js
│   ├── reminders.routes.js
│   ├── share.routes.js
│   ├── profile.routes.js
│   └── search.routes.js
│
├── controllers/
│   ├── auth.controller.js
│   ├── documents.controller.js
│   ├── chat.controller.js
│   ├── reminders.controller.js
│   ├── share.controller.js
│   ├── profile.controller.js
│   └── search.controller.js
│
├── services/
│   ├── ai.service.js              ← Gemini / OpenAI calls
│   ├── ocr.service.js             ← Google Vision + Tesseract
│   ├── vector.service.js          ← Pinecone upsert + query
│   ├── document.service.js        ← Document business logic
│   ├── reminder.service.js        ← Reminder creation logic
│   ├── share.service.js           ← Link generation + OTP
│   ├── profile.service.js         ← Profile aggregation
│   └── email.service.js           ← Email dispatch
│
├── models/
│   ├── User.model.js
│   ├── Document.model.js
│   ├── Reminder.model.js
│   ├── ShareLink.model.js
│   ├── ChatSession.model.js
│   ├── FamilyMember.model.js
│   └── Notification.model.js
│
├── middleware/
│   ├── auth.middleware.js          ← Clerk JWT verification
│   ├── upload.middleware.js        ← Multer config
│   ├── validate.middleware.js      ← express-validator runner
│   ├── rateLimit.middleware.js     ← Per-route rate limiters
│   └── errorHandler.middleware.js  ← Global error handler
│
├── jobs/
│   └── reminderJob.js             ← node-cron scheduler
│
├── utils/
│   ├── asyncHandler.js            ← Async try/catch wrapper
│   ├── ApiResponse.js             ← Standardized response format
│   ├── ApiError.js                ← Custom error class
│   ├── generateOTP.js             ← OTP generator
│   └── dateHelpers.js             ← Date utilities
│
├── validators/
│   ├── auth.validator.js
│   ├── document.validator.js
│   ├── reminder.validator.js
│   └── share.validator.js
│
├── constants/
│   ├── documentTypes.js           ← Allowed document type enums
│   └── errorMessages.js           ← Centralized error strings
│
├── .env
├── .env.example
├── package.json
└── Dockerfile
```

---

## 3. Server Entry Point

```javascript
// server.js

const express    = require('express');
const helmet     = require('helmet');
const cors       = require('cors');
const morgan     = require('morgan');
const mongoose   = require('mongoose');

const { connectDB }        = require('./config/db');
const routes               = require('./routes/index');
const errorHandler         = require('./middleware/errorHandler.middleware');
const { startReminderJob } = require('./jobs/reminderJob');

const app  = express();
const PORT = process.env.PORT || 5000;

// ─── Security Middleware ──────────────────────────────────────────
app.use(helmet());
app.use(cors({
  origin: [process.env.FRONTEND_URL, 'http://localhost:3000'],
  credentials: true,
}));

// ─── Request Parsing ─────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ─── Logging ─────────────────────────────────────────────────────
app.use(morgan('dev'));

// ─── Routes ──────────────────────────────────────────────────────
app.use('/api/v1', routes);

// ─── Health Check ────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// ─── Global Error Handler ─────────────────────────────────────────
app.use(errorHandler);

// ─── Start Server ─────────────────────────────────────────────────
const startServer = async () => {
  await connectDB();
  startReminderJob();
  app.listen(PORT, () => {
    console.log(`✅ Memora AI Server running on port ${PORT}`);
  });
};

startServer();
```

---

## 4. Configuration & Environment

### Environment Variables

```bash
# .env

# Server
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# MongoDB
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/memora_db

# Clerk Auth
CLERK_SECRET_KEY=sk_test_xxxxxxxxxxxxx
CLERK_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxx

# Cloudinary (MVP Storage)
CLOUDINARY_CLOUD_NAME=memora_cloud
CLOUDINARY_API_KEY=123456789
CLOUDINARY_API_SECRET=abcdef123456

# AWS S3 (Production Storage)
AWS_ACCESS_KEY_ID=AKIAXXXXXXXXXXXXXXXX
AWS_SECRET_ACCESS_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
AWS_BUCKET_NAME=memora-documents
AWS_REGION=ap-south-1

# AI
GEMINI_API_KEY=AIzaSy_xxxxxxxxxxxxxxxxxxxx
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Google Vision OCR
GOOGLE_APPLICATION_CREDENTIALS=./credentials/google-vision.json

# Pinecone
PINECONE_API_KEY=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
PINECONE_INDEX_NAME=memora-documents
PINECONE_ENVIRONMENT=us-east-1-aws

# Email
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxxxxxx
EMAIL_FROM=noreply@memora.ai

# Misc
OTP_EXPIRY_MINUTES=10
SHARE_LINK_DEFAULT_EXPIRY_HOURS=24
```

### Database Connection

```javascript
// config/db.js

const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      dbName: 'memora_db',
    });
    console.log('✅ MongoDB connected');
  } catch (err) {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1);
  }
};

module.exports = { connectDB };
```

---

## 5. Middleware Stack

### 5.1 Auth Middleware (Clerk)

```javascript
// middleware/auth.middleware.js

const { ClerkExpressRequireAuth } = require('@clerk/clerk-sdk-node');
const User = require('../models/User.model');

// Step 1: Verify Clerk JWT
const requireAuth = ClerkExpressRequireAuth();

// Step 2: Attach full user document from MongoDB
const attachUser = async (req, res, next) => {
  try {
    const clerkId = req.auth.userId;

    let user = await User.findOne({ clerkId });

    // Auto-create user on first request (Clerk webhook alternative)
    if (!user) {
      user = await User.create({
        clerkId,
        email: req.auth.sessionClaims?.email || '',
        name:  req.auth.sessionClaims?.name  || 'User',
      });
    }

    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
};

module.exports = { requireAuth, attachUser };
```

### 5.2 Upload Middleware (Multer)

```javascript
// middleware/upload.middleware.js

const multer  = require('multer');
const ApiError = require('../utils/ApiError');

const ALLOWED_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/heic',
  'image/tiff',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

const MAX_SIZE = 50 * 1024 * 1024; // 50 MB

const storage = multer.memoryStorage(); // Hold in memory for Cloudinary upload

const fileFilter = (req, file, cb) => {
  if (ALLOWED_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new ApiError(400, `Unsupported file type: ${file.mimetype}`), false);
  }
};

const upload = multer({ storage, fileFilter, limits: { fileSize: MAX_SIZE } });

module.exports = upload;
```

### 5.3 Rate Limiter

```javascript
// middleware/rateLimit.middleware.js

const rateLimit = require('express-rate-limit');

// General API limiter
const apiLimiter = rateLimit({
  windowMs: 60 * 1000,   // 1 minute
  max: 100,
  message: { error: 'Too many requests. Please try again in a minute.' },
});

// Strict limiter for AI endpoints (costly)
const aiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  message: { error: 'AI request limit reached. Try again in a minute.' },
});

// Share link creation limiter
const shareLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,  // 1 hour
  max: 10,
  message: { error: 'Share link limit reached for this hour.' },
});

module.exports = { apiLimiter, aiLimiter, shareLimiter };
```

### 5.4 Async Handler

```javascript
// utils/asyncHandler.js

// Wraps async route handlers to auto-catch errors
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
```

### 5.5 Standardized Response

```javascript
// utils/ApiResponse.js

class ApiResponse {
  constructor(statusCode, data, message = 'Success') {
    this.statusCode = statusCode;
    this.data       = data;
    this.message    = message;
    this.success    = statusCode < 400;
  }
}

// utils/ApiError.js
class ApiError extends Error {
  constructor(statusCode, message, errors = []) {
    super(message);
    this.statusCode = statusCode;
    this.errors     = errors;
    this.success    = false;
  }
}

module.exports = { ApiResponse, ApiError };
```

---

## 6. Authentication Module

### Routes

```javascript
// routes/auth.routes.js

const router = require('express').Router();
const { requireAuth, attachUser } = require('../middleware/auth.middleware');
const authController = require('../controllers/auth.controller');

// Sync Clerk user to MongoDB (called after first login)
router.post('/sync',   requireAuth, authController.syncUser);

// Get current user profile
router.get('/me',      requireAuth, attachUser, authController.getMe);

// Update user preferences
router.put('/preferences', requireAuth, attachUser, authController.updatePreferences);

module.exports = router;
```

### Controller

```javascript
// controllers/auth.controller.js

const User        = require('../models/User.model');
const asyncHandler = require('../utils/asyncHandler');
const { ApiResponse } = require('../utils/ApiResponse');

const syncUser = asyncHandler(async (req, res) => {
  const { userId, sessionClaims } = req.auth;
  const { name, email, phone } = req.body;

  let user = await User.findOne({ clerkId: userId });

  if (!user) {
    user = await User.create({
      clerkId: userId,
      name:    name  || sessionClaims?.name  || 'User',
      email:   email || sessionClaims?.email || '',
      phone:   phone || null,
    });
  }

  res.status(200).json(new ApiResponse(200, user, 'User synced'));
});

const getMe = asyncHandler(async (req, res) => {
  res.status(200).json(new ApiResponse(200, req.user, 'User fetched'));
});

const updatePreferences = asyncHandler(async (req, res) => {
  const { theme, emailNotifications, pushNotifications, profileType } = req.body;

  const updated = await User.findByIdAndUpdate(
    req.user._id,
    { theme, emailNotifications, pushNotifications, profileType, onboardingComplete: true },
    { new: true, runValidators: true }
  );

  res.status(200).json(new ApiResponse(200, updated, 'Preferences updated'));
});

module.exports = { syncUser, getMe, updatePreferences };
```

---

## 7. Document Module

### Routes

```javascript
// routes/documents.routes.js

const router      = require('express').Router();
const { requireAuth, attachUser } = require('../middleware/auth.middleware');
const upload      = require('../middleware/upload.middleware');
const docsCtrl    = require('../controllers/documents.controller');
const { apiLimiter } = require('../middleware/rateLimit.middleware');

const auth = [requireAuth, attachUser];

// Upload
router.post('/',            ...auth, upload.single('file'), docsCtrl.uploadDocument);

// Read
router.get('/',             ...auth, docsCtrl.getAllDocuments);
router.get('/:id',          ...auth, docsCtrl.getDocumentById);
router.get('/:id/url',      ...auth, docsCtrl.getDocumentUrl);

// Update
router.put('/:id',          ...auth, docsCtrl.updateDocument);
router.put('/:id/favorite', ...auth, docsCtrl.toggleFavorite);

// Delete
router.delete('/:id',       ...auth, docsCtrl.deleteDocument);

module.exports = router;
```

### Controller

```javascript
// controllers/documents.controller.js

const Document      = require('../models/Document.model');
const documentSvc   = require('../services/document.service');
const asyncHandler  = require('../utils/asyncHandler');
const { ApiResponse, ApiError } = require('../utils/ApiResponse');

// POST /api/v1/documents
const uploadDocument = asyncHandler(async (req, res) => {
  if (!req.file) throw new ApiError(400, 'No file uploaded');

  const userId = req.user.clerkId;

  // 1. Upload to Cloudinary
  const fileUrl = await documentSvc.uploadToCloudinary(req.file, userId);

  // 2. Create document record (status: pending)
  const doc = await Document.create({
    userId,
    originalName:  req.file.originalname,
    fileType:      req.file.mimetype.split('/')[1],
    fileSizeBytes: req.file.size,
    fileUrl,
    processingStatus: 'pending',
  });

  // 3. Trigger AI processing in background (non-blocking)
  documentSvc.processDocumentAsync(doc._id, req.file.buffer, req.file.mimetype);

  res.status(201).json(new ApiResponse(201, doc, 'Document uploaded. AI processing started.'));
});

// GET /api/v1/documents
const getAllDocuments = asyncHandler(async (req, res) => {
  const { category, type, status, sort = '-createdAt', page = 1, limit = 20 } = req.query;
  const userId = req.user.clerkId;

  const filter = { userId, isDeleted: false };
  if (category) filter.documentCategory = category;
  if (type)     filter.documentType     = type;
  if (status)   filter.processingStatus = status;

  const docs = await Document.find(filter)
    .sort(sort)
    .skip((page - 1) * limit)
    .limit(Number(limit))
    .select('-rawText -vectorIds');

  const total = await Document.countDocuments(filter);

  res.status(200).json(new ApiResponse(200, { docs, total, page, limit }, 'Documents fetched'));
});

// GET /api/v1/documents/:id
const getDocumentById = asyncHandler(async (req, res) => {
  const doc = await Document.findOne({
    _id:       req.params.id,
    userId:    req.user.clerkId,
    isDeleted: false,
  }).select('-rawText');

  if (!doc) throw new ApiError(404, 'Document not found');

  res.status(200).json(new ApiResponse(200, doc, 'Document fetched'));
});

// GET /api/v1/documents/:id/url
const getDocumentUrl = asyncHandler(async (req, res) => {
  const doc = await Document.findOne({
    _id: req.params.id, userId: req.user.clerkId, isDeleted: false,
  });
  if (!doc) throw new ApiError(404, 'Document not found');

  // Return the Cloudinary URL (or generate S3 presigned URL in production)
  res.status(200).json(new ApiResponse(200, { url: doc.fileUrl }, 'URL generated'));
});

// PUT /api/v1/documents/:id
const updateDocument = asyncHandler(async (req, res) => {
  const { tags, notes, documentType, documentCategory } = req.body;

  const doc = await Document.findOneAndUpdate(
    { _id: req.params.id, userId: req.user.clerkId, isDeleted: false },
    { tags, notes, documentType, documentCategory },
    { new: true, runValidators: true }
  );
  if (!doc) throw new ApiError(404, 'Document not found');

  res.status(200).json(new ApiResponse(200, doc, 'Document updated'));
});

// PUT /api/v1/documents/:id/favorite
const toggleFavorite = asyncHandler(async (req, res) => {
  const doc = await Document.findOne({
    _id: req.params.id, userId: req.user.clerkId, isDeleted: false,
  });
  if (!doc) throw new ApiError(404, 'Document not found');

  doc.isFavorite = !doc.isFavorite;
  await doc.save();

  res.status(200).json(new ApiResponse(200, doc, `Document ${doc.isFavorite ? 'added to' : 'removed from'} favorites`));
});

// DELETE /api/v1/documents/:id
const deleteDocument = asyncHandler(async (req, res) => {
  const doc = await Document.findOneAndUpdate(
    { _id: req.params.id, userId: req.user.clerkId, isDeleted: false },
    { isDeleted: true, deletedAt: new Date() },
    { new: true }
  );
  if (!doc) throw new ApiError(404, 'Document not found');

  // Delete vectors from Pinecone in background
  documentSvc.deleteDocumentVectors(doc.vectorIds, req.user.clerkId);

  res.status(200).json(new ApiResponse(200, null, 'Document deleted'));
});

module.exports = {
  uploadDocument, getAllDocuments, getDocumentById,
  getDocumentUrl, updateDocument, toggleFavorite, deleteDocument,
};
```

---

## 8. AI Service Module

```javascript
// services/ai.service.js

const { GoogleGenerativeAI } = require('@google/generative-ai');
const OpenAI                 = require('openai');

const genAI  = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// ─────────────────────────────────────────
// Step 1: Classify document type
// ─────────────────────────────────────────
const classifyDocument = async (rawText) => {
  const model  = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  const prompt = `
You are a document classifier. Based on the text below, identify:
1. documentType (one of: aadhaar_card, pan_card, passport, driving_licence, voter_id,
   degree_certificate, mark_sheet, offer_letter, experience_letter, salary_slip,
   insurance_policy, medical_report, prescription, bank_statement, income_tax_return,
   property_document, vehicle_registration, birth_certificate, marriage_certificate, other)
2. documentCategory (one of: identity, education, professional, medical, financial,
   property, vehicle, legal, other)

Return ONLY valid JSON: { "documentType": "...", "documentCategory": "..." }

Document text:
${rawText.slice(0, 2000)}
  `;

  const result   = await model.generateContent(prompt);
  const text     = result.response.text().trim();
  const jsonStr  = text.replace(/```json|```/g, '').trim();
  return JSON.parse(jsonStr);
};

// ─────────────────────────────────────────
// Step 2: Extract structured data
// ─────────────────────────────────────────
const extractDocumentData = async (rawText, documentType) => {
  const model  = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
  const prompt = `
You are an AI extraction engine for Indian documents.
Extract all relevant fields from this ${documentType} document.

Return ONLY valid JSON with these fields (use null if not found):
{
  "name": null,
  "dob": null,           // format: YYYY-MM-DD
  "gender": null,
  "fatherName": null,
  "address": null,
  "pincode": null,
  "idNumber": null,
  "issueDate": null,     // format: YYYY-MM-DD
  "expiryDate": null,    // format: YYYY-MM-DD
  "issuer": null,
  "nationality": null,
  "placeOfBirth": null,
  "organization": null,
  "grade": null,
  "amount": null
}

Document text:
${rawText.slice(0, 4000)}
  `;

  const result  = await model.generateContent(prompt);
  const text    = result.response.text().trim();
  const jsonStr = text.replace(/```json|```/g, '').trim();
  return JSON.parse(jsonStr);
};

// ─────────────────────────────────────────
// Step 3: Generate embeddings
// ─────────────────────────────────────────
const generateEmbedding = async (text) => {
  try {
    // Try Gemini embeddings first
    const model  = genAI.getGenerativeModel({ model: 'text-embedding-004' });
    const result = await model.embedContent(text);
    return result.embedding.values;
  } catch {
    // Fallback to OpenAI
    const response = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: text,
    });
    return response.data[0].embedding;
  }
};

// ─────────────────────────────────────────
// Chat — RAG answer generation
// ─────────────────────────────────────────
const generateChatAnswer = async (query, contextChunks) => {
  const model   = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
  const context = contextChunks.map((c, i) =>
    `[Document ${i + 1} — ${c.metadata.documentType}]\n${c.metadata.chunkText}`
  ).join('\n\n');

  const prompt = `
You are Memora AI, a personal document assistant.
Answer the user's question using ONLY the document context provided below.
If the answer is not in the context, say "I couldn't find that in your documents."
Never make up or hallucinate information.
Be concise, friendly, and helpful.

DOCUMENT CONTEXT:
${context}

USER QUESTION: ${query}
  `;

  const result = await model.generateContent(prompt);
  return result.response.text().trim();
};

// ─────────────────────────────────────────
// Resume generation
// ─────────────────────────────────────────
const generateResume = async (profileData, documents) => {
  const model  = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
  const prompt = `
Generate a professional resume in markdown format using the following data:

PERSONAL INFO: ${JSON.stringify(profileData)}
DOCUMENTS: ${JSON.stringify(documents.map(d => d.extractedData))}

Include: Summary, Education, Experience, Skills, Certifications.
Use clean markdown formatting.
  `;

  const result = await model.generateContent(prompt);
  return result.response.text().trim();
};

module.exports = {
  classifyDocument, extractDocumentData,
  generateEmbedding, generateChatAnswer, generateResume,
};
```

---

## 9. Chat Module

### Routes

```javascript
// routes/chat.routes.js

const router     = require('express').Router();
const { requireAuth, attachUser } = require('../middleware/auth.middleware');
const chatCtrl   = require('../controllers/chat.controller');
const { aiLimiter } = require('../middleware/rateLimit.middleware');

const auth = [requireAuth, attachUser];

router.post('/message',          ...auth, aiLimiter, chatCtrl.sendMessage);
router.get('/sessions',          ...auth, chatCtrl.getSessions);
router.get('/sessions/:id',      ...auth, chatCtrl.getSessionById);
router.delete('/sessions/:id',   ...auth, chatCtrl.deleteSession);

module.exports = router;
```

### Controller

```javascript
// controllers/chat.controller.js

const ChatSession  = require('../models/ChatSession.model');
const vectorSvc    = require('../services/vector.service');
const aiSvc        = require('../services/ai.service');
const asyncHandler = require('../utils/asyncHandler');
const { ApiResponse, ApiError } = require('../utils/ApiResponse');

// POST /api/v1/chat/message
const sendMessage = asyncHandler(async (req, res) => {
  const { sessionId, message } = req.body;
  const userId = req.user.clerkId;

  if (!message?.trim()) throw new ApiError(400, 'Message cannot be empty');

  // 1. Get or create session
  let session = sessionId
    ? await ChatSession.findOne({ _id: sessionId, userId })
    : null;

  if (!session) {
    session = await ChatSession.create({ userId, title: message.slice(0, 50) });
  }

  // 2. Add user message
  session.messages.push({ role: 'user', content: message });

  // 3. Embed the query
  const queryVector = await aiSvc.generateEmbedding(message);

  // 4. Search Pinecone for relevant document chunks
  const searchResults = await vectorSvc.searchVectors(queryVector, userId, 5);

  // 5. Generate AI answer using RAG
  const answer = await aiSvc.generateChatAnswer(message, searchResults.matches || []);

  // 6. Extract source documents from search results
  const sourceDocuments = [...new Set(
    (searchResults.matches || []).map(m => ({
      documentId:   m.metadata.documentId,
      documentName: m.metadata.fileName,
      documentType: m.metadata.documentType,
    }))
  )];

  // 7. Add assistant message
  session.messages.push({
    role: 'assistant',
    content: answer,
    sourceDocuments,
  });
  session.lastMessageAt = new Date();
  await session.save();

  res.status(200).json(new ApiResponse(200, {
    sessionId: session._id,
    answer,
    sourceDocuments,
  }, 'Message processed'));
});

// GET /api/v1/chat/sessions
const getSessions = asyncHandler(async (req, res) => {
  const sessions = await ChatSession.find({
    userId:     req.user.clerkId,
    isArchived: false,
  })
  .sort('-lastMessageAt')
  .select('title lastMessageAt createdAt')
  .limit(50);

  res.status(200).json(new ApiResponse(200, sessions, 'Sessions fetched'));
});

// GET /api/v1/chat/sessions/:id
const getSessionById = asyncHandler(async (req, res) => {
  const session = await ChatSession.findOne({
    _id:    req.params.id,
    userId: req.user.clerkId,
  });
  if (!session) throw new ApiError(404, 'Session not found');

  res.status(200).json(new ApiResponse(200, session, 'Session fetched'));
});

// DELETE /api/v1/chat/sessions/:id
const deleteSession = asyncHandler(async (req, res) => {
  await ChatSession.findOneAndUpdate(
    { _id: req.params.id, userId: req.user.clerkId },
    { isArchived: true }
  );
  res.status(200).json(new ApiResponse(200, null, 'Session archived'));
});

module.exports = { sendMessage, getSessions, getSessionById, deleteSession };
```

---

## 10. Reminder Module

### Routes

```javascript
// routes/reminders.routes.js

const router        = require('express').Router();
const { requireAuth, attachUser } = require('../middleware/auth.middleware');
const remindersCtrl = require('../controllers/reminders.controller');

const auth = [requireAuth, attachUser];

router.get('/',         ...auth, remindersCtrl.getReminders);
router.post('/',        ...auth, remindersCtrl.createReminder);
router.put('/:id',      ...auth, remindersCtrl.updateReminder);
router.delete('/:id',   ...auth, remindersCtrl.deleteReminder);
router.post('/:id/snooze', ...auth, remindersCtrl.snoozeReminder);

module.exports = router;
```

### Controller (key methods)

```javascript
// controllers/reminders.controller.js

const Reminder     = require('../models/Reminder.model');
const asyncHandler = require('../utils/asyncHandler');
const { ApiResponse, ApiError } = require('../utils/ApiResponse');

// GET /api/v1/reminders
const getReminders = asyncHandler(async (req, res) => {
  const { status } = req.query; // upcoming | sent | all
  const userId = req.user.clerkId;

  const filter = { userId };
  if (status === 'upcoming') filter.isSent = false;
  if (status === 'sent')     filter.isSent = true;

  const reminders = await Reminder.find(filter)
    .populate('documentId', 'documentType documentCategory fileUrl thumbnailUrl')
    .sort('remindAt');

  res.status(200).json(new ApiResponse(200, reminders, 'Reminders fetched'));
});

// POST /api/v1/reminders (manual reminder)
const createReminder = asyncHandler(async (req, res) => {
  const { documentId, remindAt, channels, customMessage } = req.body;
  const userId = req.user.clerkId;

  const reminder = await Reminder.create({
    userId, documentId, remindAt,
    reminderType: 'custom',
    channels: channels || ['email', 'in_app'],
    customMessage,
  });

  res.status(201).json(new ApiResponse(201, reminder, 'Reminder created'));
});

// POST /api/v1/reminders/:id/snooze
const snoozeReminder = asyncHandler(async (req, res) => {
  const { days = 7 } = req.body;
  const snoozedUntil = new Date(Date.now() + days * 24 * 60 * 60 * 1000);

  const reminder = await Reminder.findOneAndUpdate(
    { _id: req.params.id, userId: req.user.clerkId },
    { isSnoozed: true, snoozedUntil, remindAt: snoozedUntil },
    { new: true }
  );
  if (!reminder) throw new ApiError(404, 'Reminder not found');

  res.status(200).json(new ApiResponse(200, reminder, `Reminder snoozed for ${days} days`));
});

module.exports = { getReminders, createReminder, snoozeReminder };
```

---

## 11. Secure Share Module

### Routes

```javascript
// routes/share.routes.js

const router      = require('express').Router();
const { requireAuth, attachUser } = require('../middleware/auth.middleware');
const shareCtrl   = require('../controllers/share.controller');
const { shareLimiter } = require('../middleware/rateLimit.middleware');

const auth = [requireAuth, attachUser];

// Authenticated routes
router.post('/',      ...auth, shareLimiter, shareCtrl.createShareLink);
router.get('/my',     ...auth, shareCtrl.getMyShareLinks);
router.delete('/:id', ...auth, shareCtrl.revokeShareLink);

// Public route — no auth required
router.get('/:token',          shareCtrl.accessSharedDocument);
router.post('/:token/verify',  shareCtrl.verifyOtp);

module.exports = router;
```

### Controller

```javascript
// controllers/share.controller.js

const ShareLink   = require('../models/ShareLink.model');
const Document    = require('../models/Document.model');
const shareSvc    = require('../services/share.service');
const asyncHandler = require('../utils/asyncHandler');
const { ApiResponse, ApiError } = require('../utils/ApiResponse');
const bcrypt = require('bcryptjs');

// POST /api/v1/share
const createShareLink = asyncHandler(async (req, res) => {
  const {
    documentId,
    expiryHours  = 24,
    allowDownload = false,
    maxViews      = null,
    isOtpProtected = false,
  } = req.body;

  // Verify document belongs to user
  const doc = await Document.findOne({
    _id: documentId, userId: req.user.clerkId, isDeleted: false,
  });
  if (!doc) throw new ApiError(404, 'Document not found');

  // Generate OTP if requested
  let otp     = null;
  let otpHash = null;
  if (isOtpProtected) {
    otp     = shareSvc.generateOTP();
    otpHash = await bcrypt.hash(otp, 10);
  }

  const expiresAt = new Date(Date.now() + expiryHours * 60 * 60 * 1000);

  const shareLink = await ShareLink.create({
    userId: req.user.clerkId,
    documentId,
    expiresAt,
    allowDownload,
    maxViews,
    isOtpProtected,
    otpHash,
    otpExpiresAt: isOtpProtected
      ? new Date(Date.now() + process.env.OTP_EXPIRY_MINUTES * 60 * 1000)
      : null,
  });

  const shareUrl = `${process.env.FRONTEND_URL}/share/${shareLink.token}`;

  res.status(201).json(new ApiResponse(201, {
    shareUrl,
    token:      shareLink.token,
    expiresAt,
    otp,         // returned once — never stored in plaintext
    isOtpProtected,
  }, 'Share link created'));
});

// GET /api/v1/share/:token  (public)
const accessSharedDocument = asyncHandler(async (req, res) => {
  const shareLink = await ShareLink.findOne({
    token:     req.params.token,
    isRevoked: false,
    expiresAt: { $gt: new Date() },
  }).populate('documentId');

  if (!shareLink) throw new ApiError(404, 'Link not found or expired');

  // Check max views
  if (shareLink.maxViews && shareLink.viewCount >= shareLink.maxViews) {
    throw new ApiError(403, 'This link has reached its maximum view limit');
  }

  // If OTP protected, return flag only — verify via /verify route
  if (shareLink.isOtpProtected) {
    return res.status(200).json(new ApiResponse(200, {
      requiresOtp: true,
      token: req.params.token,
    }, 'OTP required'));
  }

  // Log access
  shareLink.viewCount += 1;
  shareLink.accessLog.push({ accessedAt: new Date(), ipAddress: req.ip });
  await shareLink.save();

  res.status(200).json(new ApiResponse(200, {
    document:     shareLink.documentId,
    allowDownload: shareLink.allowDownload,
  }, 'Document accessed'));
});

// POST /api/v1/share/:token/verify  (public — OTP check)
const verifyOtp = asyncHandler(async (req, res) => {
  const { otp } = req.body;

  const shareLink = await ShareLink.findOne({
    token: req.params.token, isRevoked: false, expiresAt: { $gt: new Date() },
  }).populate('documentId');

  if (!shareLink) throw new ApiError(404, 'Link not found or expired');
  if (!shareLink.isOtpProtected) throw new ApiError(400, 'This link does not require OTP');

  const isValid = await bcrypt.compare(otp, shareLink.otpHash);
  if (!isValid) throw new ApiError(401, 'Invalid OTP');

  shareLink.viewCount += 1;
  shareLink.accessLog.push({ accessedAt: new Date(), ipAddress: req.ip });
  await shareLink.save();

  res.status(200).json(new ApiResponse(200, {
    document:     shareLink.documentId,
    allowDownload: shareLink.allowDownload,
  }, 'OTP verified. Document accessible'));
});

// DELETE /api/v1/share/:id
const revokeShareLink = asyncHandler(async (req, res) => {
  await ShareLink.findOneAndUpdate(
    { _id: req.params.id, userId: req.user.clerkId },
    { isRevoked: true, revokedAt: new Date() }
  );
  res.status(200).json(new ApiResponse(200, null, 'Share link revoked'));
});

module.exports = { createShareLink, accessSharedDocument, verifyOtp, revokeShareLink };
```

---

## 12. Profile Module

```javascript
// services/profile.service.js

const Document = require('../models/Document.model');

// Aggregate universal profile from all user documents
const buildUniversalProfile = async (userId) => {
  const docs = await Document.find({
    userId,
    isDeleted: false,
    processingStatus: 'done',
  }).select('documentType extractedData');

  const profile = {
    name:        null,
    dob:         null,
    gender:      null,
    address:     null,
    pincode:     null,
    nationality: null,
    idNumbers:   {},
    contact:     { phone: null, email: null },
    education:   [],
    experience:  [],
  };

  const fieldPriority = ['passport', 'aadhaar_card', 'pan_card', 'driving_licence', 'voter_id'];

  // Extract core identity fields from priority documents
  for (const docType of fieldPriority) {
    const doc = docs.find(d => d.documentType === docType);
    if (!doc) continue;
    const e = doc.extractedData;
    if (!profile.name    && e.name)    profile.name    = e.name;
    if (!profile.dob     && e.dob)     profile.dob     = e.dob;
    if (!profile.gender  && e.gender)  profile.gender  = e.gender;
    if (!profile.address && e.address) profile.address = e.address;
    if (!profile.pincode && e.pincode) profile.pincode = e.pincode;
    if (e.idNumber) profile.idNumbers[docType] = e.idNumber;
  }

  // Education
  const eduDocs = docs.filter(d =>
    ['degree_certificate', 'mark_sheet', 'school_certificate'].includes(d.documentType)
  );
  profile.education = eduDocs.map(d => ({
    type:         d.documentType,
    organization: d.extractedData.organization,
    grade:        d.extractedData.grade,
    issueDate:    d.extractedData.issueDate,
  }));

  // Experience
  const expDocs = docs.filter(d =>
    ['offer_letter', 'experience_letter', 'salary_slip'].includes(d.documentType)
  );
  profile.experience = expDocs.map(d => ({
    type:         d.documentType,
    organization: d.extractedData.organization,
    amount:       d.extractedData.amount,
    issueDate:    d.extractedData.issueDate,
  }));

  return profile;
};

module.exports = { buildUniversalProfile };
```

---

## 13. Search Module

```javascript
// services/vector.service.js

const { Pinecone } = require('@pinecone-database/pinecone');

const pc    = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
const index = pc.index(process.env.PINECONE_INDEX_NAME);

// Upsert document chunks to Pinecone
const upsertVectors = async (vectors, userId) => {
  await index.namespace(userId).upsert(vectors);
};

// Semantic search within user's namespace
const searchVectors = async (queryVector, userId, topK = 5) => {
  return await index.namespace(userId).query({
    vector:          queryVector,
    topK,
    includeMetadata: true,
  });
};

// Delete vectors for a document
const deleteVectors = async (vectorIds, userId) => {
  if (!vectorIds?.length) return;
  await index.namespace(userId).deleteMany(vectorIds);
};

// Delete all vectors for a user (account deletion)
const deleteNamespace = async (userId) => {
  await index.namespace(userId).deleteAll();
};

module.exports = { upsertVectors, searchVectors, deleteVectors, deleteNamespace };
```

---

## 14. Background Jobs

```javascript
// jobs/reminderJob.js

const cron         = require('node-cron');
const Reminder     = require('../models/Reminder.model');
const Notification = require('../models/Notification.model');
const emailSvc     = require('../services/email.service');

const startReminderJob = () => {
  // Run every hour at :00
  cron.schedule('0 * * * *', async () => {
    console.log('⏰ Running reminder job...');

    try {
      const now = new Date();

      // Find all due reminders
      const dueReminders = await Reminder.find({
        remindAt:  { $lte: now },
        isSent:    false,
        isSnoozed: false,
      }).populate('documentId', 'documentType originalName');

      for (const reminder of dueReminders) {
        try {
          // Create in-app notification
          await Notification.create({
            userId:     reminder.userId,
            type:       'expiry_reminder',
            title:      `${reminder.documentName} Expiring Soon`,
            message:    `Your ${reminder.documentName} expires in ${reminder.daysBefore} days.`,
            icon:       '⚠️',
            documentId: reminder.documentId._id,
          });

          // Send email if channel includes 'email'
          if (reminder.channels.includes('email')) {
            await emailSvc.sendReminderEmail({
              userId:       reminder.userId,
              documentName: reminder.documentName,
              expiryDate:   reminder.expiryDate,
              daysBefore:   reminder.daysBefore,
            });
          }

          // Mark as sent
          await Reminder.findByIdAndUpdate(reminder._id, {
            isSent: true,
            sentAt: new Date(),
          });

          console.log(`✅ Reminder sent for: ${reminder.documentName}`);
        } catch (err) {
          console.error(`❌ Failed to send reminder ${reminder._id}:`, err.message);
        }
      }
    } catch (err) {
      console.error('❌ Reminder job error:', err.message);
    }
  });

  console.log('✅ Reminder job scheduled');
};

module.exports = { startReminderJob };
```

---

## 15. Error Handling

```javascript
// middleware/errorHandler.middleware.js

const { ApiError } = require('../utils/ApiResponse');

const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message    = err.message    || 'Internal Server Error';

  // Mongoose Validation Error
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message    = Object.values(err.errors).map(e => e.message).join(', ');
  }

  // Mongoose Duplicate Key Error
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue)[0];
    message    = `${field} already exists`;
  }

  // Mongoose CastError (invalid ObjectId)
  if (err.name === 'CastError') {
    statusCode = 400;
    message    = `Invalid ID format`;
  }

  // Multer file size error
  if (err.code === 'LIMIT_FILE_SIZE') {
    statusCode = 400;
    message    = 'File too large. Maximum size is 50 MB.';
  }

  // JWT/Clerk errors
  if (err.message?.includes('Unauthenticated')) {
    statusCode = 401;
    message    = 'Authentication required';
  }

  console.error(`[ERROR] ${statusCode}: ${message}`);

  res.status(statusCode).json({
    success:    false,
    statusCode,
    message,
    errors:     err.errors || [],
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

module.exports = errorHandler;
```

---

## 16. Security Implementation

### Summary of Security Measures

| Threat | Mitigation |
|--------|-----------|
| Unauthorized access | Clerk JWT on every private route |
| Cross-user data access | `userId` filter on every DB query |
| File upload abuse | Multer file type + size validation |
| Brute force | express-rate-limit per route |
| XSS | helmet.js + Content-Security-Policy |
| CSRF | SameSite cookies + CORS whitelist |
| NoSQL injection | Mongoose schema + express-validator |
| Sensitive data exposure | `rawText` excluded from default queries |
| Share link abuse | OTP hash, view limits, auto-expiry TTL |
| API abuse | Strict rate limits on AI endpoints |

---

## 17. Backend Data Flow Diagrams

### Upload → AI Processing Flow

```
POST /api/v1/documents
        │
        ▼
[auth.middleware]  →  Verify Clerk JWT + attach req.user
        │
        ▼
[upload.middleware] →  Multer validates file type + size
        │
        ▼
[documents.controller.uploadDocument]
  │
  ├─ uploadToCloudinary()  →  Store file, get URL
  │
  ├─ Document.create()     →  Save record (status: pending)
  │
  └─ processDocumentAsync() [non-blocking]
          │
          ▼ (background)
     [ocr.service]
       → Google Vision / Tesseract
       → rawText extracted
          │
          ▼
     [ai.service.classifyDocument]
       → Gemini 1.5 Flash
       → documentType + category
          │
          ▼
     [ai.service.extractDocumentData]
       → Gemini 1.5 Pro
       → extractedData JSON
          │
          ▼
     [ai.service.generateEmbedding]
       → Chunk text into 500-token segments
       → Embed each chunk
          │
          ▼
     [vector.service.upsertVectors]
       → Store in Pinecone (namespace = userId)
          │
          ▼
     Document.findByIdAndUpdate()
       → Save extractedData, expiryDate, vectorIds
       → processingStatus = 'done'
          │
          ▼
     [reminder.service.createAutoReminders]
       → If expiryDate found → create 4 reminders
          │
          ▼
     [Notification created]
       → "Document processed successfully"
```

### Chat Flow

```
POST /api/v1/chat/message
        │
        ▼
[auth.middleware]  →  Verify + attach user
        │
        ▼
[aiLimiter]        →  20 req/min rate limit
        │
        ▼
[chat.controller.sendMessage]
  │
  ├─ Get/create ChatSession
  │
  ├─ ai.service.generateEmbedding(query)
  │
  ├─ vector.service.searchVectors(vector, userId)
  │    → Pinecone: top 5 relevant chunks
  │
  ├─ ai.service.generateChatAnswer(query, chunks)
  │    → Gemini 1.5 Pro: grounded answer
  │
  └─ Save messages to ChatSession
        │
        ▼
Response: { answer, sourceDocuments, sessionId }
```

---

## 🔗 Related Documentation

| Document | Purpose |
|----------|---------|
| [05_Database_Design.md](./05_Database_Design.md) | MongoDB schemas used by controllers |
| [07_API_Documentation.md](./07_API_Documentation.md) | Full API reference |
| [08_AI_Pipeline.md](./08_AI_Pipeline.md) | AI processing detail |
| [11_Testing.md](./11_Testing.md) | Backend test cases |

---

<div align="center">

*Memora AI — Every request handled. Every document secured. Every AI call grounded.*

</div>
