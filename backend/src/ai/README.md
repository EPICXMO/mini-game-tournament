# AI Vision Bot System

An intelligent game-playing bot system that uses GPT-4 Vision to understand, analyze, and play mini-games with human-like reasoning and conversational explanations.

## 🎯 What This Achieves

This system transforms the basic "bot auto-fill" mentioned in the project roadmap into **truly intelligent AI players** that:

- **See and understand** game states like ChatGPT/Claude would analyze screenshots
- **Make strategic decisions** with clear explanations of their reasoning  
- **Adapt to different games** with game-specific personalities and strategies
- **Provide conversational narration** like a human streamer explaining their moves
- **Learn from experience** and improve performance over time

## 🏗️ Architecture

### Core Components

1. **VisionBot** (`src/ai/visionBot.js`)
   - Uses GPT-4 Vision API to analyze game screenshots
   - Understands game state, obstacles, opportunities
   - Makes strategic decisions with confidence ratings
   - Provides conversational explanations

2. **IntelligentBotController** (`src/ai/intelligentBotController.js`)
   - Manages bot lifecycle and game interaction
   - Converts AI decisions to specific game actions
   - Handles screenshot capture and input simulation
   - Tracks performance and learning

3. **AIBotService** (`src/ai/aiBotService.js`)
   - Creates and manages multiple bots in tournaments
   - Provides game-specific bot configurations
   - Integrates with existing tournament system
   - Handles bot performance tracking

4. **API Routes** (`src/routes/aiBotRoutes.js`)
   - REST API endpoints for bot management
   - Tournament integration endpoints
   - Bot testing and monitoring

## 🎮 Game-Specific Adaptations

Each mini-game has optimized bot configurations:

| Game | Personality | Strategy | Narration Style |
|------|-------------|----------|-----------------|
| Jetpack Joyride | Risk-taking | Flight paths & coin collection | Entertaining |
| Subway Surfers | Reactive | Lane switching & timing | Competitive |
| Geometry Dash | Precise | Rhythm & jump timing | Focused |
| Chrome Dino | Defensive | Obstacle detection | Friendly Expert |
| Space Dodger | Strategic | Movement patterns | Strategic |
| Bubble Shooter | Analytical | Color matching planning | Educational |

## 🚀 Key Features

### ✅ True Vision Understanding
```javascript
// Bot analyzes screenshot and understands context
const analysis = await bot.analyzeGameState(screenshot, 'jetpack');
// Returns: { gameState: 'mid_flight', obstacles: ['laser_top'], opportunities: ['coin_cluster'] }
```

### ✅ Strategic Decision Making
```javascript
// Bot makes intelligent decisions with reasoning
const decision = await bot.makeDecision(analysis, 'jetpack');
// Returns: { action: 'descend_and_collect', reasoning: 'Safe path while maximizing coins' }
```

### ✅ Conversational Narration
```javascript
// Bot explains actions like a human streamer
const narration = await bot.narrateAction(decision, gameState);
// Returns: "Threading through these obstacles like a pro - those coins are too good to pass up!"
```

### ✅ Adaptive Learning
```javascript
// Bot stores experiences and learns patterns
bot.storeExperience(gameType, analysis, decision, outcome);
const patterns = bot.identifyPatterns(gameContext);
```

## 📡 API Endpoints

### Create Bot
```http
POST /api/bots
{
  "tournamentId": "tour_123",
  "gameType": "jetpack",
  "config": {
    "personality": "aggressive",
    "skillLevel": "expert"
  }
}
```

### Add Bot to Tournament
```http
POST /api/bots/tournament/tour_123
{
  "gameType": "jetpack",
  "playerSlot": 1
}
```

### Start Bot Playing
```http
POST /api/bots/bot_456/start
{
  "gameType": "jetpack",
  "roundData": { "round": 3 }
}
```

### Monitor Performance
```http
GET /api/bots/bot_456/performance
```

