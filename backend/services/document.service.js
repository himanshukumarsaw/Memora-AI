const Document         = require('../models/Document.model');
const Reminder         = require('../models/Reminder.model');
const Profile          = require('../models/Profile.model');
const UploadQueue      = require('../models/UploadQueue.model');
const EmergencyProfile = require('../models/EmergencyProfile.model');
const Milestone        = require('../models/Milestone.model');
const { extractText }  = require('./ocr.service');
const { classifyDocument, extractFields, generateSummary, generateEmbedding } = require('./ai.service');
const { processGraphConnections } = require('./graph.service');
const notificationSvc  = require('../notifications/notification.service');
const logger           = require('../utils/logger');

const EXPIRY_THRESHOLDS = {
  'Passport': 180,
  'Driving Licence': 60,
  'Driving License': 60,
  'Insurance Policy': 30,
  'Health Insurance': 30,
  'Life Insurance': 30,
  'Vehicle Insurance': 30,
  'Medical Record': 15,
  'Prescription': 15,
};

const updateUniversalProfile = async (userId, documentType, category, extractedData, docId) => {
  try {
    let profile = await Profile.findOne({ userId });
    if (!profile) {
      profile = new Profile({ userId });
    }

    if (extractedData.name && !profile.fullName) profile.fullName = extractedData.name;
    if (extractedData.dob && !profile.dob) profile.dob = extractedData.dob;
    if (extractedData.nationality && (!profile.address || !profile.address.country)) {
      profile.address = profile.address || {};
      profile.address.country = extractedData.nationality;
    }
    if (extractedData.address && !profile.address?.street) {
      profile.address = profile.address || {};
      profile.address.street = extractedData.address;
    }

    if (extractedData.idNumber) {
      profile.governmentIds = profile.governmentIds || {};
      const typeLower = (documentType || '').toLowerCase();
      if (typeLower.includes('passport')) profile.governmentIds.passport = extractedData.idNumber;
      else if (typeLower.includes('pan')) profile.governmentIds.pan = extractedData.idNumber;
      else if (typeLower.includes('aadhaar') || typeLower.includes('aadhar')) profile.governmentIds.aadhaar = extractedData.idNumber;
      else if (typeLower.includes('driving') || typeLower.includes('licence') || typeLower.includes('license')) profile.governmentIds.drivingLicense = extractedData.idNumber;
      else if (typeLower.includes('voter')) profile.governmentIds.voterId = extractedData.idNumber;
    }

    if (category === 'education' && extractedData.issuingAuthority) {
      const exists = profile.education.some(e => e.institution === extractedData.issuingAuthority);
      if (!exists) {
        profile.education.push({
          degree: documentType || 'Degree Certificate',
          institution: extractedData.issuingAuthority,
          year: extractedData.issueDate ? extractedData.issueDate.split(/[\/\-]/).pop() : '',
          documentId: docId,
        });
      }
    }

    await profile.save();
    logger.info(`[Universal Profile] Auto-updated profile for user ${userId} from ${documentType}`);
  } catch (err) {
    logger.error(`[Universal Profile] Update error for user ${userId}: ${err.message}`);
  }
};

