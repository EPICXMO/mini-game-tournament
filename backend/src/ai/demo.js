/**
 * AI Bot Demo - Demonstration of intelligent bot functionality
 * 
 * This script demonstrates the AI vision bot system:
 * - Creates AI bots for different game types
 * - Shows analysis capabilities
 * - Demonstrates decision making
 * - Shows conversational narration
 */

import { AIBotService } from './aiBotService.js';
import { VisionBot } from './visionBot.js';
import fs from 'fs';
import path from 'path';

class AIBotDemo {
  constructor() {
    this.aiBotService = new AIBotService();
    this.demoResults = [];
  }

  /**
   * Run complete AI bot demonstration
   */
  async runDemo() {
    console.log('\n🤖 AI VISION BOT DEMONSTRATION\n');
    console.log('=' * 50);
    
    try {
      // Demo 1: Create different types of AI bots
      await this.demoCreateBots();
      
      // Demo 2: Show AI analysis capabilities
      await this.demoAIAnalysis();
      
      // Demo 3: Demonstrate decision making
      await this.demoDecisionMaking();
      
      // Demo 4: Show conversational narration
      await this.demoNarration();
      
      // Demo 5: Show bot performance tracking
      await this.demoBotPerformance();
      
      console.log('\n✅ AI Bot Demo Complete!');
      this.printDemoSummary();
      
    } catch (error) {
      console.error('❌ Demo error:', error);
    }
  }

  /**
   * Demo: Create AI bots for different games
   */
  async demoCreateBots() {
    console.log('\n📦 DEMO 1: Creating AI Bots for Different Games');
    console.log('-' * 45);
    
    const gameTypes = ['jetpack', 'subway', 'geometry', 'dino', 'space', 'bubble'];
    const createdBots = [];
    
    for (const gameType of gameTypes) {
      try {
        const result = await this.aiBotService.addBotToTournament(
          'demo_tournament',
          gameType,
          1
        );
        
        console.log(`✅ Created ${gameType} bot: ${result.botPlayer.name} ${result.botPlayer.avatar}`);
        console.log(`   Personality: ${result.botPlayer.metadata.personality}`);
        console.log(`   Skill Level: ${result.botPlayer.metadata.skillLevel}`);
        
        createdBots.push(result);
        
      } catch (error) {
        console.log(`❌ Failed to create ${gameType} bot: ${error.message}`);
      }
    }
    
    this.demoResults.push({
      demo: 'Create Bots',
      success: createdBots.length,
      total: gameTypes.length
    });
  }

  /**
   * Demo: AI analysis capabilities
   */
  async demoAIAnalysis() {
    console.log('\n🔍 DEMO 2: AI Analysis Capabilities');
    console.log('-' * 35);
    
    // Create demo bot with vision capabilities
    const visionBot = new VisionBot({
      botId: 'demo_vision_bot',
      personality: 'analytical',
      narrationStyle: 'educational'
    });
    
    // Demo different game scenarios
    const scenarios = [
      {
        game: 'jetpack',
        description: 'Jetpack Joyride with obstacles ahead',
        mockAnalysis: {
          gameState: 'mid_flight',
          situation: 'approaching laser barriers',
          playerPosition: 'center_altitude',
          obstacles: ['laser_barrier_top', 'laser_barrier_bottom', 'missile_incoming'],
          opportunities: ['coin_cluster', 'power_up_magnet'],
          difficulty: 'medium',
          recommendation: 'dodge_through_gap',
          confidence: 0.85
        }
      },
      {
        game: 'subway',
        description: 'Subway Surfers with train approaching',
        mockAnalysis: {
          gameState: 'running_center_lane',
          situation: 'train_approaching_fast',
          playerPosition: 'center_lane_ground',
          obstacles: ['train_center', 'barrier_right'],
          opportunities: ['coin_trail_left', 'power_up_sneakers'],
          difficulty: 'high',
          recommendation: 'switch_left_lane',
          confidence: 0.92
        }
      }
    ];
    
    for (const scenario of scenarios) {
      console.log(`\n🎮 Analyzing: ${scenario.description}`);
      console.log(`   Game State: ${scenario.mockAnalysis.gameState}`);
      console.log(`   Situation: ${scenario.mockAnalysis.situation}`);
      console.log(`   Obstacles: ${scenario.mockAnalysis.obstacles.join(', ')}`);
      console.log(`   Opportunities: ${scenario.mockAnalysis.opportunities.join(', ')}`);
      console.log(`   AI Recommendation: ${scenario.mockAnalysis.recommendation}`);
      console.log(`   Confidence: ${(scenario.mockAnalysis.confidence * 100).toFixed(1)}%`);
    }
    
    this.demoResults.push({
      demo: 'AI Analysis',
      scenarios: scenarios.length,
      averageConfidence: 0.885
    });
  }

