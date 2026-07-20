# Memora AI - Testing Strategy and Guidelines

This document outlines the testing strategy, tools, configurations, and test cases for Memora AI. Our testing approach ensures that both frontend and backend components, as well as our complex AI pipelines, function reliably.

## 1. Testing Overview

For Memora AI, we use a combination of modern testing frameworks to cover different layers of the application:
- **Backend Testing**: We use **Jest** as the test runner and assertion library, along with **Supertest** for testing Express HTTP endpoints (integration tests).
- **Frontend Testing**: We use **Jest** combined with **React Testing Library (RTL)** to test React components in isolation, ensuring they render correctly and respond to user interactions.
- **AI Pipeline Testing**: Custom validation scripts and unit tests to mock and assert the outputs of Gemini API, Google Vision OCR, and Pinecone queries.

---

## 2. Backend Unit Tests

Unit tests focus on individual controllers and services, mocking external dependencies such as the database, Cloudinary/S3, and third-party APIs.

### `auth.controller.test.js`
```javascript
const { verifyToken } = require('../../controllers/auth.controller');
const clerkClient = require('@clerk/clerk-sdk-node');

jest.mock('@clerk/clerk-sdk-node');

describe('Auth Controller - verifyToken', () => {
  it('should authenticate a valid token', async () => {
    const req = { headers: { authorization: 'Bearer valid-token' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const next = jest.fn();

    clerkClient.verifyToken.mockResolvedValue({ id: 'user_123' });

    await verifyToken(req, res, next);

    expect(clerkClient.verifyToken).toHaveBeenCalledWith('valid-token');
    expect(req.user).toEqual({ id: 'user_123' });
    expect(next).toHaveBeenCalled();
  });

  it('should return 401 for invalid token', async () => {
    const req = { headers: { authorization: 'Bearer invalid' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const next = jest.fn();

    clerkClient.verifyToken.mockRejectedValue(new Error('Invalid token'));

    await verifyToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Unauthorized' });
  });
});
```

### `documents.controller.test.js`
```javascript
const documentController = require('../../controllers/documents.controller');
const Document = require('../../models/Document');

jest.mock('../../models/Document');

describe('Documents Controller', () => {
  describe('uploadDocument', () => {
    it('should upload and save document metadata', async () => {
      const req = { 
        user: { id: 'user_123' }, 
        file: { path: 'https://cloudinary.com/img.jpg', originalname: 'tax.pdf' } 
      };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      const mockDoc = { _id: 'doc_1', title: 'tax.pdf', url: req.file.path };
      Document.create.mockResolvedValue(mockDoc);

      await documentController.uploadDocument(req, res);

      expect(Document.create).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(mockDoc);
    });
  });

  describe('getDocuments', () => {
    it('should return user documents', async () => {
      const req = { user: { id: 'user_123' }, query: {} };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      
      Document.find.mockResolvedValue([{ title: 'tax.pdf' }]);
      
      await documentController.getDocuments(req, res);
      
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith([{ title: 'tax.pdf' }]);
    });
  });

  describe('deleteDocument', () => {
    it('should delete document and return 204', async () => {
      const req = { params: { id: 'doc_1' }, user: { id: 'user_123' } };
      const res = { status: jest.fn().mockReturnThis(), end: jest.fn() };

      Document.findOneAndDelete.mockResolvedValue({ _id: 'doc_1' });

      await documentController.deleteDocument(req, res);

      expect(res.status).toHaveBeenCalledWith(204);
      expect(res.end).toHaveBeenCalled();
    });
  });
});
```

### `share.controller.test.js`
```javascript
const shareController = require('../../controllers/share.controller');
const ShareLink = require('../../models/ShareLink');

jest.mock('../../models/ShareLink');

describe('Share Controller', () => {
  it('should create a secure share link', async () => {
    const req = { body: { documentId: 'doc_1', expiresIn: '7d', requiresOtp: true } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    ShareLink.create.mockResolvedValue({ token: 'abc-123', documentId: 'doc_1' });

    await shareController.createShareLink(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveProperty('token', 'abc-123');
  });

  it('should verify OTP successfully', async () => {
    const req = { body: { token: 'abc-123', otp: '123456' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    ShareLink.findOne.mockResolvedValue({ token: 'abc-123', otp: '123456', documentId: 'doc_1' });

    await shareController.verifyOtp(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveProperty('verified', true);
  });
});
```

### `reminder.service.test.js`
```javascript
const reminderService = require('../../services/reminder.service');
const Reminder = require('../../models/Reminder');

jest.mock('../../models/Reminder');

describe('Reminder Service', () => {
  it('should auto-create reminder based on extracted expiry date', async () => {
    const extractedData = { expiryDate: '2026-12-31' };
    const documentId = 'doc_1';
    const userId = 'user_123';

    Reminder.create.mockResolvedValue({ documentId, date: '2026-12-31' });

    const result = await reminderService.createAutoReminder(userId, documentId, extractedData);

    expect(Reminder.create).toHaveBeenCalledWith(expect.objectContaining({
      userId,
      documentId,
      triggerDate: new Date('2026-12-24') // 7 days before
    }));
    expect(result).toBeDefined();
  });
});
```

