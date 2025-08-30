/**
 * AI Bot Service - Manages intelligent bots in tournaments
 * 
 * This service integrates AI vision bots with the existing tournament system by:
 * - Creating and managing intelligent bot players
 * - Replacing simple bot auto-fill with AI bots
 * - Providing bot configuration and monitoring
 * - Handling bot lifecycle in tournaments
 */

import { IntelligentBotController } from './intelligentBotController.js';

export class AIBotService {
  constructor() {
    this.bots = new Map(); // Active bots
    this.botConfigs = new Map(); // Bot configurations
    this.botPerformance = new Map(); // Performance tracking
    this.defaultConfig = this.getDefaultBotConfig();
    
    console.log('🤖 AI Bot Service initialized');
  }

  /**
   * Create a new intelligent bot for tournament play
   */
  async createBot(tournamentId, botConfig = {}) {
    try {
      const config = { ...this.defaultConfig, ...botConfig };
      const botId = `bot_${tournamentId}_${Date.now()}`;
      
      const bot = new IntelligentBotController({
        ...config,
        botId,
        tournamentId
      });
      
      this.bots.set(botId, bot);
      this.botConfigs.set(botId, config);
      this.botPerformance.set(botId, {
        created: Date.now(),
        totalGames: 0,
        totalScore: 0,
        winRate: 0
      });
      
      console.log(`🤖 Created intelligent bot: ${botId} for tournament: ${tournamentId}`);
      
      return {
        botId,
        bot,
        config,
        tournamentId
      };
      
    } catch (error) {
      console.error('❌ Error creating bot:', error);
      throw new Error(`Failed to create bot: ${error.message}`);
    }
  }

  /**
   * Add intelligent bot to tournament (replaces simple bot auto-fill)
   */
  async addBotToTournament(tournamentId, gameType, playerSlot) {
    try {
      const botConfig = this.getBotConfigForGame(gameType);
      const { botId, bot } = await this.createBot(tournamentId, botConfig);
      
      // Create bot player data for tournament system
      const botPlayer = {
        id: botId,
        name: this.generateBotName(gameType),
        type: 'intelligent_bot',
        avatar: this.getBotAvatar(gameType),
        isBot: true,
        isIntelligent: true,
        gameState: 'ready',
        position: { x: 0, y: 0 },
        score: 0,
        metadata: {
          botType: 'vision_ai',
          gameSpecialty: gameType,
          skillLevel: botConfig.skillLevel || 'adaptive',
          personality: botConfig.personality || 'strategic'
        }
      };
      
      console.log(`🎮 Adding intelligent bot ${botPlayer.name} to tournament ${tournamentId}`);
      
      return {
        botPlayer,
        controller: bot
      };
      
    } catch (error) {
      console.error('❌ Error adding bot to tournament:', error);
      throw error;
    }
  }

  /**
   * Start bot playing in a tournament round
   */
  async startBotInRound(botId, gameType, roundData, gameSession) {
    try {
      const bot = this.bots.get(botId);
      if (!bot) {
        throw new Error(`Bot ${botId} not found`);
      }
      
      console.log(`🚀 Starting bot ${botId} in ${gameType} round`);
      
      // Configure bot for specific game
      await this.configureBotForGame(bot, gameType, roundData);
      
      // Start intelligent gameplay
      await bot.startPlaying(gameType, gameSession, null);
      
      return true;
      
    } catch (error) {
      console.error(`❌ Error starting bot ${botId}:`, error);
      return false;
    }
  }

  /**
   * Stop bot from playing in current round
   */
  async stopBotInRound(botId) {
    try {
      const bot = this.bots.get(botId);
      if (!bot) {
        console.warn(`⚠️ Bot ${botId} not found`);
        return false;
      }
      
      await bot.stopPlaying();
      console.log(`🛑 Stopped bot ${botId}`);
      
      return true;
      
    } catch (error) {
      console.error(`❌ Error stopping bot ${botId}:`, error);
      return false;
    }
  }

