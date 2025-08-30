import request from 'supertest';
import { jest } from '@jest/globals';

// Mock the database module
const mockQuery = jest.fn();
const mockInitializeDatabase = jest.fn();
const mockHealthCheck = jest.fn();

jest.unstable_mockModule('../database.js', () => ({
  query: mockQuery,
  initializeDatabase: mockInitializeDatabase,
  healthCheck: mockHealthCheck
}));

// Mock the ScoreService
const mockSubmitScore = jest.fn();
const mockGetLeaderboard = jest.fn();
const mockGetGameStats = jest.fn();
const mockGetUserBestScore = jest.fn();
const mockGetUserRecentScores = jest.fn();

jest.unstable_mockModule('../services/scoreService.js', () => ({
  ScoreService: {
    submitScore: mockSubmitScore,
    getLeaderboard: mockGetLeaderboard,
    getGameStats: mockGetGameStats,
    getUserBestScore: mockGetUserBestScore,
    getUserRecentScores: mockGetUserRecentScores
  }
}));

// Import after mocking
const { default: scoreRoutes } = await import('./scoreRoutes.js');
import express from 'express';

const app = express();
app.use(express.json());
app.use('/api/score', scoreRoutes);

describe('Score Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/score/jetpack', () => {
    it('should submit a valid Jetpack score', async () => {
      const mockScoreData = {
        id: 1,
        userId: 1,
        gameType: 'jetpack',
        score: 1500,
        distance: 750,
        coinsCollected: 25,
        gameTime: 45.5,
        createdAt: new Date().toISOString()
      };

      mockSubmitScore.mockResolvedValue(mockScoreData);

      const response = await request(app)
        .post('/api/score/jetpack')
        .send({
          score: 1500,
          distance: 750,
          coins: 25,
          time: 45.5,
          userId: 1
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.scoreId).toBe(1);
      expect(response.body.data.score).toBe(1500);
      expect(response.body.data.distance).toBe(750);
      expect(response.body.data.coins).toBe(25);

      expect(mockSubmitScore).toHaveBeenCalledWith({
        userId: 1,
        gameType: 'jetpack',
        score: 1500,
        distance: 750,
        coinsCollected: 25,
        gameTime: 45.5,
        metadata: expect.objectContaining({
          timestamp: expect.any(String)
        })
      });
    });

    it('should handle missing score', async () => {
      const response = await request(app)
        .post('/api/score/jetpack')
        .send({
          distance: 750,
          coins: 25
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Score is required');
      expect(response.body.code).toBe('MISSING_SCORE');
      expect(mockSubmitScore).not.toHaveBeenCalled();
    });

    it('should handle invalid score type', async () => {
      const response = await request(app)
        .post('/api/score/jetpack')
        .send({
          score: 'invalid',
          distance: 750
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Score must be a non-negative number');
      expect(response.body.code).toBe('INVALID_SCORE');
      expect(mockSubmitScore).not.toHaveBeenCalled();
    });

    it('should handle negative score', async () => {
      const response = await request(app)
        .post('/api/score/jetpack')
        .send({
          score: -100,
          distance: 750
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Score must be a non-negative number');
      expect(mockSubmitScore).not.toHaveBeenCalled();
    });

    it('should default to anonymous user when userId not provided', async () => {
      const mockScoreData = {
        id: 2,
        userId: 1,
        gameType: 'jetpack',
        score: 500,
        distance: 250,
        coinsCollected: 5,
        gameTime: 15.0,
        createdAt: new Date().toISOString()
      };

      mockSubmitScore.mockResolvedValue(mockScoreData);

      const response = await request(app)
        .post('/api/score/jetpack')
        .send({
          score: 500,
          distance: 250,
          coins: 5,
          time: 15.0
        });

      expect(response.status).toBe(201);
      expect(mockSubmitScore).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 1, // Should default to anonymous user
          gameType: 'jetpack',
          score: 500
        })
      );
    });

    it('should handle database errors', async () => {
      mockSubmitScore.mockRejectedValue(new Error('Database connection failed'));

      const response = await request(app)
        .post('/api/score/jetpack')
        .send({
          score: 1000,
          distance: 500
        });

      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Failed to submit score');
      expect(response.body.code).toBe('SCORE_SUBMISSION_FAILED');
    });
  });

  describe('GET /api/score/jetpack/leaderboard', () => {
    it('should return Jetpack leaderboard', async () => {
      const mockLeaderboard = [
        { rank: 1, score: 2000, username: 'player1', distance: 1000, coins_collected: 50 },
        { rank: 2, score: 1500, username: 'player2', distance: 750, coins_collected: 30 },
        { rank: 3, score: 1000, username: 'player3', distance: 500, coins_collected: 20 }
      ];

      mockGetLeaderboard.mockResolvedValue(mockLeaderboard);

      const response = await request(app)
        .get('/api/score/jetpack/leaderboard');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.game).toBe('jetpack');
      expect(response.body.data.leaderboard).toEqual(mockLeaderboard);
      expect(response.body.data.total).toBe(3);

      expect(mockGetLeaderboard).toHaveBeenCalledWith('jetpack', 10);
    });

    it('should handle custom limit parameter', async () => {
      mockGetLeaderboard.mockResolvedValue([]);

      const response = await request(app)
        .get('/api/score/jetpack/leaderboard?limit=25');

      expect(response.status).toBe(200);
      expect(mockGetLeaderboard).toHaveBeenCalledWith('jetpack', 25);
    });

    it('should cap limit at 50', async () => {
      mockGetLeaderboard.mockResolvedValue([]);

      const response = await request(app)
        .get('/api/score/jetpack/leaderboard?limit=100');

      expect(response.status).toBe(200);
      expect(mockGetLeaderboard).toHaveBeenCalledWith('jetpack', 50);
    });

    it('should handle database errors', async () => {
      mockGetLeaderboard.mockRejectedValue(new Error('Database query failed'));

      const response = await request(app)
        .get('/api/score/jetpack/leaderboard');

      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Failed to retrieve leaderboard');
    });
  });

  describe('GET /api/score/jetpack/stats', () => {
    it('should return Jetpack game statistics', async () => {
      const mockStats = {
        totalPlays: 150,
        averageScore: 1250.5,
        highestScore: 5000,
        lowestScore: 50,
        averageTime: 32.5,
        uniquePlayers: 45
      };

      mockGetGameStats.mockResolvedValue(mockStats);

      const response = await request(app)
        .get('/api/score/jetpack/stats');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.game).toBe('jetpack');
      expect(response.body.data.stats).toEqual(mockStats);

      expect(mockGetGameStats).toHaveBeenCalledWith('jetpack');
    });

    it('should handle database errors', async () => {
      mockGetGameStats.mockRejectedValue(new Error('Stats query failed'));

      const response = await request(app)
        .get('/api/score/jetpack/stats');

      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Failed to retrieve game statistics');
    });
  });

  describe('GET /api/score/jetpack/user/:userId', () => {
    it('should return user Jetpack scores', async () => {
      const mockBestScore = {
        id: 1,
        score: 2000,
        distance: 1000,
        coins_collected: 50,
        created_at: '2024-01-01T12:00:00Z'
      };

      const mockRecentScores = [
        { id: 3, score: 1500, distance: 750, created_at: '2024-01-02T12:00:00Z' },
        { id: 2, score: 1000, distance: 500, created_at: '2024-01-01T15:00:00Z' }
      ];

      mockGetUserBestScore.mockResolvedValue(mockBestScore);
      mockGetUserRecentScores.mockResolvedValue(mockRecentScores);

      const response = await request(app)
        .get('/api/score/jetpack/user/123');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.userId).toBe(123);
      expect(response.body.data.game).toBe('jetpack');
      expect(response.body.data.bestScore).toEqual(mockBestScore);
      expect(response.body.data.recentScores).toEqual(mockRecentScores);
      expect(response.body.data.totalPlays).toBe(2);

      expect(mockGetUserBestScore).toHaveBeenCalledWith(123, 'jetpack');
      expect(mockGetUserRecentScores).toHaveBeenCalledWith(123, 'jetpack', 5);
    });

    it('should handle invalid user ID', async () => {
      const response = await request(app)
        .get('/api/score/jetpack/user/invalid');

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Invalid user ID');
      expect(response.body.code).toBe('INVALID_USER_ID');
    });

    it('should handle negative user ID', async () => {
      const response = await request(app)
        .get('/api/score/jetpack/user/-1');

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Invalid user ID');
    });

    it('should handle custom limit parameter', async () => {
      mockGetUserBestScore.mockResolvedValue(null);
      mockGetUserRecentScores.mockResolvedValue([]);

      const response = await request(app)
        .get('/api/score/jetpack/user/123?limit=10');

      expect(response.status).toBe(200);
      expect(mockGetUserRecentScores).toHaveBeenCalledWith(123, 'jetpack', 10);
    });

    it('should cap limit at 20', async () => {
      mockGetUserBestScore.mockResolvedValue(null);
      mockGetUserRecentScores.mockResolvedValue([]);

      const response = await request(app)
        .get('/api/score/jetpack/user/123?limit=50');

      expect(response.status).toBe(200);
      expect(mockGetUserRecentScores).toHaveBeenCalledWith(123, 'jetpack', 20);
    });

    it('should handle database errors', async () => {
      mockGetUserBestScore.mockRejectedValue(new Error('User query failed'));

      const response = await request(app)
        .get('/api/score/jetpack/user/123');

      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Failed to retrieve user scores');
    });
  });

  // =============================================================================
  // CLASH ROYALE MINI-GAME TESTS
  // =============================================================================

  describe('Clash Royale Endpoints', () => {
    describe('POST /clashroyale', () => {
      it('should submit a valid Clash Royale score successfully', async () => {
        const mockResult = {
          id: 1,
          score: 1250,
          distance: 800,
          coinsCollected: 5,
          gameTime: 150.5,
          createdAt: '2024-01-01T12:00:00Z'
        };

        mockSubmitScore.mockResolvedValue(mockResult);

        const scoreData = {
          score: 1250,
          distance: 800,
          coins: 5,
          time: 150.5,
          userId: 1,
          metadata: {
            towerDamageDealt: 800,
            towerDamageReceived: 200,
            elixirSpent: 45,
            elixirEfficiency: 17.8
          }
        };

        const response = await request(app)
          .post('/api/score/clashroyale')
          .send(scoreData);

        expect(response.status).toBe(201);
        expect(response.body.success).toBe(true);
        expect(response.body.message).toBe('Clash Royale score submitted successfully');
        expect(response.body.data.scoreId).toBe(1);
        expect(response.body.data.score).toBe(1250);
        expect(response.body.data.towerDamage).toBe(800);
        expect(response.body.data.elixirRemaining).toBe(5);

        expect(mockSubmitScore).toHaveBeenCalledWith({
          userId: 1,
          gameType: 'clashroyale',
          score: 1250,
          distance: 800,
          coinsCollected: 5,
          gameTime: 150.5,
          metadata: expect.objectContaining({
            towerDamageDealt: 800,
            towerDamageReceived: 200,
            elixirSpent: 45,
            elixirEfficiency: 17.8,
            userAgent: expect.any(String),
            timestamp: expect.any(String)
          })
        });
      });

      it('should handle missing score in Clash Royale submission', async () => {
        const response = await request(app)
          .post('/api/score/clashroyale')
          .send({
            distance: 500,
            coins: 3
          });

        expect(response.status).toBe(400);
        expect(response.body.error).toBe('Score is required');
        expect(response.body.code).toBe('MISSING_SCORE');
      });

      it('should handle invalid score type in Clash Royale submission', async () => {
        const response = await request(app)
          .post('/api/score/clashroyale')
          .send({
            score: "invalid",
            distance: 500,
            coins: 3
          });

        expect(response.status).toBe(400);
        expect(response.body.error).toBe('Score must be a non-negative number');
        expect(response.body.code).toBe('INVALID_SCORE');
      });

      it('should handle database errors in Clash Royale submission', async () => {
        mockSubmitScore.mockRejectedValue(new Error('Database connection failed'));

        const response = await request(app)
          .post('/api/score/clashroyale')
          .send({
            score: 1000,
            distance: 600,
            coins: 4
          });

        expect(response.status).toBe(500);
        expect(response.body.error).toBe('Failed to submit score');
        expect(response.body.code).toBe('SCORE_SUBMISSION_FAILED');
      });
    });

    describe('GET /clashroyale/leaderboard', () => {
      it('should get Clash Royale leaderboard successfully', async () => {
        const mockLeaderboard = [
          { id: 1, score: 2000, distance: 1200, created_at: '2024-01-01T12:00:00Z' },
          { id: 2, score: 1800, distance: 1000, created_at: '2024-01-01T11:00:00Z' }
        ];

        mockGetLeaderboard.mockResolvedValue(mockLeaderboard);

        const response = await request(app)
          .get('/api/score/clashroyale/leaderboard');

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data.game).toBe('clashroyale');
        expect(response.body.data.leaderboard).toEqual(mockLeaderboard);
        expect(response.body.data.total).toBe(2);

        expect(mockGetLeaderboard).toHaveBeenCalledWith('clashroyale', 10);
      });

      it('should respect limit parameter for Clash Royale leaderboard', async () => {
        mockGetLeaderboard.mockResolvedValue([]);

        const response = await request(app)
          .get('/api/score/clashroyale/leaderboard?limit=25');

        expect(response.status).toBe(200);
        expect(mockGetLeaderboard).toHaveBeenCalledWith('clashroyale', 25);
      });

      it('should handle database errors for Clash Royale leaderboard', async () => {
        mockGetLeaderboard.mockRejectedValue(new Error('Database query failed'));

        const response = await request(app)
          .get('/api/score/clashroyale/leaderboard');

        expect(response.status).toBe(500);
        expect(response.body.error).toBe('Failed to retrieve leaderboard');
        expect(response.body.code).toBe('LEADERBOARD_FETCH_FAILED');
      });
    });

    describe('GET /clashroyale/stats', () => {
      it('should get Clash Royale game statistics successfully', async () => {
        const mockStats = {
          totalGames: 150,
          averageScore: 1200,
          highestScore: 2500,
          totalPlayers: 50
        };

        mockGetGameStats.mockResolvedValue(mockStats);

        const response = await request(app)
          .get('/api/score/clashroyale/stats');

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data.game).toBe('clashroyale');
        expect(response.body.data.stats).toEqual(mockStats);

        expect(mockGetGameStats).toHaveBeenCalledWith('clashroyale');
      });

      it('should handle database errors for Clash Royale stats', async () => {
        mockGetGameStats.mockRejectedValue(new Error('Stats query failed'));

        const response = await request(app)
          .get('/api/score/clashroyale/stats');

        expect(response.status).toBe(500);
        expect(response.body.error).toBe('Failed to retrieve game statistics');
        expect(response.body.code).toBe('STATS_FETCH_FAILED');
      });
    });

    describe('GET /clashroyale/user/:userId', () => {
      it('should get user Clash Royale scores successfully', async () => {
        const mockBestScore = { id: 1, score: 1800, distance: 1100, created_at: '2024-01-01T12:00:00Z' };
        const mockRecentScores = [
          { id: 1, score: 1800, distance: 1100, created_at: '2024-01-01T12:00:00Z' },
          { id: 2, score: 1500, distance: 900, created_at: '2024-01-01T11:00:00Z' }
        ];

        mockGetUserBestScore.mockResolvedValue(mockBestScore);
        mockGetUserRecentScores.mockResolvedValue(mockRecentScores);

        const response = await request(app)
          .get('/api/score/clashroyale/user/123');

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data.userId).toBe(123);
        expect(response.body.data.game).toBe('clashroyale');
        expect(response.body.data.bestScore).toEqual(mockBestScore);
        expect(response.body.data.recentScores).toEqual(mockRecentScores);
        expect(response.body.data.totalPlays).toBe(2);

        expect(mockGetUserBestScore).toHaveBeenCalledWith(123, 'clashroyale');
        expect(mockGetUserRecentScores).toHaveBeenCalledWith(123, 'clashroyale', 5);
      });

      it('should handle invalid user ID for Clash Royale scores', async () => {
        const response = await request(app)
          .get('/api/score/clashroyale/user/invalid');

        expect(response.status).toBe(400);
        expect(response.body.error).toBe('Invalid user ID');
        expect(response.body.code).toBe('INVALID_USER_ID');
      });

      it('should handle database errors for user Clash Royale scores', async () => {
        mockGetUserBestScore.mockRejectedValue(new Error('Database connection failed'));

        const response = await request(app)
          .get('/api/score/clashroyale/user/123');

        expect(response.status).toBe(500);
        expect(response.body.error).toBe('Failed to retrieve user scores');
        expect(response.body.code).toBe('USER_SCORES_FETCH_FAILED');
      });
    });
  });
});