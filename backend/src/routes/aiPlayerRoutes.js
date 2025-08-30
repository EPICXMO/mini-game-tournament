/**
 * AI Player Routes - API endpoints for managing AI bot players
 */

import express from 'express';
import AIPlayerService from '../services/aiPlayerService.js';

const router = express.Router();

/**
 * POST /api/ai/bot - Create a new AI bot player
 */
router.post('/bot', async (req, res) => {
  try {
    const { botId, name, difficulty, personality } = req.body;

    if (!botId) {
      return res.status(400).json({
        error: 'Bot ID is required',
        code: 'MISSING_BOT_ID'
      });
    }

    // Check if bot already exists
    if (AIPlayerService.bots.has(botId)) {
      return res.status(409).json({
        error: 'Bot already exists',
        code: 'BOT_EXISTS'
      });
    }

    const config = {
      name: name || undefined,
      difficulty: difficulty || 'medium',
      personality: personality || 'balanced'
    };

    const bot = AIPlayerService.createBot(botId, config);

    res.status(201).json({
      success: true,
      message: 'AI bot created successfully',
      data: {
        bot: {
          id: bot.id,
          name: bot.name,
          type: bot.type,
          difficulty: bot.difficulty,
          personality: bot.personality,
          aiSettings: bot.aiSettings,
          createdAt: bot.createdAt
        }
      }
    });

  } catch (error) {
    console.error('Error creating AI bot:', error);
    
    res.status(500).json({
      error: 'Failed to create AI bot',
      code: 'BOT_CREATION_FAILED',
      message: error.message
    });
  }
});

/**
 * GET /api/ai/bots - Get all AI bots
 */
router.get('/bots', async (req, res) => {
  try {
    const bots = AIPlayerService.getAllBots();
    
    const botData = bots.map(bot => ({
      id: bot.id,
      name: bot.name,
      type: bot.type,
      difficulty: bot.difficulty,
      personality: bot.personality,
      gameState: bot.gameState,
      currentGame: bot.currentGame,
      score: bot.score,
      totalScore: bot.totalScore,
      thinkingCycle: bot.thinkingCycle,
      position: bot.position,
      createdAt: bot.createdAt
    }));

    res.json({
      success: true,
      data: {
        bots: botData,
        totalCount: bots.length,
        activeCount: bots.filter(b => b.gameState === 'playing').length
      }
    });

  } catch (error) {
    console.error('Error getting AI bots:', error);
    
    res.status(500).json({
      error: 'Failed to retrieve AI bots',
      code: 'BOTS_FETCH_FAILED'
    });
  }
});

/**
 * GET /api/ai/bot/:botId - Get specific AI bot details
 */
router.get('/bot/:botId', async (req, res) => {
  try {
    const { botId } = req.params;
    
    const performance = AIPlayerService.getBotPerformance(botId);
    
    if (!performance) {
      return res.status(404).json({
        error: 'Bot not found',
        code: 'BOT_NOT_FOUND'
      });
    }

    res.json({
      success: true,
      data: {
        bot: performance.bot,
        performance: {
          totalDecisions: performance.totalDecisions,
          averageConfidence: Math.round(performance.averageConfidence * 100) / 100,
          currentState: performance.currentState,
          recentDecisions: performance.recentPerformance.slice(-5) // Last 5 decisions
        }
      }
    });

  } catch (error) {
    console.error('Error getting AI bot details:', error);
    
    res.status(500).json({
      error: 'Failed to retrieve bot details',
      code: 'BOT_DETAILS_FAILED'
    });
  }
});

/**
 * POST /api/ai/bot/:botId/start - Start AI thinking for a bot in a game
 */
router.post('/bot/:botId/start', async (req, res) => {
  try {
    const { botId } = req.params;
    const { gameType, tournamentId } = req.body;

    if (!gameType) {
      return res.status(400).json({
        error: 'Game type is required',
        code: 'MISSING_GAME_TYPE'
      });
    }

    if (!tournamentId) {
      return res.status(400).json({
        error: 'Tournament ID is required',
        code: 'MISSING_TOURNAMENT_ID'
      });
    }

    const bot = AIPlayerService.startThinking(botId, gameType, tournamentId);

    res.json({
      success: true,
      message: 'AI thinking started',
      data: {
        botId: bot.id,
        gameType: bot.currentGame,
        gameState: bot.gameState,
        thinkingCycle: bot.thinkingCycle
      }
    });

  } catch (error) {
    console.error('Error starting AI thinking:', error);
    
    res.status(500).json({
      error: 'Failed to start AI thinking',
      code: 'AI_START_FAILED',
      message: error.message
    });
  }
});

/**
 * POST /api/ai/bot/:botId/stop - Stop AI thinking for a bot
 */
router.post('/bot/:botId/stop', async (req, res) => {
  try {
    const { botId } = req.params;

    AIPlayerService.stopThinking(botId);

    res.json({
      success: true,
      message: 'AI thinking stopped',
      data: {
        botId: botId
      }
    });

  } catch (error) {
    console.error('Error stopping AI thinking:', error);
    
    res.status(500).json({
      error: 'Failed to stop AI thinking',
      code: 'AI_STOP_FAILED'
    });
  }
});

/**
 * DELETE /api/ai/bot/:botId - Remove an AI bot
 */
