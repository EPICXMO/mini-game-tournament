import express from 'express';
import { ScoreService } from '../services/scoreService.js';

const router = express.Router();

/**
 * POST /api/score/jetpack - Submit a Jetpack game score
 */
router.post('/jetpack', async (req, res) => {
  try {
    const { score, distance, coins, time, userId } = req.body;

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
    console.error('Error submitting Jetpack score:', error);
    
    res.status(500).json({
      error: 'Failed to submit score',
      code: 'SCORE_SUBMISSION_FAILED',
      message: error.message
    });
  }
});

/**
 * GET /api/score/jetpack/leaderboard - Get Jetpack leaderboard
 */
router.get('/jetpack/leaderboard', async (req, res) => {
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
 * POST /api/score/runner - Submit a Runner game score
 */
router.post('/runner', async (req, res) => {
  try {
    const { score, distance, coins, time, userId } = req.body;

    if (score === undefined || score === null) {
      return res.status(400).json({ error: 'Score is required', code: 'MISSING_SCORE' });
    }
    if (typeof score !== 'number' || score < 0) {
      return res.status(400).json({ error: 'Score must be a non-negative number', code: 'INVALID_SCORE' });
    }

    const scoreData = {
      userId: userId || 1,
      gameType: 'runner',
      score: Math.floor(score),
      distance: distance ? Math.floor(distance) : 0,
      coinsCollected: coins ? Math.floor(coins) : 0,
      gameTime: time || 0,
      metadata: {
        userAgent: req.headers['user-agent'],
        timestamp: new Date().toISOString()
      }
    };

    const result = await ScoreService.submitScore(scoreData);

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
    console.error('Error submitting Runner score:', error);
    res.status(500).json({ error: 'Failed to submit score', code: 'SCORE_SUBMISSION_FAILED', message: error.message });
  }
});

/**
 * GET /api/score/runner/leaderboard - Get Runner leaderboard
 */
router.get('/runner/leaderboard', async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 10, 50);
    const leaderboard = await ScoreService.getLeaderboard('runner', limit);
    res.json({ success: true, data: { game: 'runner', leaderboard, total: leaderboard.length } });
  } catch (error) {
    console.error('Error getting Runner leaderboard:', error);
    res.status(500).json({ error: 'Failed to retrieve leaderboard', code: 'LEADERBOARD_FETCH_FAILED' });
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