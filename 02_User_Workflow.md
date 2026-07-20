# 📄 02 — User Workflow

> **Memora AI** | Complete User Journeys & Interaction Flows
> *Every step a user takes, from signup to daily use.*

---

## 📌 Table of Contents

| # | Section |
|---|---------|
| 1 | [User Types](#1-user-types) |
| 2 | [Onboarding Flow](#2-onboarding-flow) |
| 3 | [Document Upload Flow](#3-document-upload-flow) |
| 4 | [AI Processing Flow](#4-ai-processing-flow) |
| 5 | [Search & Chat Flow](#5-search--chat-flow) |
| 6 | [Reminder Flow](#6-reminder-flow) |
| 7 | [Secure Sharing Flow](#7-secure-sharing-flow) |
| 8 | [Autofill Flow](#8-autofill-flow) |
| 9 | [Family Vault Flow](#9-family-vault-flow) |
| 10 | [Profile Management Flow](#10-profile-management-flow) |
| 11 | [Complete Daily Usage Flow](#11-complete-daily-usage-flow) |
| 12 | [Error & Edge Case Flows](#12-error--edge-case-flows) |

---

## 1. User Types

Memora AI serves five distinct user types. Each has a different primary use case.

| User Type | Primary Goal | Key Features Used |
|-----------|-------------|-------------------|
| 👨‍🎓 **Student** | Organize academic documents | Upload, Search, Share |
| 👔 **Professional** | Manage career & ID documents | Autofill, Reminders, Share |
| 👨‍👩‍👧 **Family Head** | Manage entire family's documents | Family Vault, Reminders |
| 👴 **Senior Citizen** | Simple storage + reminders | Upload, Reminders, Search |
| 🏢 **Small Business** | Manage business documents | Vault, Sharing, Profile |

---

## 2. Onboarding Flow

### 2.1 New User Registration

```
LANDING PAGE
     │
     ▼
[Sign Up] Button Clicked
     │
     ▼
┌─────────────────────────────┐
│  Registration Form           │
│  ─────────────────────────  │
│  Full Name                  │
│  Email Address              │
│  Phone Number               │
│  Password (min 8 chars)     │
│  Confirm Password           │
│  Country                    │
└────────────┬────────────────┘
             │
             ▼
     Email Verification Sent
             │
             ▼
     User Clicks Verify Link
             │
             ▼
     Account Created ✅
             │
             ▼
     Redirect → Onboarding Wizard
```

---

### 2.2 Onboarding Wizard (First-Time Setup)

```
STEP 1 — Welcome Screen
"Welcome to Memora AI. Let's set up your digital memory."
[Get Started →]
     │
     ▼
STEP 2 — Choose Your Profile Type
  ○ Student
  ○ Professional
  ○ Family
  ○ Senior Citizen
  ○ Business
[Continue →]
     │
     ▼
STEP 3 — Upload Your First Document (Optional)
"Upload any document to get started."
[Upload Now] or [Skip for Now]
     │
     ▼
STEP 4 — Enable Reminders
"Allow notifications for document expiry alerts?"
[Enable Notifications] or [Maybe Later]
     │
     ▼
STEP 5 — Setup Complete
"Your digital memory is ready."
[Go to Dashboard →]
```

---

### 2.3 Returning User — Login Flow

```
LOGIN PAGE
     │
     ├─── Email + Password → Authenticate → Dashboard
     │
     ├─── Google OAuth → One-click login → Dashboard
     │
     └─── Magic Link (Email) → Click link → Dashboard
```

---

## 3. Document Upload Flow

### 3.1 Upload Entry Points

Users can upload documents from **3 places**:

```
1. Dashboard → [+ Upload Document] button
2. Document Vault → [+ Add New] button  
3. AI Chat → Drag & drop file into chat window
```

---

### 3.2 Full Upload Flow

```
USER INITIATES UPLOAD
         │
         ▼
┌────────────────────────────┐
│     Upload Modal Opens     │
│ ─────────────────────────  │
│  Drag & Drop Zone          │
│  OR [Browse Files] button  │
│                            │
│  Supported Formats:        │
│  PDF / JPG / PNG / HEIC /  │
│  TIFF / DOCX               │
└─────────────┬──────────────┘
              │
              ▼
     File Selected by User
              │
              ▼
┌────────────────────────────┐
│    Pre-Upload Check        │
│ ─────────────────────────  │
│  ✅ File size < 50MB       │
│  ✅ Format supported       │
│  ✅ Not duplicate          │
└─────────────┬──────────────┘
              │
         ┌────┴────┐
       PASS      FAIL
         │         │
         ▼         ▼
  Upload Begins   Error Message shown
         │         "File too large" / 
         ▼         "Format not supported"
  Progress Bar Shown (0% → 100%)
         │
         ▼
  File Stored Securely in Encrypted Vault
         │
         ▼
  AI Processing Triggered Automatically
         │
         ▼
  "Document uploaded! AI is processing..." ✅
```

---

### 3.3 Batch Upload Flow

```
User selects multiple files
         │
         ▼
Upload Queue shown (File 1, File 2, File 3...)
         │
         ▼
Each file processed sequentially
         │
         ▼
Progress shown per file
         │
         ▼
Summary: "3 of 3 documents processed successfully" ✅
```

---

## 4. AI Processing Flow

After every upload, AI processing runs automatically in the background.

### 4.1 Full AI Pipeline

```
FILE RECEIVED BY SYSTEM
         │
         ▼
┌────────────────────────┐
│   Step 1: OCR          │
│   Extract raw text     │
│   from PDF / Image     │
└──────────┬─────────────┘
           │
           ▼
┌────────────────────────┐
│   Step 2: Classification│
│   Identify document    │
│   type automatically   │
│                        │
│   Examples:            │
│   → Aadhaar Card       │
│   → Passport           │
│   → Degree Certificate │
│   → Insurance Policy   │
│   → Salary Slip        │
└──────────┬─────────────┘
           │
           ▼
┌────────────────────────┐
│   Step 3: Entity       │
│   Extraction           │
│                        │
│   Extracts:            │
│   • Full Name          │
│   • Date of Birth      │
│   • ID Number          │
│   • Issue Date         │
│   • Expiry Date        │
│   • Address            │
│   • Issuing Authority  │
└──────────┬─────────────┘
           │
           ▼
┌────────────────────────┐
│   Step 4: Embedding    │
│   Convert document     │
│   into vector for      │
│   semantic search      │
└──────────┬─────────────┘
           │
           ▼
┌────────────────────────┐
│   Step 5: Save to DB   │
│   • Metadata → SQL DB  │
│   • Vector → Vector DB │
│   • File → Encrypted   │
│     Cloud Storage      │
└──────────┬─────────────┘
           │
           ▼
┌────────────────────────┐
│   Step 6: Auto-tag     │
│   & Organize           │
│   Add to correct       │
│   category in vault    │
└──────────┬─────────────┘
           │
           ▼
┌────────────────────────┐
│   Step 7: Reminder     │
│   Check                │
│   If expiry date found │
│   → Create reminder    │
└──────────┬─────────────┘
           │
           ▼
PROCESSING COMPLETE ✅
User notified: "Your Passport has been processed.
Expires: 14 March 2027. Reminder set."
```

---

## 5. Search & Chat Flow

### 5.1 Two Ways to Find Documents

```
METHOD 1 — Search Bar
User types keyword or phrase
         │
         ▼
Semantic search runs across all documents
         │
         ▼
Ranked results shown with document preview
         │
         ▼
User clicks result → Document opens

─────────────────────────────────────

METHOD 2 — AI Chat
User types a natural language question
         │
         ▼
AI retrieves relevant documents (RAG)
         │
         ▼
AI generates grounded answer
         │
         ▼
User sees answer + source document link
```

---

### 5.2 AI Chat Detailed Flow

```
USER: "When does my driving licence expire?"
              │
              ▼
┌─────────────────────────────┐
│  Query Understanding        │
│  Intent: Expiry Date        │
│  Entity: Driving Licence    │
└──────────────┬──────────────┘
               │
               ▼
┌─────────────────────────────┐
│  Vector Search              │
│  Find relevant document     │
│  chunks from user's vault   │
└──────────────┬──────────────┘
               │
               ▼
┌─────────────────────────────┐
│  RAG — Answer Generation    │
│  Ground answer in retrieved │
│  document content only      │
└──────────────┬──────────────┘
               │
               ▼
AI: "Your Driving Licence expires on 22 August 2026.
     That's in 34 days.
     Would you like me to set a renewal reminder?"
              │
              ▼
User: "Yes, remind me 30 days before."
              │
              ▼
Reminder Created ✅
```

---

### 5.3 Example Queries & Expected Behavior

| User Query | AI Behavior |
|-----------|-------------|
| "Show my PAN card" | Returns PAN card document + extracted details |
| "What is my passport number?" | Returns passport number from stored document |
| "Find all documents with my old address" | Semantic search across all documents |
| "Which documents expire this year?" | Lists all documents with expiry in current year |
| "Generate a summary of my insurance policy" | Summarizes the policy document |
| "What is my father's Aadhaar number?" | Searches family vault if family mode enabled |

---

## 6. Reminder Flow

### 6.1 Automatic Reminder Creation

```
AI detects expiry date in document
              │
              ▼
System creates reminder automatically:
• 90 days before expiry → First alert
• 30 days before expiry → Second alert
• 7 days before expiry  → Urgent alert
• On expiry day         → Final alert
```

### 6.2 Reminder Notification Flow

```
Reminder trigger fires
         │
         ▼
┌──────────────────────────┐
│   Notification Sent Via  │
│ ─────────────────────    │
│  • Push notification     │
│  • Email alert           │
│  • In-app notification   │
└──────────┬───────────────┘
           │
           ▼
User receives: 
"⚠️ Your Passport expires in 30 days (14 March 2027).
 Start renewal process now?"
           │
    ┌──────┴──────┐
    ▼             ▼
[Renew Now]   [Remind Later]
    │               │
    ▼               ▼
Opens relevant   Snooze for
government       7 days
renewal page
```

### 6.3 Manual Reminder Creation

```
User opens any document
         │
         ▼
Clicks [Set Reminder]
         │
         ▼
Choose: Date / Days Before Expiry / Custom Date
         │
         ▼
Choose: Push / Email / Both
         │
         ▼
Reminder saved ✅
```

---

## 7. Secure Sharing Flow

### 7.1 Share a Document

```
User opens document in vault
         │
         ▼
Clicks [Share] button
         │
         ▼
┌─────────────────────────────┐
│   Sharing Options           │
│ ─────────────────────────── │
│  Expiry:                    │
│  ○ 1 Hour                   │
│  ○ 24 Hours                 │
│  ○ 7 Days                   │
│  ○ Custom                   │
│                             │
│  Access:                    │
│  ○ View Only                │
│  ○ Download Allowed         │
│                             │
│  Protection:                │
│  ○ No Password              │
│  ○ Set Password             │
│                             │
│  One-time Access: ☐         │
└──────────────┬──────────────┘
               │
               ▼
Secure Link Generated
               │
               ▼
User copies link / shares via any channel
               │
               ▼
Recipient opens link → Views document
               │
               ▼
Link auto-expires after set time ✅
```

### 7.2 Recipient Experience

```
Recipient receives link
         │
         ▼
Opens link in browser (no login required)
         │
         ▼
If password protected → Enter password
         │
         ▼
Document shown in secure viewer
(No download option if view-only)
         │
         ▼
Access logged in sender's dashboard
         │
         ▼
Link expires → "This link has expired." shown
```

---

## 8. Autofill Flow

### 8.1 Profile Building

```
User uploads documents over time
         │
         ▼
AI extracts structured data from each
         │
         ▼
Universal Profile auto-builds:
┌─────────────────────────────┐
│   Universal Profile         │
│ ─────────────────────────── │
│  Name: Rahul Sharma         │
│  DOB: 12 Jan 1995           │
│  Address: 42, MG Road...    │
│  PAN: ABCDE1234F            │
│  Passport No: A1234567      │
│  Aadhaar: 1234 5678 9012    │
│  Phone: +91 98765 43210     │
│  Email: rahul@email.com     │
└─────────────────────────────┘
```

### 8.2 Form Autofill Flow

```
User is filling an application form
         │
         ▼
Opens Memora AI → Profile tab
         │
         ▼
Clicks [Copy Field] next to required info
         │
         ▼
Pastes into form
         │
         ▼
(Future: Browser extension autofills automatically)
```

---

## 9. Family Vault Flow

### 9.1 Adding Family Members

```
User goes to Settings → Family
         │
         ▼
Clicks [Add Family Member]
         │
         ▼
Enter: Name, Relationship, DOB
         │
         ▼
Family member section created ✅
         │
         ▼
User uploads documents under that member
         │
         ▼
AI processes & organizes per member
```

### 9.2 Family Document Query

```
User in AI Chat:
"Show my mother's medical reports."
         │
         ▼
AI searches family vault → Mother's section
         │
         ▼
Returns relevant documents ✅
```

### 9.3 Family Member Access (Future)

```
User invites family member via email
         │
         ▼
Member creates account & links to family
         │
         ▼
Controlled access set by family head:
• View Own Documents Only
• View Shared Documents
• Full Family Access
```

---

## 10. Profile Management Flow

### 10.1 View & Edit Profile

```
Dashboard → Profile Icon → My Profile
         │
         ▼
View auto-extracted profile fields
         │
         ▼
Edit any field manually if AI extracted incorrectly
         │
         ▼
Save → Updated across all linked documents
```

### 10.2 Delete a Document

```
Open document → [⋮ Options] → [Delete]
         │
         ▼
Confirmation modal:
"Are you sure? This will remove the document
 and all extracted data permanently."
         │
    ┌────┴────┐
[Confirm]  [Cancel]
    │
    ▼
Document deleted from vault + DB ✅
Profile fields re-computed from remaining docs
```

---

## 11. Complete Daily Usage Flow

This is how a typical user interacts with Memora AI on any given day.

```
MORNING
────────
User receives notification:
"⚠️ Your vehicle insurance renews in 7 days."
         │
         ▼
Opens Memora AI → Sees reminder on dashboard
         │
         ▼
Clicks reminder → Insurance document opens
         │
         ▼
User sees all policy details extracted by AI

─────────────────────────────────────────────

AFTERNOON
──────────
User needs to apply for a scholarship:
"Find my 12th mark sheet."
         │
         ▼
AI responds: "Here is your Class 12 Mark Sheet.
Your percentage: 92.4%. Board: CBSE. Year: 2022."
         │
         ▼
User clicks [Share] → Generates secure link
         │
         ▼
Pastes link in scholarship form ✅

─────────────────────────────────────────────

EVENING
────────
User uploads new offer letter from employer:
         │
         ▼
AI processes → Extracts: Company, Salary, Join Date
         │
         ▼
Profile updated automatically
         │
         ▼
"Document added to your Professional section." ✅
```

---

## 12. Error & Edge Case Flows

### 12.1 Low-Quality Document (Blurry Scan)

```
User uploads blurry or low-res image
         │
         ▼
OCR extraction partially fails
         │
         ▼
System notifies:
"We couldn't fully read this document.
 Extracted partial data. Please verify."
         │
         ▼
User can manually correct extracted fields
         │
         ▼
Saved with manual corrections ✅
```

### 12.2 Duplicate Document Upload

```
User uploads same document twice
         │
         ▼
System detects hash/content match
         │
         ▼
Warning shown:
"This document already exists in your vault.
 Upload again or view existing?"
         │
    ┌────┴──────┐
[View Existing]  [Upload Anyway]
```

### 12.3 Unsupported File Format

```
User uploads .xlsx or .mp4
         │
         ▼
Pre-upload validation fails
         │
         ▼
"Unsupported format. Please upload PDF,
 JPG, PNG, TIFF, HEIC, or DOCX."
```

### 12.4 AI Answer Uncertainty

```
User asks question AI cannot answer accurately
         │
         ▼
AI responds:
"I couldn't find a confident answer in your documents.
 [View Related Documents] or [Upload Missing Document]"
```

---

## 🔗 Related Documentation

| Document | Purpose |
|----------|---------|
| [01_Project_Overview.md](./01_Project_Overview.md) | Platform overview |
| [03_UI_UX_Design.md](./03_UI_UX_Design.md) | UI screens for these flows |
| [06_Backend_Architecture.md](./06_Backend_Architecture.md) | Backend logic behind flows |
| [08_AI_Pipeline.md](./08_AI_Pipeline.md) | AI processing internals |

---

<div align="center">

*Memora AI — Every step designed to save your time.*

</div>
