import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';

describe('Dashboard Endpoints', () => {
  it('GET /api/v1/dashboard - rejects unauthorized request', async () => {
    const res = await request(app).get('/api/v1/dashboard');
    expect(res.status).toBe(401);
  });

  it('GET /api/v1/dashboard - returns metrics and stats for authenticated user', async () => {
    const regRes = await request(app).post('/api/v1/auth/register').send({
      name: 'Alan Turing',
      email: 'alan@lifeos.local',
      password: 'password123',
    });
    const token = regRes.body.data.token;

    const res = await request(app)
      .get('/api/v1/dashboard')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.stats).toBeDefined();
    expect(res.body.data.stats.totalDocuments).toBe(0);
    expect(res.body.data.productivityChart).toBeInstanceOf(Array);
    expect(res.body.data.insights).toBeInstanceOf(Array);
  });
});
