# AI Multiplayer Mini-Game Tournament - Claude Development Guide

This repository follows **AI-assisted development** patterns with Claude Code. This file contains essential information for effective coding assistance.

## 🔧 Common Commands

### Development
- `npm run dev` - Start backend in development mode with nodemon
- `npm test` - Run all backend tests (Jest)
- `npm run lint` - Check code style with ESLint
- `npm run lint:fix` - Auto-fix linting issues
- `npm run format` - Format code with Prettier
- `./start.sh` - Quick start script with Docker options

### Database
- `cd backend && docker compose up -d` - Start PostgreSQL with Docker
- `cd backend && docker compose down` - Stop database containers
- Database runs on port 5432, API on port 5000

### Unity
- Open `unity/MiniGameHub/` in Unity Hub
- Use Unity 2022.3.21f1 LTS
- Main scene: `Assets/Scenes/Lobby.unity`

### Git Workflow
- `npm run commit` - Use conventional commits with Commitizen
- Commit types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`
- Example: `feat: add new mini-game scoreboard`

## 📁 Key Files & Structure

### Backend (Node.js + Express + Socket.IO)
- `backend/src/server.js` - Main server entry point
- `backend/src/routes/` - API routes (scoreRoutes.js, statusRoutes.js)
- `backend/src/services/` - Business logic (tournamentService.js, socketService.js)
- `backend/src/database.js` - PostgreSQL connection and queries
- `backend/src/middleware/` - Express middleware
- `backend/docker-compose.yml` - Database containerization

### Frontend (Unity C#)
- `unity/MiniGameHub/Assets/Scripts/` - Game logic
- `unity/MiniGameHub/Assets/Scenes/` - Unity scenes
- `unity/MiniGameHub/Assets/Prefabs/` - Reusable components

### Configuration & Documentation
- `package.json` - Root workspace configuration
- `backend/package.json` - Backend dependencies
- `AI Development Rules (rules.md).txt` - AI coding guidelines
- `docs/prd_v1.29.md` - Comprehensive design document
- `HOW_TO_RUN.md` - Setup instructions
- `PROJECT_STATUS.md` - Current project state

## 🎨 Code Style Guidelines

### JavaScript/Node.js (Backend)
- **ES Modules**: Use `import/export` syntax, not CommonJS `require`
- **Destructuring**: `import { foo } from 'bar'` when possible
- **Async/Await**: Prefer over Promises for async operations
- **Error Handling**: Always use try-catch blocks for async operations
- **JSDoc**: Document complex functions and APIs
- **Single Responsibility**: Keep functions focused and small

### C# (Unity Frontend)
- **PascalCase**: For classes, methods, and public properties
- **camelCase**: For private fields and local variables
- **XML Documentation**: Document public APIs
- **SOLID Principles**: Follow object-oriented design patterns
- **Unity Conventions**: Use Unity's naming and structure patterns

### General
- **No Placeholders**: Always implement full functionality, avoid `// TODO` comments
- **Clear Comments**: Explain complex logic and business rules
- **Consistent Formatting**: Use Prettier/Unity formatter
- **Meaningful Names**: Use descriptive variable and function names

## 🧪 Testing Instructions

### Backend Testing
- **Run Tests**: `npm test` (38 tests should pass)
- **Test Structure**: Tests in `src/**/*.test.js` files
- **Mocking**: Database operations are mocked in tests
- **Coverage**: Focus on API endpoints and business logic
- **Integration**: Tests include Socket.IO and Express route testing

### Manual Testing
```bash
# Health check
curl http://localhost:5000/healthz

# API status  
curl http://localhost:5000/api/status

# Submit score
curl -X POST http://localhost:5000/api/score/jetpack \
  -H "Content-Type: application/json" \
  -d '{"score":1000,"distance":500,"coins":10}'

# Get leaderboard
curl http://localhost:5000/api/score/jetpack/leaderboard
```

### Unity Testing
- **Play Mode**: Test in Unity editor play mode
- **Build Testing**: Regular builds for target platforms
- **Network Testing**: Test with backend running locally

## 🔄 AI-Assisted Development Workflow

This project uses **"vibe coding"** - AI-driven rapid prototyping:

### Development Process
1. **Describe Feature**: Natural language requirement description
2. **AI Implementation**: Claude generates code following project patterns
3. **Test & Iterate**: Quick cycles of testing and refinement
4. **Document Changes**: Update CHANGELOG.md and commit with clear messages

### AI Guidelines Reference
- Follow `AI Development Rules (rules.md).txt` strictly
- Implement features from `docs/prd_v1.29.md` requirements
- Use modular design for extensibility
- Prioritize code modification over rewriting
- Ask for clarification on ambiguous requirements

### Key Patterns
- **Incremental Development**: Complete one feature fully before starting next
- **Modular Components**: Base classes/interfaces for mini-games
- **Configuration-Driven**: Use JSON/ScriptableObjects for game settings
- **Error Resilience**: Robust error handling for network operations

## 📊 Project Context

### Current Status
- **Backend**: ✅ Fully functional with PostgreSQL integration
- **API**: ✅ Score submission, leaderboards, tournament management
- **Tests**: ✅ 38 passing tests, zero linting errors
- **Database**: ✅ Docker containerization working
- **Unity**: ✅ Basic lobby scene and Jetpack mini-game

### Architecture
- **Ghost Multiplayer**: Players don't collide, score-based competition
- **Cross-Platform**: PC and mobile support planned
- **Real-time**: Socket.IO for live tournament updates
- **Scalable**: Microservices-ready architecture

### Dependencies
- **Backend**: Express 4.18, Socket.IO 4.8, PostgreSQL (pg 8.11)
- **Testing**: Jest 29.7, Supertest 6.3
- **Tooling**: ESLint, Prettier, Nodemon, Husky
- **Unity**: 2022.3.21f1 LTS

## ⚠️ Important Notes

### Database Connection
- Tests mock database calls (no real DB needed for testing)
- Development requires PostgreSQL via Docker
- Connection details in `backend/.env` (see `env.example`)

### Environment Setup
- **Node.js**: v20+ required
- **Docker**: Required for database (recommended setup)
- **Unity**: 2022.3.21f1 LTS for frontend development

### Special Considerations
- **ES Modules**: Backend uses `"type": "module"` in package.json
- **Cross-env**: Required for Jest testing with ES modules
- **Socket.IO**: Handles real-time multiplayer communication
- **AI-First**: This project is designed for AI-assisted development

### Repository Etiquette
- **Conventional Commits**: Use `npm run commit` for standardized messages
- **Small PRs**: Focus on single features or fixes
- **Documentation**: Update relevant docs with code changes
- **Testing**: Ensure tests pass before committing
- **AI Guidelines**: Follow the established AI development rules

## 🎯 Quick Reference

When working on this project:
1. **Read the PRD**: `docs/prd_v1.29.md` contains all requirements
2. **Follow AI Rules**: Implement according to `AI Development Rules (rules.md).txt`
3. **Test Early**: Run `npm test` frequently during development
4. **Use Docker**: `./start.sh` for quick environment setup
5. **Document Changes**: Update CHANGELOG.md and commit properly
6. **Incremental Approach**: Complete features fully before moving on

This project showcases AI-driven game development - use Claude's capabilities to rapidly implement features while maintaining code quality and following established patterns.