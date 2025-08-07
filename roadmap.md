# AI Multiplayer Mini-Game Tournament - Project Roadmap

## Project Overview
**Vision**: Cross-platform hub-and-spoke multiplayer game with 6 mini-games, tournament mode, and AI-assisted development
**Target Platforms**: PC (Windows) + Mobile (Android/iOS)  
**Development Style**: "Vibe-coding" with AI assistance, rapid iterations
**Repository**: https://github.com/<my-user>/party-royale

## Phase 0: Project Setup & Foundation

### Environment Setup
- [ ] Install required Unity version
- [ ] Install Node.js and required packages (e.g., WebSocket library like Socket.io)
- [ ] Set up IDE (Cursor/Roo/Cline) with Unity and Node.js integration
- [ ] Configure Blender AI/MCP integration (if available/needed for asset pipeline)

### Version Control
- [ ] Initialize Git repository
- [ ] Create initial commit
- [ ] Set up remote repository (e.g., GitHub)

### Project Structure
- [ ] Create initial Unity project folder structure (e.g., Scripts, Prefabs, Assets/Models, Assets/Sprites, Scenes, MiniGames/[GameName])
- [ ] Create initial Node.js backend project structure

### Core Dependencies
- [ ] Install/Import necessary Unity packages (e.g., Input System, any required asset store tools)
- [ ] Install necessary Node.js packages (npm install)

### AI Guidelines
- [ ] Define & Create rules.md file (AI Development Guidelines based on PRD Section 12)
- [ ] Review & Finalize rules.md content

## Phase 1: Core Systems & Hub Implementation (Weeks 1-2)

### Basic Unity Scene Setup
- [ ] Create Main Menu scene
- [ ] Create Lobby scene
- [ ] Create basic scene transition logic

### Node.js Backend Basics
- [ ] Implement basic Node.js server
- [ ] Set up WebSocket (Socket.io) connection handling
- [ ] Implement basic client connection/disconnection logic

### Main Menu/Hub UI
- [ ] Implement basic UI layout (Title, Buttons: Play Tournament, Select Mini-Game, Options, Quit)
- [ ] Implement button functionality (scene transitions)
- [ ] Designate area/trigger for Easter Egg activations

### Lobby System
- [ ] Implement basic Lobby scene UI (Player list, Game settings placeholder, Ready button, Start Game button)
- [ ] Implement basic lobby creation/joining logic on backend
- [ ] Implement player list synchronization between clients and server
- [ ] Implement Ready state logic

### Basic Multiplayer Framework
- [ ] Establish basic communication between Unity client and Node.js server
- [ ] Implement simple test message sending/receiving
- [ ] Implement placeholder for player data synchronization

### Core Systems (Placeholders)
- [ ] Implement basic persistent currency tracking (placeholder, e.g., PlayerPrefs or simple file)
- [ ] Implement basic global settings structure (e.g., for Ghost Mode toggle)

### Milestone 1.2: Lobby & Multiplayer Foundation
- [ ] **Main Menu & Lobby UI**
  - [ ] Create main menu with tournament/casual mode options
  - [ ] Implement lobby scene with player avatars and game portals
  - [ ] Add friend invite system and matchmaking
  - [ ] Create settings menu (controls, audio, accessibility)

- [ ] **Multiplayer Core**
  - [ ] Implement ghost player system (translucent avatars)
  - [ ] Set up real-time position synchronization
  - [ ] Create tournament flow management
  - [ ] Add bot player system for auto-filling matches

## Phase 2: Mini-Game Implementation (Iterative) (Weeks 3-4)

### Mini-Game: Jetpack Joyride Clone

#### Scene/Module Setup
- [ ] Create scene and basic script structure for the mini-game

#### Core Gameplay
- [ ] Implement player character movement/controls (using placeholder visuals)
- [ ] Implement core game mechanic (scrolling, jetpack thrust)
- [ ] Implement procedural generation for level/obstacles (using placeholder visuals)
- [ ] Implement hazard collision and game over logic (single player)
- [ ] Implement coin/collectible spawning and collection logic
- [ ] Implement power-up logic (if applicable for this game)
- [ ] Implement scoring system (distance/time + coins)

