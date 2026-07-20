# Memora AI - Frontend Guide

## 1. Frontend Overview

Memora AI's frontend is a React Single Page Application (SPA) built using Vite for fast development and optimized production builds. It leverages Tailwind CSS for styling, React Router for navigation, and Framer Motion for fluid animations.

### Folder Structure
```text
src/
├── assets/         # Static assets (images, icons, etc.)
├── components/     # Reusable UI components
│   ├── common/     # Buttons, Modals, Inputs
│   ├── layout/     # Sidebar, Header, PageWrappers
│   └── specific/   # ChatWindow, DocumentCard, etc.
├── context/        # React Context providers
├── hooks/          # Custom React hooks
├── pages/          # Page components corresponding to routes
├── services/       # API clients and external service integrations
├── styles/         # Global styles and Tailwind configuration
├── types/          # TypeScript interfaces/types (if using TS)
├── utils/          # Helper functions and formatters
├── App.jsx         # Root component
└── main.jsx        # Entry point
```

## 2. Design System Implementation

Memora AI uses Tailwind CSS extended with custom color tokens and CSS variables for theming.

### `tailwind.config.js`
```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: 'var(--color-primary)',
        secondary: 'var(--color-secondary)',
        background: 'var(--color-background)',
        surface: 'var(--color-surface)',
        text: 'var(--color-text)',
        textMuted: 'var(--color-text-muted)',
        accent: 'var(--color-accent)',
        danger: 'var(--color-danger)'
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
```

### `src/styles/global.css`
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --color-primary: #4f46e5; /* Indigo 600 */
  --color-secondary: #ec4899; /* Pink 500 */
  --color-background: #f9fafb; /* Gray 50 */
  --color-surface: #ffffff;
  --color-text: #111827; /* Gray 900 */
  --color-text-muted: #6b7280; /* Gray 500 */
  --color-accent: #10b981; /* Emerald 500 */
  --color-danger: #ef4444; /* Red 500 */
}

@media (prefers-color-scheme: dark) {
  :root {
    --color-background: #111827;
    --color-surface: #1f2937;
    --color-text: #f9fafb;
    --color-text-muted: #9ca3af;
  }
}

body {
  background-color: var(--color-background);
  color: var(--color-text);
  font-family: 'Inter', sans-serif;
}
```

## 3. Routing Setup

We use React Router v6 for declarative routing. The app is divided into public routes (Landing, Share View) and private routes (Dashboard, Vault).

### `src/App.jsx`
```jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ClerkProvider } from '@clerk/clerk-react';
import ProtectedRoute from './components/layout/ProtectedRoute';

// Pages
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import DocumentVault from './pages/DocumentVault';
import DocumentDetail from './pages/DocumentDetail';
import AIChat from './pages/AIChat';
import Reminders from './pages/Reminders';
import Profile from './pages/Profile';
import ShareView from './pages/ShareView';

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

function App() {
  return (
    <ClerkProvider publishableKey={clerkPubKey}>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/shared/:shareId" element={<ShareView />} />
          
          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/vault" element={<DocumentVault />} />
            <Route path="/document/:id" element={<DocumentDetail />} />
            <Route path="/chat" element={<AIChat />} />
            <Route path="/reminders" element={<Reminders />} />
            <Route path="/profile" element={<Profile />} />
          </Route>
        </Routes>
      </Router>
    </ClerkProvider>
  );
}

export default App;
```

### `src/components/layout/ProtectedRoute.jsx`
```jsx
import { useAuth } from '@clerk/clerk-react';
import { Navigate, Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

const ProtectedRoute = () => {
  const { isLoaded, userId } = useAuth();

  if (!isLoaded) return <div>Loading...</div>;
  if (!userId) return <Navigate to="/" />;

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-8">
        <Outlet />
      </main>
    </div>
  );
};

export default ProtectedRoute;
```

## 4. State Management

While React Query or SWR is recommended for server state, we use React Context for global app state (like theme, or locally cached document lists).

### `src/context/DocumentContext.jsx`
```jsx
import { createContext, useContext, useState, useCallback } from 'react';

const DocumentContext = createContext();

export const DocumentProvider = ({ children }) => {
  const [documents, setDocuments] = useState([]);
  const [activeDocument, setActiveDocument] = useState(null);

  const addDocument = useCallback((doc) => {
    setDocuments((prev) => [doc, ...prev]);
  }, []);

  return (
    <DocumentContext.Provider value={{ documents, setDocuments, activeDocument, setActiveDocument, addDocument }}>
      {children}
    </DocumentContext.Provider>
  );
};

