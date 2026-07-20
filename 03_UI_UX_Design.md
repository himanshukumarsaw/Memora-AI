# 📄 03 — UI/UX Design

> **Memora AI** | Design System, Screen Layouts & Interaction Patterns
> *Every pixel designed to feel intelligent, secure, and effortless.*

---

## 📌 Table of Contents

| # | Section |
|---|---------|
| 1 | [Design Philosophy](#1-design-philosophy) |
| 2 | [Design System — Colors](#2-design-system--colors) |
| 3 | [Design System — Typography](#3-design-system--typography) |
| 4 | [Design System — Spacing & Grid](#4-design-system--spacing--grid) |
| 5 | [Design System — Components](#5-design-system--components) |
| 6 | [Screen Inventory](#6-screen-inventory) |
| 7 | [Screen Layouts — Detailed](#7-screen-layouts--detailed) |
| 8 | [Navigation Structure](#8-navigation-structure) |
| 9 | [Interaction Patterns](#9-interaction-patterns) |
| 10 | [Responsive Design](#10-responsive-design) |
| 11 | [Accessibility Guidelines](#11-accessibility-guidelines) |
| 12 | [Dark Mode](#12-dark-mode) |

---

## 1. Design Philosophy

### Core Principles

| Principle | Description |
|-----------|-------------|
| 🧠 **Intelligence First** | Every UI element should feel smart, not static |
| 🔒 **Security Visible** | Users must always feel their data is safe |
| ⚡ **Speed Over Friction** | Zero unnecessary steps. Every action is one click away |
| 💬 **Conversational** | The interface feels like a conversation, not a filing cabinet |
| 🎨 **Premium Dark Theme** | Deep, rich dark mode with glowing accents — trusted & modern |

### Design Mood

```
Feeling: Secure  ·  Intelligent  ·  Clean  ·  Futuristic  ·  Trustworthy

Inspired by:
  Notion (clean layout)  +  Linear (dark premium)  +  Arc Browser (modern UX)
```

---

## 2. Design System — Colors

### 2.1 Primary Palette

| Role | Name | Hex | Usage |
|------|------|-----|-------|
| **Background** | Obsidian | `#0D0F14` | App background |
| **Surface** | Deep Navy | `#13161F` | Cards, sidebars |
| **Surface Elevated** | Slate Dark | `#1C202D` | Modals, dropdowns |
| **Border** | Ghost | `#262B3A` | Dividers, outlines |
| **Primary** | Violet Glow | `#7C6FF7` | Buttons, links, accents |
| **Primary Hover** | Violet Bright | `#9D94FF` | Hover states |
| **Success** | Mint | `#3ECF8E` | Success states, verified |
| **Warning** | Amber | `#F5A623` | Expiry warnings |
| **Danger** | Coral | `#F56565` | Errors, deletions |
| **Text Primary** | Ice White | `#EDF2FF` | Headings, primary text |
| **Text Secondary** | Muted Blue** | `#8892A4` | Subtext, labels |
| **Text Disabled** | Slate | `#4A5568` | Disabled states |

### 2.2 Gradient Definitions

```css
/* Hero gradient — used on landing page */
background: linear-gradient(135deg, #7C6FF7 0%, #5A4FCF 50%, #3B2FA8 100%);

/* Card glow effect */
box-shadow: 0 0 24px rgba(124, 111, 247, 0.15);

/* AI chat bubble */
background: linear-gradient(135deg, #1C202D, #232840);

/* Danger gradient */
background: linear-gradient(135deg, #F56565, #C53030);

/* Success gradient */
background: linear-gradient(135deg, #3ECF8E, #2A9E6E);
```

### 2.3 Document Category Colors

Each document category has a distinct color for quick identification:

| Category | Color | Hex |
|----------|-------|-----|
| 🪪 Identity | Violet | `#7C6FF7` |
| 🎓 Education | Sky Blue | `#4299E1` |
| 💼 Professional | Emerald | `#48BB78` |
| 🏥 Medical | Rose | `#FC8181` |
| 🏦 Financial | Gold | `#F6C90E` |
| 🏠 Property | Teal | `#38B2AC` |
| 🚗 Vehicle | Orange | `#ED8936` |
| 📋 Legal | Indigo | `#667EEA` |
| 🔖 Other | Gray | `#718096` |

---

## 3. Design System — Typography

### 3.1 Font Stack

```css
/* Primary Font — UI Text */
font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;

/* Monospace — Code / IDs / Numbers */
font-family: 'JetBrains Mono', 'Fira Code', monospace;
```

> Google Font import: `Inter` (weights: 400, 500, 600, 700)

### 3.2 Type Scale

| Name | Size | Weight | Line Height | Usage |
|------|------|--------|-------------|-------|
| `display-xl` | 48px | 700 | 1.1 | Hero headings |
| `display-lg` | 36px | 700 | 1.2 | Page titles |
| `display-md` | 28px | 600 | 1.3 | Section headings |
| `heading` | 22px | 600 | 1.4 | Card titles |
| `subheading` | 18px | 600 | 1.5 | Sub-sections |
| `body-lg` | 16px | 400 | 1.6 | Primary body text |
| `body` | 14px | 400 | 1.6 | Standard body |
| `body-sm` | 13px | 400 | 1.5 | Helper text |
| `caption` | 12px | 400 | 1.4 | Labels, captions |
| `micro` | 11px | 500 | 1.3 | Badges, tags |

---

## 4. Design System — Spacing & Grid

### 4.1 Spacing Scale (4px base unit)

```
4px   →  xs     (tight gaps, icon padding)
8px   →  sm     (small gaps)
12px  →  md-sm  (compact components)
16px  →  md     (standard padding)
24px  →  lg     (card padding)
32px  →  xl     (section gaps)
48px  →  2xl    (large section gaps)
64px  →  3xl    (page-level spacing)
```

### 4.2 Layout Grid

```
Desktop (1440px):
  12-column grid
  Column gutter: 24px
  Sidebar: 260px fixed
  Content area: fluid

Tablet (768px–1024px):
  8-column grid
  Sidebar: collapsed (icon only, 60px)

Mobile (< 768px):
  4-column grid
  Bottom navigation bar
  Full-width cards
```

### 4.3 Border Radius

```
4px   → Small buttons, tags
8px   → Input fields
12px  → Cards
16px  → Modals, large cards
24px  → Bottom sheets (mobile)
999px → Pills, avatar circles
```

---

## 5. Design System — Components

### 5.1 Buttons

```
PRIMARY BUTTON
┌─────────────────────────────┐
│  [+ Upload Document]         │  bg: #7C6FF7  text: white
└─────────────────────────────┘
  Hover: bg: #9D94FF, scale: 1.01
  Active: scale: 0.98
  Disabled: opacity: 0.4

SECONDARY BUTTON
┌─────────────────────────────┐
│  [View Details]              │  bg: transparent  border: #7C6FF7
└─────────────────────────────┘

DANGER BUTTON
┌─────────────────────────────┐
│  [Delete Document]           │  bg: #F56565  text: white
└─────────────────────────────┘

GHOST BUTTON
┌─────────────────────────────┐
│  [Cancel]                    │  bg: transparent  text: #8892A4
└─────────────────────────────┘
```

### 5.2 Input Fields

```
Default State:
┌─────────────────────────────────────┐
│  Search your documents...           │
└─────────────────────────────────────┘
  bg: #1C202D  border: #262B3A  radius: 8px

Focused State:
┌─────────────────────────────────────┐
│  Search your documents...  🔍       │
└─────────────────────────────────────┘
  border: #7C6FF7  glow: rgba(124,111,247, 0.2)
```

### 5.3 Document Card

```
┌──────────────────────────────────────┐  ← border: #262B3A
│  🪪  [Category Color Pill]           │  ← bg: #13161F
│                                      │
│  Aadhaar Card               [⋮]     │  ← heading + options menu
│  Rahul Sharma · •••• 9012            │  ← extracted key info
│                                      │
│  📅 Uploaded: 14 Jan 2025            │  ← metadata row
│  ✅ Verified by AI                   │
│                                      │
│  [View]  [Share]  [Remind]           │  ← action buttons
└──────────────────────────────────────┘
  Hover: border-color: #7C6FF7, box-shadow glow
  Transition: 200ms ease
```

### 5.4 AI Chat Bubble

```
USER BUBBLE (right-aligned):
                       ┌─────────────────────────┐
                       │ When does my passport    │
                       │ expire?                  │
                       └─────────────────────────┘
                         bg: #7C6FF7  radius: 16px 16px 4px 16px

AI BUBBLE (left-aligned):
  🧠
  ┌─────────────────────────────────────────────┐
  │ Your Passport expires on 14 March 2027.      │
  │ That is 245 days from now.                   │
  │                                              │
  │ 📄 Source: passport_scan.pdf                 │
  │ [Set Reminder] [View Document]               │
  └─────────────────────────────────────────────┘
    bg: #1C202D  radius: 4px 16px 16px 16px
```

### 5.5 Notification Toast

```
SUCCESS:
┌─────────────────────────────────────────────┐
│  ✅  Document processed successfully.        │  bg: #1C3D2A  border-left: #3ECF8E
└─────────────────────────────────────────────┘

WARNING:
┌─────────────────────────────────────────────┐
│  ⚠️  Your Passport expires in 30 days.      │  bg: #3D2E1C  border-left: #F5A623
└─────────────────────────────────────────────┘

ERROR:
┌─────────────────────────────────────────────┐
│  ❌  Upload failed. File too large.          │  bg: #3D1C1C  border-left: #F56565
└─────────────────────────────────────────────┘

Position: top-right, slides in from right
Auto-dismiss: 4 seconds
```

### 5.6 Progress Indicator (Upload)

```
Uploading passport_scan.pdf...
[████████████████████░░░░░░] 78%
Cancel
```

### 5.7 Badge / Tag Pill

```
[🪪 Identity]     bg: rgba(124,111,247,0.15)  text: #7C6FF7
[⚠️ Expiring]     bg: rgba(245,166,35,0.15)   text: #F5A623
[✅ Verified]     bg: rgba(62,207,142,0.15)   text: #3ECF8E
[🔒 Shared]       bg: rgba(66,153,225,0.15)   text: #4299E1
```

---

## 6. Screen Inventory

| # | Screen Name | Type | Priority |
|---|-------------|------|----------|
| 1 | Landing Page | Public | MVP |
| 2 | Sign Up | Auth | MVP |
| 3 | Login | Auth | MVP |
| 4 | Onboarding Wizard | Onboard | MVP |
| 5 | Dashboard (Home) | Core | MVP |
| 6 | Document Vault | Core | MVP |
| 7 | Document Detail View | Core | MVP |
| 8 | Upload Modal | Core | MVP |
| 9 | AI Chat | Core | MVP |
| 10 | Reminders | Core | MVP |
| 11 | Secure Share Modal | Core | MVP |
| 12 | Universal Profile | Core | MVP |
| 13 | Family Vault | Feature | Phase 2 |
| 14 | Settings | Support | MVP |
| 15 | Notifications Center | Support | MVP |
| 16 | Search Results | Core | MVP |

---

## 7. Screen Layouts — Detailed

### 7.1 Landing Page

```
┌─────────────────────────────────────────────────────────────────┐
│  NAVBAR                                                         │
│  🧠 Memora AI          [Features] [Pricing] [Login] [Sign Up →] │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  HERO SECTION                                                   │
│  ─────────────────────────────────────────────────             │
│                                                                 │
│  "Your Digital Memory for Life"                                 │
│                                                                 │
│  Stop searching your documents.                                 │
│  Start talking to them.                                         │
│                                                                 │
│  [Get Started Free →]    [Watch Demo ▶]                         │
│                                                                 │
│       ╔═══════════════════════════════════╗                     │
│       ║   [App Dashboard Preview Image]   ║                     │
│       ╚═══════════════════════════════════╝                     │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│  PROBLEM SECTION                                                │
│  "Sound familiar?"                                              │
│  [Grid of 5 problem cards with icons]                           │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│  FEATURES SECTION                                               │
│  [Feature 1]  [Feature 2]  [Feature 3]                          │
│  [Feature 4]  [Feature 5]  [Feature 6]                          │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│  COMPARISON TABLE                                               │
│  Memora AI vs. Google Drive vs. DigiLocker                      │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│  CTA SECTION                                                    │
│  "Start your digital memory today."                             │
│  [Create Free Account →]                                        │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│  FOOTER                                                         │
│  Links · Privacy · Terms · Contact                              │
└─────────────────────────────────────────────────────────────────┘
```

---

### 7.2 Dashboard (Home)

```
┌──────────────┬──────────────────────────────────────────────────┐
│              │  TOP BAR                                         │
│   SIDEBAR    │  🔍 Search documents...    🔔  👤 Rahul          │
│  ──────────  ├──────────────────────────────────────────────────┤
│              │                                                  │
│  🧠 Memora   │  GREETING                                        │
│              │  "Good evening, Rahul. 👋"                       │
│  📊 Dashboard│  You have 3 documents expiring soon.             │
│              │                                                  │
│  🗃️ Vault    │  ──────────────────────────────────────────────  │
│              │  QUICK STATS                                     │
│  💬 AI Chat  │  ┌──────────┐ ┌──────────┐ ┌──────────┐        │
│              │  │ 42 Docs  │ │ 3 Expiry │ │ 5 Shared │        │
│  🔔 Remind.  │  │ stored   │ │ soon ⚠️  │ │ active 🔗│        │
│              │  └──────────┘ └──────────┘ └──────────┘        │
│  👤 Profile  │                                                  │
│              │  ──────────────────────────────────────────────  │
│  👨‍👩‍👧 Family  │  EXPIRY ALERTS                                   │
│              │  ┌──────────────────────────────────────────┐   │
│  ⚙️ Settings │  │ ⚠️ Passport — expires in 30 days         │   │
│              │  │ ⚠️ Car Insurance — expires in 7 days      │   │
│  ──────────  │  │ ⚠️ Driving Licence — expires in 45 days  │   │
│              │  └──────────────────────────────────────────┘   │
│  [+ Upload]  │                                                  │
│              │  ──────────────────────────────────────────────  │
│              │  RECENT DOCUMENTS                               │
│              │  [Doc Card]  [Doc Card]  [Doc Card]             │
│              │  [Doc Card]  [Doc Card]  [Doc Card]             │
│              │                                                  │
│              │  ──────────────────────────────────────────────  │
│              │  ASK MEMORA AI                                   │
│              │  ┌──────────────────────────────────────┐       │
│              │  │  What would you like to know?  🧠   │       │
│              │  └──────────────────────────────────────┘       │
└──────────────┴──────────────────────────────────────────────────┘
```

---

### 7.3 Document Vault

```
┌──────────────┬──────────────────────────────────────────────────┐
│   SIDEBAR    │  VAULT HEADER                                    │
│  (same)      │  🗃️ My Vault          [+ Upload Document]        │
│              ├──────────────────────────────────────────────────┤
│              │                                                  │
│              │  FILTER BAR                                      │
│              │  [All] [Identity] [Education] [Medical]          │
│              │  [Financial] [Professional] [Vehicle] [Legal]    │
│              │                                                  │
│              │  SORT: [Recent ▾]  VIEW: [Grid ⊞] [List ☰]     │
│              │                                                  │
│              │  ──────────────────────────────────────────────  │
│              │                                                  │
│              │  DOCUMENT GRID                                   │
│              │  ┌────────┐  ┌────────┐  ┌────────┐            │
│              │  │🪪 Aadhaar│ │🛂Passport│ │🎓 Degree│           │
│              │  │ Card   │  │        │  │ Cert.  │            │
│              │  └────────┘  └────────┘  └────────┘            │
│              │  ┌────────┐  ┌────────┐  ┌────────┐            │
│              │  │🧾 PAN  │  │🚗 DL   │  │🏥 Med. │            │
│              │  │ Card   │  │        │  │ Report │            │
│              │  └────────┘  └────────┘  └────────┘            │
│              │                                                  │
└──────────────┴──────────────────────────────────────────────────┘
```

---

### 7.4 Document Detail View

```
┌──────────────┬──────────────────────────────────────────────────┐
│   SIDEBAR    │  ← Back to Vault                                 │
│              ├──────────────────────────────────────────────────┤
│              │  ┌──────────────────────┬───────────────────┐   │
│              │  │                      │  DOCUMENT INFO    │   │
│              │  │   DOCUMENT PREVIEW   │  ───────────────  │   │
│              │  │   (PDF Viewer /      │  📄 Passport      │   │
│              │  │    Image Viewer)     │  ✅ AI Verified    │   │
│              │  │                      │                   │   │
│              │  │                      │  Name             │   │
│              │  │                      │  Rahul Sharma     │   │
│              │  │                      │                   │   │
│              │  │                      │  Passport No.     │   │
│              │  │                      │  A1234567         │   │
│              │  │                      │                   │   │
│              │  │                      │  Issue Date       │   │
│              │  │                      │  14 Mar 2017      │   │
│              │  │                      │                   │   │
│              │  │                      │  Expiry Date      │   │
│              │  │                      │  14 Mar 2027 ⚠️   │   │
│              │  │                      │                   │   │
│              │  │                      │  Country          │   │
│              │  │                      │  India 🇮🇳         │   │
│              │  │                      │  ───────────────  │   │
│              │  │                      │  [🔗 Share]       │   │
│              │  │                      │  [🔔 Remind]      │   │
│              │  │                      │  [✏️ Edit Info]   │   │
│              │  │                      │  [🗑️ Delete]      │   │
│              │  └──────────────────────┴───────────────────┘   │
└──────────────┴──────────────────────────────────────────────────┘
```

---

### 7.5 AI Chat Screen

```
┌──────────────┬──────────────────────────────────────────────────┐
│   SIDEBAR    │  💬 AI Chat                   [New Chat +]       │
│              ├──────────────────────────────────────────────────┤
│              │                                                  │
│              │  CHAT HISTORY (left panel, collapsible)          │
│              │  • Today                                         │
│              │    - "When does my passport expire?"             │
│              │    - "Find my degree certificate"                │
│              │  • Yesterday                                     │
│              │    - "What is my PAN number?"                    │
│              │                                                  │
│              ├──────────────────────────────────────────────────┤
│              │  CHAT AREA                                       │
│              │                                                  │
│              │  🧠 Memora AI                                    │
│              │  ┌─────────────────────────────────────────┐    │
│              │  │ Hello Rahul! I can help you find,        │    │
│              │  │ understand, and manage your documents.   │    │
│              │  │ What would you like to know?             │    │
│              │  └─────────────────────────────────────────┘    │
│              │                                                  │
│              │                ┌──────────────────────────────┐ │
│              │                │ When does my passport expire? │ │
│              │                └──────────────────────────────┘ │
│              │                                                  │
│              │  🧠 Memora AI                                    │
│              │  ┌─────────────────────────────────────────┐    │
│              │  │ Your Passport expires on 14 March 2027.  │    │
│              │  │ That is 245 days from now.               │    │
│              │  │                                          │    │
│              │  │ 📄 passport_scan.pdf                     │    │
│              │  │ [Set Reminder]  [View Document]          │    │
│              │  └─────────────────────────────────────────┘    │
│              │                                                  │
│              │  ──────────────────────────────────────────────  │
│              │  ┌───────────────────────────────────┐ [Send ▶] │
│              │  │  Ask anything about your docs...  │          │
│              │  └───────────────────────────────────┘          │
│              │  📎 Attach   🎤 Voice                            │
└──────────────┴──────────────────────────────────────────────────┘
```

---

### 7.6 Reminders Screen

```
┌──────────────┬──────────────────────────────────────────────────┐
│   SIDEBAR    │  🔔 Reminders              [+ Add Reminder]      │
│              ├──────────────────────────────────────────────────┤
│              │  [Upcoming] [All] [Expired] [Completed]          │
│              │                                                  │
│              │  THIS WEEK                                       │
│              │  ┌────────────────────────────────────────────┐  │
│              │  │ 🔴  Car Insurance                          │  │
│              │  │     Expires in 7 days · 26 Jul 2025        │  │
│              │  │     [View Doc]  [Renew Now]  [Snooze]      │  │
│              │  └────────────────────────────────────────────┘  │
│              │                                                  │
│              │  THIS MONTH                                      │
│              │  ┌────────────────────────────────────────────┐  │
│              │  │ 🟠  Passport                               │  │
│              │  │     Expires in 30 days · 19 Aug 2025       │  │
│              │  │     [View Doc]  [Renew Now]  [Snooze]      │  │
│              │  └────────────────────────────────────────────┘  │
│              │                                                  │
│              │  NEXT 3 MONTHS                                   │
│              │  ┌────────────────────────────────────────────┐  │
│              │  │ 🟡  Driving Licence                        │  │
│              │  │     Expires in 45 days · 3 Sep 2025        │  │
│              │  └────────────────────────────────────────────┘  │
└──────────────┴──────────────────────────────────────────────────┘
```

---

### 7.7 Universal Profile Screen

```
┌──────────────┬──────────────────────────────────────────────────┐
│   SIDEBAR    │  👤 My Profile                                   │
│              ├──────────────────────────────────────────────────┤
│              │                                                  │
│              │  ╔═══════╗  Rahul Sharma                         │
│              │  ║  R S  ║  rahul@email.com · +91 98765 43210   │
│              │  ╚═══════╝  Member since Jan 2025                │
│              │                                                  │
│              │  ──────────── PERSONAL INFO ─────────────────   │
│              │  Full Name          Rahul Sharma        [✏️]    │
│              │  Date of Birth      12 January 1995     [✏️]    │
│              │  Gender             Male                [✏️]    │
│              │  Address            42, MG Road, Pune   [✏️]    │
│              │  Nationality        Indian              [✏️]    │
│              │                                                  │
│              │  ──────────── ID NUMBERS ────────────────────   │
│              │  Aadhaar No.        •••• •••• 9012     [Copy]   │
│              │  PAN No.            ABCDE1234F          [Copy]   │
│              │  Passport No.       A1234567            [Copy]   │
│              │  Driving Lic.       MH12 20190012345    [Copy]   │
│              │                                                  │
│              │  ──────────── CONTACT ──────────────────────   │
│              │  Phone              +91 98765 43210     [Copy]   │
│              │  Email              rahul@email.com     [Copy]   │
│              │                                                  │
│              │  [📥 Export Profile as PDF]                      │
│              │  [📋 Copy Full Profile as JSON]                  │
│              │                                                  │
└──────────────┴──────────────────────────────────────────────────┘
```

---

## 8. Navigation Structure

```
PUBLIC ROUTES
  /                  → Landing Page
  /login             → Login
  /signup            → Sign Up
  /verify-email      → Email Verification
  /share/:token      → Public Document Viewer (secure share)

PRIVATE ROUTES (authenticated)
  /dashboard         → Dashboard (Home)
  /vault             → Document Vault
  /vault/:id         → Document Detail
  /chat              → AI Chat
  /reminders         → Reminders
  /profile           → Universal Profile
  /family            → Family Vault
  /settings          → Settings
  /notifications     → Notifications Center
```

---

## 9. Interaction Patterns

### 9.1 Upload — Drag & Drop

```
User drags file anywhere on the Vault page
         │
         ▼
Full-page drop zone appears with:
"Drop your document here"
[Violet pulsing border animation]
         │
         ▼
File dropped → Upload begins
```

### 9.2 Micro-animations

| Interaction | Animation |
|-------------|-----------|
| Page load | Fade-in + slide-up (200ms) |
| Card hover | Border glow + lift (translate Y -2px) |
| Button click | Scale down 0.97 → release |
| Upload complete | Checkmark draw animation |
| AI thinking | Pulsing dots loader |
| Notification toast | Slide in from right → fade out |
| Document card appear | Stagger fade-in (50ms delay each) |
| Modal open | Scale from 0.95 → 1.0 + fade |

### 9.3 Loading States

```
SKELETON LOADER (cards while loading):
┌─────────────────────────────────────┐
│  ░░░░░░░░░░░░░  ░░░░░░░            │  ← animated shimmer
│  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░     │
│  ░░░░░░░                           │
└─────────────────────────────────────┘

AI TYPING INDICATOR:
🧠  ● ● ●  (animated dots)
```

### 9.4 Empty States

```
EMPTY VAULT:
        ╔═════════════════╗
        ║    📄           ║
        ║                 ║
        ║  No documents   ║
        ║  yet.           ║
        ╚═════════════════╝
        Upload your first document
        to get started.
        [+ Upload Document]
```

---

## 10. Responsive Design

### 10.1 Breakpoints

| Breakpoint | Width | Layout |
|------------|-------|--------|
| Mobile | < 640px | Single column, bottom nav |
| Tablet | 640px–1024px | Icon-only sidebar |
| Desktop | 1024px–1440px | Full sidebar + content |
| Wide | > 1440px | Full sidebar + wider content |

### 10.2 Mobile Layout

```
┌────────────────────────┐
│  🧠 Memora AI    🔔 👤 │  ← top bar
├────────────────────────┤
│                        │
│   CONTENT AREA         │
│   (full width)         │
│                        │
├────────────────────────┤
│ 📊  🗃️  💬  🔔  👤    │  ← bottom navigation
└────────────────────────┘
```

---

## 11. Accessibility Guidelines

| Area | Guideline |
|------|-----------|
| **Color Contrast** | Minimum 4.5:1 ratio for all text |
| **Focus States** | Visible focus ring on all interactive elements |
| **ARIA Labels** | All icons and icon-buttons labeled |
| **Keyboard Nav** | Full keyboard navigation support |
| **Screen Reader** | Semantic HTML5 + ARIA roles used |
| **Error Messages** | Descriptive text, not just color indicators |
| **Font Size** | Minimum 12px for any text |
| **Touch Targets** | Minimum 44×44px on mobile |

---

## 12. Dark Mode

Memora AI is **dark mode native** — the primary experience.

### Light Mode (Optional, future)

| Token | Dark Mode | Light Mode |
|-------|-----------|------------|
| Background | `#0D0F14` | `#F7F9FC` |
| Surface | `#13161F` | `#FFFFFF` |
| Text Primary | `#EDF2FF` | `#1A202C` |
| Text Secondary | `#8892A4` | `#4A5568` |
| Border | `#262B3A` | `#E2E8F0` |

> Toggle switch in Settings → Appearance

---

## 🔗 Related Documentation

| Document | Purpose |
|----------|---------|
| [02_User_Workflow.md](./02_User_Workflow.md) | User flows these screens support |
| [09_Frontend_Guide.md](./09_Frontend_Guide.md) | Component implementation |
| [12_Hackathon_Demo.md](./12_Hackathon_Demo.md) | Which screens to demo |

---

<div align="center">

*Memora AI — Designed to feel as intelligent as it actually is.*

</div>
