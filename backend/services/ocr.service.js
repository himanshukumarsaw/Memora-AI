const fs = require('fs');
const path = require('path');

/**
 * Extract text from a file using available methods
 * - PDF: pdf-parse
 * - Images: tesseract.js OCR
 * - Fallback: empty string
 */
const extractText = async (filePath, mimeType) => {
  try {
    if (mimeType === 'application/pdf' || filePath.endsWith('.pdf')) {
      return await extractFromPDF(filePath);
    }
    if (mimeType && mimeType.startsWith('image/')) {
      return await extractFromImage(filePath);
    }
    // Try PDF first, then image
    try { return await extractFromPDF(filePath); } catch (_) {}
    return '';
  } catch (err) {
    console.warn('OCR failed:', err.message);
    return '';
  }
};

const extractFromPDF = async (filePath) => {
  const pdfParse = require('pdf-parse');
  const buffer = fs.readFileSync(filePath);
  const data = await pdfParse(buffer);
  return data.text || '';
};

const extractFromImage = async (filePath) => {
  try {
    const Tesseract = require('tesseract.js');
    const { data: { text } } = await Tesseract.recognize(filePath, 'eng', {
      logger: () => {}, // suppress logs
    });
    return text || '';
  } catch (err) {
    console.warn('Tesseract OCR failed:', err.message);
    return '';
  }
};

module.exports = { extractText };
