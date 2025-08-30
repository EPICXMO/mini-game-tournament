/**
 * Bot Service - Manages AI bot behavior for mini-games
 * Inspired by the Super Mario Bros AI approach with reward-based decision making
 */

class BotService {
  constructor() {
    this.bots = new Map(); // botId -> bot instance
    this.botProfiles = new Map(); // botId -> bot profile/settings
    this.gameConfigs = new Map(); // gameType -> game-specific bot config
    
    // Initialize bot configurations for different games
    this.initializeGameConfigs();
  }

  /**
   * Initialize game-specific bot configurations
   */
  initializeGameConfigs() {
    // Jetpack game configuration
    this.gameConfigs.set('jetpack', {
      // Reward function weights (inspired by Mario AI)
      rewards: {
        distanceWeight: 1.0,        // Reward for distance traveled (like rightward velocity in Mario)
        coinWeight: 10.0,           // Reward for coins collected
        survivalWeight: 0.1,        // Small reward for staying alive
        timepenalty: -0.01,         // Penalty for time spent (encourages speed)
        deathPenalty: -100.0        // Heavy penalty for dying
      },
      
      // Decision making parameters
      decision: {
        reactionTime: 0.1,          // Bot reaction time in seconds (human-like)
        lookAheadDistance: 3.0,     // How far ahead to look for obstacles
        riskTolerance: 0.3,         // How much risk bot is willing to take (0-1)
        adaptiveThreshold: 0.7      // Threshold for adapting strategy
      },
      
      // Skill levels
      skillLevels: {
        easy: {
          reactionTime: 0.3,
          riskTolerance: 0.1,
          accuracyFactor: 0.6
        },
        medium: {
          reactionTime: 0.15,
          riskTolerance: 0.3,
          accuracyFactor: 0.8
        },
        hard: {
          reactionTime: 0.05,
          riskTolerance: 0.6,
          accuracyFactor: 0.95
        }
      }
    });
  }

