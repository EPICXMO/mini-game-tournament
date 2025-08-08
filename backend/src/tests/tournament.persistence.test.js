import { jest } from '@jest/globals';

// Mock repository to avoid real DB
jest.unstable_mockModule('../repositories/tournamentRepo.js', () => ({
  saveTournament: jest.fn().mockResolvedValue(undefined),
  addTournamentPlayer: jest.fn().mockResolvedValue(undefined),
  createRound: jest.fn().mockResolvedValue(undefined),
  completeRound: jest.fn().mockResolvedValue(undefined),
  submitRoundScore: jest.fn().mockResolvedValue(undefined)
}));

const { default: tournamentService } = await import('../services/tournamentService.js');

describe('Tournament persistence (mock repo)', () => {
  test('flow: create → join → start → submit score → leaderboard sorted DESC', () => {
    const t = tournamentService.createTournament('room-1', { maxRounds: 1, gameRotation: ['runner'] });
    tournamentService.addPlayer(t.id, 'u1', { name: 'A' });
    tournamentService.addPlayer(t.id, 'u2', { name: 'B' });
    tournamentService.startTournament(t.id);
    tournamentService.submitRoundScore('u1', 100);
    tournamentService.submitRoundScore('u2', 200);
    const leaderboard = t.leaderboard;
    expect(leaderboard[0].totalScore).toBeGreaterThanOrEqual(leaderboard[1].totalScore);
  });

  test('reconnect builds snapshot', async () => {
    const t = tournamentService.createTournament('room-2', { maxRounds: 1, gameRotation: ['jetpack'] });
    tournamentService.addPlayer(t.id, 'reuser', { name: 'Re' });
    const snapshot = {
      tournament: {
        id: t.id,
        status: 'waiting',
        currentRound: 0,
        maxRounds: t.maxRounds,
        playerCount: 1
      },
      leaderboard: [],
      ghostData: expect.any(Array)
    };
    // simulate helper
    const { buildReconnectPayload } = await import('../reconnectHelper.js');
    expect(buildReconnectPayload(t.id)).toMatchObject(snapshot);
  });
});


