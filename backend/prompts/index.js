// ─── prompts/index.js ─────────────────────────────────────────────────────────
// All Gemini prompt templates in one place.
// Nothing in the AI service hardcodes prompt strings — they import from here.

const { DOC_TYPES, DOC_CATEGORIES } = require('../constants');

/**
 * Prompt for extracting structured metadata from OCR text.
 * @param {string} rawText
 * @returns {string}
 */
const extractionPrompt = (rawText) => `
You are an expert document intelligence AI. Analyse the following document text and extract structured information.

Return ONLY a valid JSON object with these fields (use null if not found):
{
  "documentType": "one of: ${DOC_TYPES.join(', ')}",
  "category": "one of: ${DOC_CATEGORIES.join(', ')}",
  "name": "full name of the person",
  "dob": "date of birth (DD/MM/YYYY or YYYY-MM-DD)",
  "idNumber": "primary ID / document number",
  "issueDate": "date of issue",
  "expiryDate": "date of expiry (null if none)",
  "issuingAuthority": "name of issuing authority / institution",
  "address": "full address if present",
  "nationality": "nationality or country",
  "additionalFields": {}
}

Document Text:
"""
${rawText.substring(0, 8000)}
"""

Respond with ONLY the JSON. No explanation, no markdown.
`.trim();

/**
 * Prompt for generating a concise AI summary of a document.
 * @param {string} rawText
 * @param {string} documentType
 * @returns {string}
 */
const summaryPrompt = (rawText, documentType) => `
You are a document summarisation assistant.

Summarise this ${documentType} document in 2–3 concise sentences.
Focus on: what the document is, who it belongs to, key dates, and any important numbers/IDs.
Do NOT include advice or opinions.

Document Text:
"""
${rawText.substring(0, 4000)}
"""

Return only the summary text. No bullet points, no markdown.
`.trim();

/**
 * RAG chat prompt — ground Gemini in the user's vault context.
 * @param {string} question
 * @param {string} context        – concatenated relevant document excerpts
 * @param {Array}  chatHistory    – [{role, content}] recent messages
 * @returns {string}
 */
const ragChatPrompt = (question, context, chatHistory = []) => {
  const history = chatHistory
    .slice(-6) // last 6 turns
    .map((m) => `${m.role === 'user' ? 'User' : 'Memora AI'}: ${m.content}`)
    .join('\n');

  return `
You are Memora AI, an intelligent personal document assistant.
You have access to the user's document vault. Answer ONLY based on the provided context.
If the information is not in the context, say so politely.

--- DOCUMENT CONTEXT ---
${context || 'No documents found in vault.'}
--- END CONTEXT ---

${history ? `--- CONVERSATION HISTORY ---\n${history}\n--- END HISTORY ---\n` : ''}

User Question: ${question}

Respond in a helpful, concise, and professional manner.
  `.trim();
};

/**
 * Expiry detection prompt — determine if a document expires and when.
 * @param {string} rawText
 * @returns {string}
 */
const expiryPrompt = (rawText) => `
Analyse this document text and determine if it has an expiry date.

Return ONLY a JSON object:
{
  "hasExpiry": true or false,
  "expiryDate": "YYYY-MM-DD or null",
  "daysUntilExpiry": number or null
}

Document Text:
"""
${rawText.substring(0, 3000)}
"""

JSON only. No explanation.
`.trim();

/**
 * Resume generation prompt.
 * @param {object} profile  – structured profile data
 * @returns {string}
 */
const resumePrompt = (profile) => `
You are a professional resume writer.
Generate a polished, ATS-optimised resume in plain text format using the following profile data.

Profile:
${JSON.stringify(profile, null, 2)}

Format:
- Name and contact at top
- Summary
- Education
- Work Experience
- Skills
- Government ID references (masked)

Return the resume as plain text, properly formatted.
`.trim();

/**
 * Document classification fallback — if extraction JSON is partial.
 * @param {string} rawText
 * @returns {string}
 */
const classificationPrompt = (rawText) => `
Classify this document into one of these categories:
${DOC_CATEGORIES.join(', ')}

And identify the document type from:
${DOC_TYPES.join(', ')}

Document Text:
"""
${rawText.substring(0, 2000)}
"""

Return ONLY: {"category": "...", "documentType": "..."}
`.trim();

module.exports = {
  extractionPrompt,
  summaryPrompt,
  ragChatPrompt,
  expiryPrompt,
  resumePrompt,
  classificationPrompt,
};