  /**
   * Create a new bot instance
   */
  createBot(gameType, skillLevel = 'medium', botName = null) {
    const botId = `bot_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    const gameConfig = this.gameConfigs.get(gameType);
    
    if (!gameConfig) {
      throw new Error(`Unsupported game type: ${gameType}`);
    }

    const skillConfig = gameConfig.skillLevels[skillLevel] || gameConfig.skillLevels.medium;
    
    const bot = {
      id: botId,
      name: botName || `Bot_${botId.substr(-6)}`,
      gameType,
      skillLevel,
      config: {
        ...gameConfig,
        ...skillConfig
      },
      state: {
        isActive: false,
        currentScore: 0,
        gameTime: 0,
        position: { x: 0, y: 0 },
        lastDecision: null,
        lastDecisionTime: 0,
        performance: {
          totalGames: 0,
          averageScore: 0,
          bestScore: 0,
          survivalTime: 0
        }
      },
      // Game-specific state
      gameState: this.initializeGameState(gameType)
    };

    this.bots.set(botId, bot);
    console.log(`[BotService] Created ${skillLevel} bot: ${botId} for ${gameType}`);
    
    return bot;
  }

  /**
   * Initialize game-specific state for bot
   */
  initializeGameState(gameType) {
    switch (gameType) {
      case 'jetpack':
        return {
          isThrusting: false,
          nearestObstacles: [],
          nearestCoins: [],
          groundTime: 0,
          lastObstacleAvoidance: 0
        };
      
      default:
        return {};
    }
  }

  /**
   * Make a decision for a bot based on current game state
   * This is inspired by the reward function approach from the Mario AI
   */
  makeBotDecision(botId, gameState) {
    const bot = this.bots.get(botId);
    if (!bot || !bot.state.isActive) {
      return null;
    }

    const currentTime = Date.now();
    const timeSinceLastDecision = (currentTime - bot.state.lastDecisionTime) / 1000.0;
    
    // Check if enough time has passed for reaction time
    if (timeSinceLastDecision < bot.config.reactionTime) {
      return bot.state.lastDecision;
    }

    let decision = null;

    switch (bot.gameType) {
      case 'jetpack':
        decision = this.makeJetpackDecision(bot, gameState);
        break;
      
      default:
        decision = { action: 'idle' };
    }

    // Update bot state
    bot.state.lastDecision = decision;
    bot.state.lastDecisionTime = currentTime;
    
    return decision;
  }

  /**
   * Make decision for Jetpack game using reward-based approach
   */
  makeJetpackDecision(bot, gameState) {
    const { obstacles = [], coins = [], player = {} } = gameState;
    const { position = { x: 0, y: 0 }, velocity = { x: 0, y: 0 } } = player;
    
    // Calculate rewards for different actions
    const thrustReward = this.calculateJetpackThrustReward(bot, {
      position,
      velocity,
      obstacles,
      coins,
      action: 'thrust'
    });
    
    const fallReward = this.calculateJetpackThrustReward(bot, {
      position,
      velocity,
      obstacles,
      coins,
      action: 'fall'
    });

    // Add some randomness based on skill level (lower skill = more randomness)
    const randomFactor = (1.0 - bot.config.accuracyFactor) * 0.2;
    const thrustWithNoise = thrustReward + (Math.random() - 0.5) * randomFactor;
    const fallWithNoise = fallReward + (Math.random() - 0.5) * randomFactor;

    // Make decision based on which action has higher reward
    const shouldThrust = thrustWithNoise > fallWithNoise;
    
    // Update bot's game state
    bot.gameState.isThrusting = shouldThrust;
    bot.gameState.nearestObstacles = this.findNearestObstacles(position, obstacles, bot.config.decision.lookAheadDistance);
    bot.gameState.nearestCoins = this.findNearestCoins(position, coins, bot.config.decision.lookAheadDistance);

    return {
      action: shouldThrust ? 'thrust' : 'fall',
      confidence: Math.abs(thrustWithNoise - fallWithNoise),
      reasoning: {
        thrustReward: thrustReward.toFixed(3),
        fallReward: fallReward.toFixed(3),
        nearestObstacles: bot.gameState.nearestObstacles.length,
        nearestCoins: bot.gameState.nearestCoins.length
      }
    };
  }

  /**
   * Calculate reward for thrust action in Jetpack game
   * This implements the key insight from Mario AI: reward velocity/progress, penalize time
   */
  calculateJetpackThrustReward(bot, situation) {
    const { position, velocity, obstacles, coins, action } = situation;
    const config = bot.config.rewards;
    
    let totalReward = 0;

    // Base survival reward (small, like in Mario AI)
    totalReward += config.survivalWeight;

    // Time penalty (encourages speed, key insight from Mario AI)
    totalReward += config.timepenalty;

    // Distance reward (equivalent to rightward velocity in Mario)
    totalReward += velocity.x * config.distanceWeight;

    // Obstacle avoidance calculation
    const nearestObstacles = this.findNearestObstacles(position, obstacles, bot.config.decision.lookAheadDistance);
    
    for (const obstacle of nearestObstacles) {
      const distanceToObstacle = Math.sqrt(
        Math.pow(obstacle.x - position.x, 2) + 
        Math.pow(obstacle.y - position.y, 2)
      );
      
      // Predict future position based on action
      const futurePos = this.predictFuturePosition(position, velocity, action, 0.5);
      
      // Check if this action would lead to collision
      const wouldCollide = this.wouldCollideWithObstacle(futurePos, obstacle);
      
      if (wouldCollide) {
        // Heavy penalty for collision (like death penalty in Mario AI)
        totalReward += config.deathPenalty;
      } else {
        // Small reward for successfully avoiding obstacle
        totalReward += (1.0 / (distanceToObstacle + 1.0)) * config.survivalWeight;
      }
      
      // Additional penalty if we're too close to obstacle (proactive avoidance)
      if (distanceToObstacle < 1.5 && obstacle.x > position.x) {
        // If obstacle is at similar height and we're not taking evasive action
        const heightDiff = Math.abs(obstacle.y - futurePos.y);
        if (heightDiff < 1.0) {
          totalReward -= config.deathPenalty * 0.5; // Partial penalty for risky situation
        }
      }
    }

    // Coin collection reward
    const nearestCoins = this.findNearestCoins(position, coins, bot.config.decision.lookAheadDistance);
    
    for (const coin of nearestCoins) {
      const distanceToCoin = Math.sqrt(
        Math.pow(coin.x - position.x, 2) + 
        Math.pow(coin.y - position.y, 2)
      );
      
      // Predict future position
      const futurePos = this.predictFuturePosition(position, velocity, action, 0.5);
      const futureDistanceToCoin = Math.sqrt(
        Math.pow(coin.x - futurePos.x, 2) + 
        Math.pow(coin.y - futurePos.y, 2)
      );
      
      // Reward getting closer to coins
      if (futureDistanceToCoin < distanceToCoin) {
        totalReward += config.coinWeight * (1.0 / (futureDistanceToCoin + 1.0));
      }
    }

    return totalReward;
  }

  /**
   * Predict future position based on current physics and action
   */
  predictFuturePosition(position, velocity, action, timeStep) {
    const gravity = -9.8; // Approximate gravity
    const thrustForce = 15.0; // Approximate thrust force
    
    let futureVelocityY = velocity.y;
    
    if (action === 'thrust') {
      futureVelocityY += thrustForce * timeStep;
    }
    
    futureVelocityY += gravity * timeStep;
    
    return {
      x: position.x + velocity.x * timeStep,
      y: position.y + futureVelocityY * timeStep
    };
  }

  /**
   * Check if position would collide with obstacle
   */
  wouldCollideWithObstacle(position, obstacle) {
    const margin = 0.3; // Safety margin
    return (
      position.x >= obstacle.x - obstacle.width/2 - margin &&
      position.x <= obstacle.x + obstacle.width/2 + margin &&
      position.y >= obstacle.y - obstacle.height/2 - margin &&
      position.y <= obstacle.y + obstacle.height/2 + margin
    );
  }

  /**
   * Find nearest obstacles within look-ahead distance
   */
  findNearestObstacles(position, obstacles, lookAheadDistance) {
    return obstacles
      .filter(obstacle => {
        const distance = Math.sqrt(
          Math.pow(obstacle.x - position.x, 2) + 
          Math.pow(obstacle.y - position.y, 2)
        );
        return distance <= lookAheadDistance && obstacle.x > position.x;
      })
      .sort((a, b) => {
        const distA = Math.sqrt(Math.pow(a.x - position.x, 2) + Math.pow(a.y - position.y, 2));
        const distB = Math.sqrt(Math.pow(b.x - position.x, 2) + Math.pow(b.y - position.y, 2));
        return distA - distB;
      })
      .slice(0, 3); // Limit to 3 nearest obstacles
  }

  /**
   * Find nearest coins within look-ahead distance
   */
  findNearestCoins(position, coins, lookAheadDistance) {
    return coins
      .filter(coin => {
        const distance = Math.sqrt(
          Math.pow(coin.x - position.x, 2) + 
          Math.pow(coin.y - position.y, 2)
        );
        return distance <= lookAheadDistance;
      })
      .sort((a, b) => {
        const distA = Math.sqrt(Math.pow(a.x - position.x, 2) + Math.pow(a.y - position.y, 2));
        const distB = Math.sqrt(Math.pow(b.x - position.x, 2) + Math.pow(b.y - position.y, 2));
        return distA - distB;
      })
      .slice(0, 2); // Limit to 2 nearest coins
  }

  /**
   * Start bot for a game session
   */
  startBot(botId, gameSession) {
    const bot = this.bots.get(botId);
    if (!bot) return false;

    bot.state.isActive = true;
    bot.state.currentScore = 0;
    bot.state.gameTime = 0;
    bot.state.position = { x: 0, y: 0 };
    bot.gameState = this.initializeGameState(bot.gameType);

    console.log(`[BotService] Started bot: ${botId} for game session`);
    return true;
  }

  /**
   * Stop bot and record performance
   */
  stopBot(botId, finalScore = 0, gameTime = 0) {
    const bot = this.bots.get(botId);
    if (!bot) return false;

    bot.state.isActive = false;
    bot.state.currentScore = finalScore;
    
    // Update performance statistics
    bot.state.performance.totalGames++;
    const prevAvg = bot.state.performance.averageScore;
    const totalGames = bot.state.performance.totalGames;
    bot.state.performance.averageScore = (prevAvg * (totalGames - 1) + finalScore) / totalGames;
    
    if (finalScore > bot.state.performance.bestScore) {
      bot.state.performance.bestScore = finalScore;
    }
    
    bot.state.performance.survivalTime = gameTime;

    console.log(`[BotService] Stopped bot: ${botId}, Final Score: ${finalScore}, Performance: ${JSON.stringify(bot.state.performance)}`);
    return true;
  }

  /**
   * Get bot by ID
   */
  getBot(botId) {
    return this.bots.get(botId);
  }

  /**
   * Get all active bots
   */
  getActiveBots() {
    return Array.from(this.bots.values()).filter(bot => bot.state.isActive);
  }

  /**
   * Remove bot
   */
  removeBot(botId) {
    const bot = this.bots.get(botId);
    if (bot) {
      this.bots.delete(botId);
      console.log(`[BotService] Removed bot: ${botId}`);
      return true;
    }
    return false;
  }

  /**
   * Get bot statistics
   */
  getBotStats(botId) {
    const bot = this.bots.get(botId);
    if (!bot) return null;

    return {
      id: bot.id,
      name: bot.name,
      gameType: bot.gameType,
      skillLevel: bot.skillLevel,
      performance: bot.state.performance,
      isActive: bot.state.isActive,
      currentScore: bot.state.currentScore
    };
  }

  /**
   * Update bot position (for tournament integration)
   */
  updateBotPosition(botId, position) {
    const bot = this.bots.get(botId);
    if (bot) {
      bot.state.position = { ...position, timestamp: Date.now() };
      return true;
    }
    return false;
  }

  /**
   * Cleanup inactive bots
   */
  cleanup() {
    const inactiveBots = Array.from(this.bots.entries())
      .filter(([_, bot]) => !bot.state.isActive && 
        (Date.now() - (bot.state.lastDecisionTime || 0)) > 300000); // 5 minutes

    for (const [botId, _] of inactiveBots) {
      this.bots.delete(botId);
      console.log(`[BotService] Cleaned up inactive bot: ${botId}`);
    }

    return inactiveBots.length;
  }
}

// Create singleton instance
const botService = new BotService();

// Clean up every 10 minutes
setInterval(() => {
  botService.cleanup();
}, 10 * 60 * 1000);

export default botService;