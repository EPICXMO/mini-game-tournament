import express from 'express';
import rateLimit from 'express-rate-limit';
import { z } from 'zod';
import { ScoreService } from '../services/scoreService.js';

const router = express.Router();

const scoreLimiter = rateLimit({ windowMs: 60 * 1000, max: 120 });

/**
 * POST /api/score/jetpack - Submit a Jetpack game score
 */
router.post('/jetpack', scoreLimiter, async (req, res) => {
  try {
    const BodySchema = z.object({
      score: z.number().int().nonnegative(),
      distance: z.number().int().nonnegative().optional(),
      coins: z.number().int().nonnegative().optional(),
      time: z.number().nonnegative().optional(),
      userId: z.number().int().positive().optional()
    });
    const { score, distance, coins, time, userId } = BodySchema.parse(req.body);

    // Validate required fields
    if (score === undefined || score === null) {
      return res.status(400).json({
        error: 'Score is required',
        code: 'MISSING_SCORE'
      });
    }

    if (typeof score !== 'number' || score < 0) {
      return res.status(400).json({
        error: 'Score must be a non-negative number',
        code: 'INVALID_SCORE'
      });
    }

    // Prepare score data
    const scoreData = {
      userId: userId || 1, // Default to anonymous user
      gameType: 'jetpack',
      score: Math.floor(score), // Ensure integer
      distance: distance ? Math.floor(distance) : 0,
      coinsCollected: coins ? Math.floor(coins) : 0,
      gameTime: time || 0,
      metadata: {
        userAgent: req.headers['user-agent'],
        timestamp: new Date().toISOString()
      }
    };

    // Submit score
    const result = await ScoreService.submitScore(scoreData);

    // Return success response
    res.status(201).json({
      success: true,
      message: 'Score submitted successfully',
      data: {
        scoreId: result.id,
        score: result.score,
        distance: result.distance,
        coins: result.coinsCollected,
        time: result.gameTime,
        submittedAt: result.createdAt
      }
    });

  } catch (error) {
    const status = error?.name === 'ZodError' ? 400 : 500;
    res.status(status).json({ error: status === 400 ? 'INVALID_REQUEST' : 'SCORE_SUBMISSION_FAILED' });
  }
});

/**
 * GET /api/score/jetpack/leaderboard - Get Jetpack leaderboard
 */
router.get('/jetpack/leaderboard', scoreLimiter, async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 10, 50); // Max 50 entries

    const leaderboard = await ScoreService.getLeaderboard('jetpack', limit);

    res.json({
      success: true,
      data: {
        game: 'jetpack',
        leaderboard,
        total: leaderboard.length
      }
    });

  } catch (error) {
    console.error('Error getting Jetpack leaderboard:', error);
    
    res.status(500).json({
      error: 'Failed to retrieve leaderboard',
      code: 'LEADERBOARD_FETCH_FAILED'
    });
  }
});

/**
 * GET /api/score/jetpack/stats - Get Jetpack game statistics
 */
router.get('/jetpack/stats', async (req, res) => {
  try {
    const stats = await ScoreService.getGameStats('jetpack');

    res.json({
      success: true,
      data: {
        game: 'jetpack',
        stats
      }
    });

  } catch (error) {
    console.error('Error getting Jetpack stats:', error);
    
    res.status(500).json({
      error: 'Failed to retrieve game statistics',
      code: 'STATS_FETCH_FAILED'
    });
  }
});

/**
 * GET /api/score/jetpack/user/:userId - Get user's Jetpack scores
 */
router.get('/jetpack/user/:userId', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const limit = Math.min(parseInt(req.query.limit) || 5, 20); // Max 20 entries

    if (isNaN(userId) || userId <= 0) {
      return res.status(400).json({
        error: 'Invalid user ID',
        code: 'INVALID_USER_ID'
      });
    }

    // Get both best score and recent scores
    const [bestScore, recentScores] = await Promise.all([
      ScoreService.getUserBestScore(userId, 'jetpack'),
      ScoreService.getUserRecentScores(userId, 'jetpack', limit)
    ]);

    res.json({
      success: true,
      data: {
        userId,
        game: 'jetpack',
        bestScore,
        recentScores,
        totalPlays: recentScores.length
      }
    });

  } catch (error) {
    console.error('Error getting user Jetpack scores:', error);
    
    res.status(500).json({
      error: 'Failed to retrieve user scores',
      code: 'USER_SCORES_FETCH_FAILED'
    });
  }
});

export default router;