const request  = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const express  = require('express');

let mongoServer;
let app;
let authToken;

jest.setTimeout(30000);

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());

  app = express();
  app.use(express.json());
  app.use('/api/v1/auth', require('../routes/auth.routes'));
  app.use('/api/v1/opportunities', require('../routes/opportunity.routes'));
  app.use(require('../middleware/error.middleware'));

  // Register test user
  const reg = await request(app)
    .post('/api/v1/auth/register')
    .send({ name: 'Opportunity Scholar', email: 'scholar@example.com', password: 'password123' });

  authToken = reg.body.data.accessToken;
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('Module 4: Personal Opportunity Engine API Suite', () => {

  it('should seed opportunity catalog and evaluate user eligibility', async () => {
    const res = await request(app)
      .get('/api/v1/opportunities')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.totalOpportunities).toBeGreaterThanOrEqual(1);
    expect(res.body.data.matches[0].matchScore).toBeDefined();
    expect(res.body.data.matches[0].daysLeft).toBeDefined();
  });

  it('should trigger manual eligibility re-evaluation', async () => {
    const res = await request(app)
      .post('/api/v1/opportunities/check')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBeGreaterThanOrEqual(1);
  });

});
