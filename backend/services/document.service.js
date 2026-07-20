const Document = require('../models/Document.model');
const Reminder = require('../models/Reminder.model');
const { extractText } = require('./ocr.service');
const { classifyDocument, extractFields, generateSummary, generateEmbedding } = require('./ai.service');

/**
 * Full AI pipeline for a newly uploaded document
 */
const processDocument = async (documentId, filePath, mimeType) => {
  try {
    // Update status to processing
    await Document.findByIdAndUpdate(documentId, { status: 'processing' });

    // Stage 1: OCR — extract raw text
    console.log(`[AI Pipeline] Stage 1: OCR for doc ${documentId}`);
    const rawText = await extractText(filePath, mimeType);

    // Stage 2: Classify document type
    console.log(`[AI Pipeline] Stage 2: Classification`);
    const { documentType, category } = await classifyDocument(rawText);

    // Stage 3: Extract structured fields
    console.log(`[AI Pipeline] Stage 3: Field extraction`);
    const extractedData = await extractFields(rawText, documentType);

    // Stage 4: Generate summary
    console.log(`[AI Pipeline] Stage 4: Summary generation`);
    const aiSummary = await generateSummary(rawText, documentType);

    // Stage 5: Generate embedding for semantic search
    console.log(`[AI Pipeline] Stage 5: Embedding generation`);
    const embedding = await generateEmbedding(`${documentType} ${rawText.substring(0, 500)}`);

    // Stage 6: Detect expiry
    let hasExpiry = false;
    let expiryDate = null;
    let expiryStatus = 'unknown';

    if (extractedData.expiryDate) {
      // Try to parse expiry date
      const parts = extractedData.expiryDate.split(/[\/\-]/);
      if (parts.length === 3) {
        const parsed = new Date(parts[2], parts[1] - 1, parts[0]);
        if (!isNaN(parsed)) {
          hasExpiry = true;
          expiryDate = parsed;
          const now = new Date();
          const thirtyDays = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
          if (parsed < now) expiryStatus = 'expired';
          else if (parsed < thirtyDays) expiryStatus = 'expiring_soon';
          else expiryStatus = 'valid';
        }
      }
    }

    // Stage 7: Save everything
    const updatedDoc = await Document.findByIdAndUpdate(documentId, {
      rawText: rawText.substring(0, 10000), // Cap at 10k chars
      documentType,
      category,
      extractedData,
      aiSummary,
      embedding,
      hasExpiry,
      expiryDate,
      expiryStatus,
      status: 'ready',
    }, { new: true });

    // Auto-create reminder if expiring
    if (hasExpiry && expiryDate && updatedDoc) {
      const reminderDate = new Date(expiryDate.getTime() - 30 * 24 * 60 * 60 * 1000); // 30 days before
      await Reminder.create({
        userId: updatedDoc.userId,
        documentId: updatedDoc._id,
        title: `${documentType} expires on ${extractedData.expiryDate}`,
        description: `Your ${documentType} is expiring. Please renew it before ${extractedData.expiryDate}.`,
        dueDate: reminderDate < new Date() ? expiryDate : reminderDate,
        reminderType: 'expiry',
        priority: expiryStatus === 'expired' ? 'critical' : expiryStatus === 'expiring_soon' ? 'high' : 'medium',
      });
      console.log(`[AI Pipeline] Auto-created reminder for ${documentType}`);
    }

    console.log(`[AI Pipeline] ✅ Document ${documentId} processed successfully as: ${documentType}`);
    return updatedDoc;
  } catch (err) {
    console.error(`[AI Pipeline] ❌ Failed for doc ${documentId}:`, err.message);
    await Document.findByIdAndUpdate(documentId, {
      status: 'failed',
      processingError: err.message,
    });
    throw err;
  }
};

module.exports = { processDocument };
