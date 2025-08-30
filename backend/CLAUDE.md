# Backend Development Guide

Backend-specific Claude development information for the MiniGameHub server.

## 🔧 Backend Commands

### Development
- `npm run dev` - Start with nodemon (auto-restart on changes)
- `npm start` - Start production server
- `npm test` - Run Jest test suite (38 tests)
- `npm run lint` - ESLint code checking
- `npm run lint:fix` - Auto-fix linting issues
- `npm run format` - Prettier code formatting

### Database
- `docker compose up -d` - Start PostgreSQL container
- `docker compose down` - Stop database
- Database: postgresql://postgres:gamepass123@localhost:5432/minigamehub
- Admin UI: `docker exec -it backend-postgres-1 psql -U postgres -d minigamehub`

### API Testing
```bash
# Health check
curl http://localhost:5000/healthz

# Database status
curl http://localhost:5000/api/status

# Submit score
curl -X POST http://localhost:5000/api/score/jetpack \
  -H "Content-Type: application/json" \
  -d '{"score":1000,"distance":500,"coins":10}'

# Get leaderboard
curl http://localhost:5000/api/score/jetpack/leaderboard
```

## 📁 Backend File Structure

```
src/
├── server.js           # Main entry point & Express setup
├── database.js         # PostgreSQL connection & queries
├── routes/             # API endpoints
│   ├── scoreRoutes.js  # Score submission & leaderboards
│   └── statusRoutes.js # Health & status checks
├── services/           # Business logic
│   ├── socketService.js     # Socket.IO handlers
│   └── tournamentService.js # Tournament management
└── middleware/         # Express middleware
    └── cors.js         # CORS configuration
```

## 🎯 Key APIs

### Score Management
- `POST /api/score/:gameId` - Submit game score
- `GET /api/score/:gameId/leaderboard` - Get top scores
- `GET /api/score/:gameId/stats` - Game statistics

### Real-time Features
- Socket.IO on `/socket` endpoint
- Tournament events: `tournament:created`, `tournament:updated`, `tournament:completed`
- Player events: `player:joined`, `player:left`, `player:score-submitted`

## 🧪 Testing Patterns

### Unit Tests Structure
```javascript
describe('API Endpoint', () => {
  beforeEach(() => {
    // Setup mock database
  });
  
  it('should handle success case', async () => {
    // Test implementation
  });
  
  it('should handle error case', async () => {
    // Error testing
  });
});
```

### Mocking Database
- Database calls are mocked in tests
- No real database connection needed for testing
- Tests focus on logic, not database integration

## 🔧 Backend Architecture

### Key Dependencies
- **Express 4.18** - Web framework
- **Socket.IO 4.8** - Real-time communication
- **pg 8.11** - PostgreSQL client
- **helmet 7.1** - Security middleware
- **cors 2.8** - CORS handling

### Design Patterns
- **Service Layer** - Business logic in `/services`
- **Route Handlers** - Thin controllers in `/routes`
- **Database Layer** - Centralized in `database.js`
- **Error Handling** - Consistent try-catch patterns
- **Environment Config** - Dotenv for settings

### Security
- Helmet for security headers
- CORS configuration for cross-origin requests
- Input validation on all endpoints
- Environment-based database credentials

## ⚠️ Backend-Specific Notes

### ES Modules
- Uses `"type": "module"` in package.json
- Import/export syntax throughout
- Jest requires `cross-env NODE_OPTIONS=--experimental-vm-modules`

### Database Schema
```sql
-- Scores table
CREATE TABLE scores (
  id SERIAL PRIMARY KEY,
  game_id VARCHAR(50) NOT NULL,
  score INTEGER NOT NULL,
  distance INTEGER DEFAULT 0,
  coins INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tournaments table  
CREATE TABLE tournaments (
  id VARCHAR(100) PRIMARY KEY,
  room_id VARCHAR(100) NOT NULL,
  status VARCHAR(20) DEFAULT 'waiting',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Environment Variables
```bash
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=minigamehub
DB_USER=postgres
DB_PASSWORD=gamepass123

# Server
PORT=5000
NODE_ENV=development
```

## 🚀 Development Workflow

1. **Start Database**: `docker compose up -d`
2. **Install Dependencies**: `npm install`
3. **Start Development**: `npm run dev`
4. **Run Tests**: `npm test`
5. **Check Code Quality**: `npm run lint`
6. **Format Code**: `npm run format`

When implementing new features:
- Add routes in `/routes`
- Implement business logic in `/services`
- Add database queries to `database.js`
- Write tests alongside implementation
- Update API documentation if needed