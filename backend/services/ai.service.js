const { getGemini } = require('../config/gemini');

// Simple cosine similarity for in-memory vector search
const cosineSimilarity = (a, b) => {
  if (!a || !b || a.length !== b.length) return 0;
  const dot = a.reduce((sum, v, i) => sum + v * b[i], 0);
  const normA = Math.sqrt(a.reduce((sum, v) => sum + v * v, 0));
  const normB = Math.sqrt(b.reduce((sum, v) => sum + v * v, 0));
  if (normA === 0 || normB === 0) return 0;
  return dot / (normA * normB);
};

// Mock embedding: simple bag-of-words style vector (128 dimensions)
const mockEmbedding = (text) => {
  const vector = new Array(128).fill(0);
  const words = text.toLowerCase().split(/\s+/);
  words.forEach((word, i) => {
    const idx = word.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) % 128;
    vector[idx] += 1;
  });
  // Normalize
  const norm = Math.sqrt(vector.reduce((s, v) => s + v * v, 0)) || 1;
  return vector.map(v => v / norm);
};

/**
 * Generate text embedding
 * Uses Gemini if available, else falls back to mock
 */
const generateEmbedding = async (text) => {
  const gemini = getGemini();
  if (!gemini) return mockEmbedding(text);

  try {
    const model = gemini.getGenerativeModel({ model: 'text-embedding-004' });
    const result = await model.embedContent(text);
    return result.embedding.values;
  } catch (err) {
    console.warn('Embedding failed, using mock:', err.message);
    return mockEmbedding(text);
  }
};

/**
 * Classify document type and category from extracted text
 */
const classifyDocument = async (rawText) => {
  const gemini = getGemini();

  if (!gemini) {
    // Mock classification based on keywords
    const text = rawText.toLowerCase();
    if (text.includes('passport') || text.includes('travel document')) return { documentType: 'Passport', category: 'identity' };
    if (text.includes('pan') || text.includes('income tax')) return { documentType: 'PAN Card', category: 'financial' };
    if (text.includes('aadhaar') || text.includes('aadhar') || text.includes('uid')) return { documentType: 'Aadhaar Card', category: 'identity' };
    if (text.includes('driving') || text.includes('licence') || text.includes('license')) return { documentType: 'Driving Licence', category: 'vehicle' };
    if (text.includes('insurance') || text.includes('policy')) return { documentType: 'Insurance Policy', category: 'financial' };
    if (text.includes('degree') || text.includes('certificate') || text.includes('marksheet') || text.includes('university')) return { documentType: 'Academic Certificate', category: 'education' };
    if (text.includes('salary') || text.includes('payslip') || text.includes('payroll')) return { documentType: 'Salary Slip', category: 'professional' };
    if (text.includes('medical') || text.includes('prescription') || text.includes('doctor') || text.includes('hospital')) return { documentType: 'Medical Record', category: 'medical' };
    if (text.includes('property') || text.includes('agreement') || text.includes('rent')) return { documentType: 'Property Document', category: 'property' };
    if (text.includes('birth')) return { documentType: 'Birth Certificate', category: 'identity' };
    return { documentType: 'General Document', category: 'other' };
  }

  try {
    const model = gemini.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const prompt = `Classify this document. Return ONLY valid JSON with these exact fields:
{
  "documentType": "specific document name like Passport, PAN Card, Degree Certificate, etc.",
  "category": "one of: identity, education, professional, medical, financial, property, vehicle, legal, other"
}

Document text:
${rawText.substring(0, 2000)}`;

    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) return JSON.parse(jsonMatch[0]);
    return { documentType: 'General Document', category: 'other' };
  } catch (err) {
    console.warn('Classification failed:', err.message);
    return { documentType: 'General Document', category: 'other' };
  }
};

/**
 * Extract structured fields from document text
 */
