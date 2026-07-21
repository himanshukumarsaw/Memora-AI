// ─── services/graph.service.js ───────────────────────────────────────────────
// Knowledge Graph Entity Extraction & Relationship Linker per Feature 3 Spec

const EntityRelation = require('../models/EntityRelation.model');
const { executeLLM } = require('../config/aiProviders');
const logger         = require('../utils/logger');

/**
 * Extract named entities and connect related documents in the Knowledge Graph
 */
const processGraphConnections = async (userId, rawText, documentType, docId) => {
  try {
    const prompt = `Analyze this ${documentType} and extract entity connections. Return ONLY valid JSON:
{
  "entities": [
    {
      "entityName": "e.g. Chandigarh House, ICICI Health Insurance, Acme Corp, John Doe",
      "entityType": "one of: property, insurance, person, organization, treatment, vehicle, project, other",
      "relationshipLabel": "e.g. owns_property, covers_treatment, employs, issued_by"
    }
  ]
}

Document text:
${rawText.substring(0, 2000)}`;

    let extractedEntities = [];
    const llmRes = await executeLLM(prompt);

    if (llmRes?.text) {
      const jsonMatch = llmRes.text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        extractedEntities = parsed.entities || [];
      }
    }

    // Heuristic fallbacks if LLM not present
    if (extractedEntities.length === 0) {
      const textLower = rawText.toLowerCase();
      if (textLower.includes('house') || textLower.includes('property') || textLower.includes('deed') || textLower.includes('rent')) {
        const addrMatch = rawText.match(/(?:house|flat|plot|address)[:\s]*([A-Za-z0-9\s,]+)/i);
        extractedEntities.push({
          entityName: addrMatch ? addrMatch[1].trim().substring(0, 30) : 'Primary Property',
          entityType: 'property',
          relationshipLabel: 'property_document',
        });
      }
      if (textLower.includes('insurance') || textLower.includes('policy')) {
        extractedEntities.push({
          entityName: 'Health & Life Insurance Policy',
          entityType: 'insurance',
          relationshipLabel: 'insurance_coverage',
        });
      }
      if (textLower.includes('internship') || textLower.includes('company') || textLower.includes('salary') || textLower.includes('offer')) {
        const orgMatch = rawText.match(/(?:company|employer|organization|corp|pvt ltd)[:\s]*([A-Za-z0-9\s]+)/i);
        extractedEntities.push({
          entityName: orgMatch ? orgMatch[1].trim().substring(0, 30) : 'Employment & Career',
          entityType: 'organization',
          relationshipLabel: 'career_records',
        });
      }
    }

    // Link extracted entities to document in graph database
    for (const item of extractedEntities) {
      if (!item.entityName) continue;

      let relation = await EntityRelation.findOne({
        userId,
        entityName: { $regex: new RegExp(`^${item.entityName}$`, 'i') },
      });

      if (!relation) {
        relation = new EntityRelation({
          userId,
          entityName: item.entityName,
          entityType: item.entityType || 'other',
          relationshipLabel: item.relationshipLabel || 'connected_to',
          connectedDocumentIds: [docId],
        });
      } else {
        if (!relation.connectedDocumentIds.includes(docId)) {
          relation.connectedDocumentIds.push(docId);
        }
      }

      await relation.save();
      logger.info(`[Knowledge Graph] Connected doc ${docId} to entity: ${item.entityName}`);
    }
  } catch (err) {
    logger.error(`[Knowledge Graph] Graph linking error: ${err.message}`);
  }
};

module.exports = { processGraphConnections };