### `ai.service.test.js`
```javascript
const aiService = require('../../services/ai.service');
const { GoogleGenerativeAI } = require('@google/genai');

jest.mock('@google/genai');

describe('AI Service - Gemini API', () => {
  it('should parse and mock Gemini response correctly', async () => {
    const mockGenerateContent = jest.fn().mockResolvedValue({
      response: { text: () => JSON.stringify({ category: 'Invoice', total: 100 }) }
    });
    
    GoogleGenerativeAI.mockImplementation(() => ({
      getGenerativeModel: () => ({ generateContent: mockGenerateContent })
    }));

    const result = await aiService.analyzeDocumentText('Invoice total is $100');
    
    expect(result.category).toBe('Invoice');
    expect(result.total).toBe(100);
  });
});
```

---

## 3. Backend Integration Tests (Supertest)

Integration tests hit the actual Express app to test request/response cycles. The database is usually mocked or connected to an in-memory instance (like `mongodb-memory-server`).

### `api.integration.test.js`
```javascript
const request = require('supertest');
const app = require('../../app'); // Express app instance
const jwt = require('jsonwebtoken'); // Assuming mocked auth middleware

// Mock token for authenticated routes
const token = 'mock-jwt-token';

describe('Document API Endpoints', () => {
  it('POST /api/v1/documents - should upload a file', async () => {
    const res = await request(app)
      .post('/api/v1/documents')
      .set('Authorization', `Bearer ${token}`)
      .attach('file', Buffer.from('test'), 'test.pdf');
      
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('id');
  });

  it('GET /api/v1/documents - should fetch documents', async () => {
    const res = await request(app)
      .get('/api/v1/documents')
      .set('Authorization', `Bearer ${token}`);
      
    expect(res.statusCode).toEqual(200);
    expect(Array.isArray(res.body)).toBeTruthy();
  });
});

describe('Chat API Endpoints', () => {
  it('POST /api/v1/chat/message - should return RAG answer', async () => {
    const res = await request(app)
      .post('/api/v1/chat/message')
      .set('Authorization', `Bearer ${token}`)
      .send({ message: 'What is my total tax?' });
      
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('reply');
  });
});

describe('Share API Endpoints', () => {
  it('POST /api/v1/share - should generate share link', async () => {
    const res = await request(app)
      .post('/api/v1/share')
      .set('Authorization', `Bearer ${token}`)
      .send({ documentId: '123' });
      
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('token');
  });

  it('GET /api/v1/share/:token - should access public document', async () => {
    const res = await request(app)
      .get('/api/v1/share/valid-token-123');
      
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('documentUrl');
  });
});
```

---

## 4. Frontend Component Tests (React Testing Library)

### `DocumentCard.test.jsx`
```jsx
import { render, screen } from '@testing-library/react';
import DocumentCard from '../components/DocumentCard';

describe('DocumentCard', () => {
  const mockDoc = { title: 'Passport.pdf', category: 'ID', date: '2026-07-19' };

  it('renders document details correctly', () => {
    render(<DocumentCard document={mockDoc} />);
    
    expect(screen.getByText('Passport.pdf')).toBeInTheDocument();
    expect(screen.getByText('ID')).toBeInTheDocument();
    expect(screen.getByText('2026-07-19')).toBeInTheDocument();
  });
});
```

### `UploadModal.test.jsx`
```jsx
import { render, screen, fireEvent } from '@testing-library/react';
import UploadModal from '../components/UploadModal';

describe('UploadModal', () => {
  it('opens and closes correctly', () => {
    const onClose = jest.fn();
    render(<UploadModal isOpen={true} onClose={onClose} />);
    
    expect(screen.getByText('Upload Document')).toBeInTheDocument();
    
    const closeButton = screen.getByRole('button', { name: /close/i });
    fireEvent.click(closeButton);
    
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
```

### `ChatWindow.test.jsx`
```jsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ChatWindow from '../components/ChatWindow';

describe('ChatWindow', () => {
  it('sends a message and clears input', async () => {
    const onSendMessage = jest.fn().mockResolvedValue();
    render(<ChatWindow onSendMessage={onSendMessage} />);
    
    const input = screen.getByPlaceholderText('Ask about your documents...');
    const sendButton = screen.getByRole('button', { name: /send/i });
    
    fireEvent.change(input, { target: { value: 'Find my tax forms' } });
    fireEvent.click(sendButton);
    
    expect(onSendMessage).toHaveBeenCalledWith('Find my tax forms');
    await waitFor(() => {
      expect(input.value).toBe('');
    });
  });
});
```

---

## 5. AI Pipeline Tests

These tests evaluate the core accuracy and stability of our AI processing (OCR, Classification, Extraction, RAG).

