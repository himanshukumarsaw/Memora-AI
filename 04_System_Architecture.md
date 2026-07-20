# 📄 04 — System Architecture

> **Memora AI** | Complete System Design, Architecture Diagrams & Technical Decisions
> *Built to scale from hackathon to production.*

---

## 📌 Table of Contents

| # | Section |
|---|---------|
| 1 | [Architecture Overview](#1-architecture-overview) |
| 2 | [High-Level System Diagram](#2-high-level-system-diagram) |
| 3 | [Architecture Style](#3-architecture-style) |
| 4 | [Frontend Architecture](#4-frontend-architecture) |
| 5 | [Backend Architecture](#5-backend-architecture) |
| 6 | [AI / ML Pipeline Architecture](#6-ai--ml-pipeline-architecture) |
| 7 | [Database Architecture](#7-database-architecture) |
| 8 | [Storage Architecture](#8-storage-architecture) |
| 9 | [Authentication & Security Architecture](#9-authentication--security-architecture) |
| 10 | [Notification System](#10-notification-system) |
| 11 | [API Design & Communication](#11-api-design--communication) |
| 12 | [Caching Layer](#12-caching-layer) |
| 13 | [Technology Stack — Full](#13-technology-stack--full) |
| 14 | [Environment Architecture](#14-environment-architecture) |
| 15 | [Scalability Plan](#15-scalability-plan) |
| 16 | [Architecture Decision Log](#16-architecture-decision-log) |

---

## 1. Architecture Overview

Memora AI is built as a **cloud-native, AI-first platform** with a clear separation of concerns across five major layers:

```
+----------------------------------------------------------+
|              LAYER 5 — CLIENT                            |
|         React Web App (Vite / CRA)                       |
+----------------------------------------------------------+
                         |  HTTPS / REST
+----------------------------------------------------------+
|              LAYER 4 — API LAYER                         |
|        Node.js + Express.js (REST API)                   |
|        Auth Middleware (Clerk / Firebase)                 |
+------+------------------+-------------------+-----------+
       |                  |                   |
+------+------+   +-------+-------+   +-------+--------+
|  LAYER 3    |   |   LAYER 3     |   |   LAYER 3      |
|  Document   |   |  AI Service   |   |  Notification  |
|  Service    |   |  (Gemini /    |   |  Service       |
|             |   |   OpenAI)     |   |                |
+------+------+   +-------+-------+   +-------+--------+
       |                  |                   |
+----------------------------------------------------------+
|              LAYER 2 — DATA LAYER                        |
|        MongoDB  ·  Pinecone  ·  Redis (optional)         |
+----------------------------------------------------------+
                         |
+----------------------------------------------------------+
|              LAYER 1 — STORAGE                           |
|        Cloudinary (MVP)  ·  AWS S3 (Production)          |
+----------------------------------------------------------+
```

---

## 2. High-Level System Diagram

```
                    +---------------------+
                    |  USER (Browser)     |
                    +----------+----------+
                               | HTTPS
                    +----------v----------+
                    |   React Frontend    |
                    |   (Vercel/Netlify)  |
                    +----------+----------+
                               | REST API
                    +----------v----------+
                    |  Node.js + Express  |
                    |    API Server       |
                    +---+-------+-----+---+
                        |       |     |
            +-----------+  +----+  +--+-----------+
            |              |        |              |
   +--------v-----+  +-----v---+  +-v-----------+ |
   | Auth Service |  |  AI     |  | Notification| |
   | Clerk/       |  | Service |  | Service     | |
   | Firebase     |  | Gemini/ |  | Email/Push  | |
   +--------------+  | OpenAI  |  +-------------+ |
                     +----+----+                   |
                          |                        |
            +-------------+-----------+            |
            |                         |            |
   +--------v--------+   +------------v---+        |
   |    MongoDB       |   |   Pinecone     |        |
   |  (documents,     |   |  (vector       |        |
   |   users, meta)   |   |   embeddings)  |        |
   +-----------------+    +----------------+        |
                                                    |
                          +-------------------------v--+
                          |   Cloudinary / AWS S3      |
                          |   (File Storage)            |
                          +----------------------------+
```

---

## 3. Architecture Style

### Pattern: Modular Monolith → Microservices-Ready

For the **MVP (Hackathon)**, we use a **Modular Monolith** approach:

- Single Node.js + Express server with clearly separated route modules
- Easy to develop, test, and deploy fast
- Each module designed to be extracted as a microservice later

### Service Modules (within Express)

| Module | Responsibility |
|--------|---------------|
| `auth` | User registration, login, JWT/Clerk sessions |
| `documents` | Upload, storage, retrieval, CRUD |
| `ai` | OCR processing, extraction, embeddings, chat |
| `reminders` | Expiry tracking, notification scheduling |
| `share` | Temporary link generation, access control |
| `profile` | Universal profile management |
| `search` | Semantic search via Pinecone |

---

## 4. Frontend Architecture

### 4.1 Technology

```
Framework    : React 18 (SPA)
Language     : JavaScript / JSX
Routing      : React Router v6
Styling      : Tailwind CSS
Animations   : Framer Motion
HTTP Client  : Axios
Forms        : React Hook Form
Icons        : Lucide React / React Icons
PDF Viewer   : react-pdf
Build Tool   : Vite
```

### 4.2 Frontend Folder Structure

```
src/
├── pages/                        ← Route-level pages
│   ├── Landing.jsx               ← Public landing page
│   ├── Login.jsx
│   ├── Signup.jsx
│   ├── Dashboard.jsx
│   ├── Vault.jsx
│   ├── DocumentDetail.jsx
│   ├── Chat.jsx
│   ├── Reminders.jsx
│   ├── Profile.jsx
│   └── ShareView.jsx             ← Public share viewer
│
├── components/
│   ├── ui/                       ← Base design system
│   │   ├── Button.jsx
│   │   ├── Input.jsx
│   │   ├── Card.jsx
│   │   ├── Modal.jsx
│   │   └── Toast.jsx
│   ├── document/
│   │   ├── DocumentCard.jsx
│   │   ├── DocumentGrid.jsx
│   │   ├── DocumentViewer.jsx
│   │   └── UploadModal.jsx
│   ├── chat/
│   │   ├── ChatWindow.jsx
│   │   ├── ChatBubble.jsx
│   │   └── ChatInput.jsx
│   └── layout/
│       ├── Sidebar.jsx
│       ├── TopBar.jsx
│       └── MobileNav.jsx
│
├── hooks/                        ← Custom React hooks
│   ├── useDocuments.js
│   ├── useChat.js
│   ├── useReminders.js
│   └── useProfile.js
│
├── context/                      ← React Context (global state)
│   ├── AuthContext.jsx
│   └── DocumentContext.jsx
│
├── lib/
│   ├── api.js                    ← Axios instance + interceptors
│   └── utils.js
│
└── assets/
    ├── icons/
    └── images/
```

### 4.3 Data Flow — Frontend

```
User Action
     |
     v
React Component
     |
     v
Custom Hook (useDocuments / useChat)
     |
     v
Axios API Call → Express Backend
     |
     v
Response → useState / Context update → Re-render
```

---

## 5. Backend Architecture

### 5.1 Technology

```
Runtime      : Node.js 20 LTS
Framework    : Express.js 4.x
Language     : JavaScript (ES2023)
Auth         : Clerk SDK / Firebase Admin SDK
ODM          : Mongoose 8.x
File Upload  : Multer
Task Queue   : Node-cron / BullMQ
Email        : NodeMailer / SendGrid
Validation   : express-validator / Joi
Testing      : Jest + Supertest
```

### 5.2 Backend Folder Structure

```
backend/
├── server.js                     ← Express app entry point
├── config/
│   ├── db.js                     ← MongoDB connection
│   ├── cloudinary.js             ← Cloudinary config
│   └── env.js                    ← Environment variables
│
├── routes/
│   ├── auth.routes.js
│   ├── documents.routes.js
│   ├── chat.routes.js
│   ├── reminders.routes.js
│   ├── share.routes.js
│   └── profile.routes.js
│
├── controllers/
│   ├── auth.controller.js
│   ├── documents.controller.js
│   ├── chat.controller.js
│   ├── reminders.controller.js
│   └── share.controller.js
│
├── services/
│   ├── ai.service.js             ← Gemini / OpenAI calls
│   ├── ocr.service.js            ← Google Vision / Tesseract
│   ├── vector.service.js         ← Pinecone operations
│   ├── reminder.service.js       ← Expiry logic
│   └── share.service.js          ← Link generation
│
├── models/                       ← Mongoose schemas
│   ├── User.model.js
│   ├── Document.model.js
│   ├── Reminder.model.js
│   └── ShareLink.model.js
│
├── middleware/
│   ├── auth.middleware.js         ← Clerk / Firebase verify
│   ├── upload.middleware.js       ← Multer config
│   └── errorHandler.js
│
├── jobs/
│   └── reminderJob.js            ← Node-cron scheduler
│
└── utils/
    ├── generateToken.js
    └── formatResponse.js
```

### 5.3 Request Lifecycle

```
HTTP Request
     |
     v
Express Router
     |
     v
Middleware (Auth verify → User inject → Rate limit)
     |
     v
Controller (documents.controller.js)
     |
     v
Service Layer (ai.service.js / documents logic)
     |
     +-------------------------------------+
     v                                     v
MongoDB Operation                   Background Job
(Mongoose async)                    (OCR + AI processing)
     |                                     |
     v                                     v
Response (JSON)                    Pinecone index update
     |
     v
HTTP Response → Client
```

---

## 6. AI / ML Pipeline Architecture

### 6.1 Document Processing Pipeline

```
DOCUMENT UPLOADED BY USER
        |
        v
+-----------------------------------------------+
|  Step 1: File Ingestion                       |
|  Multer receives file (PDF / Image)           |
|  Temporary storage on server / Cloudinary     |
+----------------------+------------------------+
                       |
                       v
+-----------------------------------------------+
|  Step 2: OCR                                  |
|  • PDF text layer → pdfparse / pdf-lib        |
|  • Scanned PDF / Image → Google Vision API    |
|  • Fallback → Tesseract OCR                   |
|  → Output: raw_text (string)                  |
+----------------------+------------------------+
                       |
                       v
+-----------------------------------------------+
|  Step 3: AI Classification + Extraction       |
|  Prompt → Gemini API (primary)                |
|  Classify:                                    |
|    Aadhaar / Passport / PAN / Degree /        |
|    Insurance / Salary Slip / Medical / Other  |
|  Extract JSON:                                |
|  {                                            |
|    "document_type": "passport",               |
|    "name": "Rahul Sharma",                    |
|    "dob": "1995-01-12",                       |
|    "id_number": "A1234567",                   |
|    "issue_date": "2017-03-14",                |
|    "expiry_date": "2027-03-14",               |
|    "issuer": "Govt. of India"                 |
|  }                                            |
+----------------------+------------------------+
                       |
                       v
+-----------------------------------------------+
|  Step 4: Chunking + Embedding                 |
|  • Split text into chunks (500 tokens each)   |
|  • Generate vector embeddings via             |
|    Gemini Embeddings / OpenAI Embeddings      |
|  • Upsert vectors into Pinecone               |
|    (namespace = user_id for isolation)        |
+----------------------+------------------------+
                       |
                       v
+-----------------------------------------------+
|  Step 5: Persist to MongoDB                   |
|  • Document metadata saved                    |
|  • Extracted fields saved                     |
|  • Cloudinary URL stored                      |
+----------------------+------------------------+
                       |
                       v
+-----------------------------------------------+
|  Step 6: Post-Processing                      |
|  • Auto-create expiry reminders               |
|  • Update Universal Profile                   |
|  • Send "processing complete" notification    |
+-----------------------------------------------+
        |
        v
PROCESSING COMPLETE ✅
```

### 6.2 RAG Chat Pipeline

```
USER QUERY: "When does my passport expire?"
       |
       v
+----------------------------------------------+
|  Step 1: Query Embedding                     |
|  query_vector = embed(query)                 |
+-------------------+--------------------------+
                    |
                    v
+----------------------------------------------+
|  Step 2: Pinecone Vector Search              |
|  • Filter by namespace = user_id             |
|  • Return top-5 relevant chunks              |
+-------------------+--------------------------+
                    |
                    v
+----------------------------------------------+
|  Step 3: Context Assembly                    |
|  Combine retrieved chunks + metadata         |
+-------------------+--------------------------+
                    |
                    v
+----------------------------------------------+
|  Step 4: LLM Generation (Gemini API)         |
|  System: "Answer ONLY from the provided      |
|   document context. Never hallucinate."      |
|  Context: [retrieved chunks]                 |
|  Query: user question                        |
+-------------------+--------------------------+
                    |
                    v
+----------------------------------------------+
|  Step 5: Response                            |
|  Answer + source document reference          |
|  + Suggested actions                         |
+----------------------------------------------+
       |
       v
"Your Passport expires on 14 March 2027.
 That is 245 days from now.
 [Set Reminder] [View Document]" ✅
```

### 6.3 AI Model Strategy

| Task | Model | Why |
|------|-------|-----|
| OCR (image/scan) | Google Vision API | Best accuracy for Indian ID docs |
| OCR (PDF text) | pdfparse / pdf-lib | Direct text layer extraction |
| Classification + Extraction | Gemini 1.5 Flash | Fast, cheap, accurate |
| Embeddings | Gemini Embedding / text-embedding-3-small | Vector search |
| Chat (RAG) | Gemini 1.5 Pro / GPT-4o | Best reasoning |
| Fallback | OpenAI GPT-4o | If Gemini quota exceeded |

---

## 7. Database Architecture

### 7.1 Database Strategy

| Database | Purpose | Why |
|----------|---------|-----|
| **MongoDB** | All app data: users, documents, reminders, chat | Flexible schema for varied document types |
| **Pinecone** | Vector embeddings for semantic search | Purpose-built vector DB, fast nearest-neighbor |

### 7.2 MongoDB Collections (Mongoose Schemas)

```javascript
// Users Collection
{
  _id: ObjectId,
  clerkId: String,            // Clerk / Firebase UID
  email: String,
  name: String,
  phone: String,
  plan: String,               // free | pro
  createdAt: Date
}

// Documents Collection
{
  _id: ObjectId,
  userId: String,             // Clerk UID
  fileName: String,
  fileUrl: String,            // Cloudinary / S3 URL
  fileType: String,           // pdf | jpg | png
  documentCategory: String,   // identity | education | medical...
  documentType: String,       // aadhaar | passport | pan...
  extractedData: {
    name: String,
    dob: String,
    idNumber: String,
    issueDate: String,
    expiryDate: String,
    issuer: String,
    address: String,
  },
  rawText: String,
  processingStatus: String,   // pending | processing | done | failed
  isAiVerified: Boolean,
  uploadedAt: Date,
  processedAt: Date
}

// Reminders Collection
{
  _id: ObjectId,
  userId: String,
  documentId: ObjectId,
  documentName: String,
  expiryDate: Date,
  remindAt: Date,
  daysBefore: Number,         // 90 | 30 | 7 | 0
  channel: [String],          // ['email', 'push']
  isSent: Boolean,
  createdAt: Date
}

// Share Links Collection
{
  _id: ObjectId,
  documentId: ObjectId,
  userId: String,
  token: String,              // unique random token
  expiresAt: Date,
  maxViews: Number,           // null = unlimited
  viewCount: Number,
  otp: String,                // hashed OTP if protected
  allowDownload: Boolean,
  createdAt: Date
}

// Chat Sessions Collection
{
  _id: ObjectId,
  userId: String,
  title: String,
  messages: [
    {
      role: String,           // user | assistant
      content: String,
      sourceDocs: [ObjectId],
      createdAt: Date
    }
  ],
  createdAt: Date
}
```

---

## 8. Storage Architecture

### 8.1 MVP — Cloudinary

```
User uploads file
       |
       v
Multer receives file (buffer in memory)
       |
       v
Upload to Cloudinary (raw file delivery)
  folder: memora/{userId}/documents/
       |
       v
Cloudinary URL stored in MongoDB document
       |
       v
Frontend fetches via Cloudinary URL
(access controlled via signed URLs)
```

### 8.2 Production — AWS S3

```
User uploads file
       |
       v
Backend generates presigned upload URL (S3)
       |
       v
Frontend uploads directly to S3 (PUT request)
       |
       v
S3 key stored in MongoDB
       |
       v
Frontend requests view → Backend generates
presigned read URL (15 min TTL)
       |
       v
URL expires → secure
```

### 8.3 Storage Tiers (Production)

| Tier | Storage | Use Case |
|------|---------|----------|
| **Hot** | S3 Standard | Recently uploaded, frequently accessed |
| **Warm** | S3 Infrequent Access | Older docs, accessed rarely |
| **Cold** | S3 Glacier | Archive, > 1 year old |

---

## 9. Authentication & Security Architecture

### 9.1 Auth Flow (Clerk)

```
User visits app
       |
       v
Clerk-hosted login UI or embedded component
       |
       v
User authenticates (email/password, Google, etc.)
       |
       v
Clerk issues session JWT
       |
       v
Frontend sends JWT in every API request:
  Authorization: Bearer <clerk_jwt>
       |
       v
Backend middleware verifies JWT via Clerk SDK
       |
       v
User identity injected into req.user
       |
       v
All DB queries filtered by req.user.id
```

### 9.2 Security Layers

| Layer | Mechanism |
|-------|-----------|
| **Transport** | HTTPS / TLS 1.3 everywhere |
| **Auth** | Clerk / Firebase JWT verification |
| **File Access** | Cloudinary signed URLs / S3 presigned URLs |
| **User Isolation** | Every DB query filtered by userId |
| **Rate Limiting** | express-rate-limit (100 req/min/user) |
| **Input Validation** | express-validator on all inputs |
| **NoSQL Injection** | Mongoose sanitization |
| **XSS** | Helmet.js CSP headers |
| **CORS** | Strict origin whitelist |
| **OTP Sharing** | bcrypt-hashed OTP for shared document access |

---

## 10. Notification System

### 10.1 Reminder Job Architecture

```
Node-cron Job (runs every hour)
       |
       v
Query MongoDB:
  reminders WHERE remindAt <= NOW AND isSent = false
       |
       v
For each due reminder:
  +-------------------------------------------+
  |  Send Email (NodeMailer / SendGrid)        |
  |  "Your Passport expires in 30 days"        |
  +-------------------------------------------+
  |  (Future) Push Notification (Firebase FCM) |
  +-------------------------------------------+
       |
       v
Mark reminder isSent = true
```

### 10.2 Auto-Reminder Creation

```javascript
// Called after AI extracts expiryDate from document
function createAutoReminders(userId, documentId, expiryDate) {
  const intervals = [90, 30, 7, 0]; // days before expiry
  intervals.forEach(daysBefore => {
    const remindAt = subtractDays(expiryDate, daysBefore);
    if (remindAt > new Date()) {
      Reminder.create({ userId, documentId, remindAt, daysBefore });
    }
  });
}
```

---

## 11. API Design & Communication

### 11.1 API Design

```
Protocol    : REST
Base URL    : /api/v1/
Format      : JSON
Auth Header : Authorization: Bearer <clerk_jwt>
```

### 11.2 Core Endpoints

```
POST   /api/v1/auth/register
POST   /api/v1/auth/login
GET    /api/v1/auth/me

POST   /api/v1/documents/upload
GET    /api/v1/documents/
GET    /api/v1/documents/:id
DELETE /api/v1/documents/:id

POST   /api/v1/chat/message
GET    /api/v1/chat/sessions
GET    /api/v1/chat/sessions/:id

GET    /api/v1/reminders/
POST   /api/v1/reminders/
DELETE /api/v1/reminders/:id

POST   /api/v1/share/
GET    /api/v1/share/:token        ← public, no auth required
DELETE /api/v1/share/:id

GET    /api/v1/profile/
PUT    /api/v1/profile/

GET    /api/v1/search?q=query
```

> Full API reference → [07_API_Documentation.md](./07_API_Documentation.md)

---

## 12. Caching Layer

### 12.1 MVP — In-memory / No-cache

For hackathon MVP, caching is minimal. MongoDB queries serve directly.

### 12.2 Production — Redis (Optional Phase 2)

| Cache Key | TTL | Purpose |
|-----------|-----|---------|
| `user:{id}:profile` | 5 min | Universal profile cache |
| `user:{id}:documents` | 2 min | Document list cache |
| `share:{token}` | Till expiry | Share link validation |
| `rate:{ip}` | 1 min | Rate limiting counter |

---

## 13. Technology Stack — Full

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| **Frontend Framework** | React | 18.x | SPA UI |
| **Routing** | React Router | 6.x | Client-side routing |
| **Styling** | Tailwind CSS | 3.x | Utility CSS |
| **Animations** | Framer Motion | 10.x | Micro-animations |
| **Backend Runtime** | Node.js | 20 LTS | JavaScript runtime |
| **Backend Framework** | Express.js | 4.x | REST API server |
| **Database** | MongoDB | 7.x | Document data store |
| **ODM** | Mongoose | 8.x | MongoDB schema + queries |
| **Authentication** | Clerk / Firebase | latest | User auth + sessions |
| **Storage (MVP)** | Cloudinary | latest | File upload + delivery |
| **Storage (Prod)** | AWS S3 | latest | Scalable file storage |
| **AI (Primary LLM)** | Gemini 1.5 Pro/Flash | latest | Chat + extraction |
| **AI (Fallback)** | OpenAI GPT-4o | latest | Fallback LLM |
| **OCR (Image)** | Google Vision API | v1 | Image text extraction |
| **OCR (PDF)** | Tesseract OCR | 4.x | Open-source PDF OCR |
| **Vector Search** | Pinecone | latest | Semantic document search |
| **Reminder Jobs** | Node-cron | latest | Scheduled reminder tasks |
| **Email** | NodeMailer / SendGrid | latest | Notification emails |
| **Push (Future)** | Firebase FCM | latest | Push notifications |
| **CI/CD** | GitHub Actions | latest | Automated pipeline |
| **Monitoring** | Sentry | latest | Error tracking |

---

## 14. Environment Architecture

### 14.1 Environments

| Env | Purpose | URL |
|-----|---------|-----|
| **Development** | Local dev | localhost:3000 (FE) / localhost:5000 (BE) |
| **Staging** | Testing + QA | staging.memora.ai |
| **Production** | Live users | app.memora.ai |

### 14.2 Infrastructure Diagram

```
PRODUCTION
--------------------------------------------------
  React App (Vercel / Netlify — global CDN)
       |
  Node.js + Express API (Railway / Render / EC2)
       |
  +------------------------------------------+
  |  MongoDB Atlas (M0 free → M10 production) |
  |  Pinecone (Starter → Production pod)      |
  +------------------------------------------+
       |
  Cloudinary (MVP file storage)
  AWS S3 (production file storage)
       |
  Clerk (authentication platform)
       |
  Gemini API + OpenAI API (AI processing)
  Google Vision API (OCR)
       |
  SendGrid / NodeMailer (email notifications)
```

---

## 15. Scalability Plan

### 15.1 MVP (Hackathon) — Minimal Setup

```
1 Vercel deployment (React frontend)
1 Railway / Render instance (Express backend)
1 MongoDB Atlas M0 (free tier)
1 Pinecone Starter index (free tier)
1 Cloudinary account (free tier)
Clerk free tier (10,000 MAU)
```

### 15.2 Growth Phase — Horizontal Scale

```
Frontend : Vercel (auto-scales globally)
Backend  : Railway / EC2 with load balancer (2–10 instances)
Database : MongoDB Atlas M10 with read replicas
Vector   : Pinecone p1 production pod
Storage  : AWS S3 with CloudFront CDN
Workers  : BullMQ + Redis for background job queue
```

### 15.3 Scale Targets

| Metric | MVP Target | Production Target |
|--------|-----------|-------------------|
| Concurrent users | 10–50 | 10,000+ |
| Documents stored | 1,000 | 10M+ |
| API response time | < 500ms | < 200ms |
| AI processing time | < 30 sec | < 10 sec |
| Chat response time | < 5 sec | < 2 sec |
| Uptime | 95% | 99.9% |

---

## 16. Architecture Decision Log

| Decision | Choice | Reason | Alternatives Considered |
|----------|--------|--------|------------------------|
| Backend language | Node.js | JS full-stack consistency with React frontend | Python/FastAPI |
| Frontend framework | React | Largest ecosystem, fastest dev | Next.js, Vue |
| Primary LLM | Gemini API | Google ecosystem, generous free tier for hackathon | OpenAI only |
| Vector DB | Pinecone | Managed, reliable, easy API | pgvector, Weaviate |
| Primary DB | MongoDB | Flexible schema for varied doc types | PostgreSQL |
| File storage (MVP) | Cloudinary | Zero-config, free tier, fast | AWS S3 |
| File storage (prod) | AWS S3 | Industry standard, reliable | Cloudflare R2 |
| Auth | Clerk | Best DX, pre-built UI components | Firebase, custom JWT |
| OCR | Google Vision + Tesseract | Best accuracy for Indian documents | AWS Textract |
| Reminder scheduling | Node-cron | Simple, no extra infra needed | Celery, BullMQ |

---

## 🔗 Related Documentation

| Document | Purpose |
|----------|---------|
| [05_Database_Design.md](./05_Database_Design.md) | Detailed MongoDB schema |
| [06_Backend_Architecture.md](./06_Backend_Architecture.md) | Express routes + services detail |
| [07_API_Documentation.md](./07_API_Documentation.md) | Full API reference |
| [08_AI_Pipeline.md](./08_AI_Pipeline.md) | AI pipeline deep-dive |
| [10_Deployment.md](./10_Deployment.md) | Deployment guide |

---

<div align="center">

*Memora AI — Engineered for intelligence, built for scale.*

</div>
