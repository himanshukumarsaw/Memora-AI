const request  = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const express  = require('express');

let mongoServer;
let app;
let authToken;
let qrToken;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());

  app = express();
  app.use(express.json());
  app.use('/api/v1/auth', require('../routes/auth.routes'));
  app.use('/api/v1/emergency', require('../routes/emergency.routes'));
  app.use(require('../middleware/error.middleware'));

  // Register test user
  const reg = await request(app)
    .post('/api/v1/auth/register')
    .send({ name: 'Emergency Test Doctor', email: 'doc@example.com', password: 'password123' });

  authToken = reg.body.data.accessToken;
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('Module 1: Emergency Medical History & Public QR API Suite', () => {

  it('should fetch or create user emergency medical profile', async () => {
    const res = await request(app)
      .get('/api/v1/emergency/profile')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.profile.qrToken).toBeDefined();
    qrToken = res.body.data.profile.qrToken;
  });

  it('should update emergency vitals & contacts successfully', async () => {
    const updateRes = await request(app)
      .put('/api/v1/emergency/profile')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        bloodGroup: 'O+',
        allergies: ['Penicillin', 'Peanuts'],
        currentMedications: ['Metformin 500mg'],
        chronicDiseases: ['Diabetes Mellitus'],
        emergencyContacts: [{ name: 'Jane Doe', relation: 'Spouse', phone: '+1234567890' }],
      });

    expect(updateRes.statusCode).toBe(200);
    expect(updateRes.body.data.bloodGroup).toBe('O+');
    expect(updateRes.body.data.allergies).toContain('Penicillin');
  });

  it('should allow unauthenticated public scan of QR token by doctors', async () => {
    const publicRes = await request(app)
      .get(`/api/v1/emergency/public/${qrToken}`);

    expect(publicRes.statusCode).toBe(200);
    expect(publicRes.body.success).toBe(true);
    expect(publicRes.body.data.patientName).toBe('Emergency Test Doctor');
    expect(publicRes.body.data.bloodGroup).toBe('O+');
    expect(publicRes.body.data.allergies).toContain('Penicillin');
    expect(publicRes.body.data.emergencyContacts[0].name).toBe('Jane Doe');
  });

});
