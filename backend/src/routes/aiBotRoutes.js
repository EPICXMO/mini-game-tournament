/**
 * AI Bot Routes - API endpoints for managing intelligent bots
 * 
 * Provides REST API endpoints for:
 * - Creating and configuring AI bots
 * - Managing bot lifecycle in tournaments
 * - Monitoring bot performance
 * - Bot settings and customization
 */

import express from 'express';
import { AIBotService } from '../ai/aiBotService.js';

const router = express.Router();
const aiBotService = new AIBotService();

/**
 * GET /api/bots - Get all bots or filter by tournament
 */
router.get('/', async (req, res) => {
  try {
    const { tournamentId } = req.query;
    
    if (tournamentId) {
      const bots = aiBotService.getBotsInTournament(tournamentId);
      res.json({
        success: true,
        data: bots,
        tournamentId
      });
    } else {
      const stats = aiBotService.getServiceStats();
      res.json({
        success: true,
        data: stats
      });
    }
  } catch (error) {
    console.error('Error getting bots:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get bots'
    });
  }
});

/**
 * POST /api/bots - Create a new intelligent bot
 */
router.post('/', async (req, res) => {
  try {
    const { tournamentId, gameType, config = {} } = req.body;
    
    if (!tournamentId || !gameType) {
      return res.status(400).json({
        success: false,
        error: 'Tournament ID and game type are required'
      });
    }
    
    // Get optimized config for the game type
    const botConfig = aiBotService.getBotConfigForGame(gameType);
    const mergedConfig = { ...botConfig, ...config };
    
    const result = await aiBotService.createBot(tournamentId, mergedConfig);
    
    res.status(201).json({
      success: true,
      data: result,
      message: `Intelligent bot created for ${gameType}`
    });
    
  } catch (error) {
    console.error('Error creating bot:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to create bot'
    });
  }
});

/**
 * POST /api/bots/tournament/:tournamentId - Add bot to tournament
 */
router.post('/tournament/:tournamentId', async (req, res) => {
  try {
    const { tournamentId } = req.params;
    const { gameType, playerSlot, config = {} } = req.body;
    
    if (!gameType) {
      return res.status(400).json({
        success: false,
        error: 'Game type is required'
      });
    }
    
    const result = await aiBotService.addBotToTournament(
      tournamentId,
      gameType,
      playerSlot
    );
    
    res.status(201).json({
      success: true,
      data: result,
      message: `Intelligent bot added to tournament ${tournamentId}`
    });
    
  } catch (error) {
    console.error('Error adding bot to tournament:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to add bot to tournament'
    });
  }
});

/**
 * GET /api/bots/:botId - Get specific bot information
 */
router.get('/:botId', async (req, res) => {
  try {
    const { botId } = req.params;
    
    const performance = aiBotService.getBotPerformance(botId);
    
    if (!performance) {
      return res.status(404).json({
        success: false,
        error: 'Bot not found'
      });
    }
    
    res.json({
      success: true,
      data: performance
    });
    
  } catch (error) {
    console.error('Error getting bot:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get bot information'
    });
  }
});

/**
 * POST /api/bots/:botId/start - Start bot in a round
 */
router.post('/:botId/start', async (req, res) => {
  try {
    const { botId } = req.params;
    const { gameType, roundData, gameSession } = req.body;
    
    if (!gameType) {
      return res.status(400).json({
        success: false,
        error: 'Game type is required'
      });
    }
    
    const success = await aiBotService.startBotInRound(
      botId,
      gameType,
      roundData || {},
      gameSession || {}
    );
    
    if (success) {
      res.json({
        success: true,
        message: `Bot ${botId} started playing ${gameType}`
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Failed to start bot'
      });
    }
    
  } catch (error) {
    console.error('Error starting bot:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to start bot'
    });
  }
});

/**
 * POST /api/bots/:botId/stop - Stop bot from playing
 */
router.post('/:botId/stop', async (req, res) => {
  try {
    const { botId } = req.params;
    
    const success = await aiBotService.stopBotInRound(botId);
    
    if (success) {
      res.json({
        success: true,
        message: `Bot ${botId} stopped playing`
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Failed to stop bot'
      });
    }
    
  } catch (error) {
    console.error('Error stopping bot:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to stop bot'
    });
  }
});

/**
 * PUT /api/bots/:botId/score - Update bot score
 */
router.put('/:botId/score', async (req, res) => {
  try {
    const { botId } = req.params;
    const { score, gameData } = req.body;
    
    if (typeof score !== 'number') {
      return res.status(400).json({
        success: false,
        error: 'Score must be a number'
      });
    }
    
    aiBotService.updateBotScore(botId, score, gameData || {});
    
    res.json({
      success: true,
      message: `Bot ${botId} score updated to ${score}`
    });
    
  } catch (error) {
    console.error('Error updating bot score:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update bot score'
    });
  }
});

/**
 * DELETE /api/bots/:botId - Remove bot
 */
router.delete('/:botId', async (req, res) => {
  try {
    const { botId } = req.params;
    
    await aiBotService.removeBot(botId);
    
    res.json({
      success: true,
      message: `Bot ${botId} removed`
    });
    
  } catch (error) {
    console.error('Error removing bot:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to remove bot'
    });
  }
});

/**
 * GET /api/bots/:botId/performance - Get detailed bot performance
 */
router.get('/:botId/performance', async (req, res) => {
  try {
    const { botId } = req.params;
    
    const performance = aiBotService.getBotPerformance(botId);
    
    if (!performance) {
      return res.status(404).json({
        success: false,
        error: 'Bot not found'
      });
    }
    
    res.json({
      success: true,
      data: {
        botId,
        performance,
        timestamp: Date.now()
      }
    });
    
  } catch (error) {
    console.error('Error getting bot performance:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get bot performance'
    });
  }
});

/**
 * POST /api/bots/test - Test AI vision system with screenshot
 */
router.post('/test', async (req, res) => {
  try {
    const { gameType, screenshotPath, config = {} } = req.body;
    
    if (!gameType || !screenshotPath) {
      return res.status(400).json({
        success: false,
        error: 'Game type and screenshot path are required'
      });
    }
    
    // Create temporary bot for testing
    const testBot = await aiBotService.createBot('test_tournament', {
      ...config,
      botId: `test_bot_${Date.now()}`
    });
    
    // Test AI analysis
    const result = await testBot.bot.visionBot.playTurn(
      screenshotPath,
      gameType,
      { score: 0, isActive: true }
    );
    
    // Clean up test bot
    await aiBotService.removeBot(testBot.botId);
    
    res.json({
      success: true,
      data: result,
      message: 'AI vision test completed'
    });
    
  } catch (error) {
    console.error('Error testing AI vision:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to test AI vision'
    });
  }
});

/**
 * GET /api/bots/configs/games - Get available game configurations
 */
router.get('/configs/games', async (req, res) => {
  try {
    const gameTypes = ['jetpack', 'subway', 'geometry', 'dino', 'space', 'bubble'];
    const configs = {};
    
    gameTypes.forEach(gameType => {
      configs[gameType] = aiBotService.getBotConfigForGame(gameType);
    });
    
    res.json({
      success: true,
      data: configs
    });
    
  } catch (error) {
    console.error('Error getting game configs:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get game configurations'
    });
  }
});

export default router;