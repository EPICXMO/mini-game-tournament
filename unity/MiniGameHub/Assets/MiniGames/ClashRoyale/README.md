# Clash Royale Mini-Game with AI Bot

## Overview

A tower defense mini-game inspired by Clash Royale, featuring an intelligent AI opponent that applies lessons learned from the Super Mario Bros. AI case study.

## Key Features

### AI Improvements Over Baseline
1. **Reward Engineering**: AI rewards strategic efficiency and speed, not just survival
2. **Action Space Management**: Limited card deck and placement zones for faster training
3. **Strategic Decision Making**: Real-time card placement and timing optimization
4. **Performance Optimization**: Fixed learning algorithm implementation for better efficiency

### Game Mechanics
- **Player vs AI**: Human player competes against AI bot
- **Tower Defense**: Protect your towers while attacking opponent's towers
- **Elixir System**: Resource management for card deployment
- **Unit Cards**: Deploy troops, spells, and buildings
- **Real-time Strategy**: Fast-paced decision making

### Scoring System
- **Primary**: Tower damage dealt to opponent
- **Secondary**: Elixir efficiency (damage per elixir spent)
- **Bonus**: Time-based multiplier (faster wins = higher score)
- **Penalty**: Tower damage received

## AI Bot Architecture

### Reward Function (Inspired by Mario AI)
```
Reward = Tower_Damage_Dealt * 10 
         + Elixir_Efficiency * 5
         - Tower_Damage_Received * 15
         - Time_Penalty * 0.1
         + Victory_Bonus * 100
```

### Action Space (Managed Complexity)
- **8 Card Types**: Limited deck for faster training
- **16 Placement Zones**: 4x4 grid on player's side
- **Timing Decisions**: When to deploy based on elixir

### Learning Optimizations
- **Proper PPO Implementation**: Fixed algorithm bugs from Mario AI case
- **Experience Replay**: Store and learn from strategic patterns
- **Reward Shaping**: Encourage fast, efficient play over defensive camping

## Integration with Tournament System

- **Scoring**: Integrates with existing Distance + Coins formula
- **Multiplayer**: AI bot acts as opponent in single-player mode
- **Tournament**: Scores submitted to backend for leaderboard tracking
- **Cross-platform**: Works on PC and mobile with touch controls