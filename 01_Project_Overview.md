# 📄 01 — Project Overview

> **Memora AI** | Your Digital Memory for Life
> *"Stop searching your documents. Start talking to them."*

---

## 📌 Table of Contents

| # | Section |
|---|---------|
| 1 | [What is Memora AI?](#1-what-is-memora-ai) |
| 2 | [Core Concept](#2-core-concept) |
| 3 | [Key Value Propositions](#3-key-value-propositions) |
| 4 | [How It Works — Simple View](#4-how-it-works--simple-view) |
| 5 | [Platform Capabilities](#5-platform-capabilities) |
| 6 | [Who Builds This?](#6-who-builds-this) |
| 7 | [Project Scope](#7-project-scope) |
| 8 | [What Makes This Different](#8-what-makes-this-different) |
| 9 | [Tech Summary](#9-tech-summary) |
| 10 | [Success Metrics](#10-success-metrics) |

---

## 1. What is Memora AI?

**Memora AI** is an AI-powered, secure digital document management platform.

It is designed to serve as a person's **permanent digital memory** — a single intelligent place where all important documents live, are understood, and are ready to use at any moment.

### In One Line

> Memora AI = Smart Vault + AI Assistant + Document Intelligence

### It is NOT just cloud storage.

Traditional platforms store files. Memora AI **understands** files.

| Platform Type | What It Does |
|---------------|-------------|
| Cloud Storage (Drive, Dropbox) | Stores files passively |
| **Memora AI** | Reads, understands, organizes, reminds, answers |

---

## 2. Core Concept

Every person has important documents scattered across:

```
Email  →  WhatsApp  →  Pendrive  →  Desktop  →  DigiLocker  →  Hard Disk
```

Memora AI pulls them all into **one secure, intelligent place**.

Once uploaded, documents are:

1. **Read** by AI (OCR + text extraction)
2. **Understood** (entities, dates, categories extracted)
3. **Indexed** (vector embeddings for semantic search)
4. **Organized** (auto-categorized by document type)
5. **Made conversational** (ask questions, get answers)
6. **Monitored** (deadlines and expiries tracked)

### The Transformation

```
BEFORE MEMORA AI                    AFTER MEMORA AI
--------------------                --------------------
Files scattered everywhere    →     One intelligent vault
Search by filename            →     Search by meaning
Open PDF manually             →     Ask a question
Forget deadlines              →     AI reminds you
Fill forms repeatedly         →     AI autofills for you
Share via WhatsApp unsafely   →     Share via expiring secure link
```

---

## 3. Key Value Propositions

| Value | User Benefit |
|-------|-------------|
| ⚡ Instant Retrieval | Find any document in seconds, not minutes |
| 🧠 AI Understanding | Documents are understood, not just stored |
| 🔒 Security First | Encrypted vault, no unsafe sharing |
| ⏰ Proactive Memory | AI remembers deadlines so you don't have to |
| ✍️ Zero Repetition | Autofill forms from your stored profile |
| 👨‍👩‍👧 Family Ready | Manage documents for your entire family |
| 💬 Conversational | Talk to your documents naturally |

---

## 4. How It Works — Simple View

### Step-by-Step

```
USER UPLOADS A DOCUMENT
        │
        ▼
┌───────────────────┐
│  File Ingestion   │  PDF / Image / Scan accepted
└────────┬──────────┘
         │
         ▼
┌───────────────────┐
│   OCR Engine      │  Extracts raw text from any format
└────────┬──────────┘
         │
         ▼
┌───────────────────┐
│  AI Extraction    │  Finds: Name, DOB, Expiry, Type, Number
└────────┬──────────┘
         │
         ▼
┌───────────────────┐
│  Vector Indexing  │  Embeds document for semantic search
└────────┬──────────┘
         │
         ▼
┌───────────────────┐
│  Smart Storage    │  Saved in encrypted vault, auto-categorized
└────────┬──────────┘
         │
         ▼
USER ASKS: "When does my passport expire?"
        │
        ▼
┌───────────────────┐
│  AI Chat Engine   │  Retrieves relevant documents via RAG
│  (RAG Pipeline)   │  Generates accurate, grounded answer
└────────┬──────────┘
         │
         ▼
"Your passport expires on 14 March 2027. 
 Would you like a renewal reminder?" ✅
```

---

## 5. Platform Capabilities

### 5.1 Document Intelligence

| Capability | Description |
|-----------|-------------|
| Multi-format Support | PDF, JPG, PNG, TIFF, DOCX, HEIC |
| OCR | Extracts text from scanned or image-based files |
| Entity Extraction | Pulls Name, DOB, Address, ID numbers, Dates |
| Auto-Categorization | Identifies: ID Card / Certificate / Insurance / Medical etc. |
| Expiry Detection | Reads and tracks validity dates automatically |

### 5.2 AI Conversational Search

| Capability | Description |
|-----------|-------------|
| Natural Language Q&A | Ask questions like a human |
| Semantic Search | Finds documents by meaning, not keywords |
| RAG (Retrieval Augmented Generation) | Answers are grounded in actual documents |
| Multi-document Queries | "Show all documents with my old address" |
| Context Memory | Follows up within a conversation session |

### 5.3 Smart Reminders

| Capability | Description |
|-----------|-------------|
| Expiry Alerts | Passport, Insurance, Licence, Visa, Prescription |
| Deadline Reminders | Tax dates, EMI, Scholarship deadlines |
| Custom Reminders | User-set reminders for any document |
| Push + Email Notifications | Delivered across channels |

### 5.4 Secure Sharing

| Capability | Description |
|-----------|-------------|
| Temporary Links | Auto-expire after set time (1hr / 24hr / 7 days) |
| One-time Access | Link works only once, then expires |
| Password Protection | Optional password on shared links |
| Access Logs | See who accessed what and when |

### 5.5 AI Autofill

| Capability | Description |
|-----------|-------------|
| Universal Profile | Auto-built from all uploaded documents |
| Form Filling Assistance | Pre-fill job, government, insurance forms |
| Data Export | Export profile as structured JSON / PDF |

### 5.6 Family Vault

| Capability | Description |
|-----------|-------------|
| Multiple Members | Add spouse, children, parents under one account |
| Per-member Document Sections | Clear separation per family member |
| Shared Access | Controlled visibility between family members |

---

## 6. Who Builds This?

Memora AI is being built as part of a **hackathon project** with the long-term vision of becoming a production-grade SaaS platform.

### Current Build Status

| Component | Status |
|-----------|--------|
| Project Planning | ✅ Complete |
| Architecture Design | ✅ Complete |
| UI/UX Design | 🔄 In Progress |
| Backend Development | 📅 Planned |
| AI Pipeline | 📅 Planned |
| Testing | 📅 Planned |
| Demo Build | 📅 Planned |

---

## 7. Project Scope

### In Scope (MVP — Hackathon)

- ✅ User Authentication (Sign Up / Login)
- ✅ Document Upload (PDF + Image)
- ✅ OCR & Text Extraction
- ✅ AI Information Extraction
- ✅ Conversational Chat (RAG-based)
- ✅ Document List & Preview
- ✅ Expiry Reminders
- ✅ Secure Temporary Sharing
- ✅ Basic Universal Profile

### Out of Scope (MVP)

- ❌ Mobile App (Future Phase)
- ❌ Voice Interface (Future Phase)
- ❌ Government API Integration (Future Phase)
- ❌ Full Family Vault (Future Phase)
- ❌ AI Autofill Browser Extension (Future Phase)

---

## 8. What Makes This Different

### Competitive Differentiation

```
Feature                  DigiLocker  Google Drive  Notion  Memora AI
──────────────────────── ─────────── ──────────── ─────── ─────────
AI Document Understanding     ✗           ✗          ✗        ✅
Conversational Search         ✗           ✗          ✗        ✅
Expiry Reminders              ✗           ✗          ✗        ✅
Secure Temporary Sharing      ✗           ✗          ✗        ✅
AI Autofill                   ✗           ✗          ✗        ✅
Family Management             ✗           ✗          ✗        ✅
Semantic Search               ✗           ✗          ~        ✅
Universal Profile             ✗           ✗          ✗        ✅
```

---

## 9. Tech Summary

| Layer | Technology |
|-------|------------|
| **Frontend** | React · Tailwind CSS · React Router · Framer Motion |
| **Backend** | Node.js · Express.js |
| **Database** | MongoDB |
| **Authentication** | Clerk / Firebase |
| **Storage (MVP)** | Cloudinary |
| **Storage (Production)** | AWS S3 |
| **AI** | Gemini API · OpenAI API |
| **OCR** | Google Vision API · Tesseract OCR |
| **Vector Search** | Pinecone |

> Full details → [04_System_Architecture.md](./04_System_Architecture.md)

---

## 10. Success Metrics

### Hackathon Demo Goals

| Metric | Target |
|--------|--------|
| Upload a document | < 5 seconds |
| OCR + Extraction | < 10 seconds |
| AI Chat Response | < 3 seconds |
| Accuracy of extraction | > 90% on standard documents |
| UI wow factor | Judges impressed at first glance |

### Long-term KPIs (Post-Hackathon)

| Metric | Target |
|--------|--------|
| Monthly Active Users | 10,000+ in Year 1 |
| Documents Processed | 1M+ |
| Average Time to Find a Document | < 5 seconds |
| User Retention (30-day) | > 60% |

---

## 🔗 Related Documentation

| Document | Purpose |
|----------|---------|
| [README.md](./README.md) | Project introduction & overview |
| [02_User_Workflow.md](./02_User_Workflow.md) | Detailed user journeys |
| [03_UI_UX_Design.md](./03_UI_UX_Design.md) | Design system |
| [04_System_Architecture.md](./04_System_Architecture.md) | Full system architecture |
| [08_AI_Pipeline.md](./08_AI_Pipeline.md) | AI/ML pipeline detail |

---

<div align="center">

*Memora AI — Because your time is worth more than a search bar.*

</div>
