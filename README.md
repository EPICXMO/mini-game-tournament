# AI Multiplayer Mini-Game Tournament

A cross-platform multiplayer hub featuring 6 classic-inspired mini-games with tournament mode, built with AI assistance and Unity.

## 🎮 Vision

**Party Royale** is a hub-and-spoke multiplayer game where friends gather in an interactive lobby and jump into quick arcade-style mini-games. Players can compete in structured tournaments or play casual rounds, with seamless cross-platform multiplayer between PC and mobile devices.

## ✨ Features

### 🏆 Tournament Mode
- **5, 10, 15, or 20 round tournaments** (10 rounds default)
- **Random mini-game selection** each round
- **Live leaderboards** between rounds
- **Cumulative scoring** system
- **Rematch functionality**

### 🎯 Mini-Games (v1.0)
1. **Jetpack Joyride Clone** - Endless side-scrolling flyer
2. **Subway Surfers Clone** - 3-lane endless runner
3. **Geometry Dash Clone** - Rhythm-based platformer
4. **Chrome Dino Runner Clone** - Simple endless runner
5. **Space Dodger** - 2D space shooter
6. **Bubble Shooter** - Color-matching puzzle game

### 🌐 Multiplayer Features
- **Ghost player system** - See other players as translucent avatars
- **Real-time synchronization** - <200ms latency target
- **Cross-platform play** - PC and mobile players together
- **Bot auto-fill** - AI players fill empty slots
- **Up to 8 concurrent players** per match

### 🎨 Lobby & Social
- **Interactive 3D/2D lobby** with game portals
- **Friend invite system** and matchmaking
- **Easter egg mini-games** in the lobby
- **Customizable avatars** and themes
- **Settings & accessibility** options

## 🛠️ Technology Stack

- **Frontend**: Unity 2022.3 LTS (C#)
- **Backend**: Node.js + Socket.io
- **Networking**: WebSocket-based real-time communication
- **Build Targets**: Windows, Android, iOS
- **Development**: AI-assisted "vibe-coding" approach

## 🚀 Getting Started

### Prerequisites
- Unity 2022.3 LTS or later
- Node.js 18+ and npm
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/<my-user>/party-royale.git
   cd party-royale
   ```

2. **Set up the backend**
   ```bash
   cd backend
   npm install
   npm start
   ```

3. **Open Unity project**
   - Open Unity Hub
   - Add the `unity_project/` folder as a project
   - Open the project in Unity

4. **Configure build settings**
   - Set up Android SDK (for mobile builds)
   - Configure iOS build settings (if targeting iOS)
   - Set up Windows build target

### Development Workflow

This project follows a **"vibe-coding"** approach with AI assistance:

1. **Feature Development**: Describe requirements to AI, get implementation
2. **Rapid Iteration**: Test and refine in quick cycles
3. **Modular Design**: Each mini-game is self-contained
4. **Clear Changelog**: Every change documented in `CHANGELOG.md`

## 📁 Project Structure

```
party-royale/
├── unity_project/          # Unity game client
│   ├── Assets/
│   │   ├── Scripts/        # C# game logic
│   │   ├── Prefabs/        # Reusable game objects
│   │   ├── Scenes/         # Game scenes
│   │   └── MiniGames/      # Individual mini-game modules
│   └── ProjectSettings/    # Unity configuration
├── backend/                # Node.js server
│   ├── src/               # Server source code
│   └── package.json       # Node.js dependencies
├── docs/                  # Documentation
├── logs/                  # Development conversation logs
├── roadmap.md            # Development roadmap
└── CHANGELOG.md          # Version history
```

## 🎯 Development Roadmap

See [roadmap.md](roadmap.md) for detailed development phases:

- **Phase 1**: Foundation & Core Systems (Weeks 1-2)
- **Phase 2**: First Mini-Game - Jetpack Joyride Clone (Weeks 3-4)
- **Phase 3**: Tournament System & Leaderboard (Weeks 5-6)
- **Phase 4**: Additional Mini-Games (Weeks 7-12)
- **Phase 5**: Easter Eggs & Polish (Weeks 13-14)
- **Phase 6**: Testing & Deployment (Weeks 15-16)

## 🎮 Game Design Principles

### Core Mechanics
- **Faithful replication** of classic game mechanics (~95% accuracy)
- **Simple controls** that work on both PC and mobile
- **Score = Distance + Coins** (standardized across games)
- **Procedural generation** with shared random seeds for fairness

### Multiplayer Design
- **Ghost players** - No direct collision between players
- **Score-based competition** - Skill and luck determine winners
- **Synchronized environments** - Same obstacles for all players
- **Spectate mode** - Watch after elimination

### Cross-Platform
- **Identical gameplay** across all platforms
- **Adaptive controls** - Keyboard/touch/gamepad support
- **Responsive UI** - Scales to different screen sizes
- **Performance targets** - 60 FPS on mid-tier devices

## 🎨 Art & Assets

- **AI-generated assets** - Created with AI assistance
- **Copyright-free** - All original or properly licensed content
- **Modular themes** - Easy to swap visual styles
- **Customization support** - User-provided assets welcome

## 🤖 AI-Assisted Development

This project showcases AI-driven game development:

- **Code generation** - AI writes boilerplate and game logic
- **Asset creation** - AI generates graphics and audio
- **Design suggestions** - AI proposes mechanics and features
- **Rapid prototyping** - Quick iteration cycles

## 📊 Performance Targets

- **Frame Rate**: 60 FPS on target devices
- **Network Latency**: <200ms for player synchronization
- **Platform Support**: Windows PC, Android, iOS
- **Player Count**: Up to 8 concurrent players
- **File Size**: <100MB per platform (use Git LFS for larger assets)

## 🐛 Known Issues & Limitations

- **Phase 1 multiplayer** uses ghost system (no direct interaction)
- **Asset pipeline** in development (placeholder assets initially)
- **Mobile optimization** ongoing
- **Advanced networking** planned for v2.0

## 🤝 Contributing

This is a solo project with AI assistance, but feedback and suggestions are welcome:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🎯 Future Plans

### Version 1.1: Community Features
- Global leaderboards
- Enhanced friend system
- Chat functionality
- Achievement system

### Version 1.2: Content Expansion
- Additional mini-games
- Custom character system
- Seasonal events
- AI-generated content pipeline

### Version 2.0: Advanced Multiplayer
- Direct player interaction
- Real-time competitive modes
- Advanced networking features
- Spectator mode

## 📞 Support

For questions, issues, or suggestions:
- Check the [roadmap.md](roadmap.md) for development status
- Review the [CHANGELOG.md](CHANGELOG.md) for recent changes
- Open an issue on GitHub

---

**Built with ❤️ and AI assistance** 