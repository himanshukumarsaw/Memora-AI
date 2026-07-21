const request  = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const express  = require('express');

let mongoServer;
let app;
let authToken;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());

  app = express();
  app.use(express.json());
  app.use('/api/v1/auth', require('../routes/auth.routes'));
  app.use('/api/v1/graph', require('../routes/knowledgeGraph.routes'));
  app.use(require('../middleware/error.middleware'));

  // Register test user
  const reg = await request(app)
    .post('/api/v1/auth/register')
    .send({ name: 'Graph User', email: 'graph@example.com', password: 'password123' });

  authToken = reg.body.data.accessToken;

  // Create sample entity relation
  const EntityRelation = require('../models/EntityRelation.model');
  await EntityRelation.create({
    userId: reg.body.data.user._id,
    entityName: 'Chandigarh House',
    entityType: 'property',
    relationshipLabel: 'property_document',
  });
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('Module 3: Life OS Knowledge Graph API Suite', () => {

  it('should fetch knowledge graph nodes and edges', async () => {
    const res = await request(app)
      .get('/api/v1/graph/nodes')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.totalEntities).toBeGreaterThanOrEqual(1);
    expect(res.body.data.nodes).toBeDefined();
  });

  it('should answer cross-document graph queries', async () => {
    const res = await request(app)
      .post('/api/v1/graph/query')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ question: 'Show everything related to my Chandigarh house' });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.answer).toBeDefined();
  });

});
