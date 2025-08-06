import request from 'supertest';
import app from './server.js';

describe('Server Health Checks', () => {
  test('GET /healthz should return 200', async () => {
    const response = await request(app)
      .get('/healthz')
      .expect(200);
    
    expect(response.body.status).toBe('OK');
    expect(response.body.timestamp).toBeDefined();
  });

  test('GET /api/status should return server status', async () => {
    const response = await request(app)
      .get('/api/status')
      .expect(200);
    
    expect(response.body.message).toBe('MiniGameHub Server is running');
    expect(response.body.timestamp).toBeDefined();
  });

  test('GET /nonexistent should return 404', async () => {
    const response = await request(app)
      .get('/nonexistent')
      .expect(404);
    
    expect(response.body.error).toBe('Not found');
  });
});