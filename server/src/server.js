const http = require('http');
const app = require('./app');
const connectDB = require('./config/db');
const { Server } = require('socket.io');
const { initializeSocket } = require('./socket/socketHandler');

const PORT = process.env.PORT || 5000;

// Share a single HTTP server instance so Socket.io can handle WebSocket upgrades on the same port.
const httpServer = http.createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
    methods: ['GET', 'POST']
  }
});

initializeSocket(io);

const startServer = async () => {
  try {
    // Establish DB connectivity before accepting HTTP/WebSocket traffic.
    await connectDB();

    httpServer.listen(PORT, () => {
      console.log(`[Server] Listening on http://localhost:${PORT} (${process.env.NODE_ENV || 'development'})`);
    });
  } catch (error) {
    console.error(`[Startup Error] ${error.message}`);
    process.exit(1);
  }
};

startServer();
