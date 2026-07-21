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
  app.use('/api/v1/timeline', require('../routes/timeline.routes'));
  app.use(require('../middleware/error.middleware'));

  // Register test user
  const reg = await request(app)
    .post('/api/v1/auth/register')
    .send({ name: 'Timeline User', email: 'timeline@example.com', password: 'password123' });

  authToken = reg.body.data.accessToken;
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('Module 2: Digital Life History Timeline API Suite', () => {

  it('should create a custom milestone event', async () => {
    const res = await request(app)
      .post('/api/v1/timeline')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        title: 'Class 10 Result',
        description: 'Passed Class 10 with 95% marks',
        eventDate: '2018-05-15',
        category: 'education',
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.milestoneYear).toBe(2018);
  });

  it('should fetch timeline milestone history grouped by year and decade', async () => {
    const res = await request(app)
      .get('/api/v1/timeline')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data.totalMilestones).toBeGreaterThanOrEqual(1);
    expect(res.body.data.yearGroups['2018']).toBeDefined();
    expect(res.body.data.decadeGroups['2010s']).toBeDefined();
  });

  it('should filter milestones by year', async () => {
    const res = await request(app)
      .get('/api/v1/timeline?year=2018')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data.milestones.length).toBe(1);
    expect(res.body.data.milestones[0].title).toBe('Class 10 Result');
  });

});