const updateEmergencyProfileFromMedicalDoc = async (userId, rawText, docId) => {
  try {
    let emp = await EmergencyProfile.findOne({ userId });
    if (!emp) {
      emp = new EmergencyProfile({ userId });
    }

    const textUpper = rawText.toUpperCase();

    const bloodMatch = textUpper.match(/\b(A|B|AB|O)\s*[\+\-]\b/i) || textUpper.match(/\bBLOOD\s*GROUP[:\s]*([ABO\+\-]+)/i);
    if (bloodMatch && (emp.bloodGroup === 'Unknown' || !emp.bloodGroup)) {
      const bg = bloodMatch[1].replace(/\s+/g, '').toUpperCase();
      if (['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].includes(bg)) {
        emp.bloodGroup = bg;
      }
    }

    if (textUpper.includes('DIABETES') || textUpper.includes('DIABETIC')) {
      if (!emp.chronicDiseases.includes('Diabetes Mellitus')) emp.chronicDiseases.push('Diabetes Mellitus');
    }
    if (textUpper.includes('HYPERTENSION') || textUpper.includes('HIGH BP')) {
      if (!emp.chronicDiseases.includes('Hypertension')) emp.chronicDiseases.push('Hypertension');
    }
    if (textUpper.includes('ASTHMA')) {
      if (!emp.chronicDiseases.includes('Asthma')) emp.chronicDiseases.push('Asthma');
    }

    if (textUpper.includes('PENICILLIN') && (textUpper.includes('ALLERGY') || textUpper.includes('ALLERGIC'))) {
      if (!emp.allergies.includes('Penicillin')) emp.allergies.push('Penicillin');
    }

    emp.lastUpdatedFromDoc = docId;
    await emp.save();
    logger.info(`[Emergency Profile] Auto-extracted medical vitals for user ${userId}`);
  } catch (err) {
    logger.error(`[Emergency Profile] Auto-update error: ${err.message}`);
  }
};

const autoExtractMilestone = async (userId, documentType, category, extractedData, docTitle, docId) => {
  try {
    let eventYear = null;
    let eventDate = new Date();

    if (extractedData.issueDate) {
      const parts = extractedData.issueDate.split(/[\/\-]/);
      if (parts.length === 3) {
        const yr = parseInt(parts[2].length === 2 ? `20${parts[2]}` : parts[2]);
        if (!isNaN(yr) && yr > 1950 && yr <= new Date().getFullYear() + 5) {
          eventYear = yr;
          eventDate = new Date(yr, (parseInt(parts[1]) || 1) - 1, parseInt(parts[0]) || 1);
        }
      }
    }

    if (!eventYear) {
      const yearMatch = docTitle.match(/\b(19\d\d|20\d\d)\b/);
      if (yearMatch) {
        eventYear = parseInt(yearMatch[1]);
        eventDate = new Date(eventYear, 0, 1);
      } else {
        eventYear = new Date().getFullYear();
      }
    }

    const existing = await Milestone.findOne({ userId, documentId: docId });
    if (!existing) {
      await Milestone.create({
        userId,
        title: `${documentType} — ${docTitle}`,
        description: `Auto-catalogued milestone from uploaded ${documentType}`,
        eventDate,
        milestoneYear: eventYear,
        category: ['education', 'career', 'identity', 'financial', 'property', 'medical'].includes(category) ? category : 'personal',
        documentId: docId,
        icon: category === 'education' ? 'GraduationCap' : category === 'career' || category === 'professional' ? 'Briefcase' : category === 'property' ? 'Home' : 'Award',
        isAutoExtracted: true,
      });
      logger.info(`[Digital Life History] Created milestone for ${docTitle} (${eventYear})`);
    }
  } catch (err) {
    logger.error(`[Digital Life History] Milestone extraction error: ${err.message}`);
  }
};

/**
 * Full 7-stage AI pipeline for a newly uploaded document
 */
const processDocument = async (documentId, filePath, mimeType) => {
  let queueItem;
  try {
    const doc = await Document.findById(documentId);
    if (!doc) return;

    queueItem = await UploadQueue.create({
      documentId,
      userId: doc.userId,
      status: 'ocr',
      attempt: 1,
    });

    await Document.findByIdAndUpdate(documentId, { status: 'processing' });

    // Stage 1: OCR
    logger.info(`[AI Pipeline] Stage 1: OCR for doc ${documentId}`);
    const rawText = await extractText(filePath, mimeType);

    // Stage 2: Classify
    await UploadQueue.findByIdAndUpdate(queueItem._id, { status: 'extraction' });
    logger.info(`[AI Pipeline] Stage 2: Classification`);
    const { documentType, category } = await classifyDocument(rawText);

    // Stage 3: Extract structured fields
    logger.info(`[AI Pipeline] Stage 3: Field extraction`);
    const extractedData = await extractFields(rawText, documentType);

    // Stage 4: Generate summary
    logger.info(`[AI Pipeline] Stage 4: Summary generation`);
    const aiSummary = await generateSummary(rawText, documentType);

    // Stage 5: Generate embedding
    await UploadQueue.findByIdAndUpdate(queueItem._id, { status: 'embedding' });
    logger.info(`[AI Pipeline] Stage 5: Embedding generation`);
    const embedding = await generateEmbedding(`${documentType} ${category} ${aiSummary} ${rawText.substring(0, 500)}`);

    // Stage 6: Expiry detection
    let hasExpiry = false;
    let expiryDate = null;
    let expiryStatus = 'unknown';

    if (extractedData.expiryDate) {
      const parts = extractedData.expiryDate.split(/[\/\-]/);
      if (parts.length === 3) {
        const parsed = new Date(parts[2].length === 2 ? `20${parts[2]}` : parts[2], parts[1] - 1, parts[0]);
        if (!isNaN(parsed.getTime())) {
          hasExpiry = true;
          expiryDate = parsed;
          const now = new Date();
          const thresholdDays = EXPIRY_THRESHOLDS[documentType] || 30;
          const warningThreshold = new Date(now.getTime() + thresholdDays * 24 * 60 * 60 * 1000);

          if (parsed < now) expiryStatus = 'expired';
          else if (parsed < warningThreshold) expiryStatus = 'expiring_soon';
          else expiryStatus = 'valid';
        }
      }
    }

    // Stage 7: Save document results
    const updatedDoc = await Document.findByIdAndUpdate(documentId, {
      rawText: rawText.substring(0, 10000),
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

    // Universal Profile Auto-Builder
    await updateUniversalProfile(doc.userId, documentType, category, extractedData, doc._id);

    // Feature 1: Emergency Profile Auto-Updater
    if (category === 'medical' || (documentType || '').toLowerCase().includes('medical') || (documentType || '').toLowerCase().includes('report')) {
      await updateEmergencyProfileFromMedicalDoc(doc.userId, rawText, doc._id);
    }

    // Feature 2: Digital Life History Milestone Auto-Extractor
    await autoExtractMilestone(doc.userId, documentType, category, extractedData, updatedDoc.title, updatedDoc._id);

    // Feature 3: Life OS Knowledge Graph Entity Connector
    await processGraphConnections(doc.userId, rawText, documentType, updatedDoc._id);

    // Auto-create reminder if expiring
    if (hasExpiry && expiryDate && updatedDoc) {
      const thresholdDays = EXPIRY_THRESHOLDS[documentType] || 30;
      const reminderDate = new Date(expiryDate.getTime() - thresholdDays * 24 * 60 * 60 * 1000);
      await Reminder.create({
        userId: updatedDoc.userId,
        documentId: updatedDoc._id,
        title: `${documentType} renewal reminder`,
        description: `Your ${documentType} "${updatedDoc.title}" expires on ${extractedData.expiryDate}.`,
        dueDate: reminderDate < new Date() ? expiryDate : reminderDate,
        reminderType: 'expiry',
        priority: expiryStatus === 'expired' ? 'critical' : expiryStatus === 'expiring_soon' ? 'high' : 'medium',
      });
      logger.info(`[AI Pipeline] Auto-created reminder for ${documentType}`);
    }

    // Complete upload queue & send notification
    if (queueItem) await UploadQueue.findByIdAndUpdate(queueItem._id, { status: 'completed', completedAt: new Date() });
    await notificationSvc.sendUploadComplete(doc.userId, updatedDoc.title);

    logger.info(`[AI Pipeline] ✅ Document ${documentId} processed successfully as: ${documentType}`);
    return updatedDoc;
  } catch (err) {
    logger.error(`[AI Pipeline] ❌ Failed for doc ${documentId}: ${err.message}`);
    if (queueItem) await UploadQueue.findByIdAndUpdate(queueItem._id, { status: 'failed', errorMessage: err.message });
    await Document.findByIdAndUpdate(documentId, { status: 'failed', processingError: err.message });
    throw err;
  }
};

module.exports = { processDocument };
