/**
 * Intelligent Bot Controller - Executes AI vision bot decisions in Unity games
 * 
 * This module bridges the AI vision analysis with actual game control by:
 * - Converting AI decisions to game-specific actions
 * - Managing bot input simulation in Unity
 * - Coordinating with tournament system
 * - Providing bot performance monitoring
 */

import { VisionBot } from './visionBot.js';
import fs from 'fs';
import path from 'path';

export class IntelligentBotController {
  constructor(config = {}) {
    this.botId = config.botId || `intelligent_bot_${Date.now()}`;
    this.visionBot = new VisionBot(config);
    this.gameInterface = null;
    this.currentGame = null;
    this.isActive = false;
    this.performance = {
      gamesPlayed: 0,
      totalScore: 0,
      averageScore: 0,
      winRate: 0,
      decisions: 0,
      successfulDecisions: 0
    };
    
    this.config = {
      screenshotInterval: config.screenshotInterval || 500, // 500ms between screenshots
      decisionDelay: config.decisionDelay || 100, // 100ms delay before executing
      enableLearning: config.enableLearning !== false,
      enableNarration: config.enableNarration !== false,
      logLevel: config.logLevel || 'info',
      ...config
    };
    
    console.log(`🎮 Intelligent Bot Controller initialized: ${this.botId}`);
  }

  /**
   * Start playing a specific game with AI vision
   */
  async startPlaying(gameType, gameSession, gameInterface) {
    try {
      this.currentGame = gameType;
      this.gameInterface = gameInterface;
      this.isActive = true;
      
      console.log(`🚀 Starting INTELLIGENT play for ${gameType}`);
      
      if (this.config.enableNarration) {
        console.log(`🎤 AI SAYS: "Time to show what I can do in ${gameType}! Let me analyze the situation..."`);
      }
      
      // Start the main game loop
      await this.gameLoop(gameSession);
      
    } catch (error) {
      console.error('❌ Error starting intelligent bot:', error);
      this.isActive = false;
      throw error;
    }
  }

  /**
   * Stop the bot from playing
   */
  async stopPlaying() {
    this.isActive = false;
    this.currentGame = null;
    this.gameInterface = null;
    
    console.log(`🛑 Intelligent Bot stopped playing`);
  }

  /**
   * Main game loop - continuous AI analysis and decision making
   */
  async gameLoop(gameSession) {
    console.log(`🔄 Starting intelligent game loop for ${this.currentGame}`);
    
    while (this.isActive && gameSession.isActive) {
      try {
        // Step 1: Capture current game state
        const screenshot = await this.captureGameScreen(gameSession);
        
        if (!screenshot) {
          await this.sleep(this.config.screenshotInterval);
          continue;
        }
        
        // Step 2: Let AI analyze and decide
        const aiResponse = await this.visionBot.playTurn(
          screenshot,
          this.currentGame,
          this.getGameState(gameSession)
        );
        
        // Step 3: Execute the AI's decision
        await this.executeAIDecision(aiResponse, gameSession);
        
        // Step 4: Update performance metrics
        this.updatePerformanceMetrics(aiResponse, gameSession);
        
        // Step 5: Wait before next analysis
        await this.sleep(this.config.screenshotInterval);
        
      } catch (error) {
        console.error('❌ Error in game loop:', error);
        
        // Execute fallback action
        await this.executeFallbackAction(gameSession);
        await this.sleep(this.config.screenshotInterval * 2); // Longer delay on error
      }
    }
    
    console.log(`✅ Game loop ended for ${this.currentGame}`);
  }

  /**
   * Capture screenshot of current game state
   */
  async captureGameScreen(gameSession) {
    try {
      // This would integrate with Unity's screenshot system
      // For now, we'll simulate with a placeholder path
      const screenshotDir = '/tmp/bot_screenshots';
      const screenshotPath = path.join(screenshotDir, `${this.botId}_${Date.now()}.png`);
      
      // Ensure directory exists
      if (!fs.existsSync(screenshotDir)) {
        fs.mkdirSync(screenshotDir, { recursive: true });
      }
      
      // In a real implementation, this would capture the Unity game screen
      // For demonstration, we'll create a placeholder
      await this.createPlaceholderScreenshot(screenshotPath);
      
      return screenshotPath;
      
    } catch (error) {
      console.error('❌ Error capturing screenshot:', error);
      return null;
    }
  }

  /**
   * Convert AI decision to game-specific actions
   */
  async executeAIDecision(aiResponse, gameSession) {
    try {
      const { decision, narration } = aiResponse;
      
      // Log AI narration if enabled
      if (this.config.enableNarration && narration) {
        console.log(`🎤 AI SAYS: "${narration}"`);
      }
      
      // Convert AI decision to game controls
      const gameActions = this.mapDecisionToActions(decision, this.currentGame);
      
      // Execute actions through game interface
      for (const action of gameActions) {
        await this.executeGameAction(action, gameSession);
        
        // Small delay between actions for realistic timing
        if (gameActions.length > 1) {
          await this.sleep(this.config.decisionDelay);
        }
      }
      
      this.performance.decisions++;
      
    } catch (error) {
      console.error('❌ Error executing AI decision:', error);
      await this.executeFallbackAction(gameSession);
    }
  }

