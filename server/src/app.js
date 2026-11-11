const dotenv = require('dotenv');

// Load environment variables before importing modules that read process.env.
dotenv.config();

const express = require('express');
const cors = require('cors');

const roomRoutes = require('./routes/roomRoutes');
const executeRoutes = require('./routes/executeRoutes');
const debugRoutes = require('./routes/debugRoutes');

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
  })
);

app.use(express.json());

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime())
  });
});

app.use('/api/rooms', roomRoutes);
app.use('/api/execute', executeRoutes);
app.use('/api/debug', debugRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: `Cannot ${req.method} ${req.originalUrl} - Route not found on this server.`
  });
});

// 4-arg signature required by Express to treat this as error-handling middleware.
app.use((err, req, res, next) => {
  console.error('[Unhandled Error]', err.stack || err.message);

  const statusCode = err.status || err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    error: err.message || 'Internal Server Error'
  });
});

module.exports = app;
