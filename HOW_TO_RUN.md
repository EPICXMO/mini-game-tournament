# 🚀 How to Run the Mini-Game Tournament

This guide provides step-by-step instructions to get the Mini-Game Tournament project running on your system.

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js 20+** - [Download from nodejs.org](https://nodejs.org/)
- **npm** (comes with Node.js)
- **Git** - [Download from git-scm.com](https://git-scm.com/)
- **Unity 2022.3.21f1 LTS** - [Download from unity.com](https://unity.com/download) (for Unity development)
- **Docker** (optional, for database) - [Download from docker.com](https://www.docker.com/)

## 🎯 Quick Start (Recommended)

1. **Clone the repository:**
   ```bash
   git clone https://github.com/EPICXMO/mini-game-tournament.git
   cd mini-game-tournament
   ```

2. **Run the startup script:**
   ```bash
   ./start.sh
   ```
   
   Follow the prompts to choose your preferred setup:
   - **Option 1**: With Docker (includes PostgreSQL database) - **Recommended**
   - **Option 2**: Without Docker (backend only, no database)
   - **Option 3**: Development mode (with nodemon for auto-restart)

## 🐳 Method 1: Docker Setup (Recommended)

This method includes PostgreSQL database and is the easiest way to get everything running.

```bash
# 1. Clone and navigate to project
git clone https://github.com/EPICXMO/mini-game-tournament.git
cd mini-game-tournament

# 2. Install root dependencies
npm install

# 3. Navigate to backend and start with Docker
cd backend
docker compose up -d

# 4. Check if everything is running
docker compose ps
```

**Services will be available at:**
- 🌐 Backend API: http://localhost:4000
- 🏥 Health Check: http://localhost:4000/healthz
- 📊 API Status: http://localhost:4000/api/status
- 🎮 Jetpack Scores: http://localhost:4000/api/score/jetpack
- 🗄️ PostgreSQL: localhost:5432 (user: postgres, password: password, db: minigamehub)

**Useful Docker commands:**
```bash
# View logs
docker compose logs -f

# Stop services
docker compose down

# Restart services
docker compose restart

# View only backend logs
docker compose logs -f server
```

## 🔧 Method 2: Manual Setup (Without Docker)

If you don't have Docker or prefer to run components separately:

```bash
# 1. Clone and install dependencies
git clone https://github.com/EPICXMO/mini-game-tournament.git
cd mini-game-tournament
npm install

# 2. Setup backend
cd backend
cp env.example .env

# 3. Start backend server
npm run dev
```

**Note:** Without Docker, database features won't work, but the API will still function and return appropriate error messages for database operations.

## 🎮 Unity Setup

1. **Open Unity Hub**
2. **Add Project**: Click "Add" and navigate to `unity/MiniGameHub/`
3. **Open Project**: Select Unity 2022.3.21f1 LTS when prompted
4. **Open Lobby Scene**: Navigate to `Assets/Scenes/Lobby.unity`
5. **Configure Server URL**: In the SocketClient component, set the server URL to match your backend (e.g., `http://localhost:4000`)
6. **Press Play** to test the connection

## 🧪 Testing the Setup

### Backend API Testing

1. **Health Check:**
   ```bash
   curl http://localhost:4000/healthz
   ```

2. **API Status:**
   ```bash
   curl http://localhost:4000/api/status
   ```

3. **Submit a Score:**
   ```bash
   curl -X POST http://localhost:4000/api/score/jetpack \
     -H "Content-Type: application/json" \
     -d '{"score":1000,"distance":500,"coins":10}'
   ```

4. **Get Leaderboard:**
   ```bash
   curl http://localhost:4000/api/score/jetpack/leaderboard
   ```

### Development Commands

```bash
# Run tests
npm test

# Run linter
npm run lint

# Fix linting issues
npm run lint:fix

# Format code
npm run format
```

## 🏗️ Building Unity Project

### For Desktop (PC/Mac/Linux):
1. Open Unity project
2. Go to **File → Build Settings**
3. Select **PC, Mac & Linux Standalone**
4. Choose your target platform
5. Click **Build**

### For Mobile:
- **Android**: Requires Android SDK setup through Unity Hub
- **iOS**: Requires macOS and Xcode

## 🔧 Development Workflow

1. **Start backend in development mode:**
   ```bash
   cd backend && npm run dev
   ```

2. **Open Unity project and press Play**

3. **The lobby will automatically connect to the backend**

## 📊 Project Structure

```
mini-game-tournament/
├── backend/                 # Node.js backend server
│   ├── src/                # Source code
│   ├── database/           # Database schemas
│   ├── scripts/            # Utility scripts
│   └── docker-compose.yml  # Docker configuration
├── unity/MiniGameHub/      # Unity project
│   ├── Assets/             # Unity assets
│   └── ProjectSettings/    # Unity project settings
├── docs/                   # Documentation
├── start.sh               # Quick start script
└── README.md              # Main documentation
```

## 🐛 Troubleshooting

### Common Issues:

1. **Port 4000 already in use:**
   - Stop other services: `docker compose down`
   - Or use a different port: `PORT=4001 npm run dev`

2. **Database connection failed:**
   - Ensure Docker is running: `docker ps`
   - Restart containers: `docker compose restart`
   - Check logs: `docker compose logs postgres`

3. **Unity can't connect to backend:**
   - Verify backend is running on the correct port
   - Check SocketClient component URL in Unity
   - Ensure CORS is configured correctly

4. **ESLint errors:**
   - Run: `npm run lint:fix`
   - Check `.eslintrc.json` configuration

### Getting Help:

- Check the logs: `docker compose logs -f`
- Review the API status: `curl http://localhost:4000/api/status`
- Run tests: `npm test`
- Check Unity console for errors

## 🎯 Next Steps

Once everything is running:

1. **Play the Jetpack mini-game** in Unity
2. **Submit scores** and see them in the leaderboard
3. **Explore the codebase** to understand the architecture
4. **Add new features** following the development guidelines

## 📞 Support

If you encounter any issues:

1. Check the troubleshooting section above
2. Review the logs for error messages
3. Ensure all prerequisites are properly installed
4. Verify network connectivity and port availability

---

🎮 **Happy Gaming!** The Mini-Game Tournament is ready to play!