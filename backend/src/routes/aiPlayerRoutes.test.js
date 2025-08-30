/**
 * AI Player Routes Tests
 */

import request from 'supertest';
import express from 'express';
import aiPlayerRoutes from './aiPlayerRoutes.js';
import AIPlayerService from '../services/aiPlayerService.js';

describe('AI Player Routes', () => {
  let app;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/api/ai', aiPlayerRoutes);
  });

  beforeEach(() => {
    // Clear AI service state
    AIPlayerService.bots.clear();
    AIPlayerService.decisionHistory.clear();
    AIPlayerService.thinkingEnabled = false;
  });

  describe('POST /api/ai/bot', () => {
    test('should create a new AI bot', async () => {
      const botData = {
        botId: 'test-bot-1',
        name: 'Test AI',
        difficulty: 'hard',
        personality: 'aggressive'
      };

      const response = await request(app)
        .post('/api/ai/bot')
        .send(botData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.bot.id).toBe('test-bot-1');
      expect(response.body.data.bot.name).toBe('Test AI');
      expect(response.body.data.bot.difficulty).toBe('hard');
      expect(response.body.data.bot.personality).toBe('aggressive');
      expect(response.body.data.bot.type).toBe('ai_player');
    });

    test('should create bot with default values', async () => {
      const response = await request(app)
        .post('/api/ai/bot')
        .send({ botId: 'default-bot' })
        .expect(201);

      expect(response.body.data.bot.difficulty).toBe('medium');
      expect(response.body.data.bot.personality).toBe('balanced');
      expect(response.body.data.bot.name).toMatch(/AI_/);
    });

    test('should reject request without botId', async () => {
      const response = await request(app)
        .post('/api/ai/bot')
        .send({ name: 'Test' })
        .expect(400);

      expect(response.body.error).toBe('Bot ID is required');
      expect(response.body.code).toBe('MISSING_BOT_ID');
    });

    test('should reject duplicate bot creation', async () => {
      const botData = { botId: 'duplicate-bot' };
      
      // Create first bot
      await request(app)
        .post('/api/ai/bot')
        .send(botData)
        .expect(201);

      // Try to create duplicate
      const response = await request(app)
        .post('/api/ai/bot')
        .send(botData)
        .expect(409);

      expect(response.body.error).toBe('Bot already exists');
      expect(response.body.code).toBe('BOT_EXISTS');
    });
  });

  describe('GET /api/ai/bots', () => {
    test('should return empty list when no bots exist', async () => {
      const response = await request(app)
        .get('/api/ai/bots')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.bots).toEqual([]);
      expect(response.body.data.totalCount).toBe(0);
      expect(response.body.data.activeCount).toBe(0);
    });

    test('should return list of created bots', async () => {
      // Create some bots
      AIPlayerService.createBot('bot1', { name: 'Bot One' });
      AIPlayerService.createBot('bot2', { name: 'Bot Two' });
      
      const response = await request(app)
        .get('/api/ai/bots')
        .expect(200);

      expect(response.body.data.bots).toHaveLength(2);
      expect(response.body.data.totalCount).toBe(2);
      expect(response.body.data.bots[0].name).toBe('Bot One');
      expect(response.body.data.bots[1].name).toBe('Bot Two');
    });

    test('should count active bots correctly', async () => {
      AIPlayerService.createBot('active-bot');
      AIPlayerService.createBot('idle-bot');
      
      // Start thinking for one bot
      AIPlayerService.startThinking('active-bot', 'jetpack', 'tournament-1');
      
      const response = await request(app)
        .get('/api/ai/bots')
        .expect(200);

      expect(response.body.data.totalCount).toBe(2);
      expect(response.body.data.activeCount).toBe(1);
    });
  });

  describe('GET /api/ai/bot/:botId', () => {
    test('should return bot details', async () => {
      AIPlayerService.createBot('detail-bot', { name: 'Detail Bot' });
      
      const response = await request(app)
        .get('/api/ai/bot/detail-bot')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.bot.id).toBe('detail-bot');
      expect(response.body.data.bot.name).toBe('Detail Bot');
      expect(response.body.data.performance).toBeDefined();
      expect(response.body.data.performance.totalDecisions).toBe(0);
    });

    test('should return 404 for non-existent bot', async () => {
      const response = await request(app)
        .get('/api/ai/bot/nonexistent')
        .expect(404);

      expect(response.body.error).toBe('Bot not found');
      expect(response.body.code).toBe('BOT_NOT_FOUND');
    });
  });

  describe('POST /api/ai/bot/:botId/start', () => {
    test('should start AI thinking', async () => {
      AIPlayerService.createBot('thinking-bot');
      
      const response = await request(app)
        .post('/api/ai/bot/thinking-bot/start')
        .send({ gameType: 'jetpack', tournamentId: 'tournament-1' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.gameType).toBe('jetpack');
      expect(response.body.data.gameState).toBe('playing');
    });

    test('should require gameType', async () => {
      AIPlayerService.createBot('test-bot');
      
      const response = await request(app)
        .post('/api/ai/bot/test-bot/start')
        .send({ tournamentId: 'tournament-1' })
        .expect(400);

      expect(response.body.error).toBe('Game type is required');
      expect(response.body.code).toBe('MISSING_GAME_TYPE');
    });

    test('should require tournamentId', async () => {
      AIPlayerService.createBot('test-bot');
      
      const response = await request(app)
        .post('/api/ai/bot/test-bot/start')
        .send({ gameType: 'jetpack' })
        .expect(400);

      expect(response.body.error).toBe('Tournament ID is required');
      expect(response.body.code).toBe('MISSING_TOURNAMENT_ID');
    });

    test('should handle non-existent bot', async () => {
      const response = await request(app)
        .post('/api/ai/bot/nonexistent/start')
        .send({ gameType: 'jetpack', tournamentId: 'tournament-1' })
        .expect(500);

      expect(response.body.code).toBe('AI_START_FAILED');
    });
  });

  describe('POST /api/ai/bot/:botId/stop', () => {
    test('should stop AI thinking', async () => {
      AIPlayerService.createBot('stop-bot');
      AIPlayerService.startThinking('stop-bot', 'jetpack', 'tournament-1');
      
      const response = await request(app)
        .post('/api/ai/bot/stop-bot/stop')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.botId).toBe('stop-bot');
      
      // Verify bot is stopped
      const bot = AIPlayerService.bots.get('stop-bot');
      expect(bot.gameState).toBe('idle');
    });

    test('should handle stopping non-existent bot gracefully', async () => {
      const response = await request(app)
        .post('/api/ai/bot/nonexistent/stop')
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });

  describe('DELETE /api/ai/bot/:botId', () => {
    test('should remove bot', async () => {
      AIPlayerService.createBot('remove-bot');
      
      const response = await request(app)
        .delete('/api/ai/bot/remove-bot')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.botId).toBe('remove-bot');
      
      // Verify bot is removed
      expect(AIPlayerService.bots.has('remove-bot')).toBe(false);
    });

    test('should return 404 for non-existent bot', async () => {
      const response = await request(app)
        .delete('/api/ai/bot/nonexistent')
        .expect(404);

      expect(response.body.error).toBe('Bot not found');
      expect(response.body.code).toBe('BOT_NOT_FOUND');
    });
  });

  describe('GET /api/ai/bot/:botId/performance', () => {
    test('should return performance data', async () => {
      AIPlayerService.createBot('perf-bot');
      
      const response = await request(app)
        .get('/api/ai/bot/perf-bot/performance')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.botId).toBe('perf-bot');
      expect(response.body.data.analytics).toBeDefined();
      expect(response.body.data.recentDecisions).toEqual([]);
    });

    test('should handle limit parameter', async () => {
      AIPlayerService.createBot('limit-bot');
      
      const response = await request(app)
        .get('/api/ai/bot/limit-bot/performance?limit=5')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.recentDecisions).toEqual([]);
    });

    test('should return 404 for non-existent bot', async () => {
      const response = await request(app)
        .get('/api/ai/bot/nonexistent/performance')
        .expect(404);

      expect(response.body.error).toBe('Bot not found');
    });
  });

  describe('POST /api/ai/tournament/:tournamentId/fill', () => {
    test('should create bots for tournament', async () => {
      const response = await request(app)
        .post('/api/ai/tournament/test-tournament/fill')
        .send({ targetPlayerCount: 3 })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.botsCreated).toBe(3);
      expect(response.body.data.bots).toHaveLength(3);
      expect(response.body.data.tournamentId).toBe('test-tournament');
    });

    test('should use custom bot configs', async () => {
      const botConfigs = [
        { name: 'Custom Bot 1', difficulty: 'expert', personality: 'aggressive' },
        { name: 'Custom Bot 2', difficulty: 'easy', personality: 'defensive' }
      ];

      const response = await request(app)
        .post('/api/ai/tournament/custom-tournament/fill')
        .send({ targetPlayerCount: 2, botConfigs })
        .expect(200);

      expect(response.body.data.bots[0].name).toBe('Custom Bot 1');
      expect(response.body.data.bots[0].difficulty).toBe('expert');
      expect(response.body.data.bots[1].name).toBe('Custom Bot 2');
      expect(response.body.data.bots[1].difficulty).toBe('easy');
    });

    test('should limit to maximum 8 bots', async () => {
      const response = await request(app)
        .post('/api/ai/tournament/large-tournament/fill')
        .send({ targetPlayerCount: 15 })
        .expect(200);

      expect(response.body.data.botsCreated).toBeLessThanOrEqual(8);
    });

    test('should handle duplicate bot creation gracefully', async () => {
      // Pre-create a bot that would conflict
      AIPlayerService.createBot('ai_bot_duplicate_tournament_1');
      
      const response = await request(app)
        .post('/api/ai/tournament/duplicate-tournament/fill')
        .send({ targetPlayerCount: 2 })
        .expect(200);

      // Should create the second bot even if first fails
      expect(response.body.success).toBe(true);
      expect(response.body.data.botsCreated).toBeGreaterThanOrEqual(1);
    });
  });

  describe('GET /api/ai/status', () => {
    test('should return AI system status', async () => {
      AIPlayerService.createBot('status-bot1');
      AIPlayerService.createBot('status-bot2');
      AIPlayerService.startThinking('status-bot1', 'jetpack', 'tournament-1');
      
      const response = await request(app)
        .get('/api/ai/status')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.totalBots).toBe(2);
      expect(response.body.data.activeBots).toBe(1);
      expect(response.body.data.idleBots).toBe(1);
      expect(response.body.data.activeGames).toContain('jetpack');
      expect(response.body.data.strategies).toContain('jetpack');
      expect(response.body.data.strategies).toContain('subway');
      expect(response.body.data.strategies).toContain('default');
      expect(response.body.data.uptime).toBeGreaterThan(0);
    });

    test('should return empty status when no bots exist', async () => {
      const response = await request(app)
        .get('/api/ai/status')
        .expect(200);

      expect(response.body.data.totalBots).toBe(0);
      expect(response.body.data.activeBots).toBe(0);
      expect(response.body.data.idleBots).toBe(0);
      expect(response.body.data.activeGames).toEqual([]);
    });
  });

  describe('Error Handling', () => {
    test('should handle service errors gracefully', async () => {
      // Mock service to throw error
      const originalCreateBot = AIPlayerService.createBot;
      AIPlayerService.createBot = () => {
        throw new Error('Service error');
      };

      const response = await request(app)
        .post('/api/ai/bot')
        .send({ botId: 'error-bot' })
        .expect(500);

      expect(response.body.code).toBe('BOT_CREATION_FAILED');
      expect(response.body.message).toBe('Service error');

      // Restore original method
      AIPlayerService.createBot = originalCreateBot;
    });
  });
});