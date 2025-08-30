/**
 * AI Player Service Tests
 */

import AIPlayerService from './aiPlayerService.js';

describe('AIPlayerService', () => {
  let service;
  
  beforeEach(() => {
    // Reset service state
    service = AIPlayerService;
    service.bots.clear();
    service.decisionHistory.clear();
    service.thinkingEnabled = false; // Disable logging during tests
  });

  describe('Bot Creation', () => {
    test('should create a basic AI bot', () => {
      const botId = 'test-bot-1';
      const bot = service.createBot(botId);
      
      expect(bot.id).toBe(botId);
      expect(bot.type).toBe('ai_player');
      expect(bot.name).toMatch(/AI_/);
      expect(bot.difficulty).toBe('medium');
      expect(bot.personality).toBe('balanced');
      expect(bot.gameState).toBe('idle');
      expect(bot.score).toBe(0);
      expect(bot.aiSettings).toBeDefined();
    });

    test('should create bot with custom configuration', () => {
      const botId = 'custom-bot';
      const config = {
        name: 'Strategic AI Alpha',
        difficulty: 'expert',
        personality: 'aggressive'
      };
      
      const bot = service.createBot(botId, config);
      
      expect(bot.name).toBe('Strategic AI Alpha');
      expect(bot.difficulty).toBe('expert');
      expect(bot.personality).toBe('aggressive');
      expect(bot.aiSettings.reactionTime).toBe(150); // expert reaction time
      expect(bot.aiSettings.riskTolerance).toBe(0.9); // aggressive risk tolerance
    });

    test('should store bot in service maps', () => {
      const botId = 'storage-test';
      service.createBot(botId);
      
      expect(service.bots.has(botId)).toBe(true);
      expect(service.decisionHistory.has(botId)).toBe(true);
      expect(service.decisionHistory.get(botId)).toEqual([]);
    });
  });

  describe('Game Strategies', () => {
    test('should have strategies for supported games', () => {
      expect(service.gameStrategies.has('jetpack')).toBe(true);
      expect(service.gameStrategies.has('subway')).toBe(true);
      expect(service.gameStrategies.has('default')).toBe(true);
    });

    test('should analyze jetpack game state', () => {
      const gameState = {
        botId: 'test',
        gameType: 'jetpack',
        playerPosition: { x: 0, y: 50 },
        scenario: { type: 'obstacle_ahead', obstacle_distance: 30 },
        visibility: 'good'
      };
      
      const analysis = service.analyzeJetpackState(gameState);
      
      expect(analysis.screenType).toBe('battle');
      expect(analysis.confidence).toBeGreaterThan(0.6);
      expect(analysis.availableActions).toContain('boost_jetpack');
      expect(analysis.scenario).toBe(gameState.scenario);
    });

    test('should make jetpack decisions based on scenario', () => {
      const obstacleAnalysis = {
        confidence: 0.8,
        scenario: { type: 'obstacle_ahead', obstacle_distance: 30 }
      };
      
      const decision = service.makeJetpackDecision(obstacleAnalysis);
      expect(decision.action).toBe('boost_jetpack');
      expect(decision.reasoning).toContain('avoid collision');
    });

    test('should handle low confidence analysis', () => {
      const lowConfidenceAnalysis = {
        confidence: 0.2,
        scenario: { type: 'unknown' }
      };
      
      const decision = service.makeJetpackDecision(lowConfidenceAnalysis);
      expect(decision.action).toBe('analyze');
      expect(decision.reasoning).toContain('deeper analysis');
    });
  });

  describe('AI Thinking Cycle', () => {
    test('should start thinking for a bot', () => {
      const botId = 'thinking-bot';
      const bot = service.createBot(botId);
      
      const updatedBot = service.startThinking(botId, 'jetpack', 'tournament-1');
      
      expect(updatedBot.currentGame).toBe('jetpack');
      expect(updatedBot.gameState).toBe('playing');
      expect(updatedBot.thinkingCycle).toBe(0);
    });

    test('should perform thinking cycle', () => {
      const botId = 'cycle-bot';
      service.createBot(botId);
      service.startThinking(botId, 'jetpack', 'tournament-1');
      
      // Perform one thinking cycle
      service.performThinkingCycle(botId, 'tournament-1');
      
      const bot = service.bots.get(botId);
      expect(bot.thinkingCycle).toBe(1);
      expect(bot.lastAnalysis).toBeDefined();
      expect(bot.lastDecision).toBeDefined();
    });

    test('should stop thinking', () => {
      const botId = 'stop-bot';
      service.createBot(botId);
      service.startThinking(botId, 'jetpack', 'tournament-1');
      
      service.stopThinking(botId);
      
      const bot = service.bots.get(botId);
      expect(bot.gameState).toBe('idle');
    });
  });

  describe('Decision Execution', () => {
    test('should execute boost_jetpack decision', () => {
      const botId = 'exec-bot';
      const bot = service.createBot(botId);
      bot.position = { x: 0, y: 50 };
      bot.score = 0;
      
      const decision = { action: 'boost_jetpack' };
      service.executeDecision(botId, decision, 'tournament-1');
      
      expect(bot.position.y).toBe(60); // Increased by 10
      expect(bot.score).toBe(5);
      expect(bot.totalScore).toBe(5);
    });

    test('should execute collect_coins decision', () => {
      const botId = 'coin-bot';
      const bot = service.createBot(botId);
      bot.score = 0;
      
      const decision = { action: 'collect_coins' };
      service.executeDecision(botId, decision, 'tournament-1');
      
      expect(bot.score).toBe(10);
      expect(bot.totalScore).toBe(10);
    });

    test('should handle analyze action', () => {
      const botId = 'analyze-bot';
      const bot = service.createBot(botId);
      const initialScore = bot.score;
      
      const decision = { action: 'analyze' };
      service.executeDecision(botId, decision, 'tournament-1');
      
      expect(bot.score).toBe(initialScore); // No score change for analysis
    });
  });

  describe('Performance Tracking', () => {
    test('should track bot performance', () => {
      const botId = 'perf-bot';
      service.createBot(botId);
      
      // Record some decisions
      const analysis = { confidence: 0.8, screenType: 'battle' };
      const decision = { action: 'boost_jetpack', reasoning: 'test' };
      service.recordDecision(botId, analysis, decision);
      service.recordDecision(botId, analysis, decision);
      
      const performance = service.getBotPerformance(botId);
      
      expect(performance.totalDecisions).toBe(2);
      expect(performance.averageConfidence).toBe(0.8);
      expect(performance.recentPerformance).toHaveLength(2);
      expect(performance.currentState).toBeDefined();
    });

    test('should limit decision history', () => {
      const botId = 'history-bot';
      service.createBot(botId);
      
      // Record more than 100 decisions
      const analysis = { confidence: 0.8 };
      const decision = { action: 'test' };
      
      for (let i = 0; i < 105; i++) {
        service.recordDecision(botId, analysis, decision);
      }
      
      const history = service.decisionHistory.get(botId);
      expect(history.length).toBe(100); // Should cap at 100
    });
  });

  describe('Configuration Helpers', () => {
    test('should calculate reaction times correctly', () => {
      expect(service.getReactionTime('easy')).toBe(800);
      expect(service.getReactionTime('medium')).toBe(500);
      expect(service.getReactionTime('hard')).toBe(300);
      expect(service.getReactionTime('expert')).toBe(150);
      expect(service.getReactionTime('unknown')).toBe(500); // default
    });

    test('should calculate accuracy correctly', () => {
      expect(service.getAccuracy('easy')).toBe(0.6);
      expect(service.getAccuracy('expert')).toBe(0.95);
    });

    test('should calculate adaptability correctly', () => {
      expect(service.getAdaptability('aggressive')).toBe(0.9);
      expect(service.getAdaptability('defensive')).toBe(0.6);
      expect(service.getAdaptability('adaptive')).toBe(0.95);
    });

    test('should calculate risk tolerance correctly', () => {
      expect(service.getRiskTolerance('aggressive')).toBe(0.9);
      expect(service.getRiskTolerance('defensive')).toBe(0.3);
    });
  });

  describe('Threat and Opportunity Detection', () => {
    test('should detect obstacles as threats', () => {
      const gameState = {
        scenario: { type: 'obstacle_ahead', obstacle_distance: 25 }
      };
      
      const threats = service.detectThreats(gameState);
      expect(threats).toHaveLength(1);
      expect(threats[0].type).toBe('obstacle');
      expect(threats[0].distance).toBe(25);
    });

    test('should detect coins as opportunities', () => {
      const gameState = {
        scenario: { coin_nearby: true }
      };
      
      const opportunities = service.detectOpportunities(gameState);
      expect(opportunities).toHaveLength(1);
      expect(opportunities[0].type).toBe('coin');
      expect(opportunities[0].value).toBe(10);
    });

    test('should detect power-ups as opportunities', () => {
      const gameState = {
        scenario: { type: 'power_up_available', power_up_type: 'coin_magnet' }
      };
      
      const opportunities = service.detectOpportunities(gameState);
      expect(opportunities).toHaveLength(1);
      expect(opportunities[0].type).toBe('power_up');
      expect(opportunities[0].name).toBe('coin_magnet');
    });
  });

  describe('Bot Management', () => {
    test('should get all bots', () => {
      service.createBot('bot1');
      service.createBot('bot2');
      service.createBot('bot3');
      
      const allBots = service.getAllBots();
      expect(allBots).toHaveLength(3);
      expect(allBots.map(b => b.id)).toContain('bot1');
      expect(allBots.map(b => b.id)).toContain('bot2');
      expect(allBots.map(b => b.id)).toContain('bot3');
    });

    test('should remove bot completely', () => {
      const botId = 'remove-bot';
      service.createBot(botId);
      service.startThinking(botId, 'jetpack', 'tournament-1');
      
      expect(service.bots.has(botId)).toBe(true);
      expect(service.decisionHistory.has(botId)).toBe(true);
      
      service.removeBot(botId);
      
      expect(service.bots.has(botId)).toBe(false);
      expect(service.decisionHistory.has(botId)).toBe(false);
    });
  });

  describe('Error Handling', () => {
    test('should handle missing bot in startThinking', () => {
      expect(() => {
        service.startThinking('nonexistent-bot', 'jetpack', 'tournament-1');
      }).toThrow('Bot not found');
    });

    test('should handle missing bot in getBotPerformance', () => {
      const performance = service.getBotPerformance('nonexistent-bot');
      expect(performance).toBeNull();
    });

    test('should handle missing bot in executeDecision', () => {
      const decision = { action: 'boost_jetpack' };
      // Should not throw error
      expect(() => {
        service.executeDecision('nonexistent-bot', decision, 'tournament-1');
      }).not.toThrow();
    });
  });
});