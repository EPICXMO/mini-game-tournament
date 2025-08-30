/**
 * Bot Routes - API endpoints for managing AI bots
 */
import express from 'express';
import botService from '../services/botService.js';
import tournamentService from '../services/tournamentService.js';

const router = express.Router();

/**
 * GET /api/bot/stats
 * Get overall bot service statistics
 */
router.get('/stats', (req, res) => {
  try {
    const activeBots = botService.getActiveBots();
    const stats = {
      totalActiveBots: activeBots.length,
      botsBySkillLevel: {
        easy: activeBots.filter(bot => bot.skillLevel === 'easy').length,
        medium: activeBots.filter(bot => bot.skillLevel === 'medium').length,
        hard: activeBots.filter(bot => bot.skillLevel === 'hard').length
      },
      botsByGame: {
        jetpack: activeBots.filter(bot => bot.gameType === 'jetpack').length
      }
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error getting bot stats:', error);
    res.status(500).json({
      error: 'Failed to retrieve bot statistics',
      details: error.message
    });
  }
});

/**
 * POST /api/bot/create
 * Create a new bot
 */
router.post('/create', (req, res) => {
  try {
    const { gameType = 'jetpack', skillLevel = 'medium', name } = req.body;

    if (!['jetpack'].includes(gameType)) {
      return res.status(400).json({
        error: 'Unsupported game type',
        supportedTypes: ['jetpack']
      });
    }

    if (!['easy', 'medium', 'hard'].includes(skillLevel)) {
      return res.status(400).json({
        error: 'Invalid skill level',
        supportedLevels: ['easy', 'medium', 'hard']
      });
    }

    const bot = botService.createBot(gameType, skillLevel, name);

    res.status(201).json({
      success: true,
      data: {
        botId: bot.id,
        name: bot.name,
        gameType: bot.gameType,
        skillLevel: bot.skillLevel,
        isActive: bot.state.isActive
      }
    });
  } catch (error) {
    console.error('Error creating bot:', error);
    res.status(500).json({
      error: 'Failed to create bot',
      details: error.message
    });
  }
});

/**
 * GET /api/bot/:botId
 * Get bot details and statistics
 */
router.get('/:botId', (req, res) => {
  try {
    const { botId } = req.params;
    const stats = botService.getBotStats(botId);

    if (!stats) {
      return res.status(404).json({
        error: 'Bot not found'
      });
    }

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error getting bot details:', error);
    res.status(500).json({
      error: 'Failed to retrieve bot details',
      details: error.message
    });
  }
});

/**
 * POST /api/bot/:botId/start
 * Start a bot for a game session
 */
router.post('/:botId/start', (req, res) => {
  try {
    const { botId } = req.params;
    const { gameSession = {} } = req.body;

    const bot = botService.getBot(botId);
    if (!bot) {
      return res.status(404).json({
        error: 'Bot not found'
      });
    }

    const started = botService.startBot(botId, gameSession);

    if (started) {
      res.json({
        success: true,
        data: {
          botId: bot.id,
          name: bot.name,
          isActive: bot.state.isActive,
          message: 'Bot started successfully'
        }
      });
    } else {
      res.status(400).json({
        error: 'Failed to start bot'
      });
    }
  } catch (error) {
    console.error('Error starting bot:', error);
    res.status(500).json({
      error: 'Failed to start bot',
      details: error.message
    });
  }
});

/**
 * POST /api/bot/:botId/stop
 * Stop a bot and record final performance
 */
router.post('/:botId/stop', (req, res) => {
  try {
    const { botId } = req.params;
    const { finalScore = 0, gameTime = 0 } = req.body;

    const bot = botService.getBot(botId);
    if (!bot) {
      return res.status(404).json({
        error: 'Bot not found'
      });
    }

    const stopped = botService.stopBot(botId, finalScore, gameTime);

    if (stopped) {
      const stats = botService.getBotStats(botId);
      res.json({
        success: true,
        data: {
          botId: bot.id,
          name: bot.name,
          finalScore,
          gameTime,
          performance: stats.performance,
          message: 'Bot stopped successfully'
        }
      });
    } else {
      res.status(400).json({
        error: 'Failed to stop bot'
      });
    }
  } catch (error) {
    console.error('Error stopping bot:', error);
    res.status(500).json({
      error: 'Failed to stop bot',
      details: error.message
    });
  }
});

/**
 * POST /api/bot/:botId/decision
 * Get bot decision for current game state
 */
router.post('/:botId/decision', (req, res) => {
  try {
    const { botId } = req.params;
    const { gameState } = req.body;

    if (!gameState) {
      return res.status(400).json({
        error: 'Game state is required'
      });
    }

    const bot = botService.getBot(botId);
    if (!bot) {
      return res.status(404).json({
        error: 'Bot not found'
      });
    }

    const decision = botService.makeBotDecision(botId, gameState);

    res.json({
      success: true,
      data: {
        botId: bot.id,
        decision: decision,
        timestamp: Date.now()
      }
    });
  } catch (error) {
    console.error('Error making bot decision:', error);
    res.status(500).json({
      error: 'Failed to make bot decision',
      details: error.message
    });
  }
});

/**
 * DELETE /api/bot/:botId
 * Remove a bot
 */
router.delete('/:botId', (req, res) => {
  try {
    const { botId } = req.params;
    
    const bot = botService.getBot(botId);
    if (!bot) {
      return res.status(404).json({
        error: 'Bot not found'
      });
    }

    const removed = botService.removeBot(botId);

    if (removed) {
      res.json({
        success: true,
        data: {
          botId: botId,
          message: 'Bot removed successfully'
        }
      });
    } else {
      res.status(400).json({
        error: 'Failed to remove bot'
      });
    }
  } catch (error) {
    console.error('Error removing bot:', error);
    res.status(500).json({
      error: 'Failed to remove bot',
      details: error.message
    });
  }
});

/**
 * GET /api/bot/active/list
 * List all active bots
 */
router.get('/active/list', (req, res) => {
  try {
    const activeBots = botService.getActiveBots();
    
    const botList = activeBots.map(bot => ({
      id: bot.id,
      name: bot.name,
      gameType: bot.gameType,
      skillLevel: bot.skillLevel,
      currentScore: bot.state.currentScore,
      gameTime: bot.state.gameTime,
      performance: bot.state.performance
    }));

    res.json({
      success: true,
      data: {
        totalCount: botList.length,
        bots: botList
      }
    });
  } catch (error) {
    console.error('Error listing active bots:', error);
    res.status(500).json({
      error: 'Failed to list active bots',
      details: error.message
    });
  }
});

/**
 * POST /api/bot/tournament/:tournamentId/decisions
 * Get decisions for all bots in a tournament
 */
router.post('/tournament/:tournamentId/decisions', (req, res) => {
  try {
    const { tournamentId } = req.params;
    const { gameState } = req.body;

    if (!gameState) {
      return res.status(400).json({
        error: 'Game state is required'
      });
    }

    const tournament = tournamentService.getTournament(tournamentId);
    if (!tournament) {
      return res.status(404).json({
        error: 'Tournament not found'
      });
    }

    const botDecisions = tournamentService.makeBotDecisions(tournamentId, gameState);

    res.json({
      success: true,
      data: {
        tournamentId: tournamentId,
        decisions: botDecisions,
        timestamp: Date.now()
      }
    });
  } catch (error) {
    console.error('Error making tournament bot decisions:', error);
    res.status(500).json({
      error: 'Failed to make bot decisions',
      details: error.message
    });
  }
});

export default router;