/**
 * Bot Routes Tests
 */
import request from 'supertest';
import express from 'express';
import botRoutes from './botRoutes.js';
import botService from '../services/botService.js';

// Create test app
const app = express();
app.use(express.json());
app.use('/api/bot', botRoutes);

describe('Bot Routes', () => {
  let testBotId = null;

  beforeEach(() => {
    // Clear all bots before each test
    botService.bots.clear();
  });

  afterEach(() => {
    // Clean up test bot if it exists
    if (testBotId) {
      botService.removeBot(testBotId);
      testBotId = null;
    }
  });

  describe('POST /api/bot/create', () => {
    test('should create a new bot with default settings', async () => {
      const response = await request(app)
        .post('/api/bot/create')
        .send({});

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('botId');
      expect(response.body.data).toHaveProperty('name');
      expect(response.body.data.gameType).toBe('jetpack');
      expect(response.body.data.skillLevel).toBe('medium');
      expect(response.body.data.isActive).toBe(false);

      testBotId = response.body.data.botId;
    });

    test('should create a bot with custom settings', async () => {
      const response = await request(app)
        .post('/api/bot/create')
        .send({
          gameType: 'jetpack',
          skillLevel: 'hard',
          name: 'TestBot'
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('TestBot');
      expect(response.body.data.skillLevel).toBe('hard');

      testBotId = response.body.data.botId;
    });

    test('should reject invalid game type', async () => {
      const response = await request(app)
        .post('/api/bot/create')
        .send({
          gameType: 'invalid-game'
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Unsupported game type');
    });

    test('should reject invalid skill level', async () => {
      const response = await request(app)
        .post('/api/bot/create')
        .send({
          skillLevel: 'impossible'
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Invalid skill level');
    });
  });

  describe('GET /api/bot/stats', () => {
    test('should return bot service statistics', async () => {
      // Create a few test bots
      const bot1 = botService.createBot('jetpack', 'easy');
      const bot2 = botService.createBot('jetpack', 'hard');
      botService.startBot(bot1.id, {});
      botService.startBot(bot2.id, {});

      const response = await request(app)
        .get('/api/bot/stats');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('totalActiveBots');
      expect(response.body.data.totalActiveBots).toBe(2);
      expect(response.body.data.botsBySkillLevel.easy).toBe(1);
      expect(response.body.data.botsBySkillLevel.hard).toBe(1);
      expect(response.body.data.botsByGame.jetpack).toBe(2);

      // Clean up
      botService.removeBot(bot1.id);
      botService.removeBot(bot2.id);
    });
  });

  describe('GET /api/bot/:botId', () => {
    test('should return bot details', async () => {
      const bot = botService.createBot('jetpack', 'medium', 'DetailBot');
      testBotId = bot.id;

      const response = await request(app)
        .get(`/api/bot/${bot.id}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(bot.id);
      expect(response.body.data.name).toBe('DetailBot');
      expect(response.body.data.skillLevel).toBe('medium');
      expect(response.body.data).toHaveProperty('performance');
    });

    test('should return 404 for non-existent bot', async () => {
      const response = await request(app)
        .get('/api/bot/non-existent-bot');

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Bot not found');
    });
  });

  describe('POST /api/bot/:botId/start', () => {
    test('should start a bot', async () => {
      const bot = botService.createBot('jetpack', 'medium');
      testBotId = bot.id;

      const response = await request(app)
        .post(`/api/bot/${bot.id}/start`)
        .send({
          gameSession: { level: 1 }
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.isActive).toBe(true);
      expect(response.body.data.message).toContain('started successfully');
    });

    test('should return 404 for non-existent bot', async () => {
      const response = await request(app)
        .post('/api/bot/non-existent-bot/start')
        .send({});

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Bot not found');
    });
  });

  describe('POST /api/bot/:botId/stop', () => {
    test('should stop a bot and record performance', async () => {
      const bot = botService.createBot('jetpack', 'medium');
      botService.startBot(bot.id, {});
      testBotId = bot.id;

      const response = await request(app)
        .post(`/api/bot/${bot.id}/stop`)
        .send({
          finalScore: 1500,
          gameTime: 45.5
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.finalScore).toBe(1500);
      expect(response.body.data.gameTime).toBe(45.5);
      expect(response.body.data.performance).toHaveProperty('totalGames');
      expect(response.body.data.performance.totalGames).toBe(1);
    });
  });

  describe('POST /api/bot/:botId/decision', () => {
    test('should return bot decision for game state', async () => {
      const bot = botService.createBot('jetpack', 'medium');
      botService.startBot(bot.id, {});
      testBotId = bot.id;

      const gameState = {
        obstacles: [
          { x: 3, y: 1, width: 1, height: 1 }
        ],
        coins: [
          { x: 2, y: 2 }
        ],
        player: {
          position: { x: 0, y: 0 },
          velocity: { x: 2, y: 0 }
        }
      };

      const response = await request(app)
        .post(`/api/bot/${bot.id}/decision`)
        .send({ gameState });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.decision).toHaveProperty('action');
      expect(['thrust', 'fall']).toContain(response.body.data.decision.action);
      expect(response.body.data).toHaveProperty('timestamp');
    });

    test('should reject request without game state', async () => {
      const bot = botService.createBot('jetpack', 'medium');
      testBotId = bot.id;

      const response = await request(app)
        .post(`/api/bot/${bot.id}/decision`)
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Game state is required');
    });
  });

  describe('DELETE /api/bot/:botId', () => {
    test('should remove a bot', async () => {
      const bot = botService.createBot('jetpack', 'medium');
      
      const response = await request(app)
        .delete(`/api/bot/${bot.id}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.message).toContain('removed successfully');

      // Verify bot is actually removed
      const removedBot = botService.getBot(bot.id);
      expect(removedBot).toBeUndefined();
    });

    test('should return 404 for non-existent bot', async () => {
      const response = await request(app)
        .delete('/api/bot/non-existent-bot');

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Bot not found');
    });
  });

  describe('GET /api/bot/active/list', () => {
    test('should list all active bots', async () => {
      // Create and start multiple bots
      const bot1 = botService.createBot('jetpack', 'easy', 'Bot1');
      const bot2 = botService.createBot('jetpack', 'hard', 'Bot2');
      const bot3 = botService.createBot('jetpack', 'medium', 'Bot3');
      
      botService.startBot(bot1.id, {});
      botService.startBot(bot2.id, {});
      // Don't start bot3

      const response = await request(app)
        .get('/api/bot/active/list');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.totalCount).toBe(2);
      expect(response.body.data.bots).toHaveLength(2);
      
      const botNames = response.body.data.bots.map(bot => bot.name);
      expect(botNames).toContain('Bot1');
      expect(botNames).toContain('Bot2');
      expect(botNames).not.toContain('Bot3');

      // Clean up
      botService.removeBot(bot1.id);
      botService.removeBot(bot2.id);
      botService.removeBot(bot3.id);
    });

    test('should return empty list when no bots are active', async () => {
      const response = await request(app)
        .get('/api/bot/active/list');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.totalCount).toBe(0);
      expect(response.body.data.bots).toHaveLength(0);
    });
  });

  describe('Integration Tests', () => {
    test('should handle complete bot lifecycle via API', async () => {
      // Create bot
      const createResponse = await request(app)
        .post('/api/bot/create')
        .send({
          gameType: 'jetpack',
          skillLevel: 'hard',
          name: 'IntegrationBot'
        });

      expect(createResponse.status).toBe(201);
      const botId = createResponse.body.data.botId;

      // Start bot
      const startResponse = await request(app)
        .post(`/api/bot/${botId}/start`)
        .send({});

      expect(startResponse.status).toBe(200);
      expect(startResponse.body.data.isActive).toBe(true);

      // Make decision
      const decisionResponse = await request(app)
        .post(`/api/bot/${botId}/decision`)
        .send({
          gameState: {
            obstacles: [],
            coins: [{ x: 2, y: 1 }],
            player: { position: { x: 0, y: 0 }, velocity: { x: 2, y: 0 } }
          }
        });

      expect(decisionResponse.status).toBe(200);
      expect(decisionResponse.body.data.decision).toHaveProperty('action');

      // Stop bot
      const stopResponse = await request(app)
        .post(`/api/bot/${botId}/stop`)
        .send({
          finalScore: 2500,
          gameTime: 60.0
        });

      expect(stopResponse.status).toBe(200);
      expect(stopResponse.body.data.finalScore).toBe(2500);

      // Get final stats
      const statsResponse = await request(app)
        .get(`/api/bot/${botId}`);

      expect(statsResponse.status).toBe(200);
      expect(statsResponse.body.data.performance.totalGames).toBe(1);
      expect(statsResponse.body.data.performance.bestScore).toBe(2500);

      // Remove bot
      const removeResponse = await request(app)
        .delete(`/api/bot/${botId}`);

      expect(removeResponse.status).toBe(200);
    });
  });
});