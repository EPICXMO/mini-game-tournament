import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { initializeDatabase, healthCheck } from './database.js';
import scoreRoutes from './routes/scoreRoutes.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

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
  path: '/socket'
});

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || "http://localhost:3000",
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/healthz', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.env.npm_package_version || '1.0.0'
  });
});

// API Routes
app.get('/api/status', async (req, res) => {
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
  
  // Handle disconnection
  socket.on('disconnect', (reason) => {
    console.log(`[Socket] Client disconnected: ${socket.id}, reason: ${reason}`);
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