#### Asset Integration (Placeholders)
- [ ] Integrate basic player character visual (placeholder model/sprite)
- [ ] Integrate basic hazard visuals (placeholder models/sprites)
- [ ] Integrate basic environment visuals

#### Multiplayer Integration
- [ ] Implement player representation (syncing position/state of remote players per Section 8)
- [ ] Implement environment synchronization (hazards, etc., per Section 8)
- [ ] Implement game state management (start, elimination, round end, spectate, results screen per game spec / Section 8)
- [ ] Implement network considerations (update frequency, interpolation per Section 8)

#### Basic Testing
- [ ] Test core mechanics and multiplayer sync in isolation

## Phase 3: Tournament System & Leaderboard (Weeks 5-6)

### Milestone 3.1: Tournament Flow
- [ ] **Tournament Management**
  - [ ] Implement 5/10/15/20 round configurations
  - [ ] Create random mini-game selection system
  - [ ] Add tournament progression tracking
  - [ ] Implement tie-breaker rules

- [ ] **Leaderboard & Results**
  - [ ] Create live leaderboard between rounds
  - [ ] Implement final tournament results screen
  - [ ] Add rematch functionality
  - [ ] Create tournament history tracking

### Milestone 3.2: Cross-Platform Polish
- [ ] **UI/UX Refinement**
  - [ ] Optimize UI for mobile screens
  - [ ] Add responsive design for different resolutions
  - [ ] Implement touch-friendly controls
  - [ ] Add accessibility features

- [ ] **Performance Optimization**
  - [ ] Target 60 FPS on mid-tier devices
  - [ ] Optimize network usage (<200ms latency)
  - [ ] Implement object pooling for obstacles
  - [ ] Add platform-specific optimizations

## Phase 4: Additional Mini-Games (Weeks 7-12)

### Milestone 4.1: Subway Surfers Clone
- [ ] **3-Lane Runner Mechanics**
  - [ ] Implement lane switching (left/right)
  - [ ] Add jump and roll mechanics
  - [ ] Create train/barrier obstacle system
  - [ ] Add power-ups (coin magnet, sneakers, hoverboard)

### Milestone 4.2: Geometry Dash Clone
- [ ] **Rhythm-Based Platformer**
  - [ ] Implement auto-forward movement
  - [ ] Add precise jump timing mechanics
  - [ ] Create spike/pit obstacle system
  - [ ] Add gravity flip portals and vehicle modes

### Milestone 4.3: Chrome Dino Runner Clone
- [ ] **Simple Endless Runner**
  - [ ] Implement basic jump mechanics
  - [ ] Add cactus and pterodactyl obstacles
  - [ ] Create progressive speed increase
  - [ ] Add duck mechanics

### Milestone 4.4: Space Dodger
- [ ] **2D Space Shooter**
  - [ ] Implement free 2D movement
  - [ ] Add asteroid avoidance mechanics
  - [ ] Create power-up system (shield, slow-motion)
  - [ ] Add optional shooting mechanics

### Milestone 4.5: Bubble Shooter
- [ ] **Puzzle Game**
  - [ ] Implement bubble aiming and shooting
  - [ ] Add color matching mechanics
  - [ ] Create chain reaction system
  - [ ] Add descending bubble mechanics

## Phase 3: Easter Egg Implementation (Weeks 7-8)

### Easter Egg: Classic Snake
- [ ] UI Integration: Implement trigger and visual container within Hub UI
- [ ] Core Mechanics: Implement specific gameplay logic
- [ ] Controls: Implement PC/Mobile controls
- [ ] Reset Logic: Implement functionality for the reset button
- [ ] Basic Testing: Test activation, gameplay, and reset

