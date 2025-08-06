# Architecture Overview

## System Architecture

The MiniGameHub follows a **client-server architecture** with real-time multiplayer capabilities:

```
┌─────────────────┐    WebSocket/HTTP    ┌──────────────────┐
│                 │ ◄─────────────────► │                  │
│  Unity Client   │                     │  Node.js Server  │
│  (C# + URP)     │                     │  (Express +      │
│                 │                     │   Socket.io)     │
└─────────────────┘                     └──────────────────┘
                                                 │
                                                 ▼
                                        ┌──────────────────┐
                                        │   PostgreSQL     │
                                        │   Database       │
                                        └──────────────────┘
```

## Unity Client Architecture

### Assembly Structure
- **MiniGameHub.Core**: Core game systems, managers, utilities
- **MiniGameHub.Networking**: Socket.io client, multiplayer sync
- **MiniGameHub.UI**: User interface, lobby, menus
- **MiniGameHub.Tests**: Unit tests and integration tests
- **MiniGameHub.Editor**: Build scripts, development tools

### Key Components
1. **LobbyManager**: Handles lobby UI and room management
2. **SocketClient**: WebSocket communication with server
3. **GameManager**: Coordinates mini-game lifecycle
4. **NetworkSync**: Synchronizes player positions and game state

## Backend Architecture

### Service Structure
- **Express Server**: REST API endpoints and middleware
- **Socket.io Server**: Real-time WebSocket communication
- **Room Manager**: Game room creation and management
- **Player Manager**: Player session and state management

### Key Endpoints
- `GET /healthz`: Health check
- `GET /api/status`: Server status and metrics
- `WS /socket`: WebSocket connection for real-time communication

## Data Flow

### Room Creation Flow
1. Player clicks "Create Room" in Unity
2. Unity sends `create_room` event via Socket.io
3. Server generates unique room ID
4. Server responds with room details
5. Player joins the created room

### Multiplayer Sync Flow
1. Player performs action in Unity (move, jump, etc.)
2. Unity sends position update via Socket.io
3. Server broadcasts to all players in room
4. Other clients receive update and render ghost player

## Deployment Architecture

### Development
- Unity Editor for client development
- Local Node.js server for backend
- Docker Compose for database services

### Production (Planned)
- Unity builds deployed to app stores
- Node.js server on cloud platform (AWS/Azure/GCP)
- PostgreSQL managed database
- Redis for session management
- CDN for static assets

## Security Considerations

### Client Security
- Input validation on all user actions
- Rate limiting on network requests
- Secure WebSocket connections (WSS in production)

### Server Security
- Helmet.js for security headers
- CORS protection
- Request rate limiting
- SQL injection prevention with parameterized queries
- Authentication tokens (planned for Phase 3)

## Performance Targets

### Client Performance
- **60 FPS** on target devices (mid-tier Android, PC)
- **<100ms** input latency for local actions
- **<50MB** memory usage on mobile

### Network Performance
- **<200ms** network latency for multiplayer sync
- **20Hz** update rate for player positions
- **<1KB/s** bandwidth per player for ghost sync

### Server Performance
- **<50ms** response time for API endpoints
- **1000+** concurrent WebSocket connections
- **99.9%** uptime target

## Scalability Plan

### Horizontal Scaling
- Stateless server design for easy scaling
- Load balancer for multiple server instances
- Redis for shared session state
- Database read replicas for scaling reads

### Vertical Scaling
- Optimize database queries and indexes
- Implement caching layers (Redis)
- Use connection pooling for database
- Compress WebSocket messages

## Monitoring & Observability

### Metrics (Planned)
- Server response times and error rates
- WebSocket connection counts and latency
- Database query performance
- Unity client FPS and memory usage

### Logging
- Structured logging with timestamps
- Error tracking and alerting
- Performance monitoring
- User action analytics

## Technology Decisions

### Why Unity?
- Cross-platform support (PC, Mobile, Console)
- Mature C# ecosystem
- Built-in physics and rendering
- Large community and documentation

### Why Node.js + Socket.io?
- Real-time WebSocket support
- JavaScript ecosystem familiarity
- Fast development iteration
- Good Unity integration options

### Why PostgreSQL?
- ACID compliance for data integrity
- JSON support for flexible schemas
- Excellent performance and reliability
- Strong ecosystem and tooling