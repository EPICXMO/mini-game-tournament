import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { initializeDatabase, healthCheck } from './database.js';
import scoreRoutes from './routes/scoreRoutes.js';
import tournamentService from './services/tournamentService.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import compression from 'compression';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Create Express app
const app = express();
const server = createServer(app);

// Configure Socket.IO with CORS
const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true
  },
  path: '/socket',
  perMessageDeflate: { threshold: 1024 },
  maxHttpBufferSize: 1e6
});

// Middleware
app.disable('x-powered-by');
app.set('etag', 'strong');
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || "http://localhost:3000",
  credentials: true
}));
app.use(compression());
app.use(express.json({ limit: '64kb' }));
app.use(express.urlencoded({ extended: true, limit: '64kb' }));

// Health check endpoint
app.get('/healthz', (req, res) => {
  res.set('Cache-Control', 'no-store');
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.env.npm_package_version || '1.0.0'
  });
});

// API Routes
app.get('/api/status', async (req, res) => {
  res.set('Cache-Control', 'no-store');
  const dbHealth = await healthCheck();
  res.json({
    message: 'MiniGameHub Server is running',
    connectedClients: io.engine.clientsCount,
    timestamp: new Date().toISOString(),
    database: dbHealth
  });
});

// Score routes
app.use('/api/score', scoreRoutes);

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log(`[Socket] Client connected: ${socket.id}`);
  
  // Handle ping from clients
  socket.on('ping', (data) => {
    console.log(`[Socket] Ping received from ${socket.id}:`, data);
    socket.emit('pong', {
      message: 'Pong from server',
      timestamp: new Date().toISOString(),
      clientId: socket.id
    });
  });
  
  // Handle room creation
  socket.on('create_room', (data) => {
    console.log(`[Socket] Create room request from ${socket.id}:`, data);
    const roomId = `room_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    socket.join(roomId);
    socket.emit('room_created', {
      roomId,
      roomName: data.roomName || 'New Room',
      playerId: socket.id,
      timestamp: new Date().toISOString()
    });
    
    console.log(`[Socket] Room created: ${roomId} by ${socket.id}`);
  });
  
  // Handle room joining
  socket.on('join_room', (data) => {
    console.log(`[Socket] Join room request from ${socket.id}:`, data);
    const { roomId } = data;
    
    if (roomId) {
      socket.join(roomId);
      socket.to(roomId).emit('player_joined', {
        playerId: socket.id,
        timestamp: new Date().toISOString()
      });
      
      socket.emit('room_joined', {
        roomId,
        playerId: socket.id,
        timestamp: new Date().toISOString()
      });
      
      console.log(`[Socket] Player ${socket.id} joined room: ${roomId}`);
    } else {
      socket.emit('error', { message: 'Room ID is required' });
    }
  });

  // Tournament Management
  socket.on('create_tournament', (data) => {
    try {
      const { roomId, settings } = data;
      const tournament = tournamentService.createTournament(roomId, settings);
      
      socket.emit('tournament_created', {
        tournament: {
          id: tournament.id,
          roomId: tournament.roomId,
          status: tournament.status,
          maxRounds: tournament.maxRounds,
          settings: tournament.settings
        }
      });
      
      // Notify room members
      socket.to(roomId).emit('tournament_available', {
        tournamentId: tournament.id,
        createdBy: socket.id
      });
    } catch (error) {
      socket.emit('tournament_error', { message: error.message });
    }
  });

  socket.on('join_tournament', (data) => {
    try {
      const { tournamentId, playerName } = data;
      const player = tournamentService.addPlayer(tournamentId, socket.id, { name: playerName });
      const tournament = tournamentService.getTournament(tournamentId);
      
      socket.emit('tournament_joined', {
        player,
        tournament: {
          id: tournament.id,
          status: tournament.status,
          playerCount: tournament.players.size
        }
      });
      
      // Notify other players
      socket.to(tournament.roomId).emit('player_joined_tournament', {
        player: {
          id: player.id,
          name: player.name
        },
        playerCount: tournament.players.size
      });
    } catch (error) {
      socket.emit('tournament_error', { message: error.message });
    }
  });

  socket.on('start_tournament', (data) => {
    try {
      const { tournamentId } = data;
      const tournament = tournamentService.startTournament(tournamentId);
      
      // Notify all players in the room
      io.to(tournament.roomId).emit('tournament_started', {
        tournamentId: tournament.id,
        currentRound: tournament.currentRound,
        maxRounds: tournament.maxRounds,
        game: tournament.rounds[0].game
      });
    } catch (error) {
      socket.emit('tournament_error', { message: error.message });
    }
  });

  // Ghost Multiplayer - Position Updates (throttled)
  socket.on('player_position', (data) => {
    const now = Date.now();
    const minInterval = parseInt(process.env.POSITION_BROADCAST_INTERVAL_MS || '50', 10);
    if (socket.data.lastGhostEmitAt && now - socket.data.lastGhostEmitAt < minInterval) {
      return;
    }
    socket.data.lastGhostEmitAt = now;

    const { position } = data;
    const updated = tournamentService.updatePlayerPosition(socket.id, position);
    
    if (updated) {
      const playerData = tournamentService.getPlayer(socket.id);
      if (playerData) {
        const tournament = tournamentService.getTournament(playerData.tournamentId);
        if (tournament) {
          // Broadcast position to other players in the room (ghost data)
          socket.to(tournament.roomId).emit('ghost_position', {
            playerId: socket.id,
            position,
            timestamp: now
          });
        }
      }
    }
  });

  // Score Submission
  socket.on('submit_score', (data) => {
    try {
      const { score } = data;
      const submitted = tournamentService.submitRoundScore(socket.id, score);
      
      if (submitted) {
        const playerData = tournamentService.getPlayer(socket.id);
        const tournament = tournamentService.getTournament(playerData.tournamentId);
        
        socket.emit('score_submitted', {
          score,
          totalScore: tournament.players.get(socket.id).totalScore,
          round: tournament.currentRound
        });
        
        // Broadcast score update to room
        socket.to(tournament.roomId).emit('player_score_update', {
          playerId: socket.id,
          score,
          totalScore: tournament.players.get(socket.id).totalScore,
          round: tournament.currentRound
        });
        
        // Send updated leaderboard to all players
        const leaderboard = tournament.leaderboard;
        io.to(tournament.roomId).emit('leaderboard_update', {
          leaderboard,
          round: tournament.currentRound
        });
      }
    } catch (error) {
      socket.emit('score_error', { message: error.message });
    }
  });

  // Get Tournament State
  socket.on('get_tournament_state', (data) => {
    try {
      const { tournamentId } = data;
      const tournament = tournamentService.getTournament(tournamentId);
      
      if (tournament) {
        socket.emit('tournament_state', {
          tournament: {
            id: tournament.id,
            status: tournament.status,
            currentRound: tournament.currentRound,
            maxRounds: tournament.maxRounds,
            playerCount: tournament.players.size
          },
          leaderboard: tournament.leaderboard,
          ghostData: tournamentService.getGhostData(tournamentId)
        });
      } else {
        socket.emit('tournament_error', { message: 'Tournament not found' });
      }
    } catch (error) {
      socket.emit('tournament_error', { message: error.message });
    }
  });
  
  // Handle disconnection
  socket.on('disconnect', (reason) => {
    console.log(`[Socket] Client disconnected: ${socket.id}, reason: ${reason}`);
    
    // Remove player from tournament if they were in one
    const playerData = tournamentService.getPlayer(socket.id);
    if (playerData) {
      const tournament = tournamentService.getTournament(playerData.tournamentId);
      if (tournament && tournament.status === 'waiting') {
        tournamentService.removePlayer(playerData.tournamentId, socket.id);
        
        // Notify other players
        socket.to(tournament.roomId).emit('player_left_tournament', {
          playerId: socket.id,
          playerCount: tournament.players.size
        });
      }
    }
  });
  
  // Handle errors
  socket.on('error', (error) => {
    console.error(`[Socket] Socket error for ${socket.id}:`, error);
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not found',
    message: `Route ${req.originalUrl} not found`
  });
});

// Start server
const PORT = process.env.PORT || 4000;
const HOST = process.env.HOST || '0.0.0.0';

async function startServer() {
  // Initialize database
  const dbInitialized = await initializeDatabase();
  if (!dbInitialized && process.env.NODE_ENV !== 'test') {
    console.warn('⚠️  Database initialization failed, but server will continue');
  }

  server.listen(PORT, HOST, () => {
    console.log(`🚀 MiniGameHub Server started on ${HOST}:${PORT}`);
    console.log(`📡 Socket.IO endpoint: ws://${HOST}:${PORT}/socket`);
    console.log(`🏥 Health check: http://${HOST}:${PORT}/healthz`);
    console.log(`📊 API status: http://${HOST}:${PORT}/api/status`);
    console.log(`🎮 Jetpack scores: http://${HOST}:${PORT}/api/score/jetpack`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  });
}

startServer().catch(error => {
  console.error('Failed to start server:', error);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

export default app;