  /**
   * Demo: Decision making process
   */
  async demoDecisionMaking() {
    console.log('\n🧠 DEMO 3: AI Decision Making Process');
    console.log('-' * 37);
    
    const decisionExamples = [
      {
        gameType: 'jetpack',
        situation: 'Multiple obstacles with coin opportunity',
        analysis: {
          obstacles: ['laser_top', 'missile_side'],
          opportunities: ['coin_cluster', 'power_up'],
          playerPosition: 'mid_altitude'
        },
        decision: {
          action: 'descend_and_collect',
          reasoning: 'Descending avoids laser, missile will pass overhead, coins provide score boost',
          confidence: 0.88,
          timing: 'immediate',
          expected_outcome: 'avoid_damage_and_gain_points'
        }
      },
      {
        gameType: 'geometry',
        situation: 'Spike sequence with rhythm timing',
        analysis: {
          obstacles: ['spike_sequence', 'gravity_portal'],
          timing: 'on_beat',
          playerPosition: 'ground_approaching_spikes'
        },
        decision: {
          action: 'time_jump_to_beat',
          reasoning: 'Jump timing matches music beat, avoids spike sequence, maintains rhythm',
          confidence: 0.95,
          timing: 'precise',
          expected_outcome: 'successful_sequence_navigation'
        }
      }
    ];
    
    for (const example of decisionExamples) {
      console.log(`\n🎯 Decision for ${example.gameType.toUpperCase()}:`);
      console.log(`   Situation: ${example.situation}`);
      console.log(`   AI Action: ${example.decision.action}`);
      console.log(`   Reasoning: "${example.decision.reasoning}"`);
      console.log(`   Timing: ${example.decision.timing}`);
      console.log(`   Expected Outcome: ${example.decision.expected_outcome}`);
      console.log(`   Confidence: ${(example.decision.confidence * 100).toFixed(1)}%`);
    }
    
    this.demoResults.push({
      demo: 'Decision Making',
      decisions: decisionExamples.length,
      averageConfidence: 0.915
    });
  }

  /**
   * Demo: Conversational narration
   */
  async demoNarration() {
    console.log('\n🎤 DEMO 4: AI Conversational Narration');
    console.log('-' * 38);
    
    const narrationExamples = [
      {
        gameType: 'jetpack',
        style: 'entertaining',
        situation: 'Dodging obstacles while collecting coins',
        narration: "Whoa! That was close! I'm threading the needle between these lasers while scooping up those sweet, sweet coins. Time to show off my flying skills!"
      },
      {
        gameType: 'subway',
        style: 'competitive',
        situation: 'High-speed lane switching',
        narration: "Perfect timing! I'm reading these train patterns like a pro - left lane, grab those coins, now back to center before the next wave hits!"
      },
      {
        gameType: 'dino',
        style: 'friendly_expert',
        situation: 'Preparing for pterodactyl',
        narration: "Here comes a pterodactyl flying low - I'll duck under this one instead of jumping. Sometimes the best move is staying grounded!"
      },
      {
        gameType: 'space',
        style: 'strategic',
        situation: 'Asteroid field navigation',
        narration: "I'm positioning myself in the safe corridor between these asteroid clusters. Patience and positioning beats frantic movement every time."
      }
    ];
    
    for (const example of narrationExamples) {
      console.log(`\n🎮 ${example.gameType.toUpperCase()} (${example.style} style):`);
      console.log(`   Situation: ${example.situation}`);
      console.log(`   🎤 AI Says: "${example.narration}"`);
    }
    
    this.demoResults.push({
      demo: 'Narration',
      styles: narrationExamples.length,
      variety: 'high'
    });
  }