export const useDocumentContext = () => useContext(DocumentContext);
```

## 5. API Client

We configure an Axios instance that intercepts requests to attach the Clerk JWT for backend authentication.

### `src/services/apiClient.js`
```javascript
import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Setup interceptor dynamically in a hook or wrapper
export const setupInterceptors = (getToken) => {
  apiClient.interceptors.request.use(async (config) => {
    const token = await getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });
};

export default apiClient;
```

## 6. Pages

Here is the component structure for key pages:

- **Landing Page**: Hero Section, Feature Highlights, Footer, `SignInButton` / `SignUpButton`.
- **Login / Signup**: Handled via Clerk's `<SignIn />` and `<SignUp />` components.
- **Dashboard**: Quick Stats, Recent Documents List, Upcoming Reminders Widget.
- **Document Vault**: Search Bar, Filter Tabs, Grid of `DocumentCard`s, `UploadModal` trigger.
- **Document Detail**: Document Viewer (PDF/Image), Metadata Sidebar, Action Buttons (Share, Delete).
- **AI Chat**: `ChatWindow`, `ChatBubble`s, Context Selector (which doc to chat with).
- **Reminders**: Calendar/List view of `ReminderCard`s, Create Reminder Form.
- **Profile**: Clerk's `<UserProfile />` component, usage stats.
- **Share View (public)**: Read-only viewer for shared documents, minimal header.

## 7. Key Components

### `Sidebar.jsx`
```jsx
import { NavLink } from 'react-router-dom';
import { UserButton } from '@clerk/clerk-react';

const Sidebar = () => {
  return (
    <aside className="w-64 bg-surface border-r border-gray-200 flex flex-col h-full">
      <div className="p-6 font-bold text-2xl text-primary">Memora AI</div>
      <nav className="flex-1 px-4 space-y-2">
        <NavLink to="/dashboard" className={({ isActive }) => `block px-4 py-2 rounded-md ${isActive ? 'bg-primary text-white' : 'text-text hover:bg-gray-100'}`}>Dashboard</NavLink>
        <NavLink to="/vault" className={({ isActive }) => `block px-4 py-2 rounded-md ${isActive ? 'bg-primary text-white' : 'text-text hover:bg-gray-100'}`}>Vault</NavLink>
        <NavLink to="/chat" className={({ isActive }) => `block px-4 py-2 rounded-md ${isActive ? 'bg-primary text-white' : 'text-text hover:bg-gray-100'}`}>AI Chat</NavLink>
        <NavLink to="/reminders" className={({ isActive }) => `block px-4 py-2 rounded-md ${isActive ? 'bg-primary text-white' : 'text-text hover:bg-gray-100'}`}>Reminders</NavLink>
      </nav>
      <div className="p-4 border-t border-gray-200">
        <UserButton afterSignOutUrl="/" />
      </div>
    </aside>
  );
};
export default Sidebar;
```

### `DocumentCard.jsx`
```jsx
import { motion } from 'framer-motion';

const DocumentCard = ({ document, onClick }) => {
  return (
    <motion.div 
      whileHover={{ y: -5, boxShadow: '0px 10px 20px rgba(0,0,0,0.1)' }}
      className="bg-surface p-4 rounded-xl shadow-sm border border-gray-100 cursor-pointer transition-colors hover:border-primary"
      onClick={() => onClick(document._id)}
    >
      <div className="h-32 bg-gray-100 rounded-lg mb-4 flex items-center justify-center text-textMuted">
        {/* Placeholder for thumbnail */}
        {document.fileType === 'application/pdf' ? 'PDF' : 'IMAGE'}
      </div>
      <h3 className="font-semibold text-text truncate">{document.title}</h3>
      <p className="text-sm text-textMuted mt-1">{new Date(document.createdAt).toLocaleDateString()}</p>
    </motion.div>
  );
};
export default DocumentCard;
```

### `UploadModal.jsx`
```jsx
import { useState } from 'react';
import { motion } from 'framer-motion';

