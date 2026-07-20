# Memora AI: Deployment Guide

This document outlines the complete deployment process for Memora AI. Memora AI consists of a React frontend and a Node.js/Express backend. 

## 1. Deployment Overview
*   **Frontend:** Vercel (Recommended) or Netlify.
*   **Backend:** Railway (Recommended) or Render.
*   **Database:** MongoDB Atlas.
*   **Vector Database:** Pinecone.
*   **Authentication:** Clerk.
*   **Media Storage:** Cloudinary.

## 2. Prerequisites
Before beginning deployment, ensure you have accounts created for the following services:
*   [Node.js 20+](https://nodejs.org/) (for local builds and tests)
*   [MongoDB Atlas](https://www.mongodb.com/atlas/database)
*   [Clerk](https://clerk.com/)
*   [Cloudinary](https://cloudinary.com/)
*   [Google Gemini API](https://ai.google.dev/)
*   [Pinecone](https://www.pinecone.io/)
*   [GitHub](https://github.com/) (to host the repository)
*   [Vercel](https://vercel.com/)
*   [Railway](https://railway.app/)

## 3. Environment Setup

### Backend `.env`
Create a `.env` file in the root of your `backend` directory.

```env
# Server
PORT=5000
NODE_ENV=production
CLIENT_URL=https://memora-ai.vercel.app # Update with your Vercel URL

# Database
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/memora

# Authentication (Clerk)
CLERK_SECRET_KEY=sk_test_...

# AI & OCR
GEMINI_API_KEY=AIza...
OPENAI_API_KEY=sk-... # If using OpenAI as fallback

# Vector DB
PINECONE_API_KEY=...
PINECONE_INDEX_NAME=memora-docs

# Media Storage
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
```

### Frontend `.env`
Create a `.env` file in the root of your `frontend` directory.

```env
VITE_API_BASE_URL=https://memora-api.railway.app # Update with your Railway URL

# Clerk Auth
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
```

## 4. MongoDB Atlas Setup
1.  **Create a Cluster:** Log in to MongoDB Atlas and create a new free-tier cluster (M0).
2.  **Network Access (IP Whitelist):** Go to **Network Access** and click **Add IP Address**. Choose **Allow Access from Anywhere** (`0.0.0.0/0`) since Railway IP addresses are dynamic.
3.  **Database Access:** Go to **Database Access** and create a new database user with a secure password. Remember these credentials.
4.  **Get Connection URI:** Click **Connect** on your cluster, choose **Drivers**, select Node.js, and copy the connection string. Replace `<username>` and `<password>` with your database user credentials.

## 5. Clerk Auth Setup
1.  **Create Application:** Go to the Clerk Dashboard and click **Add Application**. Select your preferred sign-in methods (e.g., Email, Google).
2.  **Get Keys:** Go to **API Keys** in the sidebar. Copy the **Publishable Key** for the frontend and **Secret Key** for the backend.
3.  **Configure Redirects:** In the Clerk Dashboard under **Paths**, configure the **After Sign In** and **After Sign Up** redirect URLs to your frontend deployment URL (e.g., `https://memora-ai.vercel.app/dashboard`).

## 6. Cloudinary Setup
1.  **Get Credentials:** Log in to Cloudinary and go to your **Dashboard**. Copy your **Cloud Name**, **API Key**, and **API Secret**.
2.  **Folder Structure:** While optional, it's recommended to create a folder in your Cloudinary Media Library (e.g., `memora_uploads`) to keep user-uploaded documents organized. Update your backend upload logic to use this folder.

## 7. Pinecone Setup
1.  **Create Index:** Log in to Pinecone and click **Create Index**.
2.  **Configuration:**
    *   **Name:** `memora-docs`
    *   **Dimensions:** Match the embedding model you are using (e.g., 768 for Gemini, 1536 for OpenAI).
    *   **Metric:** `cosine`
3.  **Get API Key:** Go to **API Keys** and copy your key.

## 8. Backend Deployment on Railway
1.  **Connect GitHub Repo:** Log in to Railway, click **New Project**, and select **Deploy from GitHub repo**. Choose your Memora AI repository. Select the `backend` folder as the root directory if it's a monorepo, or deploy the backend repo.
2.  **Set Environment Variables:** Go to the **Variables** tab of your Railway service and add all the variables from your backend `.env` file.
3.  **Deploy Command:** Railway should automatically detect it as a Node.js app. Verify the Start Command in settings is:
    ```bash
    node server.js
    ```
4.  **Health Check URL:** Ensure your backend has a `/health` route. Railway will use this to verify deployment success.
    ```javascript
    app.get('/health', (req, res) => res.status(200).send('OK'));
    ```
5.  **Generate Domain:** Under the **Settings** tab > **Environment** > **Domains**, click **Generate Domain** to get your public API URL.

## 9. Frontend Deployment on Vercel
1.  **Connect GitHub Repo:** Log in to Vercel, click **Add New** > **Project**, and import your Memora AI repository.
2.  **Configure Project:**
    *   **Framework Preset:** Vite
    *   **Root Directory:** `frontend` (if using a monorepo)
3.  **Set Environment Variables:** Expand the **Environment Variables** section and add all `VITE_` variables from your frontend `.env`.
4.  **Build Settings:** Ensure the following are set (usually auto-detected):
    *   **Build Command:** `npm run build`
    *   **Output Directory:** `dist`
5.  **Deploy:** Click **Deploy**. Vercel will build and assign a public URL.

## 10. GitHub Actions CI/CD Pipeline
Create a `.github/workflows/deploy.yml` file in your repository to automatically deploy to Vercel and Railway on pushes to the `main` branch. Note: Railway and Vercel often auto-deploy on push natively if connected to GitHub, but a manual pipeline can provide more control.

```yaml
name: Memora AI CI/CD

on:
  push:
    branches:
      - main

jobs:
  build-and-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Use Node.js 20
        uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'npm'
      - name: Install Frontend Deps
        run: cd frontend && npm install
      - name: Build Frontend
        run: cd frontend && npm run build
      - name: Install Backend Deps
        run: cd backend && npm install

  # Deployment steps can be omitted if using Vercel/Railway native GitHub integrations.
```

## 11. Domain & CORS Configuration
1.  **Backend CORS:** Update your Express server to accept requests from your Vercel domain.
    ```javascript
    const corsOptions = {
      origin: ['https://memora-ai.vercel.app', 'http://localhost:5173'],
      credentials: true,
    };
    app.use(cors(corsOptions));
    ```
2.  **Custom Domains (Optional):** Add custom domains in Vercel (Frontend) and Railway (Backend) settings and update DNS records accordingly. Remember to update `CLIENT_URL` and `VITE_API_BASE_URL` if you change domains.

## 12. 10-Phase Development Roadmap

- [ ] **Phase 1: Project Initialization & Setup** (Repo setup, base React/Express apps, styling configs).
- [ ] **Phase 2: Authentication** (Clerk integration, protected routes, user context).
- [ ] **Phase 3: Database & Core Models** (MongoDB connection, User, Document, and Tag schemas).
- [ ] **Phase 4: Document Upload & Storage** (Cloudinary integration, multer setup, frontend upload UI).
- [ ] **Phase 5: OCR & Text Extraction** (Tesseract/Google Vision integration to extract text from images/PDFs).
- [ ] **Phase 6: Vectorization & Pinecone Integration** (Generate embeddings using Gemini API, store in Pinecone).
- [ ] **Phase 7: Semantic Search & AI Chat** (Implement vector search, hook up Gemini API for Q&A on documents).
- [ ] **Phase 8: Frontend UI Polish** (Framer Motion animations, responsive design, dashboard layout).
- [ ] **Phase 9: Testing & Optimization** (Unit tests, performance profiling, error handling).
- [ ] **Phase 10: Production Deployment** (Deploy to Vercel/Railway following this guide).

## 13. Post-Deployment Verification Checklist
- [ ] Visit frontend URL and ensure it loads without errors.
- [ ] Test user registration and login via Clerk.
- [ ] Upload a test document (PDF/Image) and verify it appears in Cloudinary.
- [ ] Check MongoDB Atlas to ensure the document metadata is saved.
- [ ] Verify OCR text extraction in the UI.
- [ ] Search for a term and verify semantic search retrieves the correct document.
- [ ] Ask a question to the AI assistant regarding the uploaded document and verify the response.
- [ ] Check browser console and server logs for any unhandled errors or warnings.

## 14. Common Errors and Fixes

| Error | Cause | Fix |
| :--- | :--- | :--- |
| **CORS Error on frontend fetch** | Backend `origin` is not configured correctly. | Ensure `CLIENT_URL` in backend matches the exact Vercel frontend URL (no trailing slash). |
| **502 Bad Gateway / Application Error on Railway** | Server crashed on startup. | Check Railway deployment logs. Ensure `PORT` is correctly bound (`process.env.PORT \|\| 5000`) and DB connection is successful. |
| **Clerk "Missing Publishable Key"** | Frontend env var missing. | Verify `VITE_CLERK_PUBLISHABLE_KEY` is added to Vercel environment variables. |
| **MongoDB Network Timeout** | IP Whitelist is restricted. | Ensure MongoDB Atlas Network Access includes `0.0.0.0/0`. |
| **Pinecone 401 Unauthorized** | Invalid API Key or Index Name. | Double-check `PINECONE_API_KEY` and ensure the `PINECONE_INDEX_NAME` exactly matches the one created. |
| **Vite build fails on Vercel** | Missing dependency or ESLint error. | Check Vercel build logs. Ensure all dependencies are in `package.json` and fix any strict TS/ESLint errors. |
