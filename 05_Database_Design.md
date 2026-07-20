# 📄 05 — Database Design

> **Memora AI** | MongoDB Schema Design, Collections, Indexes & Data Flow
> *One flexible database. Every document. Every user.*

---

## 📌 Table of Contents

| # | Section |
|---|---------|
| 1 | [Database Overview](#1-database-overview) |
| 2 | [Database Architecture Decision](#2-database-architecture-decision) |
| 3 | [Collection Index](#3-collection-index) |
| 4 | [Collection: Users](#4-collection-users) |
| 5 | [Collection: Documents](#5-collection-documents) |
| 6 | [Collection: Reminders](#6-collection-reminders) |
| 7 | [Collection: Share Links](#7-collection-share-links) |
| 8 | [Collection: Chat Sessions](#8-collection-chat-sessions) |
| 9 | [Collection: Family Members](#9-collection-family-members) |
| 10 | [Collection: Notifications](#10-collection-notifications) |
| 11 | [Pinecone Vector Index Design](#11-pinecone-vector-index-design) |
| 12 | [Collection Relationships](#12-collection-relationships) |
| 13 | [Indexes & Query Optimization](#13-indexes--query-optimization) |
| 14 | [Data Validation Rules](#14-data-validation-rules) |
| 15 | [Data Lifecycle & Retention](#15-data-lifecycle--retention) |
| 16 | [Sample Documents](#16-sample-documents) |

---

## 1. Database Overview

Memora AI uses **two databases** working together:

| Database | Role | Technology |
|----------|------|-----------|
| **MongoDB Atlas** | Primary database — all app data | MongoDB 7.x + Mongoose 8.x |
| **Pinecone** | Vector database — semantic search | Pinecone Serverless |

### Why MongoDB?

| Reason | Explanation |
|--------|-------------|
| **Flexible Schema** | Each document type (Passport, PAN, Insurance) has different extracted fields — a rigid SQL schema would require dozens of columns or complex joins |
| **Nested Objects** | Extracted data, messages, and metadata fit naturally as nested JSON |
| **Scalability** | MongoDB Atlas scales horizontally with sharding |
| **Developer Speed** | Mongoose ODM + JavaScript = fast full-stack development |
| **Real-world fit** | Document database for a document management platform 🎯 |

---

## 2. Database Architecture Decision

```
MONGODB ATLAS
─────────────────────────────────────────────────────────
Database Name: memora_db

Collections:
  users             → User accounts & preferences
  documents         → Uploaded files + AI-extracted data
  reminders         → Expiry alerts & custom reminders
  share_links       → Temporary secure share tokens
  chat_sessions     → AI chat history
  family_members    → Family vault member profiles
  notifications     → In-app notification log

─────────────────────────────────────────────────────────

PINECONE
─────────────────────────────────────────────────────────
Index Name: memora-documents
Dimensions: 768 (Gemini) or 1536 (OpenAI)
Metric:     cosine
Namespaces: one per user_id (strict data isolation)
```

---

## 3. Collection Index

| Collection | Documents Stored | Estimated Size (MVP) |
|------------|-----------------|----------------------|
| `users` | 1 per user | ~1 KB each |
| `documents` | 10–100 per user | ~50 KB each (metadata only) |
| `reminders` | 4 per document with expiry | ~2 KB each |
| `share_links` | Variable | ~1 KB each |
| `chat_sessions` | 1+ per user | ~10 KB each (grows with messages) |
| `family_members` | 0–10 per user | ~2 KB each |
| `notifications` | Variable | ~500 bytes each |

---

## 4. Collection: Users

### Purpose
Stores user account information, preferences, and plan details.

### Mongoose Schema

```javascript
// models/User.model.js

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    // Auth Identity
    clerkId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    // Personal Info
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
      default: null,
    },
    country: {
      type: String,
      default: 'India',
    },

    // Plan & Subscription
    plan: {
      type: String,
      enum: ['free', 'pro', 'family', 'business'],
      default: 'free',
    },
    storageUsedBytes: {
      type: Number,
      default: 0,
    },
    storageLimitBytes: {
      type: Number,
      default: 524288000, // 500 MB free tier
    },

    // Preferences
    notificationsEnabled: {
      type: Boolean,
      default: true,
    },
    emailNotifications: {
      type: Boolean,
      default: true,
    },
    pushNotifications: {
      type: Boolean,
      default: true,
    },
    theme: {
      type: String,
      enum: ['dark', 'light'],
      default: 'dark',
    },

    // Onboarding
    profileType: {
      type: String,
      enum: ['student', 'professional', 'family', 'senior', 'business'],
      default: null,
    },
    onboardingComplete: {
      type: Boolean,
      default: false,
    },

    // Status
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLoginAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true, // adds createdAt and updatedAt automatically
  }
);

module.exports = mongoose.model('User', userSchema);
```

### Sample Document

```json
{
  "_id": "64f1a2b3c4d5e6f7a8b9c0d1",
  "clerkId": "user_2abc123def456",
  "name": "Rahul Sharma",
  "email": "rahul@gmail.com",
  "phone": "+91 98765 43210",
  "country": "India",
  "plan": "free",
  "storageUsedBytes": 15728640,
  "storageLimitBytes": 524288000,
  "notificationsEnabled": true,
  "emailNotifications": true,
  "pushNotifications": false,
  "theme": "dark",
  "profileType": "professional",
  "onboardingComplete": true,
  "isActive": true,
  "lastLoginAt": "2025-07-19T16:30:00.000Z",
  "createdAt": "2025-01-14T10:00:00.000Z",
  "updatedAt": "2025-07-19T16:30:00.000Z"
}
```

---

## 5. Collection: Documents

### Purpose
Stores metadata, AI-extracted information, and file references for every uploaded document.

### Mongoose Schema

```javascript
// models/Document.model.js

const mongoose = require('mongoose');

// Sub-schema for extracted fields
const extractedDataSchema = new mongoose.Schema(
  {
    name:         { type: String, default: null },
    dob:          { type: String, default: null },  // "YYYY-MM-DD"
    gender:       { type: String, default: null },
    fatherName:   { type: String, default: null },
    address:      { type: String, default: null },
    pincode:      { type: String, default: null },
    idNumber:     { type: String, default: null },  // Aadhaar / PAN / Passport No.
    issueDate:    { type: String, default: null },  // "YYYY-MM-DD"
    expiryDate:   { type: String, default: null },  // "YYYY-MM-DD"
    issuer:       { type: String, default: null },
    nationality:  { type: String, default: null },
    placeOfBirth: { type: String, default: null },
    organization: { type: String, default: null },  // For certificates / salary slips
    grade:        { type: String, default: null },  // For mark sheets
    amount:       { type: String, default: null },  // For financial docs
    extra:        { type: Map, of: String },        // Catch-all for unique fields
  },
  { _id: false }
);

const documentSchema = new mongoose.Schema(
  {
    // Ownership
    userId: {
      type: String,
      required: true,
      index: true,
    },
    familyMemberId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'FamilyMember',
      default: null,
    },

    // File Info
    originalName: {
      type: String,
      required: true,
    },
    fileType: {
      type: String,
      enum: ['pdf', 'jpg', 'jpeg', 'png', 'heic', 'tiff', 'docx'],
      required: true,
    },
    fileSizeBytes: {
      type: Number,
      required: true,
    },
    fileUrl: {
      type: String,       // Cloudinary URL (MVP) / S3 Key (Production)
      required: true,
    },
    thumbnailUrl: {
      type: String,
      default: null,
    },

    // AI Classification
    documentCategory: {
      type: String,
      enum: [
        'identity',
        'education',
        'professional',
        'medical',
        'financial',
        'property',
        'vehicle',
        'legal',
        'other',
      ],
      default: 'other',
    },
    documentType: {
      type: String,
      enum: [
        'aadhaar_card',
        'pan_card',
        'passport',
        'driving_licence',
        'voter_id',
        'degree_certificate',
        'mark_sheet',
        'school_certificate',
        'offer_letter',
        'experience_letter',
        'salary_slip',
        'insurance_policy',
        'medical_report',
        'prescription',
        'bank_statement',
        'income_tax_return',
        'property_document',
        'vehicle_registration',
        'gst_certificate',
        'birth_certificate',
        'marriage_certificate',
        'other',
      ],
      default: 'other',
    },

    // AI Extracted Data
    extractedData: {
      type: extractedDataSchema,
      default: {},
    },
    rawText: {
      type: String,
      default: null,       // OCR output, used for re-embedding
      select: false,       // Not returned by default (large field)
    },
    confidenceScore: {
      type: Number,        // 0.0 to 1.0 — overall AI confidence
      default: null,
    },

    // Processing
    processingStatus: {
      type: String,
      enum: ['pending', 'processing', 'done', 'failed'],
      default: 'pending',
    },
    processingError: {
      type: String,
      default: null,
    },
    isAiVerified: {
      type: Boolean,
      default: false,
    },

    // Important Dates
    expiryDate: {
      type: Date,
      default: null,
      index: true,         // For expiry queries
    },
    issueDate: {
      type: Date,
      default: null,
    },

    // Pinecone
    vectorIds: {
      type: [String],      // Pinecone vector IDs for this document's chunks
      default: [],
    },

    // User Customization
    tags: {
      type: [String],
      default: [],
    },
    notes: {
      type: String,
      default: null,
    },
    isFavorite: {
      type: Boolean,
      default: false,
    },

    // Soft Delete
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date,
      default: null,
    },

    processedAt: { type: Date, default: null },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Document', documentSchema);
```

### Sample Document

```json
{
  "_id": "64f2b3c4d5e6f7a8b9c0d2e3",
  "userId": "user_2abc123def456",
  "familyMemberId": null,
  "originalName": "passport_scan.pdf",
  "fileType": "pdf",
  "fileSizeBytes": 2097152,
  "fileUrl": "https://res.cloudinary.com/memora/raw/upload/v1/memora/user_2abc123def456/passport_scan.pdf",
  "thumbnailUrl": "https://res.cloudinary.com/memora/image/upload/v1/memora/user_2abc123def456/passport_thumb.jpg",
  "documentCategory": "identity",
  "documentType": "passport",
  "extractedData": {
    "name": "Rahul Sharma",
    "dob": "1995-01-12",
    "gender": "Male",
    "idNumber": "A1234567",
    "issueDate": "2017-03-14",
    "expiryDate": "2027-03-14",
    "issuer": "Passport Seva Kendra, Pune",
    "nationality": "Indian",
    "placeOfBirth": "Pune, Maharashtra"
  },
  "confidenceScore": 0.97,
  "processingStatus": "done",
  "processingError": null,
  "isAiVerified": true,
  "expiryDate": "2027-03-14T00:00:00.000Z",
  "issueDate": "2017-03-14T00:00:00.000Z",
  "vectorIds": ["vec_passport_chunk_1", "vec_passport_chunk_2"],
  "tags": ["travel", "id"],
  "notes": null,
  "isFavorite": true,
  "isDeleted": false,
  "deletedAt": null,
  "processedAt": "2025-01-14T10:05:00.000Z",
  "createdAt": "2025-01-14T10:00:00.000Z",
  "updatedAt": "2025-01-14T10:05:00.000Z"
}
```

---

## 6. Collection: Reminders

### Purpose
Stores expiry alerts and custom reminders, scheduled for delivery via email or push.

### Mongoose Schema

```javascript
// models/Reminder.model.js

const mongoose = require('mongoose');

const reminderSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    documentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Document',
      required: true,
    },

    // What to remind about
    documentName:  { type: String, required: true },
    documentType:  { type: String, required: true },
    expiryDate:    { type: Date,   default: null },

    // When to remind
    remindAt:      { type: Date,   required: true, index: true },
    daysBefore:    { type: Number, default: null }, // 90 | 30 | 7 | 0 | custom
    reminderType:  {
      type: String,
      enum: ['auto_expiry', 'custom'],
      default: 'auto_expiry',
    },

    // Delivery
    channels: {
      type: [String],
      enum: ['email', 'push', 'in_app'],
      default: ['email', 'in_app'],
    },
    isSent:      { type: Boolean, default: false },
    sentAt:      { type: Date,    default: null },
    isSnoozed:   { type: Boolean, default: false },
    snoozedUntil:{ type: Date,    default: null },

    // Custom reminder message
    customMessage: { type: String, default: null },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Reminder', reminderSchema);
```

### Sample Documents (Auto-created for Passport)

```json
[
  {
    "_id": "64f3c4d5e6f7a8b9c0d3e4f5",
    "userId": "user_2abc123def456",
    "documentId": "64f2b3c4d5e6f7a8b9c0d2e3",
    "documentName": "Passport",
    "documentType": "passport",
    "expiryDate": "2027-03-14T00:00:00.000Z",
    "remindAt": "2026-12-14T08:00:00.000Z",
    "daysBefore": 90,
    "reminderType": "auto_expiry",
    "channels": ["email", "in_app"],
    "isSent": false,
    "sentAt": null,
    "isSnoozed": false
  },
  {
    "remindAt": "2027-02-12T08:00:00.000Z",
    "daysBefore": 30,
    "isSent": false
  },
  {
    "remindAt": "2027-03-07T08:00:00.000Z",
    "daysBefore": 7,
    "isSent": false
  },
  {
    "remindAt": "2027-03-14T08:00:00.000Z",
    "daysBefore": 0,
    "isSent": false
  }
]
```

---

## 7. Collection: Share Links

### Purpose
Manages temporary, OTP-protected secure document sharing links.

### Mongoose Schema

```javascript
// models/ShareLink.model.js

const mongoose = require('mongoose');
const crypto   = require('crypto');

const shareLinkSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    documentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Document',
      required: true,
    },

    // Token
    token: {
      type: String,
      required: true,
      unique: true,
      default: () => crypto.randomBytes(32).toString('hex'),
    },

    // Expiry
    expiresAt: {
      type: Date,
      required: true,
      index: true,     // TTL index for auto-cleanup
    },

    // Access Control
    allowDownload:   { type: Boolean, default: false },
    maxViews:        { type: Number,  default: null },  // null = unlimited
    viewCount:       { type: Number,  default: 0 },

    // OTP Protection
    isOtpProtected:  { type: Boolean, default: false },
    otpHash:         { type: String,  default: null }, // bcrypt hash of OTP
    otpExpiresAt:    { type: Date,    default: null },

    // Access Log
    accessLog: [
      {
        accessedAt:  { type: Date },
        ipAddress:   { type: String },
        userAgent:   { type: String },
      },
    ],

    // Status
    isRevoked:   { type: Boolean, default: false },
    revokedAt:   { type: Date,    default: null },
  },
  {
    timestamps: true,
  }
);

// Auto-delete expired links using MongoDB TTL index
shareLinkSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('ShareLink', shareLinkSchema);
```

### Sample Document

```json
{
  "_id": "64f4d5e6f7a8b9c0d4e5f6a7",
  "userId": "user_2abc123def456",
  "documentId": "64f2b3c4d5e6f7a8b9c0d2e3",
  "token": "a3f9b2e1c8d7f6a5b4c3d2e1f0a9b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4e3f2",
  "expiresAt": "2025-07-20T22:00:00.000Z",
  "allowDownload": false,
  "maxViews": 1,
  "viewCount": 0,
  "isOtpProtected": true,
  "otpHash": "$2b$10$hashedOTPvalue",
  "otpExpiresAt": "2025-07-19T23:00:00.000Z",
  "accessLog": [],
  "isRevoked": false,
  "revokedAt": null,
  "createdAt": "2025-07-19T22:00:00.000Z"
}
```

---

## 8. Collection: Chat Sessions

### Purpose
Stores AI chat history — sessions with messages — for every user.

### Mongoose Schema

```javascript
// models/ChatSession.model.js

const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      enum: ['user', 'assistant'],
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    // Documents used as RAG context for this response
    sourceDocuments: [
      {
        documentId:   { type: mongoose.Schema.Types.ObjectId, ref: 'Document' },
        documentName: { type: String },
        documentType: { type: String },
      },
    ],
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true }
);

const chatSessionSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    title: {
      type: String,
      default: 'New Chat',
    },
    messages: {
      type: [messageSchema],
      default: [],
    },
    isArchived: {
      type: Boolean,
      default: false,
    },
    lastMessageAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('ChatSession', chatSessionSchema);
```

### Sample Document

```json
{
  "_id": "64f5e6f7a8b9c0d5e6f7a8b9",
  "userId": "user_2abc123def456",
  "title": "Passport expiry query",
  "messages": [
    {
      "_id": "64f5e6f7a8b9c0d5e6f7aaaa",
      "role": "user",
      "content": "When does my passport expire?",
      "sourceDocuments": [],
      "createdAt": "2025-07-19T16:00:00.000Z"
    },
    {
      "_id": "64f5e6f7a8b9c0d5e6f7bbbb",
      "role": "assistant",
      "content": "Your Passport expires on 14 March 2027. That is 245 days from now. Would you like me to set a renewal reminder?",
      "sourceDocuments": [
        {
          "documentId": "64f2b3c4d5e6f7a8b9c0d2e3",
          "documentName": "passport_scan.pdf",
          "documentType": "passport"
        }
      ],
      "createdAt": "2025-07-19T16:00:03.000Z"
    }
  ],
  "isArchived": false,
  "lastMessageAt": "2025-07-19T16:00:03.000Z",
  "createdAt": "2025-07-19T16:00:00.000Z",
  "updatedAt": "2025-07-19T16:00:03.000Z"
}
```

---

## 9. Collection: Family Members

### Purpose
Stores profiles of family members whose documents are managed by the account owner.

### Mongoose Schema

```javascript
// models/FamilyMember.model.js

const mongoose = require('mongoose');

const familyMemberSchema = new mongoose.Schema(
  {
    ownerId: {
      type: String,
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    relationship: {
      type: String,
      enum: [
        'spouse', 'child', 'parent', 'sibling',
        'grandparent', 'in_law', 'other',
      ],
      required: true,
    },
    dob: {
      type: Date,
      default: null,
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other'],
      default: null,
    },
    avatarColor: {
      type: String,
      default: '#7C6FF7', // Used for UI avatar
    },
    documentCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('FamilyMember', familyMemberSchema);
```

---

## 10. Collection: Notifications

### Purpose
Stores in-app notification history for the notification bell/panel.

### Mongoose Schema

```javascript
// models/Notification.model.js

const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: [
        'document_processed',    // AI done processing
        'expiry_reminder',       // Document expiring soon
        'share_accessed',        // Someone accessed shared link
        'share_expired',         // Shared link expired
        'system',                // Platform announcements
      ],
      required: true,
    },
    title:   { type: String, required: true },
    message: { type: String, required: true },
    icon:    { type: String, default: null }, // emoji or icon name

    // Reference
    documentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Document',
      default: null,
    },

    isRead:  { type: Boolean, default: false },
    readAt:  { type: Date,    default: null },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Notification', notificationSchema);
```

### Sample Document

```json
{
  "_id": "64f6f7a8b9c0d6e7f8a9b0c1",
  "userId": "user_2abc123def456",
  "type": "expiry_reminder",
  "title": "Passport Expiring Soon",
  "message": "Your Passport expires in 30 days on 14 March 2027.",
  "icon": "⚠️",
  "documentId": "64f2b3c4d5e6f7a8b9c0d2e3",
  "isRead": false,
  "readAt": null,
  "createdAt": "2025-07-19T08:00:00.000Z"
}
```

---

## 11. Pinecone Vector Index Design

### Index Configuration

```
Index Name : memora-documents
Dimensions : 768  (Gemini text-embedding-004)
             or
             1536 (OpenAI text-embedding-3-small)
Metric     : cosine
Cloud      : AWS
Region     : us-east-1
```

### Namespace Strategy

```
Each user gets their own namespace:
  namespace = user_2abc123def456

This ensures:
  ✅ Complete data isolation between users
  ✅ Efficient per-user search (no cross-user contamination)
  ✅ Easy cleanup when user deletes account
```

### Vector Metadata Structure

```javascript
// Each vector upserted to Pinecone:
{
  id: "doc_64f2b3c4_chunk_0",       // documentId + chunk index
  values: [0.023, -0.441, ...],      // 768-dim embedding
  metadata: {
    userId:       "user_2abc123def456",
    documentId:   "64f2b3c4d5e6f7a8b9c0d2e3",
    documentType: "passport",
    category:     "identity",
    chunkIndex:   0,
    chunkText:    "Rahul Sharma passport number A1234567 expiry 2027...",
    fileName:     "passport_scan.pdf",
    expiryDate:   "2027-03-14",
  }
}
```

### Query Example

```javascript
// Search for "passport expiry" in user's namespace
const results = await pineconeIndex.namespace(userId).query({
  vector: queryEmbedding,
  topK: 5,
  includeMetadata: true,
});
```

---

## 12. Collection Relationships

```
users
  │
  ├──< documents (userId)
  │       │
  │       ├──< reminders (documentId)
  │       ├──< share_links (documentId)
  │       └──── [vectors in Pinecone] (documentId)
  │
  ├──< chat_sessions (userId)
  │       │
  │       └──< messages (embedded array)
  │               │
  │               └──< sourceDocuments (documentId ref)
  │
  ├──< family_members (ownerId)
  │       │
  │       └──< documents (familyMemberId)
  │
  └──< notifications (userId)
```

### Relationship Summary

| From | To | Type | Field |
|------|----|------|-------|
| `users` | `documents` | One-to-Many | `documents.userId` |
| `users` | `reminders` | One-to-Many | `reminders.userId` |
| `users` | `share_links` | One-to-Many | `share_links.userId` |
| `users` | `chat_sessions` | One-to-Many | `chat_sessions.userId` |
| `users` | `family_members` | One-to-Many | `family_members.ownerId` |
| `documents` | `reminders` | One-to-Many | `reminders.documentId` |
| `documents` | `share_links` | One-to-Many | `share_links.documentId` |
| `family_members` | `documents` | One-to-Many | `documents.familyMemberId` |

---

## 13. Indexes & Query Optimization

### Critical Indexes

```javascript
// Users
userSchema.index({ clerkId: 1 });        // Lookup by Clerk ID on every request
userSchema.index({ email: 1 });          // Unique email lookup

// Documents
documentSchema.index({ userId: 1 });               // All docs for a user
documentSchema.index({ userId: 1, documentType: 1 }); // Filter by type
documentSchema.index({ userId: 1, documentCategory: 1 }); // Filter by category
documentSchema.index({ expiryDate: 1 });            // Expiry queries
documentSchema.index({ userId: 1, isDeleted: 1 }); // Exclude soft-deleted
documentSchema.index({ processingStatus: 1 });      // Processing queue

// Reminders
reminderSchema.index({ userId: 1 });
reminderSchema.index({ remindAt: 1, isSent: 1 });  // Cron job query

// Share Links
shareLinkSchema.index({ token: 1 });               // Public link lookup
shareLinkSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL auto-delete

// Chat Sessions
chatSessionSchema.index({ userId: 1, lastMessageAt: -1 }); // Recent chats

// Notifications
notificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });
```

### Common Queries & Index Usage

| Query | Index Used |
|-------|-----------|
| Get all documents for user | `{ userId: 1 }` |
| Get identity documents | `{ userId: 1, documentCategory: 1 }` |
| Get expiring documents | `{ expiryDate: 1 }` |
| Pending reminders (cron) | `{ remindAt: 1, isSent: 1 }` |
| Validate share link | `{ token: 1 }` |
| Recent chat sessions | `{ userId: 1, lastMessageAt: -1 }` |
| Unread notifications | `{ userId: 1, isRead: 1, createdAt: -1 }` |

---

## 14. Data Validation Rules

### Documents Collection

| Field | Rule |
|-------|------|
| `userId` | Required, non-empty string |
| `fileType` | Must be in allowed enum list |
| `fileSizeBytes` | Max 52,428,800 (50 MB) |
| `documentCategory` | Must be in allowed enum |
| `documentType` | Must be in allowed enum |
| `expiryDate` | Must be a valid future date (if set) |
| `processingStatus` | Must be in allowed enum |
| `confidenceScore` | 0.0 – 1.0 |

### Share Links Collection

| Field | Rule |
|-------|------|
| `expiresAt` | Must be in the future |
| `maxViews` | Positive integer or null |
| `viewCount` | Cannot exceed `maxViews` |
| `token` | 64-char hex string, unique |

### Reminders Collection

| Field | Rule |
|-------|------|
| `remindAt` | Must be in the future |
| `channels` | At least one channel required |
| `daysBefore` | 0–365 |

---

## 15. Data Lifecycle & Retention

### Document Lifecycle

```
UPLOADED
   │
   ▼
PROCESSING (AI running)
   │
   ▼
DONE (active in vault)
   │
   ▼ (user deletes)
SOFT DELETED (isDeleted = true, 30-day grace period)
   │
   ▼ (after 30 days)
HARD DELETED (removed from MongoDB + Cloudinary/S3 + Pinecone)
```

### Automatic Cleanup Jobs

| Job | Schedule | Action |
|-----|----------|--------|
| Expired share links | MongoDB TTL index (instant) | Auto-deleted by MongoDB |
| Soft-deleted documents | Daily cron | Hard delete after 30 days |
| Sent reminders | Weekly cron | Archive reminders older than 90 days |
| Old chat sessions | Monthly cron | Archive sessions older than 6 months |
| Failed processing docs | Daily cron | Retry or mark as failed after 3 attempts |

### DPDP / GDPR Compliance

```
On account deletion request:
  1. Soft delete all documents
  2. Delete Pinecone vectors (by namespace)
  3. Delete Cloudinary / S3 files
  4. Anonymize user record (keep aggregate stats)
  5. Complete within 30 days
```

---

## 16. Sample Documents

### Complete User + Documents Snapshot

```javascript
// USER
{
  clerkId: "user_2abc123def456",
  name: "Rahul Sharma",
  email: "rahul@gmail.com",
  plan: "free",
  profileType: "professional"
}

// DOCUMENTS (abbreviated)
[
  { documentType: "passport",        expiryDate: "2027-03-14", isAiVerified: true  },
  { documentType: "aadhaar_card",    expiryDate: null,         isAiVerified: true  },
  { documentType: "pan_card",        expiryDate: null,         isAiVerified: true  },
  { documentType: "driving_licence", expiryDate: "2025-08-22", isAiVerified: true  },
  { documentType: "salary_slip",     expiryDate: null,         isAiVerified: true  },
  { documentType: "degree_certificate", expiryDate: null,      isAiVerified: true  },
]

// REMINDERS (for driving_licence — expires in 34 days)
[
  { daysBefore: 7,  remindAt: "2025-08-15", isSent: false },
  { daysBefore: 0,  remindAt: "2025-08-22", isSent: false },
]

// NOTIFICATIONS (recent)
[
  { type: "expiry_reminder", title: "Driving Licence Expiring",
    message: "Expires in 34 days", isRead: false },
  { type: "document_processed", title: "Salary Slip Processed",
    message: "AI has extracted your salary details", isRead: true },
]
```

---

## 🔗 Related Documentation

| Document | Purpose |
|----------|---------|
| [04_System_Architecture.md](./04_System_Architecture.md) | System design overview |
| [06_Backend_Architecture.md](./06_Backend_Architecture.md) | How backend uses these schemas |
| [07_API_Documentation.md](./07_API_Documentation.md) | API endpoints that query these collections |
| [08_AI_Pipeline.md](./08_AI_Pipeline.md) | How AI data is stored and retrieved |

---

<div align="center">

*Memora AI — Every document understood. Every field captured. Every deadline remembered.*

</div>
