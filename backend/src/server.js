require('dotenv').config();
const app = require('./app');
const { verifyConnection } = require('./config/db');
const logger = require('./utils/logger');

const PORT = process.env.PORT || 4000;

async function start() {
  try {
    await verifyConnection();
    logger.info('Database connection verified');
  } catch (err) {
    logger.error('Failed to connect to the database on boot', { error: err.message });
    process.exit(1); // fail fast — a running server with no DB is worse than no server
  }

  const server = app.listen(PORT, () => {
    logger.info(`CollegeKhoj API listening on port ${PORT}`);
  });

  const shutdown = (signal) => {
    logger.info(`${signal} received, shutting down gracefully`);
    server.close(() => process.exit(0));
  };
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

start();