  /**
   * Update bot score and performance
   */
  updateBotScore(botId, score, gameData) {
    try {
      const performance = this.botPerformance.get(botId);
      if (!performance) {
        console.warn(`⚠️ No performance data for bot ${botId}`);
        return;
      }
      
      performance.totalGames++;
      performance.totalScore += score;
      performance.averageScore = performance.totalScore / performance.totalGames;
      performance.lastScore = score;
      performance.lastGame = gameData.gameType;
      performance.lastPlayed = Date.now();
      
      // Update bot's internal performance
      const bot = this.bots.get(botId);
      if (bot) {
        bot.updatePerformanceMetrics(
          { analysis: gameData, decision: { action: 'game_complete' } },
          { score, isActive: false }
        );
      }
      
      console.log(`📊 Updated bot ${botId} score: ${score} (avg: ${performance.averageScore.toFixed(1)})`);
      
    } catch (error) {
      console.error(`❌ Error updating bot score:`, error);
    }
  }

  /**
   * Get bot performance statistics
   */
  getBotPerformance(botId) {
    const performance = this.botPerformance.get(botId);
    const bot = this.bots.get(botId);
    
    if (!performance) {
      return null;
    }
    
    return {
      botId,
      ...performance,
      currentStats: bot ? bot.getPerformanceStats() : null,
      isActive: bot ? bot.isActive : false
    };
  }

  /**
   * Get all active bots in a tournament
   */
  getBotsInTournament(tournamentId) {
    const tournamentBots = [];
    
    for (const [botId, bot] of this.bots) {
      if (bot.config && bot.config.tournamentId === tournamentId) {
        tournamentBots.push({
          botId,
          performance: this.getBotPerformance(botId),
          config: this.botConfigs.get(botId)
        });
      }
    }
    
    return tournamentBots;
  }

  /**
   * Remove bot from tournament
   */
  async removeBot(botId) {
    try {
      const bot = this.bots.get(botId);
      if (bot) {
        await bot.stopPlaying();
        this.bots.delete(botId);
      }
      
      this.botConfigs.delete(botId);
      
      console.log(`🗑️ Removed bot: ${botId}`);
      
    } catch (error) {
      console.error(`❌ Error removing bot ${botId}:`, error);
    }
  }

  /**
   * Configure bot for specific game type
   */
  async configureBotForGame(bot, gameType, roundData) {
    const gameConfigs = {
      'jetpack': {
        screenshotInterval: 300,
        decisionDelay: 50,
        narrationStyle: 'entertaining'
      },
      'subway': {
        screenshotInterval: 200,
        decisionDelay: 100,
        narrationStyle: 'competitive'
      },
      'geometry': {
        screenshotInterval: 100,
        decisionDelay: 50,
        narrationStyle: 'focused'
      },
      'dino': {
        screenshotInterval: 150,
        decisionDelay: 75,
        narrationStyle: 'friendly_expert'
      },
      'space': {
        screenshotInterval: 250,
        decisionDelay: 50,
        narrationStyle: 'strategic'
      },
      'bubble': {
        screenshotInterval: 1000,
        decisionDelay: 200,
        narrationStyle: 'educational'
      }
    };
    
    const gameConfig = gameConfigs[gameType] || {};
    
    // Update bot configuration
    Object.assign(bot.config, gameConfig);
    
    console.log(`⚙️ Configured bot for ${gameType}:`, gameConfig);
  }

