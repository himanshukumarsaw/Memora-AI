# 📄 07 — API Documentation

> **Memora AI** | Complete REST API Reference
> *Every endpoint. Every request. Every response.*

---

## 📌 Table of Contents

| # | Section |
|---|---------|
| 1 | [API Overview](#1-api-overview) |
| 2 | [Authentication](#2-authentication) |
| 3 | [Response Format](#3-response-format) |
| 4 | [Error Codes](#4-error-codes) |
| 5 | [Auth Endpoints](#5-auth-endpoints) |
| 6 | [Document Endpoints](#6-document-endpoints) |
| 7 | [AI Chat Endpoints](#7-ai-chat-endpoints) |
| 8 | [Reminder Endpoints](#8-reminder-endpoints) |
| 9 | [Share Link Endpoints](#9-share-link-endpoints) |
| 10 | [Profile Endpoints](#10-profile-endpoints) |
| 11 | [Search Endpoints](#11-search-endpoints) |
| 12 | [Notification Endpoints](#12-notification-endpoints) |
| 13 | [Family Endpoints](#13-family-endpoints) |
| 14 | [Rate Limits](#14-rate-limits) |
| 15 | [Postman Collection](#15-postman-collection) |

---

## 1. API Overview

```
Base URL      : https://api.memora.ai/api/v1
               (Development: http://localhost:5000/api/v1)

Protocol      : HTTPS (REST)
Format        : JSON (application/json)
Auth          : Bearer Token (Clerk JWT)
Versioning    : URL path (/api/v1/)
```

### Endpoint Summary

| Module | Prefix | # Endpoints |
|--------|--------|-------------|
| Auth | `/auth` | 3 |
| Documents | `/documents` | 7 |
| AI Chat | `/chat` | 4 |
| Reminders | `/reminders` | 5 |
| Share Links | `/share` | 5 |
| Profile | `/profile` | 3 |
| Search | `/search` | 2 |
| Notifications | `/notifications` | 3 |
| Family | `/family` | 4 |
| **Total** | | **36** |

---

## 2. Authentication

All private endpoints require a **Clerk JWT** passed as a Bearer token.

```
Authorization: Bearer <clerk_session_token>
```

### How to get the token (Frontend)

```javascript
// Using Clerk React SDK
import { useAuth } from '@clerk/clerk-react';

const { getToken } = useAuth();
const token = await getToken();

// Attach to every request
axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
```

### Public Endpoints (No Auth Required)

| Endpoint | Description |
|----------|-------------|
| `GET /share/:token` | View shared document |
| `POST /share/:token/verify` | Verify OTP for shared document |
| `GET /health` | Server health check |

---

## 3. Response Format

All responses follow a consistent structure:

### Success Response

```json
{
  "statusCode": 200,
  "success":    true,
  "message":    "Documents fetched",
  "data":       { ... }
}
```

### Error Response

```json
{
  "statusCode": 404,
  "success":    false,
  "message":    "Document not found",
  "errors":     []
}
```

### Paginated Response

```json
{
  "statusCode": 200,
  "success":    true,
  "message":    "Documents fetched",
  "data": {
    "docs":  [ ... ],
    "total": 42,
    "page":  1,
    "limit": 20
  }
}
```

---

## 4. Error Codes

| HTTP Code | Meaning | Common Causes |
|-----------|---------|---------------|
| `200` | OK | Successful GET / PUT |
| `201` | Created | Successful POST |
| `400` | Bad Request | Missing fields, invalid format |
| `401` | Unauthorized | Missing or invalid JWT |
| `403` | Forbidden | Access to another user's resource |
| `404` | Not Found | Resource doesn't exist |
| `409` | Conflict | Duplicate resource (email already exists) |
| `413` | Payload Too Large | File > 50 MB |
| `422` | Unprocessable | Validation failed |
| `429` | Too Many Requests | Rate limit exceeded |
| `500` | Internal Error | Server / AI / DB error |

---

## 5. Auth Endpoints

---

### `POST /auth/sync`

Sync Clerk user to MongoDB after first login. Call this once on registration.

**Auth:** Required

**Request Body:**

```json
{
  "name":  "Rahul Sharma",
  "email": "rahul@gmail.com",
  "phone": "+91 98765 43210"
}
```

**Response `200`:**

```json
{
  "statusCode": 200,
  "success":    true,
  "message":    "User synced",
  "data": {
    "_id":                 "64f1a2b3c4d5e6f7a8b9c0d1",
    "clerkId":             "user_2abc123def456",
    "name":                "Rahul Sharma",
    "email":               "rahul@gmail.com",
    "phone":               "+91 98765 43210",
    "plan":                "free",
    "onboardingComplete":  false,
    "createdAt":           "2025-07-19T16:30:00.000Z"
  }
}
```

---

### `GET /auth/me`

Get the current authenticated user's profile.

**Auth:** Required

**Response `200`:**

```json
{
  "statusCode": 200,
  "success":    true,
  "message":    "User fetched",
  "data": {
    "_id":                 "64f1a2b3c4d5e6f7a8b9c0d1",
    "clerkId":             "user_2abc123def456",
    "name":                "Rahul Sharma",
    "email":               "rahul@gmail.com",
    "plan":                "free",
    "storageUsedBytes":    15728640,
    "storageLimitBytes":   524288000,
    "theme":               "dark",
    "profileType":         "professional",
    "onboardingComplete":  true
  }
}
```

---

### `PUT /auth/preferences`

Update user preferences and complete onboarding.

**Auth:** Required

**Request Body:**

```json
{
  "theme":               "dark",
  "emailNotifications":  true,
  "pushNotifications":   false,
  "profileType":         "professional"
}
```

**Response `200`:**

```json
{
  "statusCode": 200,
  "success":    true,
  "message":    "Preferences updated",
  "data":       { ...updated user object }
}
```

---

## 6. Document Endpoints

---

### `POST /documents`

Upload a new document. Triggers AI processing automatically.

**Auth:** Required
**Content-Type:** `multipart/form-data`

**Form Fields:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `file` | File | ✅ | PDF, JPG, PNG, HEIC, TIFF, DOCX |
| `tags` | String | ❌ | Comma-separated tags |
| `notes` | String | ❌ | Optional user note |
| `familyMemberId` | String | ❌ | ObjectId of family member |

**Response `201`:**

```json
{
  "statusCode": 201,
  "success":    true,
  "message":    "Document uploaded. AI processing started.",
  "data": {
    "_id":               "64f2b3c4d5e6f7a8b9c0d2e3",
    "userId":            "user_2abc123def456",
    "originalName":      "passport_scan.pdf",
    "fileType":          "pdf",
    "fileSizeBytes":     2097152,
    "fileUrl":           "https://res.cloudinary.com/memora/...",
    "processingStatus":  "pending",
    "isAiVerified":      false,
    "createdAt":         "2025-07-19T16:00:00.000Z"
  }
}
```

---

### `GET /documents`

Get all documents for the authenticated user.

**Auth:** Required

**Query Parameters:**

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `category` | String | — | Filter by category (`identity`, `education`, etc.) |
| `type` | String | — | Filter by document type (`passport`, `pan_card`, etc.) |
| `status` | String | — | Filter by processing status (`done`, `pending`, `failed`) |
| `sort` | String | `-createdAt` | Sort field (`-createdAt`, `expiryDate`, `originalName`) |
| `page` | Number | `1` | Page number |
| `limit` | Number | `20` | Results per page |

**Response `200`:**

```json
{
  "statusCode": 200,
  "success":    true,
  "message":    "Documents fetched",
  "data": {
    "docs": [
      {
        "_id":               "64f2b3c4d5e6f7a8b9c0d2e3",
        "originalName":      "passport_scan.pdf",
        "documentCategory":  "identity",
        "documentType":      "passport",
        "extractedData": {
          "name":       "Rahul Sharma",
          "idNumber":   "A1234567",
          "expiryDate": "2027-03-14"
        },
        "processingStatus": "done",
        "isAiVerified":     true,
        "expiryDate":       "2027-03-14T00:00:00.000Z",
        "isFavorite":       true,
        "thumbnailUrl":     "https://res.cloudinary.com/memora/...",
        "createdAt":        "2025-01-14T10:00:00.000Z"
      }
    ],
    "total": 42,
    "page":  1,
    "limit": 20
  }
}
```

---

### `GET /documents/:id`

Get a single document by ID.

**Auth:** Required
**Path Params:** `id` — Document ObjectId

**Response `200`:**

```json
{
  "statusCode": 200,
  "success":    true,
  "message":    "Document fetched",
  "data": {
    "_id":               "64f2b3c4d5e6f7a8b9c0d2e3",
    "originalName":      "passport_scan.pdf",
    "fileType":          "pdf",
    "fileSizeBytes":     2097152,
    "fileUrl":           "https://res.cloudinary.com/memora/...",
    "documentCategory":  "identity",
    "documentType":      "passport",
    "extractedData": {
      "name":        "Rahul Sharma",
      "dob":         "1995-01-12",
      "gender":      "Male",
      "idNumber":    "A1234567",
      "issueDate":   "2017-03-14",
      "expiryDate":  "2027-03-14",
      "issuer":      "Passport Seva Kendra, Pune",
      "nationality": "Indian"
    },
    "confidenceScore":  0.97,
    "processingStatus": "done",
    "isAiVerified":     true,
    "expiryDate":       "2027-03-14T00:00:00.000Z",
    "tags":             ["travel", "id"],
    "notes":            null,
    "isFavorite":       true,
    "createdAt":        "2025-01-14T10:00:00.000Z",
    "processedAt":      "2025-01-14T10:05:00.000Z"
  }
}
```

**Error `404`:**

```json
{
  "statusCode": 404,
  "success":    false,
  "message":    "Document not found"
}
```

---

### `GET /documents/:id/url`

Get the file URL for rendering (Cloudinary URL / S3 presigned URL).

**Auth:** Required

**Response `200`:**

```json
{
  "statusCode": 200,
  "success":    true,
  "message":    "URL generated",
  "data": {
    "url":       "https://res.cloudinary.com/memora/raw/upload/...",
    "expiresAt": null
  }
}
```

---

### `PUT /documents/:id`

Update document metadata (tags, notes, type override).

**Auth:** Required

**Request Body:**

```json
{
  "tags":              ["travel", "important"],
  "notes":             "Renewed in 2017",
  "documentType":      "passport",
  "documentCategory":  "identity"
}
```

**Response `200`:**

```json
{
  "statusCode": 200,
  "success":    true,
  "message":    "Document updated",
  "data":       { ...updated document }
}
```

---

### `PUT /documents/:id/favorite`

Toggle the favorite status of a document.

**Auth:** Required

**Response `200`:**

```json
{
  "statusCode": 200,
  "success":    true,
  "message":    "Document added to favorites",
  "data":       { ...updated document, "isFavorite": true }
}
```

---

### `DELETE /documents/:id`

Soft delete a document (30-day grace period before permanent deletion).

**Auth:** Required

**Response `200`:**

```json
{
  "statusCode": 200,
  "success":    true,
  "message":    "Document deleted",
  "data":       null
}
```

---

## 7. AI Chat Endpoints

---

### `POST /chat/message`

Send a message to Memora AI. Performs RAG search over user's documents.

**Auth:** Required
**Rate Limit:** 20 req/min

**Request Body:**

```json
{
  "sessionId": "64f5e6f7a8b9c0d5e6f7a8b9",
  "message":   "When does my passport expire?"
}
```

> `sessionId` is optional. If omitted, a new session is created automatically.

**Response `200`:**

```json
{
  "statusCode": 200,
  "success":    true,
  "message":    "Message processed",
  "data": {
    "sessionId": "64f5e6f7a8b9c0d5e6f7a8b9",
    "answer":    "Your Passport expires on 14 March 2027. That is 245 days from now. Would you like me to set a renewal reminder?",
    "sourceDocuments": [
      {
        "documentId":   "64f2b3c4d5e6f7a8b9c0d2e3",
        "documentName": "passport_scan.pdf",
        "documentType": "passport"
      }
    ]
  }
}
```

**Example Queries:**

```
"Show my PAN card number"
"What is my Aadhaar number?"
"Find all documents expiring this year"
"What is my address as per my Aadhaar?"
"List my educational qualifications"
"What documents do I have for travel?"
```

---

### `GET /chat/sessions`

Get all chat sessions for the user.

**Auth:** Required

**Response `200`:**

```json
{
  "statusCode": 200,
  "success":    true,
  "message":    "Sessions fetched",
  "data": [
    {
      "_id":           "64f5e6f7a8b9c0d5e6f7a8b9",
      "title":         "When does my passport expire?",
      "lastMessageAt": "2025-07-19T16:00:03.000Z",
      "createdAt":     "2025-07-19T16:00:00.000Z"
    }
  ]
}
```

---

### `GET /chat/sessions/:id`

Get full message history for a specific session.

**Auth:** Required

**Response `200`:**

```json
{
  "statusCode": 200,
  "success":    true,
  "message":    "Session fetched",
  "data": {
    "_id":   "64f5e6f7a8b9c0d5e6f7a8b9",
    "title": "When does my passport expire?",
    "messages": [
      {
        "_id":             "64f5...aaaa",
        "role":            "user",
        "content":         "When does my passport expire?",
        "sourceDocuments": [],
        "createdAt":       "2025-07-19T16:00:00.000Z"
      },
      {
        "_id":    "64f5...bbbb",
        "role":   "assistant",
        "content": "Your Passport expires on 14 March 2027...",
        "sourceDocuments": [
          {
            "documentId":   "64f2b3...",
            "documentName": "passport_scan.pdf",
            "documentType": "passport"
          }
        ],
        "createdAt": "2025-07-19T16:00:03.000Z"
      }
    ],
    "lastMessageAt": "2025-07-19T16:00:03.000Z"
  }
}
```

---

### `DELETE /chat/sessions/:id`

Archive (soft delete) a chat session.

**Auth:** Required

**Response `200`:**

```json
{
  "statusCode": 200,
  "success":    true,
  "message":    "Session archived",
  "data":       null
}
```

---

## 8. Reminder Endpoints

---

### `GET /reminders`

Get all reminders for the user.

**Auth:** Required

**Query Parameters:**

| Param | Type | Values | Description |
|-------|------|--------|-------------|
| `status` | String | `upcoming`, `sent`, `all` | Filter by status |

**Response `200`:**

```json
{
  "statusCode": 200,
  "success":    true,
  "message":    "Reminders fetched",
  "data": [
    {
      "_id":          "64f3c4d5e6f7a8b9c0d3e4f5",
      "documentId": {
        "_id":              "64f2b3...",
        "documentType":     "passport",
        "documentCategory": "identity",
        "thumbnailUrl":     "https://..."
      },
      "documentName":  "Passport",
      "expiryDate":    "2027-03-14T00:00:00.000Z",
      "remindAt":      "2027-02-12T08:00:00.000Z",
      "daysBefore":    30,
      "reminderType":  "auto_expiry",
      "channels":      ["email", "in_app"],
      "isSent":        false,
      "isSnoozed":     false
    }
  ]
}
```

---

### `POST /reminders`

Create a custom reminder for any document.

**Auth:** Required

**Request Body:**

```json
{
  "documentId":    "64f2b3c4d5e6f7a8b9c0d2e3",
  "remindAt":      "2025-12-01T08:00:00.000Z",
  "channels":      ["email", "in_app"],
  "customMessage": "Renew my passport before travelling to Europe"
}
```

**Response `201`:**

```json
{
  "statusCode": 201,
  "success":    true,
  "message":    "Reminder created",
  "data": {
    "_id":           "64f3...new",
    "documentId":    "64f2b3...",
    "remindAt":      "2025-12-01T08:00:00.000Z",
    "reminderType":  "custom",
    "channels":      ["email", "in_app"],
    "customMessage": "Renew my passport before travelling to Europe",
    "isSent":        false
  }
}
```

---

### `PUT /reminders/:id`

Update a reminder's schedule or channels.

**Auth:** Required

**Request Body:**

```json
{
  "remindAt": "2025-11-15T08:00:00.000Z",
  "channels":  ["email"]
}
```

**Response `200`:** `{ ...updated reminder }`

---

### `POST /reminders/:id/snooze`

Snooze a reminder for N days.

**Auth:** Required

**Request Body:**

```json
{
  "days": 7
}
```

**Response `200`:**

```json
{
  "statusCode": 200,
  "success":    true,
  "message":    "Reminder snoozed for 7 days",
  "data": {
    "isSnoozed":    true,
    "snoozedUntil": "2025-07-26T08:00:00.000Z",
    "remindAt":     "2025-07-26T08:00:00.000Z"
  }
}
```

---

### `DELETE /reminders/:id`

Delete a reminder permanently.

**Auth:** Required

**Response `200`:**

```json
{
  "statusCode": 200,
  "success":    true,
  "message":    "Reminder deleted",
  "data":       null
}
```

---

## 9. Share Link Endpoints

---

### `POST /share`

Create a temporary, OTP-protected secure share link.

**Auth:** Required
**Rate Limit:** 10 per hour

**Request Body:**

```json
{
  "documentId":     "64f2b3c4d5e6f7a8b9c0d2e3",
  "expiryHours":    24,
  "allowDownload":  false,
  "maxViews":       1,
  "isOtpProtected": true
}
```

**Request Body Fields:**

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `documentId` | String | — | ✅ Required |
| `expiryHours` | Number | `24` | Link expiry duration |
| `allowDownload` | Boolean | `false` | Allow recipient to download |
| `maxViews` | Number | `null` | Max access count (null = unlimited) |
| `isOtpProtected` | Boolean | `false` | Require OTP to access |

**Response `201`:**

```json
{
  "statusCode": 201,
  "success":    true,
  "message":    "Share link created",
  "data": {
    "shareUrl":       "https://app.memora.ai/share/a3f9b2e1c8d7...",
    "token":          "a3f9b2e1c8d7f6a5b4c3d2e1f0a9b8c7...",
    "expiresAt":      "2025-07-20T22:00:00.000Z",
    "otp":            "847291",
    "isOtpProtected": true
  }
}
```

> ⚠️ `otp` is returned **once only** and never stored in plaintext. Share it separately with the recipient.

---

### `GET /share/my`

Get all share links created by the authenticated user.

**Auth:** Required

**Response `200`:**

```json
{
  "statusCode": 200,
  "success":    true,
  "message":    "Share links fetched",
  "data": [
    {
      "_id":            "64f4d5...",
      "documentId":     "64f2b3...",
      "token":          "a3f9b2...",
      "expiresAt":      "2025-07-20T22:00:00.000Z",
      "viewCount":      0,
      "maxViews":       1,
      "isOtpProtected": true,
      "isRevoked":      false,
      "allowDownload":  false
    }
  ]
}
```

---

### `GET /share/:token` *(Public)*

Access a shared document. No authentication required.

**Path Params:** `token` — Share link token

**Response `200` (no OTP):**

```json
{
  "statusCode": 200,
  "success":    true,
  "message":    "Document accessed",
  "data": {
    "document": {
      "_id":          "64f2b3...",
      "originalName": "passport_scan.pdf",
      "fileUrl":      "https://...",
      "documentType": "passport",
      "extractedData": { ... }
    },
    "allowDownload": false
  }
}
```

**Response `200` (OTP required):**

```json
{
  "statusCode": 200,
  "success":    true,
  "message":    "OTP required",
  "data": {
    "requiresOtp": true,
    "token":       "a3f9b2..."
  }
}
```

**Error `404`:**

```json
{
  "statusCode": 404,
  "success":    false,
  "message":    "Link not found or expired"
}
```

---

### `POST /share/:token/verify` *(Public)*

Verify OTP to access an OTP-protected shared document.

**Request Body:**

```json
{
  "otp": "847291"
}
```

**Response `200`:**

```json
{
  "statusCode": 200,
  "success":    true,
  "message":    "OTP verified. Document accessible",
  "data": {
    "document":     { ...document object },
    "allowDownload": false
  }
}
```

**Error `401`:**

```json
{
  "statusCode": 401,
  "success":    false,
  "message":    "Invalid OTP"
}
```

---

### `DELETE /share/:id`

Revoke a share link immediately.

**Auth:** Required

**Response `200`:**

```json
{
  "statusCode": 200,
  "success":    true,
  "message":    "Share link revoked",
  "data":       null
}
```

---

## 10. Profile Endpoints

---

### `GET /profile`

Get the auto-built Universal Profile aggregated from all documents.

**Auth:** Required

**Response `200`:**

```json
{
  "statusCode": 200,
  "success":    true,
  "message":    "Profile fetched",
  "data": {
    "name":        "Rahul Sharma",
    "dob":         "1995-01-12",
    "gender":      "Male",
    "address":     "42, MG Road, Pune, Maharashtra - 411001",
    "pincode":     "411001",
    "nationality": "Indian",
    "idNumbers": {
      "aadhaar_card":    "1234 5678 9012",
      "pan_card":        "ABCDE1234F",
      "passport":        "A1234567",
      "driving_licence": "MH12 20190012345"
    },
    "contact": {
      "phone": "+91 98765 43210",
      "email": "rahul@gmail.com"
    },
    "education": [
      {
        "type":         "degree_certificate",
        "organization": "University of Pune",
        "grade":        "8.4 CGPA",
        "issueDate":    "2017-05-15"
      }
    ],
    "experience": [
      {
        "type":         "offer_letter",
        "organization": "Tech Corp India Pvt. Ltd.",
        "amount":       "₹12,00,000 per annum",
        "issueDate":    "2022-03-01"
      }
    ]
  }
}
```

---

### `PUT /profile`

Manually update / correct a profile field.

**Auth:** Required

**Request Body:**

```json
{
  "phone":   "+91 99999 88888",
  "address": "101, New Address, Mumbai, Maharashtra - 400001"
}
```

**Response `200`:** `{ ...updated profile }`

---

### `GET /profile/resume`

Generate a resume using AI from stored document data.

**Auth:** Required
**Rate Limit:** 5 per hour

**Response `200`:**

```json
{
  "statusCode": 200,
  "success":    true,
  "message":    "Resume generated",
  "data": {
    "resumeMarkdown": "# Rahul Sharma\n\n## Summary\n...",
    "generatedAt":    "2025-07-19T16:00:00.000Z"
  }
}
```

---

## 11. Search Endpoints

---

### `GET /search`

Semantic search across all user documents using Pinecone.

**Auth:** Required

**Query Parameters:**

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `q` | String | ✅ | Search query |
| `category` | String | ❌ | Filter by document category |
| `limit` | Number | ❌ | Max results (default: 10) |

**Example:**
```
GET /search?q=old+address+mumbai&limit=5
```

**Response `200`:**

```json
{
  "statusCode": 200,
  "success":    true,
  "message":    "Search completed",
  "data": {
    "query":   "old address mumbai",
    "results": [
      {
        "score":      0.94,
        "documentId": "64f2b3...",
        "documentName": "aadhaar_card.jpg",
        "documentType": "aadhaar_card",
        "matchedChunk": "42, Andheri West, Mumbai - 400053",
        "thumbnailUrl": "https://..."
      },
      {
        "score":      0.87,
        "documentId": "64f2b4...",
        "documentName": "bank_statement.pdf",
        "documentType": "bank_statement",
        "matchedChunk": "Address: 42, Andheri West, Mumbai",
        "thumbnailUrl": "https://..."
      }
    ]
  }
}
```

---

### `GET /search/expiring`

Get all documents expiring within a given number of days.

**Auth:** Required

**Query Parameters:**

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `days` | Number | `90` | Documents expiring within N days |

**Example:**
```
GET /search/expiring?days=30
```

**Response `200`:**

```json
{
  "statusCode": 200,
  "success":    true,
  "message":    "Expiring documents fetched",
  "data": [
    {
      "_id":          "64f2b3...",
      "documentType": "driving_licence",
      "originalName": "driving_licence.jpg",
      "expiryDate":   "2025-08-22T00:00:00.000Z",
      "daysRemaining": 34,
      "thumbnailUrl": "https://..."
    }
  ]
}
```

---

## 12. Notification Endpoints

---

### `GET /notifications`

Get all in-app notifications for the user.

**Auth:** Required

**Query Parameters:**

| Param | Type | Values | Description |
|-------|------|--------|-------------|
| `read` | Boolean | `true`, `false` | Filter by read status |
| `limit` | Number | — | Max results (default: 20) |

**Response `200`:**

```json
{
  "statusCode": 200,
  "success":    true,
  "message":    "Notifications fetched",
  "data": [
    {
      "_id":        "64f6f7...",
      "type":       "expiry_reminder",
      "title":      "Passport Expiring Soon",
      "message":    "Your Passport expires in 30 days on 14 March 2027.",
      "icon":       "⚠️",
      "documentId": "64f2b3...",
      "isRead":     false,
      "createdAt":  "2025-07-19T08:00:00.000Z"
    },
    {
      "_id":     "64f6f8...",
      "type":    "document_processed",
      "title":   "Salary Slip Processed",
      "message": "AI has extracted your salary details successfully.",
      "icon":    "✅",
      "isRead":  true
    }
  ]
}
```

---

### `PUT /notifications/:id/read`

Mark a single notification as read.

**Auth:** Required

**Response `200`:**

```json
{
  "statusCode": 200,
  "success":    true,
  "message":    "Notification marked as read",
  "data":       { ...updated notification, "isRead": true }
}
```

---

### `PUT /notifications/read-all`

Mark all notifications as read.

**Auth:** Required

**Response `200`:**

```json
{
  "statusCode": 200,
  "success":    true,
  "message":    "All notifications marked as read",
  "data":       { "updatedCount": 5 }
}
```

---

## 13. Family Endpoints

---

### `GET /family/members`

Get all family members for the user.

**Auth:** Required

**Response `200`:**

```json
{
  "statusCode": 200,
  "success":    true,
  "message":    "Family members fetched",
  "data": [
    {
      "_id":          "64f7a8b9c0d7e8f9a0b1c2d3",
      "name":         "Sunita Sharma",
      "relationship": "spouse",
      "dob":          "1997-05-20T00:00:00.000Z",
      "gender":       "female",
      "avatarColor":  "#3ECF8E",
      "documentCount": 8
    }
  ]
}
```

---

### `POST /family/members`

Add a new family member.

**Auth:** Required

**Request Body:**

```json
{
  "name":         "Sunita Sharma",
  "relationship": "spouse",
  "dob":          "1997-05-20",
  "gender":       "female"
}
```

**Response `201`:**

```json
{
  "statusCode": 201,
  "success":    true,
  "message":    "Family member added",
  "data": {
    "_id":          "64f7a8...",
    "name":         "Sunita Sharma",
    "relationship": "spouse",
    "avatarColor":  "#3ECF8E",
    "documentCount": 0
  }
}
```

---

### `PUT /family/members/:id`

Update a family member's details.

**Auth:** Required

**Request Body:** Any updatable field (`name`, `dob`, `gender`, `relationship`)

**Response `200`:** `{ ...updated member }`

---

### `DELETE /family/members/:id`

Remove a family member (their documents are NOT deleted).

**Auth:** Required

**Response `200`:**

```json
{
  "statusCode": 200,
  "success":    true,
  "message":    "Family member removed",
  "data":       null
}
```

---

## 14. Rate Limits

| Endpoint Group | Limit | Window |
|----------------|-------|--------|
| All API routes | 100 requests | 1 minute |
| `POST /chat/message` | 20 requests | 1 minute |
| `GET /profile/resume` | 5 requests | 1 hour |
| `POST /share` | 10 requests | 1 hour |
| `POST /documents` | 30 uploads | 1 hour |

### Rate Limit Response `429`

```json
{
  "statusCode": 429,
  "success":    false,
  "message":    "Too many requests. Please try again in a minute.",
  "data":       null
}
```

### Rate Limit Headers

```
X-RateLimit-Limit:     100
X-RateLimit-Remaining: 87
X-RateLimit-Reset:     1721407200
```

---

## 15. Postman Collection

### Base Setup

```
Collection Variable:
  BASE_URL   = http://localhost:5000/api/v1
  AUTH_TOKEN = <your Clerk JWT>

Pre-request Script (Collection level):
  pm.request.headers.add({
    key:   'Authorization',
    value: 'Bearer ' + pm.collectionVariables.get('AUTH_TOKEN')
  });
```

### Quick Import — Environment

```json
{
  "id":   "memora-ai-env",
  "name": "Memora AI - Local",
  "values": [
    { "key": "BASE_URL",    "value": "http://localhost:5000/api/v1" },
    { "key": "AUTH_TOKEN",  "value": "" },
    { "key": "DOC_ID",      "value": "" },
    { "key": "SESSION_ID",  "value": "" },
    { "key": "SHARE_TOKEN", "value": "" }
  ]
}
```

### Sample Request — Upload Document

```
POST {{BASE_URL}}/documents
Authorization: Bearer {{AUTH_TOKEN}}
Content-Type: multipart/form-data

Body (form-data):
  file: [select file]
  tags: travel,identity
```

### Sample Request — AI Chat

```
POST {{BASE_URL}}/chat/message
Authorization: Bearer {{AUTH_TOKEN}}
Content-Type: application/json

{
  "message": "When does my passport expire?"
}
```

### Sample Request — Create Share Link

```
POST {{BASE_URL}}/share
Authorization: Bearer {{AUTH_TOKEN}}
Content-Type: application/json

{
  "documentId":     "{{DOC_ID}}",
  "expiryHours":    24,
  "allowDownload":  false,
  "maxViews":       1,
  "isOtpProtected": true
}
```

---

## 🔗 Related Documentation

| Document | Purpose |
|----------|---------|
| [06_Backend_Architecture.md](./06_Backend_Architecture.md) | Controller implementation |
| [05_Database_Design.md](./05_Database_Design.md) | Data models behind responses |
| [08_AI_Pipeline.md](./08_AI_Pipeline.md) | How AI endpoints work internally |
| [11_Testing.md](./11_Testing.md) | API test cases |

---

<div align="center">

*Memora AI API — Clean. Consistent. Secure.*

</div>