### Test AI Vision
```http
POST /api/bots/test
{
  "gameType": "jetpack",
  "screenshotPath": "/tmp/game_screenshot.png"
}
```

## ⚙️ Configuration

### Environment Variables
```bash
# Required
OPENAI_API_KEY=your_openai_api_key_here

# Optional AI settings
AI_BOT_ENABLED=true
AI_BOT_MAX_CONCURRENT=8
AI_VISION_MODEL=gpt-4-vision-preview
AI_DECISION_MODEL=gpt-4
AI_NARRATION_ENABLED=true
AI_LEARNING_ENABLED=true
```

### Bot Configuration
```javascript
const botConfig = {
  personality: 'strategic',        // strategic, aggressive, defensive, analytical
  skillLevel: 'adaptive',          // beginner, balanced, expert, adaptive
  narrationStyle: 'friendly_expert', // entertaining, competitive, educational
  screenshotInterval: 500,         // ms between screenshots
  decisionDelay: 100,             // ms delay before executing
  enableLearning: true,           // store and learn from experiences
  enableNarration: true           // provide conversational explanations
};
```

## 🛠️ Setup and Usage

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Configure Environment
```bash
cp .env.ai.example .env
# Edit .env and add your OPENAI_API_KEY
```

### 3. Start Server
```bash
npm run dev
```

### 4. Test the System
```bash
# Run offline demo (no API key required)
node src/ai/demoOffline.js

# Run full demo (requires API key)
node src/ai/demo.js
```

### 5. Create and Use Bots
```javascript
// Via API
const response = await fetch('/api/bots', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    tournamentId: 'my_tournament',
    gameType: 'jetpack'
  })
});

// Via Service
const aiBotService = new AIBotService();
const { botId, bot } = await aiBotService.createBot('tournament_id');
```

## 🧪 Testing

Run the test suite:
```bash
npm test src/ai/aiBotSystem.test.js
```

## 🔄 Integration with Tournament System

The AI bot system seamlessly integrates with the existing tournament infrastructure:

1. **Replaces Simple Bots**: Upgrades the basic "bot auto-fill" to intelligent AI players
2. **Tournament Flow**: Bots can join tournaments, play rounds, and compete with humans
3. **Score Tracking**: Performance is tracked and integrated with leaderboards
4. **Multi-Game Support**: Works across all 6 planned mini-games

## 📊 Performance Monitoring

Track bot performance through:
- Games played and win rates
- Average scores per game type
- Decision success rates
- Learning progression
- Real-time gameplay statistics

## 🎭 Bot Personalities

Different personality types affect gameplay:

- **Strategic**: Calculated, risk-averse decisions
- **Aggressive**: High-risk, high-reward plays
- **Defensive**: Safety-first, consistent performance  
- **Analytical**: Data-driven, pattern-recognition focused

## 🧠 AI Models Used

- **GPT-4 Vision**: Screenshot analysis and game state understanding
- **GPT-4**: Strategic decision making and reasoning
- **GPT-4**: Conversational narration and explanations

## 🔮 Future Enhancements

- **Unity Integration**: Direct screenshot capture and input simulation
- **Advanced Learning**: Machine learning models for pattern recognition
- **Custom Personalities**: User-defined bot behaviors and strategies
- **Competitive Modes**: Bot vs bot tournaments and challenges
- **Real-time Streaming**: Live commentary during gameplay

## 🎯 Example Bot Behavior

```
🎮 AI Bot taking turn in jetpack
🔍 Analyzing jetpack screenshot...
🧠 AI UNDERSTANDS: mid_flight - approaching laser barriers with coin opportunity
🎯 AI STRATEGY: descend_and_weave - Thread through obstacles while collecting coins
🎤 AI SAYS: "Perfect timing! I'll duck under these lasers and grab those coins - risk and reward!"
🎮 Executing action: descend_and_weave
📊 Updated bot performance: 15 games, 1,650 avg score
```

This creates exactly the ChatGPT-like bot experience described in the problem statement - bots that truly see, understand, reason, and explain their decisions just like a human expert player would.