router.delete('/bot/:botId', async (req, res) => {
  try {
    const { botId } = req.params;

    if (!AIPlayerService.bots.has(botId)) {
      return res.status(404).json({
        error: 'Bot not found',
        code: 'BOT_NOT_FOUND'
      });
    }

    AIPlayerService.removeBot(botId);

    res.json({
      success: true,
      message: 'AI bot removed successfully',
      data: {
        botId: botId
      }
    });

  } catch (error) {
    console.error('Error removing AI bot:', error);
    
    res.status(500).json({
      error: 'Failed to remove AI bot',
      code: 'BOT_REMOVAL_FAILED'
    });
  }
});

/**
 * GET /api/ai/bot/:botId/performance - Get detailed bot performance analytics
 */
router.get('/bot/:botId/performance', async (req, res) => {
  try {
    const { botId } = req.params;
    const { limit = 20 } = req.query;

    const performance = AIPlayerService.getBotPerformance(botId);
    
    if (!performance) {
      return res.status(404).json({
        error: 'Bot not found',
        code: 'BOT_NOT_FOUND'
      });
    }

    const recentDecisions = performance.recentPerformance.slice(-Math.min(parseInt(limit), 100));
    
    // Calculate analytics
    const analytics = {
      totalDecisions: performance.totalDecisions,
      averageConfidence: Math.round(performance.averageConfidence * 100) / 100,
      confidenceDistribution: calculateConfidenceDistribution(recentDecisions),
      actionFrequency: calculateActionFrequency(recentDecisions),
      performanceTrend: calculatePerformanceTrend(recentDecisions)
    };

    res.json({
      success: true,
      data: {
        botId: botId,
        analytics: analytics,
        recentDecisions: recentDecisions,
        currentState: performance.currentState
      }
    });

  } catch (error) {
    console.error('Error getting bot performance:', error);
    
    res.status(500).json({
      error: 'Failed to retrieve bot performance',
      code: 'PERFORMANCE_FETCH_FAILED'
    });
  }
});

/**
 * POST /api/ai/tournament/:tournamentId/fill - Auto-fill tournament with AI bots
 */
router.post('/tournament/:tournamentId/fill', async (req, res) => {
  try {
    const { tournamentId } = req.params;
    const { targetPlayerCount = 8, botConfigs = [] } = req.body;

    // This would integrate with the tournament service
    // For now, just create the requested bots
    const createdBots = [];
    
    for (let i = 0; i < Math.min(targetPlayerCount, 8); i++) {
      const botId = `ai_bot_${tournamentId}_${i + 1}`;
      const config = botConfigs[i] || {
        name: `AI Player ${i + 1}`,
        difficulty: ['easy', 'medium', 'hard'][Math.floor(Math.random() * 3)],
        personality: ['aggressive', 'defensive', 'balanced'][Math.floor(Math.random() * 3)]
      };

      try {
        if (!AIPlayerService.bots.has(botId)) {
          const bot = AIPlayerService.createBot(botId, config);
          createdBots.push({
            id: bot.id,
            name: bot.name,
            difficulty: bot.difficulty,
            personality: bot.personality
          });
        }
      } catch (error) {
        console.warn(`Failed to create bot ${botId}:`, error.message);
      }
    }

    res.json({
      success: true,
      message: `Created ${createdBots.length} AI bots for tournament`,
      data: {
        tournamentId: tournamentId,
        botsCreated: createdBots.length,
        bots: createdBots
      }
    });

  } catch (error) {
    console.error('Error filling tournament with bots:', error);
    
    res.status(500).json({
      error: 'Failed to fill tournament with AI bots',
      code: 'TOURNAMENT_FILL_FAILED'
    });
  }
});

/**
 * GET /api/ai/status - Get AI system status
 */
router.get('/status', async (req, res) => {
  try {
    const bots = AIPlayerService.getAllBots();
    const activeBots = bots.filter(bot => bot.gameState === 'playing');
    const gameTypes = [...new Set(activeBots.map(bot => bot.currentGame).filter(Boolean))];
    
    res.json({
      success: true,
      data: {
        totalBots: bots.length,
        activeBots: activeBots.length,
        idleBots: bots.length - activeBots.length,
        activeGames: gameTypes,
        strategies: Array.from(AIPlayerService.gameStrategies.keys()),
        thinkingEnabled: AIPlayerService.thinkingEnabled,
        uptime: process.uptime()
      }
    });

  } catch (error) {
    console.error('Error getting AI status:', error);
    
    res.status(500).json({
      error: 'Failed to retrieve AI status',
      code: 'AI_STATUS_FAILED'
    });
  }
});

// Helper methods for analytics (would be moved to service if used extensively)
function calculateConfidenceDistribution(decisions) {
  const ranges = { low: 0, medium: 0, high: 0 };
  decisions.forEach(decision => {
    const confidence = decision.analysis.confidence;
    if (confidence < 0.5) ranges.low++;
    else if (confidence < 0.8) ranges.medium++;
    else ranges.high++;
  });
  return ranges;
}

function calculateActionFrequency(decisions) {
  const frequency = {};
  decisions.forEach(decision => {
    const action = decision.decision.action;
    frequency[action] = (frequency[action] || 0) + 1;
  });
  return frequency;
}

function calculatePerformanceTrend(decisions) {
  if (decisions.length < 2) return 'stable';
  
  const recent = decisions.slice(-5);
  const avgRecent = recent.reduce((sum, d) => sum + d.analysis.confidence, 0) / recent.length;
  
  const earlier = decisions.slice(-10, -5);
  if (earlier.length === 0) return 'stable';
  
  const avgEarlier = earlier.reduce((sum, d) => sum + d.analysis.confidence, 0) / earlier.length;
  
  const diff = avgRecent - avgEarlier;
  if (diff > 0.1) return 'improving';
  else if (diff < -0.1) return 'declining';
  else return 'stable';
}

export default router;