### 5.1 OCR Output Validation
```javascript
it('should correctly extract text from test image using Vision API', async () => {
  const result = await visionService.extractText('tests/fixtures/sample_invoice.png');
  expect(result.text).toContain('Invoice #1029');
  expect(result.confidenceScore).toBeGreaterThan(0.85);
});
```

### 5.2 Classification Accuracy Test Cases

We use a fixed dataset to measure classification prompt accuracy.

| Document Type | Sample File | Expected Classification | Pass/Fail |
|---------------|-------------|-------------------------|-----------|
| Passport      | pass_1.jpg  | Identity Document       | Pass      |
| W-2 Form      | w2_2025.pdf | Tax Document            | Pass      |
| Electricity Bill | util.pdf | Utility Bill            | Pass      |
| Rent Agreement| lease.pdf   | Contract                | Pass      |
| Rx Receipt    | rx_01.jpg   | Medical Record          | Pass      |
| Bank Statement| chase.pdf   | Financial               | Pass      |
| Car Insurance | geico.pdf   | Insurance               | Pass      |
| Warranty Card | sony.jpg    | Warranty/Receipt        | Pass      |
| Paystub       | pay_1.pdf   | Employment              | Pass      |
| Vaccination   | vax.pdf     | Medical Record          | Pass      |

### 5.3 Extraction Field Validation
```javascript
it('should extract correct metadata fields from a receipt', async () => {
  const text = "Store: Target\nDate: 2026-07-15\nTotal: $45.99";
  const extracted = await aiService.extractMetadata(text);
  
  expect(extracted.vendor).toBe('Target');
  expect(extracted.amount).toBe(45.99);
  expect(extracted.date).toBe('2026-07-15');
});
```

### 5.4 RAG Answer Grounding Test
```javascript
it('should return context-aware answers based on Pinecone vector search', async () => {
  const userQuery = "What is the policy number for my car insurance?";
  
  // Mock Pinecone returning relevant chunks
  mockPineconeSearch.mockResolvedValue([{ text: "Your auto policy number is POL-998877." }]);
  
  const answer = await ragService.generateAnswer(userQuery, 'user_123');
  
  expect(answer).toContain('POL-998877');
});
```

---

## 6. Manual QA Test Cases

While automated tests cover regressions, Manual QA is necessary for UX and end-to-end flows.

| Feature | Steps to Reproduce | Expected Result | Status |
|---------|--------------------|-----------------|--------|
| **Onboarding** | 1. Sign up via Clerk<br>2. Complete intro steps | User lands on Empty Dashboard | ⬜ |
| **Doc Upload** | 1. Drag & drop PDF<br>2. Wait for AI processing | Doc appears with correct auto-tags | ⬜ |
| **Search** | 1. Type "Tax 2025" in search bar | Shows related W-2s and 1099s | ⬜ |
| **Chatbot** | 1. Open Chat<br>2. Ask "When does my passport expire?" | Bot replies with accurate date | ⬜ |
| **Secure Share**| 1. Click Share<br>2. Toggle OTP<br>3. Open link in incognito | Requires OTP before viewing | ⬜ |
| **Responsive** | 1. Open app on mobile device browser<br>2. Open navigation | Mobile menu functions properly | ⬜ |

---

## 7. Test Environment Setup (`.env.test`)

Create a `.env.test` file in the root directory to ensure tests don't pollute the production or dev databases.

```env
NODE_ENV=test
PORT=4000

# Use an in-memory DB or local test DB
MONGODB_URI=mongodb://localhost:27017/memora_test

# Mocked Secrets
CLERK_SECRET_KEY=test_clerk_key
GEMINI_API_KEY=test_gemini_key
PINECONE_API_KEY=test_pinecone_key

# Disable real Cloudinary uploads during tests
USE_MOCK_STORAGE=true
```

---

## 8. Jest Configuration (`jest.config.js`)

```javascript
module.exports = {
  testEnvironment: 'node',
  setupFilesAfterEnv: ['./jest.setup.js'],
  testMatch: ['**/__tests__/**/*.js?(x)', '**/?(*.)+(spec|test).js?(x)'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy' // For frontend CSS modules
  },
  collectCoverageFrom: [
    'src/**/*.{js,jsx}',
    '!src/index.js',
    '!src/reportWebVitals.js'
  ],
  coverageDirectory: 'coverage',
};
```

---

## 9. Test Coverage Targets

We aim for the following code coverage minimums to maintain a robust codebase:

- **Statements**: 80%
- **Branches**: 75%
- **Functions**: 80%
- **Lines**: 80%

Coverage is enforced in our CI/CD pipeline (GitHub Actions). Builds will fail if coverage drops below these thresholds.

---

## 10. Testing Commands

Run these commands from the root or respective `client`/`server` directories.

```bash
# Run all tests
npm test

# Run tests in watch mode (useful during development)
npm run test:watch

# Run tests and generate coverage report
npm run test:coverage

# Run specific test file
npm test -- auth.controller.test.js

# Frontend specific (React)
cd client
npm test
```
