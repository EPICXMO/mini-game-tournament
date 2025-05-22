const http = require('http');
const { Server } = require('socket.io');

const httpServer = http.createServer();
const io = new Server(httpServer);

function startServer(port = process.env.PORT || 3000) {
  return new Promise((resolve, reject) => {
    httpServer.listen(port, () => resolve(httpServer));
    httpServer.on('error', reject);
  });
}

function closeServer() {
  return new Promise((resolve, reject) => {
    httpServer.close(err => (err ? reject(err) : resolve()));
  });
}

if (require.main === module) {
  startServer().then(server => {
    console.log(`Server listening on port ${server.address().port}`);
  });
}

module.exports = { startServer, closeServer, httpServer };
