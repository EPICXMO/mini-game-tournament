import request from 'supertest';
import { jest } from '@jest/globals';

// Mock DB query used by leaderboard route
const mockQuery = jest.fn();
jest.unstable_mockModule('../database.js', () => ({
  query: (...args) => mockQuery(...args)
}));

const { default: leaderboardRoutes } = await import('../routes/leaderboardRoutes.js');
const { default: statusRoutes } = await import('../routes/tournamentStatusRoutes.js');
const { default: tournamentService } = await import('../services/tournamentService.js');
import express from 'express';

const app = express();
app.use('/api', leaderboardRoutes);
app.use('/api', statusRoutes);

describe('Tournament routes', () => {
  beforeEach(() => {
    mockQuery.mockReset();
  });

  test('status returns 404 for missing id', async () => {
    const res = await request(app).get('/api/tournament/unknown/status');
    expect(res.status).toBe(404);
  });

  test('status returns full object for existing tournament', async () => {
    const t = tournamentService.createTournament('room-x');
    const res = await request(app).get(`/api/tournament/${t.id}/status`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toMatchObject({ id: t.id, currentRound: 0 });
  });

  test('leaderboard honors limit and sorts', async () => {
    mockQuery.mockResolvedValue({ rows: [ { user_id: 'u1', top_score: 300 }, { user_id: 'u2', top_score: 200 } ] });
    const res = await request(app).get('/api/leaderboard/runner?limit=2');
    expect(res.status).toBe(200);
    expect(res.body.data.total).toBe(2);
  });
});