const UploadModal = ({ isOpen, onClose, onUpload }) => {
  const [dragActive, setDragActive] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-surface rounded-2xl p-8 w-full max-w-md shadow-2xl relative"
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800">&times;</button>
        <h2 className="text-xl font-bold mb-4 text-text">Upload Document</h2>
        <div 
          className={`border-2 border-dashed rounded-xl p-10 text-center transition-colors ${dragActive ? 'border-primary bg-indigo-50' : 'border-gray-300 bg-gray-50'}`}
          onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
          onDragLeave={() => setDragActive(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragActive(false);
            if(e.dataTransfer.files && e.dataTransfer.files[0]) {
              onUpload(e.dataTransfer.files[0]);
            }
          }}
        >
          <p className="text-textMuted">Drag and drop your file here, or click to browse</p>
          <input type="file" className="hidden" id="file-upload" onChange={(e) => onUpload(e.target.files[0])} />
          <label htmlFor="file-upload" className="mt-4 inline-block px-4 py-2 bg-primary text-white rounded-lg cursor-pointer hover:bg-indigo-700">Browse Files</label>
        </div>
      </motion.div>
    </div>
  );
};
export default UploadModal;
```

### `ChatWindow.jsx` & `ChatBubble.jsx`
```jsx
import { useState } from 'react';

const ChatBubble = ({ message }) => (
  <div className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} mb-4`}>
    <div className={`max-w-xs md:max-w-md p-3 rounded-2xl ${message.role === 'user' ? 'bg-primary text-white rounded-tr-none' : 'bg-gray-100 text-text rounded-tl-none'}`}>
      {message.content}
    </div>
  </div>
);

const ChatWindow = ({ messages, onSendMessage }) => {
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (input.trim()) {
      onSendMessage(input);
      setInput('');
    }
  };

  return (
    <div className="flex flex-col h-full bg-surface rounded-xl shadow-sm border border-gray-200">
      <div className="flex-1 overflow-y-auto p-4">
        {messages.map((msg, idx) => <ChatBubble key={idx} message={msg} />)}
      </div>
      <div className="p-4 border-t border-gray-200 flex gap-2">
        <input 
          type="text" 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-primary"
          placeholder="Ask something about your documents..."
        />
        <button onClick={handleSend} className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-indigo-700">Send</button>
      </div>
    </div>
  );
};
export default ChatWindow;
```

### `ReminderCard.jsx`
```jsx
const ReminderCard = ({ reminder }) => {
  return (
    <div className="bg-surface p-4 rounded-xl border-l-4 border-accent shadow-sm mb-3">
      <div className="flex justify-between items-start">
        <div>
          <h4 className="font-bold text-text">{reminder.title}</h4>
          <p className="text-sm text-textMuted mt-1">Due: {new Date(reminder.dueDate).toLocaleString()}</p>
        </div>
        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${reminder.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
          {reminder.status}
        </span>
      </div>
    </div>
  );
};
export default ReminderCard;
```

## 8. Custom Hooks

Abstracting API calls and logic into custom hooks keeps components clean.

### `useDocuments.js`
```javascript
import { useState, useEffect } from 'react';
import apiClient from '../services/apiClient';

export const useDocuments = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/documents');
      setDocuments(res.data);
    } catch (error) {
      console.error("Failed to fetch documents", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  return { documents, loading, refetch: fetchDocuments };
};
```
*(Similarly implement `useChat`, `useReminders`, `useProfile` following this pattern)*.

## 9. Framer Motion Animations

Framer Motion is used for micro-interactions and page transitions.

**Page Transition Wrapper:**
```jsx
import { motion } from 'framer-motion';

export const PageTransition = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    transition={{ duration: 0.3 }}
  >
    {children}
  </motion.div>
);
```

**Upload Pulse Animation (CSS or Framer):**
```jsx
<motion.div
  animate={{ scale: [1, 1.02, 1] }}
  transition={{ repeat: Infinity, duration: 2 }}
  className="upload-dropzone"
>
  Drop files here
</motion.div>
```

## 10. Environment Variables

Store frontend secrets in `.env`. Vite requires the `VITE_` prefix.

```env
# .env
VITE_CLERK_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxxxxxxxxxx
VITE_API_URL=http://localhost:5000/api
VITE_APP_ENV=development
```

## 11. Scripts & Dev Server Setup

### `package.json` scripts
```json
{
  "name": "memora-ai-frontend",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "lint": "eslint . --ext js,jsx --report-unused-disable-directives --max-warnings 0",
    "preview": "vite preview"
  }
}
```

### `vite.config.js`
```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true
      }
    }
  }
})
```