### Easter Egg: Physics-Based Menu Text
- [ ] UI Integration: Implement trigger and visual container within Hub UI
- [ ] Core Mechanics: Implement specific gameplay logic
- [ ] Controls: Implement PC/Mobile controls
- [ ] Reset Logic: Implement functionality for the reset button
- [ ] Basic Testing: Test activation, gameplay, and reset

### Easter Egg: Explodable Text
- [ ] UI Integration: Implement trigger and visual container within Hub UI
- [ ] Core Mechanics: Implement specific gameplay logic
- [ ] Controls: Implement PC/Mobile controls
- [ ] Reset Logic: Implement functionality for the reset button
- [ ] Basic Testing: Test activation, gameplay, and reset

### Easter Egg: Gravity Flip
- [ ] UI Integration: Implement trigger and visual container within Hub UI
- [ ] Core Mechanics: Implement specific gameplay logic
- [ ] Controls: Implement PC/Mobile controls
- [ ] Reset Logic: Implement functionality for the reset button
- [ ] Basic Testing: Test activation, gameplay, and reset

### Easter Egg: Bubble Shooter (Requires detailed breakdown first)
- [ ] Define detailed breakdown (Gameplay, Controls, etc.)
- [ ] Implement based on breakdown

## Phase 4: Asset Integration & Polish (Weeks 9-12)

### High-Quality Asset Integration (Blender -> Unity)
- [ ] Integrate final Player Character models/sprites (per game)
- [ ] Integrate final Hazard/Obstacle models/sprites (per game)
- [ ] Integrate final Environment assets/themes (per game)
- [ ] Integrate final UI assets (buttons, icons, fonts)
- [ ] Update configuration files to reference final assets

### Animation & Effects Polish
- [ ] Refine player animations (using final models/sprites)
- [ ] Refine hazard animations
- [ ] Add/Refine particle effects (thrust, explosions, collection, etc.)
- [ ] Implement UI animations/transitions

### Shop Implementation
- [ ] Design and implement Shop UI
- [ ] Implement logic for purchasing/unlocking per-game characters using persistent currency
- [ ] Implement logic for selecting unlocked characters per game

### Audio Implementation
- [ ] Integrate background music (Hub, per game)
- [ ] Integrate sound effects (UI clicks, jumps, collisions, coin collection, power-ups, etc.)

## Phase 5: Testing & Refinement (Weeks 13-14)

### Code Review & Refactoring Session
- [ ] Review major systems (Core, Mini-Games) for clarity, maintainability, and performance improvements based on rules.md

### Comprehensive Gameplay Testing
- [ ] Test all mini-games thoroughly (single player & multiplayer)
- [ ] Test all Easter eggs
- [ ] Test core loop (hub, lobby, game transitions, results)
- [ ] Test on all target platforms (PC, Mobile)

### Multiplayer Stress Testing
- [ ] Test with multiple concurrent players
- [ ] Test handling of disconnections/reconnections (if supported)
- [ ] Test latency compensation effectiveness

### Security Review
- [ ] Audit backend code (Node.js) and communication points for common vulnerabilities

### Bug Fixing
- [ ] Address all identified bugs from testing phases

### Performance Optimization
- [ ] Profile and optimize CPU, GPU, and network usage

### Usability Testing
- [ ] Gather feedback on controls, UI clarity, and overall experience

## Phase 6: Documentation & Deployment (Weeks 15-16)

### Finalize Documentation
- [ ] Update README.md with final instructions
- [ ] Ensure code is well-commented

### Build Preparation
- [ ] Configure build settings for PC platforms (Windows, Mac, Linux)
- [ ] Configure build settings for Mobile platforms (iOS, Android)

### Deployment
- [ ] Create final builds
- [ ] (Optional: Outline deployment steps to specific platforms/stores)

## Technical Architecture