  /**
   * Get bot configuration optimized for specific game
   */
  getBotConfigForGame(gameType) {
    const baseConfig = { ...this.defaultConfig };
    
    const gameSpecificConfigs = {
      'jetpack': {
        personality: 'risk_taking',
        skillLevel: 'adaptive',
        narrationStyle: 'entertaining',
        analysisPrompt: 'Focus on flight paths and obstacle avoidance'
      },
      'subway': {
        personality: 'reactive',
        skillLevel: 'expert',
        narrationStyle: 'competitive',
        analysisPrompt: 'Focus on lane switching and timing'
      },
      'geometry': {
        personality: 'precise',
        skillLevel: 'expert',
        narrationStyle: 'focused',
        analysisPrompt: 'Focus on rhythm and jump timing'
      },
      'dino': {
        personality: 'defensive',
        skillLevel: 'balanced',
        narrationStyle: 'friendly_expert',
        analysisPrompt: 'Focus on obstacle detection and timing'
      },
      'space': {
        personality: 'strategic',
        skillLevel: 'adaptive',
        narrationStyle: 'strategic',
        analysisPrompt: 'Focus on movement patterns and enemy prediction'
      },
      'bubble': {
        personality: 'analytical',
        skillLevel: 'expert',
        narrationStyle: 'educational',
        analysisPrompt: 'Focus on color matching and strategic planning'
      }
    };
    
    return {
      ...baseConfig,
      ...(gameSpecificConfigs[gameType] || {})
    };
  }

  /**
   * Generate appropriate bot name based on game type
   */
  generateBotName(gameType) {
    const nameTemplates = {
      'jetpack': ['SkyBot', 'JetAI', 'FlightMaster', 'AeroBot', 'ThrustAI'],
      'subway': ['RailRunner', 'TrackBot', 'SpeedAI', 'SubwayPro', 'RushBot'],
      'geometry': ['BeatBot', 'RhythmAI', 'PrecisionBot', 'TimingBot', 'GeometryPro'],
      'dino': ['DinoBot', 'JumperAI', 'CactusDodger', 'DesertBot', 'T-RexAI'],
      'space': ['StarBot', 'AstroAI', 'SpaceAce', 'CosmoBot', 'VoidNavigator'],
      'bubble': ['BubbleBot', 'ColorAI', 'MatchMaster', 'PopBot', 'BubblePro']
    };
    
    const names = nameTemplates[gameType] || ['SmartBot', 'AI Player', 'IntelliBot'];
    const randomName = names[Math.floor(Math.random() * names.length)];
    const suffix = Math.floor(Math.random() * 100);
    
    return `${randomName}-${suffix}`;
  }

  /**
   * Get bot avatar based on game type
   */
  getBotAvatar(gameType) {
    const avatars = {
      'jetpack': '🚀',
      'subway': '🚄',
      'geometry': '🔷',
      'dino': '🦕',
      'space': '🛸',
      'bubble': '🫧'
    };
    
    return avatars[gameType] || '🤖';
  }

  /**
   * Get default bot configuration
   */
  getDefaultBotConfig() {
    return {
      openaiApiKey: process.env.OPENAI_API_KEY,
      personality: 'strategic',
      skillLevel: 'adaptive',
      narrationStyle: 'friendly_expert',
      screenshotInterval: 500,
      decisionDelay: 100,
      enableLearning: true,
      enableNarration: true,
      maxMemorySize: 50,
      logLevel: 'info'
    };
  }

  /**
   * Get service statistics
   */
  getServiceStats() {
    const activeBots = Array.from(this.bots.values()).filter(bot => bot.isActive).length;
    const totalBots = this.bots.size;
    
    return {
      totalBots,
      activeBots,
      inactiveBots: totalBots - activeBots,
      averagePerformance: this.calculateAveragePerformance(),
      timestamp: Date.now()
    };
  }

  /**
   * Calculate average performance across all bots
   */
  calculateAveragePerformance() {
    const performances = Array.from(this.botPerformance.values());
    
    if (performances.length === 0) {
      return { totalGames: 0, averageScore: 0 };
    }
    
    const totalGames = performances.reduce((sum, p) => sum + p.totalGames, 0);
    const totalScore = performances.reduce((sum, p) => sum + p.totalScore, 0);
    
    return {
      totalGames,
      averageScore: totalGames > 0 ? totalScore / totalGames : 0
    };
  }
}

export default AIBotService;