  /**
   * Map AI decisions to specific game actions
   */
  mapDecisionToActions(decision, gameType) {
    const actionMappings = {
      'jetpack': {
        'boost_up': [{ type: 'key_press', key: 'space', duration: 200 }],
        'maintain_altitude': [{ type: 'key_press', key: 'space', duration: 100 }],
        'descend': [{ type: 'key_release', key: 'space' }],
        'collect_coin': [{ type: 'move_towards', target: 'coin' }]
      },
      
      'subway': {
        'move_left': [{ type: 'key_press', key: 'arrow_left' }],
        'move_right': [{ type: 'key_press', key: 'arrow_right' }],
        'jump': [{ type: 'key_press', key: 'arrow_up' }],
        'duck': [{ type: 'key_press', key: 'arrow_down' }],
        'stay_center': []
      },
      
      'geometry': {
        'jump': [{ type: 'key_press', key: 'space' }],
        'time_jump': [{ type: 'key_press', key: 'space', timing: 'precise' }],
        'wait': [{ type: 'wait', duration: 100 }]
      },
      
      'dino': {
        'jump': [{ type: 'key_press', key: 'space' }],
        'duck': [{ type: 'key_press', key: 'arrow_down' }],
        'prepare_jump': [{ type: 'key_ready', key: 'space' }]
      },
      
      'space': {
        'move_up': [{ type: 'key_press', key: 'arrow_up' }],
        'move_down': [{ type: 'key_press', key: 'arrow_down' }],
        'move_left': [{ type: 'key_press', key: 'arrow_left' }],
        'move_right': [{ type: 'key_press', key: 'arrow_right' }],
        'move_center': [{ type: 'move_to_center' }],
        'shoot': [{ type: 'key_press', key: 'space' }]
      },
      
      'bubble': {
        'aim_left': [{ type: 'mouse_move', direction: 'left' }],
        'aim_right': [{ type: 'mouse_move', direction: 'right' }],
        'shoot': [{ type: 'mouse_click' }],
        'aim_largest_group': [{ type: 'aim_at_target', target: 'largest_group' }]
      }
    };
    
    const gameActions = actionMappings[gameType];
    if (!gameActions) {
      console.warn(`⚠️ No action mapping for game: ${gameType}`);
      return [];
    }
    
    const actions = gameActions[decision.action];
    if (!actions) {
      console.warn(`⚠️ No mapping for action: ${decision.action} in ${gameType}`);
      return [];
    }
    
    return actions;
  }

  /**
   * Execute a specific game action
   */
  async executeGameAction(action, gameSession) {
    try {
      console.log(`🎮 Executing action: ${action.type}`);
      
      // In a real implementation, this would send commands to Unity
      // through the game interface (WebSocket, file system, etc.)
      
      switch (action.type) {
        case 'key_press':
          await this.simulateKeyPress(action.key, action.duration || 50);
          break;
          
        case 'key_release':
          await this.simulateKeyRelease(action.key);
          break;
          
        case 'mouse_click':
          await this.simulateMouseClick(action.x, action.y);
          break;
          
        case 'mouse_move':
          await this.simulateMouseMove(action.direction);
          break;
          
        case 'move_towards':
          await this.simulateMoveTowards(action.target);
          break;
          
        case 'wait':
          await this.sleep(action.duration);
          break;
          
        default:
          console.log(`🤖 Simulated action: ${JSON.stringify(action)}`);
      }
      
      this.performance.successfulDecisions++;
      
    } catch (error) {
      console.error('❌ Error executing game action:', error);
    }
  }

  /**
   * Execute fallback action when AI fails
   */
  async executeFallbackAction(gameSession) {
    const fallbackActions = {
      'jetpack': [{ type: 'key_press', key: 'space', duration: 100 }],
      'subway': [],
      'geometry': [{ type: 'wait', duration: 200 }],
      'dino': [{ type: 'key_ready', key: 'space' }],
      'space': [{ type: 'move_to_center' }],
      'bubble': [{ type: 'wait', duration: 500 }]
    };
    
    const actions = fallbackActions[this.currentGame] || [];
    
    for (const action of actions) {
      await this.executeGameAction(action, gameSession);
    }
  }

  /**
   * Get current game state information
   */
  getGameState(gameSession) {
    return {
      score: gameSession.score || 0,
      isActive: gameSession.isActive || false,
      startTime: gameSession.startTime || Date.now(),
      playerCount: gameSession.playerCount || 1,
      gameType: this.currentGame
    };
  }

  /**
   * Update bot performance metrics
   */
  updatePerformanceMetrics(aiResponse, gameSession) {
    const gameState = this.getGameState(gameSession);
    
    // Update based on game outcome
    if (gameState.score > 0) {
      this.performance.totalScore += gameState.score;
      this.performance.gamesPlayed++;
      this.performance.averageScore = this.performance.totalScore / this.performance.gamesPlayed;
    }
    
    // Calculate decision success rate
    if (this.performance.decisions > 0) {
      this.performance.successRate = this.performance.successfulDecisions / this.performance.decisions;
    }
  }

  /**
   * Get bot performance statistics
   */
  getPerformanceStats() {
    return {
      botId: this.botId,
      currentGame: this.currentGame,
      isActive: this.isActive,
      performance: { ...this.performance },
      timestamp: Date.now()
    };
  }

  // Simulation methods (would be replaced with real game interface)
  async simulateKeyPress(key, duration) {
    console.log(`🎹 Simulating key press: ${key} for ${duration}ms`);
    return new Promise(resolve => setTimeout(resolve, duration));
  }

  async simulateKeyRelease(key) {
    console.log(`🎹 Simulating key release: ${key}`);
  }

  async simulateMouseClick(x, y) {
    console.log(`🖱️ Simulating mouse click at (${x}, ${y})`);
  }

  async simulateMouseMove(direction) {
    console.log(`🖱️ Simulating mouse move: ${direction}`);
  }

  async simulateMoveTowards(target) {
    console.log(`🎯 Simulating move towards: ${target}`);
  }

  async sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Create placeholder screenshot for testing
   */
  async createPlaceholderScreenshot(path) {
    // Create a minimal placeholder file
    fs.writeFileSync(path, 'placeholder_screenshot');
  }
}

export default IntelligentBotController;