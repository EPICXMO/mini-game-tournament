const { startServer, closeServer, httpServer } = require('../index');

describe('server', () => {
  test('starts and listens on a port', async () => {
    await startServer(0); // let OS assign a free port
    const addr = httpServer.address();
    expect(addr && addr.port).toBeGreaterThan(0);
    await closeServer();
  });
});