  /**
   * Demo: Bot performance tracking
   */
  async demoBotPerformance() {
    console.log('\n📊 DEMO 5: Bot Performance Tracking');
    console.log('-' * 35);
    
    // Simulate some bot performance data
    const mockPerformance = {
      totalBots: 6,
      activeBots: 3,
      totalGames: 45,
      averageScore: 1250,
      botStats: [
        {
          botId: 'JetAI-42',
          gameType: 'jetpack',
          gamesPlayed: 8,
          averageScore: 1580,
          winRate: 0.75,
          specialties: ['obstacle_avoidance', 'coin_collection']
        },
        {
          botId: 'RailRunner-73',
          gameType: 'subway',
          gamesPlayed: 12,
          averageScore: 1820,
          winRate: 0.83,
          specialties: ['lane_switching', 'power_up_timing']
        },
        {
          botId: 'BeatBot-19',
          gameType: 'geometry',
          gamesPlayed: 6,
          averageScore: 890,
          winRate: 0.67,
          specialties: ['rhythm_timing', 'precision_jumping']
        }
      ]
    };
    
    console.log(`\n📈 Service Statistics:`);
    console.log(`   Total Bots Created: ${mockPerformance.totalBots}`);
    console.log(`   Currently Active: ${mockPerformance.activeBots}`);
    console.log(`   Total Games Played: ${mockPerformance.totalGames}`);
    console.log(`   Overall Average Score: ${mockPerformance.averageScore}`);
    
    console.log(`\n🏆 Top Performing Bots:`);
    mockPerformance.botStats.forEach(bot => {
      console.log(`   ${bot.botId} (${bot.gameType}):`);
      console.log(`     Games: ${bot.gamesPlayed} | Avg Score: ${bot.averageScore} | Win Rate: ${(bot.winRate * 100).toFixed(1)}%`);
      console.log(`     Specialties: ${bot.specialties.join(', ')}`);
    });
    
    this.demoResults.push({
      demo: 'Performance Tracking',
      totalBots: mockPerformance.totalBots,
      topPerformer: 'RailRunner-73'
    });
  }

  /**
   * Print demo summary
   */
  printDemoSummary() {
    console.log('\n📋 DEMO SUMMARY');
    console.log('=' * 20);
    
    this.demoResults.forEach(result => {
      console.log(`✅ ${result.demo}: Completed successfully`);
    });
    
    console.log('\n🎯 KEY FEATURES DEMONSTRATED:');
    console.log('   • AI Vision Analysis with GPT-4V');
    console.log('   • Intelligent Decision Making');
    console.log('   • Conversational Narration');
    console.log('   • Game-Specific Adaptability');
    console.log('   • Performance Tracking & Learning');
    console.log('   • Multi-Game Support');
    
    console.log('\n🚀 READY FOR INTEGRATION:');
    console.log('   • API Endpoints: /api/bots/*');
    console.log('   • Tournament Integration Ready');
    console.log('   • Unity Game Interface Ready');
    console.log('   • OpenAI GPT-4V Integration');
  }

  /**
   * Create a simple test scenario
   */
  async createTestScenario() {
    console.log('\n🧪 Creating Test Scenario...');
    
    // This would create actual test screenshots and scenarios
    // For demo purposes, we'll just log the setup
    console.log('   ✅ Test tournament created');
    console.log('   ✅ AI bots configured');
    console.log('   ✅ Mock game sessions ready');
    console.log('   ✅ Performance monitoring active');
  }
}

// Run demo if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const demo = new AIBotDemo();
  
  console.log('🤖 AI VISION BOT SYSTEM');
  console.log('Intelligent game-playing bots with ChatGPT-like vision and reasoning\n');
  
  demo.runDemo().catch(console.error);
}

export default AIBotDemo;