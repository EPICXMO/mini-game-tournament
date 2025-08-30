/**
 * AI Bot System Tests
 */

import { AIBotService } from '../src/ai/aiBotService.js';
import { VisionBot } from '../src/ai/visionBot.js';
import { IntelligentBotController } from '../src/ai/intelligentBotController.js';

describe('AI Bot System', () => {
  let aiBotService;

  beforeEach(() => {
    aiBotService = new AIBotService();
  });

  afterEach(async () => {
    // Clean up any created bots
    const bots = aiBotService.getBotsInTournament('test_tournament');
    for (const bot of bots) {
      await aiBotService.removeBot(bot.botId);
    }
  });

  describe('AIBotService', () => {
    test('should create a new bot', async () => {
      const result = await aiBotService.createBot('test_tournament', {
        personality: 'strategic',
        skillLevel: 'expert'
      });

      expect(result).toBeDefined();
      expect(result.botId).toBeTruthy();
      expect(result.bot).toBeInstanceOf(IntelligentBotController);
      expect(result.tournamentId).toBe('test_tournament');
    });

    test('should add bot to tournament', async () => {
      const result = await aiBotService.addBotToTournament(
        'test_tournament',
        'jetpack',
        1
      );

      expect(result).toBeDefined();
      expect(result.botPlayer).toBeDefined();
      expect(result.botPlayer.type).toBe('intelligent_bot');
      expect(result.botPlayer.isIntelligent).toBe(true);
      expect(result.controller).toBeInstanceOf(IntelligentBotController);
    });

    test('should get bot configuration for different games', () => {
      const jetpackConfig = aiBotService.getBotConfigForGame('jetpack');
      const subwayConfig = aiBotService.getBotConfigForGame('subway');

      expect(jetpackConfig.personality).toBe('risk_taking');
      expect(subwayConfig.personality).toBe('reactive');
      expect(jetpackConfig.narrationStyle).toBe('entertaining');
      expect(subwayConfig.narrationStyle).toBe('competitive');
    });

    test('should generate appropriate bot names', () => {
      const jetpackName = aiBotService.generateBotName('jetpack');
      const subwayName = aiBotService.generateBotName('subway');

      expect(jetpackName).toMatch(/^(SkyBot|JetAI|FlightMaster|AeroBot|ThrustAI)-\d+$/);
      expect(subwayName).toMatch(/^(RailRunner|TrackBot|SpeedAI|SubwayPro|RushBot)-\d+$/);
    });

    test('should track bot performance', async () => {
      const { botId } = await aiBotService.createBot('test_tournament');
      
      aiBotService.updateBotScore(botId, 1500, { gameType: 'jetpack' });
      aiBotService.updateBotScore(botId, 2000, { gameType: 'jetpack' });

      const performance = aiBotService.getBotPerformance(botId);
      
      expect(performance).toBeDefined();
      expect(performance.totalGames).toBe(2);
      expect(performance.totalScore).toBe(3500);
      expect(performance.averageScore).toBe(1750);
    });
  });

  describe('VisionBot', () => {
    test('should initialize with default config', () => {
      const visionBot = new VisionBot();
      
      expect(visionBot.botId).toBeTruthy();
      expect(visionBot.personality).toBe('strategic');
      expect(visionBot.gameContext).toBeInstanceOf(Map);
      expect(visionBot.learningMemory).toBeInstanceOf(Map);
    });

    test('should get game-specific prompts', () => {
      const visionBot = new VisionBot();
      
      const jetpackPrompt = visionBot.getGameSpecificPrompt('jetpack');
      const subwayPrompt = visionBot.getGameSpecificPrompt('subway');
      
      expect(jetpackPrompt).toContain('Jetpack Joyride');
      expect(jetpackPrompt).toContain('jetpack status');
      expect(subwayPrompt).toContain('Subway Surfers');
      expect(subwayPrompt).toContain('lane position');
    });

    test('should provide fallback actions', () => {
      const visionBot = new VisionBot();
      
      const jetpackFallback = visionBot.getFallbackAction('jetpack');
      const subwayFallback = visionBot.getFallbackAction('subway');
      
      expect(jetpackFallback.decision.action).toBe('maintain_altitude');
      expect(subwayFallback.decision.action).toBe('stay_center');
      expect(jetpackFallback.fallback).toBe(true);
    });

    test('should store and retrieve game context', () => {
      const visionBot = new VisionBot();
      
      const mockAnalysis = {
        gameState: 'playing',
        situation: 'test_situation'
      };
      
      visionBot.storeGameContext('jetpack', mockAnalysis);
      
      const context = visionBot.getRelevantContext('jetpack');
      expect(context.recentStates).toHaveLength(1);
      expect(context.recentStates[0].analysis).toEqual(mockAnalysis);
    });
  });

  describe('IntelligentBotController', () => {
    test('should initialize with vision bot', () => {
      const controller = new IntelligentBotController({
        botId: 'test_controller'
      });
      
      expect(controller.botId).toBe('test_controller');
      expect(controller.visionBot).toBeInstanceOf(VisionBot);
      expect(controller.isActive).toBe(false);
    });

    test('should map decisions to game actions', () => {
      const controller = new IntelligentBotController();
      
      const jetpackActions = controller.mapDecisionToActions(
        { action: 'boost_up' },
        'jetpack'
      );
      
      const subwayActions = controller.mapDecisionToActions(
        { action: 'move_left' },
        'subway'
      );
      
      expect(jetpackActions).toHaveLength(1);
      expect(jetpackActions[0].type).toBe('key_press');
      expect(jetpackActions[0].key).toBe('space');
      
      expect(subwayActions).toHaveLength(1);
      expect(subwayActions[0].type).toBe('key_press');
      expect(subwayActions[0].key).toBe('arrow_left');
    });

    test('should provide performance statistics', () => {
      const controller = new IntelligentBotController({
        botId: 'test_performance'
      });
      
      const stats = controller.getPerformanceStats();
      
      expect(stats.botId).toBe('test_performance');
      expect(stats.isActive).toBe(false);
      expect(stats.performance).toBeDefined();
      expect(stats.timestamp).toBeTruthy();
    });
  });

  describe('Integration Tests', () => {
    test('should create and manage bot lifecycle', async () => {
      // Create bot
      const { botId, bot } = await aiBotService.createBot('test_tournament', {
        personality: 'test'
      });
      
      expect(botId).toBeTruthy();
      expect(bot).toBeInstanceOf(IntelligentBotController);
      
      // Check bot is tracked
      const bots = aiBotService.getBotsInTournament('test_tournament');
      expect(bots).toHaveLength(1);
      expect(bots[0].botId).toBe(botId);
      
      // Update performance
      aiBotService.updateBotScore(botId, 1000, { gameType: 'test' });
      
      const performance = aiBotService.getBotPerformance(botId);
      expect(performance.totalGames).toBe(1);
      expect(performance.lastScore).toBe(1000);
      
      // Remove bot
      await aiBotService.removeBot(botId);
      
      const botsAfterRemoval = aiBotService.getBotsInTournament('test_tournament');
      expect(botsAfterRemoval).toHaveLength(0);
    });

    test('should handle multiple bots in tournament', async () => {
      const gameTypes = ['jetpack', 'subway', 'geometry'];
      const createdBots = [];
      
      // Create multiple bots
      for (const gameType of gameTypes) {
        const result = await aiBotService.addBotToTournament(
          'multi_bot_tournament',
          gameType,
          1
        );
        createdBots.push(result);
      }
      
      expect(createdBots).toHaveLength(3);
      
      // Check all bots are tracked
      const bots = aiBotService.getBotsInTournament('multi_bot_tournament');
      expect(bots).toHaveLength(3);
      
      // Each bot should have different names and specialties
      const names = bots.map(b => b.performance.botId);
      const uniqueNames = new Set(names);
      expect(uniqueNames.size).toBe(3);
    });
  });
});