### Core Technologies
- **Frontend**: Unity 2022.3 LTS (C#)
- **Backend**: Node.js + Socket.io
- **Networking**: WebSocket-based real-time communication
- **Build Targets**: Windows, Android, iOS

### Key Design Principles
1. **Modularity**: Each mini-game is self-contained and pluggable
2. **Cross-Platform**: Identical gameplay across all platforms
3. **Ghost Multiplayer**: Non-colliding player representations
4. **AI-Assisted**: Heavy use of AI for code generation and assets
5. **Performance**: 60 FPS target with <200ms network latency

### Success Metrics
- [ ] All 6 mini-games fully functional
- [ ] Tournament mode working with 8 players
- [ ] Cross-platform multiplayer stable
- [ ] Performance targets met on target devices
- [ ] Modular architecture ready for expansion

## Risk Mitigation

### Technical Risks
- **Unity Mobile Performance**: Early testing on target devices
- **Network Latency**: Implement interpolation and prediction
- **Cross-Platform Sync**: Extensive testing across platforms

### Development Risks
- **AI Dependency**: Maintain human oversight and testing
- **Scope Creep**: Focus on core features first
- **Asset Creation**: Use placeholder assets initially

## Post-Launch Roadmap

### Version 1.1: Community Features
- [ ] Global leaderboards
- [ ] Friend system enhancements
- [ ] Chat functionality
- [ ] Achievement system

### Version 1.2: Content Expansion
- [ ] Additional mini-games
- [ ] Custom character system
- [ ] Seasonal events
- [ ] AI-generated content pipeline

### Version 2.0: Advanced Multiplayer
- [ ] Direct player interaction
- [ ] Real-time competitive modes
- [ ] Advanced networking features
- [ ] Spectator mode

---

## Implementation Status

### ✅ Phase 0: Project Setup & Foundation (COMPLETED)
- ✅ Environment Setup: Unity 2022.3 LTS project created with URP
- ✅ Version Control: Git repository initialized with feature branch workflow
- ✅ Project Structure: Unity project with assembly definitions (Core, Networking, UI, Tests, Editor)
- ✅ Core Dependencies: Node.js backend with Express and Socket.io
- ✅ AI Guidelines: Development rules established

### ✅ Phase 1: Core Systems & Hub Implementation (COMPLETED - Week 1-2)
- ✅ Basic Unity Scene Setup: Lobby scene created with LobbyManager
- ✅ Node.js Backend Basics: Express server with Socket.io on port 4000
- ✅ Main Menu/Hub UI: Basic lobby UI with Join/Create room buttons
- ✅ Lobby System: Room creation and joining logic implemented
- ✅ Basic Multiplayer Framework: Socket client stub with ping functionality
- ✅ Core Systems: Placeholder networking and UI systems
- ✅ CI/CD Pipeline: GitHub Actions workflow for backend tests and Unity builds
- ✅ Development Tooling: Husky hooks, Conventional Commits, automated releases

### ✅ Phase 2: First Mini-Game - Jetpack Joyride Clone (COMPLETED - Week 3-4)

**Achievements**:
- ✅ Unity scene with scrolling background and obstacle spawning
- ✅ Player controller with jetpack thrust physics
- ✅ PostgreSQL score submission API (`POST /api/score/jetpack`)
- ✅ Comprehensive Jest test suite for backend endpoints
- ✅ CI/CD matrix builds for both Lobby and Jetpack scenes
- ✅ Documentation in `docs/mini-games.md`

### 🚀 Phase 3: Ghost Multiplayer & Tournament Core (IN PROGRESS - Week 5-6)

**Current Status**: Tournament system and ghost multiplayer implemented with:
- ✅ TournamentService with round management and leaderboards
- ✅ Socket.IO events for tournament lifecycle (create, join, start, score submission)
- ✅ Ghost multiplayer position streaming between players
- ✅ Unity TournamentManager and enhanced SocketClient
- ✅ LobbyManager integration with tournament UI
- ✅ Comprehensive Jest test suite for tournament service (38 tests passing)

**Next**: Extend CI/CD, update docs, open Phase 3 PR.

---

**Total Estimated Timeline**: 16 weeks for v1.0
**Team**: 1 developer + AI assistance
**Development Style**: Rapid "vibe-coding" with frequent commits and clear changelog 