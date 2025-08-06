# Mini-Games Documentation

This document contains detailed specifications and implementation notes for all mini-games in the MiniGameHub tournament platform.

## Overview

Each mini-game is implemented as a self-contained module within the Unity project, with its own:
- Scene file
- Assembly definition
- Scripts and prefabs
- Score submission endpoint
- CI/CD build verification

All mini-games follow the same architectural patterns:
- **Scoring**: Distance traveled + Coins collected
- **Multiplayer**: "Ghost player" system (no direct collision)
- **Controls**: Cross-platform (keyboard/mouse + touch)
- **Performance**: 60 FPS target on mid-tier devices

---

## Jetpack Joyride – v0.1 Mechanics

**Status**: ✅ Implemented (Phase 2)  
**Scene**: `Assets/MiniGames/Jetpack/Jetpack.unity`  
**Assembly**: `MiniGame.Jetpack.asmdef`  
**API Endpoint**: `POST /api/score/jetpack`

### Game Mechanics

**Core Gameplay**:
- Endless side-scrolling flyer with automatic forward movement
- Single input control: Hold/tap to thrust upward, release to drop
- Player can land on ground safely (no death on ground contact)
- Game over occurs when hitting obstacles (pipes, lasers, etc.)

**Physics**:
- Rigidbody2D-based movement with configurable thrust force
- Gravity scale affects falling speed
- Maximum velocity clamping prevents excessive speeds
- Ground collision detection with safe landing

**Controls**:
- **PC**: Spacebar or mouse click to thrust
- **Mobile**: Touch and hold screen to thrust
- **Cross-platform**: Input system handles both seamlessly

**Scoring System**:
```
Score = (Distance in meters) + (Coins collected × 10)
```

**Difficulty Scaling**:
- Game speed increases every 10 seconds
- Obstacle spawn rate increases over time
- Minimum spawn interval caps maximum difficulty

### Technical Implementation

**Core Scripts**:
- `JetpackPlayer.cs`: Player controller with thrust physics
- `JetpackGameManager.cs`: Game state, scoring, and UI management
- `ScrollingBackground.cs`: Infinite scrolling background system
- `ObstacleSpawner.cs`: Procedural obstacle generation
- `ObstacleMover.cs`: Movement component for obstacles and coins

**Key Features**:
- Object pooling for obstacles and coins (planned optimization)
- Audio integration for jetpack thrust sounds
- Real-time UI updates (score, distance, game over)
- Backend score submission with metadata

**Obstacles**:
- Pipe-like barriers at various heights
- Coins spawn with configurable probability (30% default)
- Obstacles despawn when off-screen to prevent memory leaks

**Performance Optimizations**:
- Efficient collision detection using 2D triggers
- Automatic cleanup of off-screen objects
- Lightweight rendering with 2D sprites

### API Integration

**Score Submission**:
```json
POST /api/score/jetpack
{
  "score": 1500,
  "distance": 750,
  "coins": 25,
  "time": 45.5,
  "userId": 1
}
```

**Response**:
```json
{
  "success": true,
  "message": "Score submitted successfully",
  "data": {
    "scoreId": 123,
    "score": 1500,
    "distance": 750,
    "coins": 25,
    "time": 45.5,
    "submittedAt": "2024-01-01T12:00:00Z"
  }
}
```

**Additional Endpoints**:
- `GET /api/score/jetpack/leaderboard` - Top scores
- `GET /api/score/jetpack/stats` - Game statistics
- `GET /api/score/jetpack/user/:userId` - User's scores

### Testing

**Unit Tests**: `backend/src/routes/scoreRoutes.test.js`
- Score submission validation
- Error handling for invalid inputs
- Leaderboard and statistics endpoints
- User score retrieval

**CI/CD**: GitHub Actions builds Jetpack scene independently
- Matrix build strategy for multiple scenes
- Artifact upload for build verification
- Cross-platform compatibility checks

### Future Enhancements

**Phase 2.1 Improvements**:
- [ ] Power-ups (shield, coin magnet, speed boost)
- [ ] Multiple background themes
- [ ] Particle effects for thrust and collisions
- [ ] Sound effects and background music
- [ ] Ghost player visualization for multiplayer

**Phase 3 Features**:
- [ ] Customizable player skins
- [ ] Achievement system integration
- [ ] Replay system for best runs
- [ ] Tournament mode integration

---

## Upcoming Mini-Games

### Subway Surfers Clone
**Status**: 📋 Planned (Phase 2.2)
- 3-lane endless runner
- Swipe controls for lane switching
- Power-ups and obstacles

### Geometry Dash Clone  
**Status**: 📋 Planned (Phase 2.3)
- Rhythm-based platformer
- Jump timing mechanics
- Music synchronization

### Chrome Dino Runner Clone
**Status**: 📋 Planned (Phase 2.4)
- Simple jump/duck mechanics
- Increasing speed over time
- Cactus and pterodactyl obstacles

### Space Dodger
**Status**: 📋 Planned (Phase 2.5)
- Free-movement space shooter
- Asteroid avoidance
- Optional shooting mechanics

### Bubble Shooter
**Status**: 📋 Planned (Phase 2.6)
- Match-3 puzzle mechanics
- Physics-based bubble trajectories
- Multiplayer score competition

---

## Development Guidelines

### Adding New Mini-Games

1. **Directory Structure**:
   ```
   unity/MiniGameHub/Assets/MiniGames/[GameName]/
   ├── Scripts/
   │   ├── [GameName]Player.cs
   │   ├── [GameName]GameManager.cs
   │   └── MiniGame.[GameName].asmdef
   ├── Prefabs/
   ├── [GameName].unity
   └── README.md
   ```

2. **Backend Integration**:
   ```
   backend/src/routes/scoreRoutes.js
   └── Add POST /api/score/[gamename] endpoint
   ```

3. **CI/CD Integration**:
   - Add scene to GitHub Actions matrix
   - Update Unity BuildScript if needed
   - Add endpoint tests

4. **Documentation**:
   - Add section to this document
   - Update main README.md
   - Include in roadmap.md progress

### Code Standards

- Use namespace `MiniGameHub.[GameName]` for all scripts
- Implement `IGameManager` interface (when created)
- Follow Unity naming conventions
- Include XML documentation for public methods
- Write unit tests for all API endpoints

### Performance Requirements

- Maintain 60 FPS on target devices
- Memory usage < 100MB per mini-game
- Network requests < 1KB per score submission
- Build time < 5 minutes per scene in CI

---

## Troubleshooting

### Common Issues

**Unity Build Failures**:
- Check scene paths in CI configuration
- Verify assembly references are correct
- Ensure all required assets are committed

**Score Submission Errors**:
- Validate JSON payload format
- Check database connection in backend
- Verify user authentication (when implemented)

**Performance Problems**:
- Profile with Unity Profiler
- Check for memory leaks in object spawning
- Optimize texture sizes and compression

### Debug Commands

```bash
# Test backend endpoints locally
curl -X POST http://localhost:4000/api/score/jetpack \
  -H "Content-Type: application/json" \
  -d '{"score":1000,"distance":500,"coins":10}'

# Run Unity builds locally
Unity -batchmode -quit -projectPath unity/MiniGameHub \
  -executeMethod UnityBuilderAction.BuildScript.Build \
  -sceneList "Assets/MiniGames/Jetpack/Jetpack.unity"
```

---

*Last updated: Phase 2 implementation*