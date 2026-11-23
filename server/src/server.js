import dotenv from 'dotenv';
dotenv.config();

import app from './app.js';
import { connectDB } from './config/db.js';

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();
    const server = app.listen(PORT, () => {
      console.log(`[LifeOS Server] Running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
      console.log(`[LifeOS Server] Health check available at http://localhost:${PORT}/api/health`);
    });

    // Handle unhandled rejections
    process.on('unhandledRejection', (err) => {
      console.error('[UNHANDLED_REJECTION]', err);
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      console.log('[LifeOS Server] SIGTERM received. Shutting down gracefully...');
      server.close(() => {
        console.log('[LifeOS Server] Process terminated.');
      });
    });
  } catch (error) {
    console.error('[LifeOS Server] Failed to start:', error);
    process.exit(1);
  }
};

startServer();
