// Basic Socket.io server for multiplayer communication
const http = require('http');
const { Server } = require('socket.io');

const port = process.env.PORT || 3000;
// Create HTTP server and bind Socket.io to it
const server = http.createServer();
const io = new Server(server, {
  cors: { origin: '*' }
});

io.on('connection', (socket) => {
  // Notify when a new client connects
  console.log('Client connected:', socket.id);

  // Handle client disconnects
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });

  // Simple test message echo for connectivity checks
  socket.on('test', (message) => {
    console.log('Received test message:', message);
    socket.emit('test', `Server echo: ${message}`);
  });
});

server.listen(port, () => {
  console.log(`Socket.io server running on port ${port}`);
});
