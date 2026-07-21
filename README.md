# 🧠 Memora AI — Digital Memory & Document Intelligence Platform

> **Upload once. Never search again.**  
> Memora AI is an intelligent document management platform powered by Node.js, Express, React 19, MongoDB, and Google Gemini AI.

---

## 🌟 Key Features

- 📄 **7-Stage AI Document Pipeline**: OCR → Classification → Metadata Extraction → Universal Profile → Vector Embeddings → RAG Chat → Reminders.
- 💬 **Conversational RAG Chat**: Ask natural questions grounded in your document vault (*"When does my passport expire?"*).
- 🔍 **Semantic Search**: Search by meaning rather than filenames (*"Identity proof"* finds Passports, PANs, Aadhaar, Licenses).
- 👤 **Universal Profile**: Automatically aggregates identity, education, medical, and financial data into a single digital profile.
- 📄 **Resume AI**: One-click ATS-optimized resume generator built from your verified certificates and employment records.
- 📝 **AI Form Autofill**: Scans application forms, matches fields against your Universal Profile, and exports filled forms.
- 🔒 **Secure OTP Sharing**: Generate auto-expiring, password/OTP-protected download links.
- 🛡️ **AI Redaction**: Automatically mask sensitive identifiers (PAN, Aadhaar, Phone, Address) for privacy compliance.
- ⏰ **Smart Reminders**: Automated cron engine triggering priority alerts before Passports, Licenses, or Insurance policies expire.
- 🛡️ **Admin Portal**: System control panel for user management, document auditing, and platform metrics.

---

## 🏗️ Architecture

```
[ React 19 Frontend ]  ── (HTTP / REST API / v1) ──>  [ Node.js + Express Backend ]
   - Vite + Tailwind v4                                   - Layered Repositories
   - Framer Motion                                        - Tiered Rate Limiters
   - Lucide React Icons                                   - Winston Logger
                                                          - Cron Reminder Engine
                                                                 │
                                          ┌──────────────────────┼──────────────────────┐
                                          ▼                      ▼                      ▼
                                    MongoDB Atlas            Cloudinary            Gemini 1.5 AI
                                  (13 Collections)        (File Storage)       (RAG & Extraction)
```

---

## 🚀 Quick Start (Local Development)

### 1. Start Backend API
```bash
cd backend
npm install
npm run dev
```
*Backend runs on `http://localhost:5000` (starts auto in-memory MongoDB if no URI is set).*

### 2. Start Frontend Web App
```bash
cd frontend
npm install
npm run dev
```
*Frontend runs on `http://localhost:3001` (or `http://localhost:3000`).*

### 3. Run Automated Test Suite
```bash
cd backend
npm test
```
*Runs 13 Jest test cases & AI evaluation benchmark suite.*

---

## 🐳 Docker Deployment

```bash
# Run entire full-stack application with Docker Compose
docker-compose up --build
```
- Frontend: `http://localhost:3000`
- Backend: `http://localhost:5000`
- MongoDB: `mongodb://localhost:27017`

---

## 📡 API Documentation & Versioning

Base URL: `http://localhost:5000/api/v1`

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/auth/register` | `POST` | Register account |
| `/auth/login` | `POST` | Login & receive JWT |
| `/documents/upload` | `POST` | Upload file to AI pipeline |
| `/documents` | `GET` | List vault documents / search |
| `/ai/status/:id` | `GET` | Processing pipeline stage status |
| `/ai/redact` | `POST` | Redact sensitive identifiers |
| `/chat/message` | `POST` | RAG conversational Q&A |
| `/search` | `POST` | Vector semantic search |
| `/reminders` | `GET`/`POST` | Reminder management |
| `/profile` | `GET`/`PUT` | Universal profile data |
| `/resume` | `POST` | Generate ATS resume |
| `/autofill/analyze`| `POST` | Analyze application form |
| `/dashboard` | `GET` | Aggregated dashboard stats |
| `/admin/dashboard` | `GET` | Admin metrics & management |

---

## 📜 License & Author

- **Author**: Memora AI Engineering Team
- **Version**: 1.0.0
- **Status**: Production Ready & Verified
