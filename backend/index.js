const http = require('http');

let Server;
try {
  ({ Server } = require('socket.io'));
} catch (err) {
  console.warn('Socket.io not installed. Running without WebSocket support.');
}

const PORT = process.env.PORT || 3000;

const httpServer = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Mini Game Tournament Backend');
});

if (Server) {
  const io = new Server(httpServer, {
    cors: {
      origin: '*',
    },
  });

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });
}

httpServer.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