const extractFields = async (rawText, documentType) => {
  const gemini = getGemini();

  if (!gemini) {
    // Mock extraction using regex patterns
    const fields = {};
    // Name patterns
    const nameMatch = rawText.match(/(?:name|holder|bearer)[:\s]+([A-Z][a-zA-Z\s]+)/i);
    if (nameMatch) fields.name = nameMatch[1].trim();

    // DOB patterns
    const dobMatch = rawText.match(/(?:date of birth|dob|born)[:\s]+(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i);
    if (dobMatch) fields.dob = dobMatch[1];

    // ID number
    const idMatch = rawText.match(/(?:no|number|id)[.:\s]+([A-Z0-9]{6,20})/i);
    if (idMatch) fields.idNumber = idMatch[1];

    // Expiry date
    const expiryMatch = rawText.match(/(?:expiry|expiration|valid until|valid thru)[:\s]+(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i);
    if (expiryMatch) fields.expiryDate = expiryMatch[1];

    return fields;
  }

  try {
    const model = gemini.getGenerativeModel({ model: 'gemini-1.5-pro' });
    const prompt = `Extract key information from this ${documentType}. Return ONLY valid JSON:
{
  "name": "full name if found, else empty string",
  "dob": "date of birth in DD/MM/YYYY format if found, else empty string",
  "idNumber": "ID/document number if found, else empty string",
  "expiryDate": "expiry date in DD/MM/YYYY format if found, else empty string",
  "issueDate": "issue/date of issue in DD/MM/YYYY format if found, else empty string",
  "issuingAuthority": "issuing authority/organization if found, else empty string",
  "address": "address if found, else empty string",
  "nationality": "nationality/country if found, else empty string"
}

Document text:
${rawText.substring(0, 3000)}`;

    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) return JSON.parse(jsonMatch[0]);
    return {};
  } catch (err) {
    console.warn('Field extraction failed:', err.message);
    return {};
  }
};

/**
 * Generate a summary of the document
 */
const generateSummary = async (rawText, documentType) => {
  const gemini = getGemini();

  if (!gemini) {
    return `This is a ${documentType}. Contains ${rawText.split(' ').length} words of extracted text.`;
  }

  try {
    const model = gemini.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const prompt = `Write a concise 2-3 sentence summary of this ${documentType}. Focus on what it is, who it belongs to, and any important dates or numbers.

Document text:
${rawText.substring(0, 2000)}`;

    const result = await model.generateContent(prompt);
    return result.response.text().trim();
  } catch (err) {
    return `This is a ${documentType} document.`;
  }
};

/**
 * RAG Chat — answer a question using document context
 */
const ragChat = async (question, documents, chatHistory = []) => {
  const gemini = getGemini();

  // Build context from documents
  const context = documents.map((doc, i) =>
    `Document ${i + 1} [${doc.documentType || doc.category}]: ${doc.aiSummary || ''}\n${doc.rawText ? doc.rawText.substring(0, 1000) : ''}`
  ).join('\n\n---\n\n');

  if (!gemini) {
    // Smart mock responses
    const q = question.toLowerCase();
    if (documents.length === 0) {
      return "I don't have any documents to search through yet. Please upload some documents first and I'll be able to answer questions about them!";
    }
    if (q.includes('passport') || q.includes('expire') || q.includes('expiry')) {
      const passportDoc = documents.find(d => d.documentType?.toLowerCase().includes('passport'));
      if (passportDoc && passportDoc.extractedData?.expiryDate) {
        return `Based on your Passport, the expiry date is **${passportDoc.extractedData.expiryDate}**. Would you like me to set a reminder for renewal?`;
      }
      return "I found your documents but couldn't locate a specific passport expiry date. Please ensure your passport is uploaded and processed.";
    }
    if (q.includes('name')) {
      const doc = documents.find(d => d.extractedData?.name);
      return doc ? `Your name as found in your ${doc.documentType} is: **${doc.extractedData.name}**` : `Based on your uploaded documents, I found ${documents.length} document(s) but couldn't extract a name clearly.`;
    }
    if (q.includes('pan')) {
      const panDoc = documents.find(d => d.documentType?.toLowerCase().includes('pan'));
      if (panDoc) return `Your PAN Card (${panDoc.documentType}) is stored in your vault. ${panDoc.extractedData?.idNumber ? `PAN Number: **${panDoc.extractedData.idNumber}**` : ''}`;
      return "I couldn't find a PAN Card in your vault. Please upload it to get started.";
    }
    return `I found ${documents.length} document(s) in your vault. Here's what I know: ${documents.map(d => d.documentType || d.category).join(', ')}. To get more specific answers, please add your Gemini API key in the backend .env file.`;
  }

  try {
    const model = gemini.getGenerativeModel({ model: 'gemini-1.5-pro' });

    const historyText = chatHistory.slice(-6).map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`).join('\n');

    const prompt = `You are Memora AI, a smart document assistant. You have access to the user's document vault.

DOCUMENT VAULT CONTEXT:
${context || 'No documents available.'}

RECENT CONVERSATION:
${historyText}

USER QUESTION: ${question}

Instructions:
- Answer based on the documents provided
- Be specific and cite document names when referencing information
- If information is not in the documents, say so clearly
- Keep responses concise and helpful
- Use markdown formatting for clarity
- If asked to generate something (like a resume), create it based on available data`;

    const result = await model.generateContent(prompt);
    return result.response.text().trim();
  } catch (err) {
    console.error('RAG chat error:', err.message);
    return 'I encountered an error while searching your documents. Please try again.';
  }
};

/**
 * Search documents using vector similarity
 */
const semanticSearch = async (query, documentEmbeddings) => {
  const queryEmbedding = await generateEmbedding(query);
  return documentEmbeddings
    .map(doc => ({ ...doc, score: cosineSimilarity(queryEmbedding, doc.embedding) }))
    .sort((a, b) => b.score - a.score)
    .filter(d => d.score > 0.1);
};

module.exports = { generateEmbedding, classifyDocument, extractFields, generateSummary, ragChat, semanticSearch };
