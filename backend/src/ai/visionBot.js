/**
 * AI Vision Bot - Intelligent game playing bot using GPT-4 Vision
 * 
 * This module implements a ChatGPT-like bot that can:
 * - Analyze game screenshots using GPT-4 Vision
 * - Understand game state and context
 * - Make strategic decisions with explanations
 * - Adapt to different mini-games
 * - Learn from gameplay experiences
 */

import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';

export class VisionBot {
  constructor(config = {}) {
    this.openai = new OpenAI({
      apiKey: config.openaiApiKey || process.env.OPENAI_API_KEY
    });
    
    this.botId = config.botId || `bot_${Date.now()}`;
    this.personality = config.personality || 'strategic';
    this.gameContext = new Map(); // Store game state history
    this.learningMemory = new Map(); // Store experiences for learning
    
    // Bot configuration
    this.config = {
      analysisPrompt: config.analysisPrompt || this.getDefaultAnalysisPrompt(),
      decisionThreshold: config.decisionThreshold || 0.7,
      maxMemorySize: config.maxMemorySize || 100,
      narrationStyle: config.narrationStyle || 'friendly_expert',
      ...config
    };
    
    console.log(`🤖 AI Vision Bot initialized: ${this.botId}`);
  }

  /**
   * Analyze a game screenshot and understand the current state
   */
  async analyzeGameState(screenshotPath, gameType = 'unknown') {
    try {
      // Convert screenshot to base64
      const imageBase64 = await this.encodeImageToBase64(screenshotPath);
      
      // Get game-specific analysis prompt
      const prompt = this.getGameSpecificPrompt(gameType);
      
      console.log(`🔍 Analyzing ${gameType} screenshot...`);
      
      const response = await this.openai.chat.completions.create({
        model: "gpt-4-vision-preview",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: prompt
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:image/jpeg;base64,${imageBase64}`,
                  detail: "high"
                }
              }
            ]
          }
        ],
        max_tokens: 1500,
        temperature: 0.3 // Lower temperature for more consistent analysis
      });

      const analysis = JSON.parse(response.choices[0].message.content);
      
      // Store analysis in context for learning
      this.storeGameContext(gameType, analysis);
      
      return analysis;
      
    } catch (error) {
      console.error('❌ Error analyzing game state:', error);
      throw new Error(`Failed to analyze game state: ${error.message}`);
    }
  }

  /**
   * Make an intelligent decision based on game analysis
   */
  async makeDecision(gameAnalysis, gameType) {
    try {
      const decisionPrompt = this.getDecisionPrompt(gameAnalysis, gameType);
      
      console.log(`🧠 Making strategic decision for ${gameType}...`);
      
      const response = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: this.getDecisionSystemPrompt()
          },
          {
            role: "user",
            content: decisionPrompt
          }
        ],
        max_tokens: 800,
        temperature: 0.4
      });

      const decision = JSON.parse(response.choices[0].message.content);
      
      // Add context from memory
      decision.context = this.getRelevantContext(gameType);
      
      return decision;
      
    } catch (error) {
      console.error('❌ Error making decision:', error);
      throw new Error(`Failed to make decision: ${error.message}`);
    }
  }

  /**
   * Generate conversational narration of bot's actions
   */
  async narrateAction(decision, gameState) {
    try {
      const narrationPrompt = this.getNarrationPrompt(decision, gameState);
      
      const response = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: this.getNarrationSystemPrompt()
          },
          {
            role: "user",
            content: narrationPrompt
          }
        ],
        max_tokens: 300,
        temperature: 0.8 // Higher temperature for more varied narration
      });

      const narration = response.choices[0].message.content.trim();
      console.log(`🎤 AI SAYS: "${narration}"`);
      
      return narration;
      
    } catch (error) {
      console.error('❌ Error generating narration:', error);
      return "I'm thinking about my next move...";
    }
  }

  /**
   * Execute a complete AI analysis and decision cycle
   */
  async playTurn(screenshotPath, gameType, gameState = {}) {
    try {
      console.log(`🎮 AI Bot taking turn in ${gameType}`);
      
      // Step 1: Analyze the current game state
      const analysis = await this.analyzeGameState(screenshotPath, gameType);
      console.log(`🧠 AI UNDERSTANDS: ${analysis.gameState} - ${analysis.situation}`);
      
      // Step 2: Make a strategic decision
      const decision = await this.makeDecision(analysis, gameType);
      console.log(`🎯 AI STRATEGY: ${decision.action} - ${decision.reasoning}`);
      
      // Step 3: Generate conversational narration
      const narration = await this.narrateAction(decision, analysis);
      
      // Step 4: Store experience for learning
      this.storeExperience(gameType, analysis, decision, gameState);
      
      return {
        analysis,
        decision,
        narration,
        timestamp: Date.now(),
        botId: this.botId
      };
      
    } catch (error) {
      console.error('❌ Error in AI play turn:', error);
      return this.getFallbackAction(gameType);
    }
  }

  /**
   * Store game context for learning and pattern recognition
   */
  storeGameContext(gameType, analysis) {
    if (!this.gameContext.has(gameType)) {
      this.gameContext.set(gameType, []);
    }
    
    const context = this.gameContext.get(gameType);
    context.push({
      timestamp: Date.now(),
      analysis,
      gameState: analysis.gameState
    });
    
    // Keep only recent context to prevent memory bloat
    if (context.length > this.config.maxMemorySize) {
      context.shift();
    }
  }

  /**
   * Store experience for learning and improvement
   */
  storeExperience(gameType, analysis, decision, outcome) {
    if (!this.learningMemory.has(gameType)) {
      this.learningMemory.set(gameType, []);
    }
    
    const experiences = this.learningMemory.get(gameType);
    experiences.push({
      timestamp: Date.now(),
      analysis,
      decision,
      outcome,
      success: outcome.score || 0
    });
    
    // Keep memory manageable
    if (experiences.length > this.config.maxMemorySize) {
      experiences.shift();
    }
  }

  /**
   * Get relevant context from memory for decision making
   */
  getRelevantContext(gameType) {
    const context = this.gameContext.get(gameType) || [];
    const experiences = this.learningMemory.get(gameType) || [];
    
    return {
      recentStates: context.slice(-5), // Last 5 game states
      successfulStrategies: experiences
        .filter(exp => exp.success > 50)
        .slice(-3), // Last 3 successful strategies
      commonPatterns: this.identifyPatterns(context)
    };
  }

  /**
   * Identify patterns in gameplay for strategic learning
   */
  identifyPatterns(context) {
    // Simple pattern recognition - can be enhanced with ML
    const patterns = {};
    
    context.forEach(ctx => {
      const situation = ctx.analysis.situation || 'unknown';
      patterns[situation] = (patterns[situation] || 0) + 1;
    });
    
    return Object.entries(patterns)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([pattern, count]) => ({ pattern, frequency: count }));
  }

  /**
   * Convert image file to base64 string
   */
  async encodeImageToBase64(imagePath) {
    try {
      const imageBuffer = fs.readFileSync(imagePath);
      return imageBuffer.toString('base64');
    } catch (error) {
      throw new Error(`Failed to encode image: ${error.message}`);
    }
  }

  /**
   * Get default analysis prompt for game understanding
   */
  getDefaultAnalysisPrompt() {
    return `You are an expert game analyst with perfect vision. Analyze this game screenshot and provide a JSON response with the following structure:

{
  "gameState": "description of current game state",
  "situation": "brief description of current situation",
  "playerPosition": "where the player/character is",
  "obstacles": ["list of visible obstacles/threats"],
  "opportunities": ["list of opportunities like coins, power-ups"],
  "difficulty": "easy/medium/hard",
  "recommendation": "what should be done next",
  "confidence": 0.95
}

Be precise, observant, and strategic in your analysis.`;
  }

  /**
   * Get game-specific analysis prompt
   */
  getGameSpecificPrompt(gameType) {
    const gamePrompts = {
      'jetpack': `Analyze this Jetpack Joyride-style game screenshot. Look for:
- Player position and jetpack status
- Upcoming obstacles (lasers, missiles, barriers)
- Coins and power-ups to collect
- Safe flight paths
- Floor vs airborne positioning
Return analysis in JSON format as specified.`,

      'subway': `Analyze this Subway Surfers-style endless runner screenshot. Identify:
- Current lane position (left/center/right)
- Upcoming trains/obstacles
- Coins and power-ups on track
- Need to jump, duck, or change lanes
- Speed/difficulty level
Return analysis in JSON format as specified.`,

      'geometry': `Analyze this Geometry Dash-style rhythm platformer screenshot. Note:
- Player position relative to spikes/obstacles
- Upcoming jump timing requirements
- Platform patterns and gravity zones
- Progress through level
- Beat/rhythm timing
Return analysis in JSON format as specified.`,

      'dino': `Analyze this Chrome Dino Runner-style game screenshot. Check for:
- T-Rex position and state
- Approaching cacti (heights/types)
- Flying pterodactyls
- Ground level obstacles
- Game speed/difficulty
Return analysis in JSON format as specified.`,

      'space': `Analyze this Space Dodger game screenshot. Observe:
- Spaceship position and movement
- Incoming asteroids/enemies
- Available power-ups or shields
- Safe movement zones
- Current score/lives
Return analysis in JSON format as specified.`,

      'bubble': `Analyze this Bubble Shooter game screenshot. Examine:
- Bubble colors and patterns
- Available shots and aim direction
- Matching opportunities (3+ same colors)
- Bubble wall height/danger level
- Strategic cluster formations
Return analysis in JSON format as specified.`
    };

    return gamePrompts[gameType] || this.getDefaultAnalysisPrompt();
  }

  /**
   * Get decision-making prompt
   */
  getDecisionPrompt(gameAnalysis, gameType) {
    return `Based on this game analysis, make a strategic decision:

Game Type: ${gameType}
Analysis: ${JSON.stringify(gameAnalysis, null, 2)}

Provide a JSON response with:
{
  "action": "specific action to take",
  "reasoning": "why this action is best",
  "confidence": 0.95,
  "backup_plan": "alternative if primary action fails",
  "timing": "when to execute (immediate/wait/precise)",
  "expected_outcome": "what should happen"
}

Think like a pro player - be strategic, adaptive, and explain your reasoning clearly.`;
  }

  /**
   * Get system prompt for decision making
   */
  getDecisionSystemPrompt() {
    return `You are a professional game player with perfect strategic thinking. You make decisions based on:

1. Current game state analysis
2. Pattern recognition from similar situations  
3. Risk vs reward calculation
4. Timing and execution precision
5. Adaptability to changing conditions

Always explain your reasoning clearly and provide confident, actionable decisions. You play to win but also to learn and improve.`;
  }

  /**
   * Get narration prompt for conversational explanations
   */
  getNarrationPrompt(decision, gameState) {
    return `You are a friendly AI streamer playing games. Explain what you're doing in a natural, conversational way.

Your decision: ${JSON.stringify(decision, null, 2)}
Game state: ${JSON.stringify(gameState, null, 2)}

Provide a brief, enthusiastic explanation (1-2 sentences) of what you're doing and why, as if you're talking to viewers. Be engaging but concise.`;
  }

  /**
   * Get system prompt for narration
   */
  getNarrationSystemPrompt() {
    const styles = {
      'friendly_expert': 'You are a friendly expert gamer who explains moves clearly and enthusiastically.',
      'competitive': 'You are a competitive player focused on winning with strategic explanations.',
      'educational': 'You are a teacher explaining game strategies to help others learn.',
      'entertaining': 'You are an entertaining streamer keeping viewers engaged with humor and excitement.'
    };

    return styles[this.config.narrationStyle] || styles['friendly_expert'];
  }

  /**
   * Get fallback action when AI analysis fails
   */
  getFallbackAction(gameType) {
    const fallbacks = {
      'jetpack': { action: 'maintain_altitude', reasoning: 'Safe default flight pattern' },
      'subway': { action: 'stay_center', reasoning: 'Center lane is usually safest' },
      'geometry': { action: 'time_jump', reasoning: 'Default jump timing' },
      'dino': { action: 'prepare_jump', reasoning: 'Ready for obstacles' },
      'space': { action: 'move_center', reasoning: 'Central position for dodging' },
      'bubble': { action: 'aim_largest_group', reasoning: 'Target biggest cluster' }
    };

    return {
      analysis: { gameState: 'unknown', situation: 'fallback_mode' },
      decision: fallbacks[gameType] || { action: 'wait', reasoning: 'Analyzing situation' },
      narration: "I'm getting my bearings and planning my next move!",
      timestamp: Date.now(),
      botId: this.botId,
      fallback: true
    };
  }
}

export default VisionBot;