import mongoose from 'mongoose';

let mongoMemoryServer = null;

export const connectDB = async (uri = process.env.MONGO_URI) => {
  const targetUri = uri || 'mongodb://127.0.0.1:27017/lifeos';
  
  try {
    // Set connection options with brief server selection timeout so we can fallback gracefully
    const conn = await mongoose.connect(targetUri, {
      serverSelectionTimeoutMS: 2500,
    });
    console.log(`[Database] MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (err) {
    console.warn(`[Database] Could not connect to primary MongoDB URI (${targetUri}): ${err.message}`);
    
    // In dev / test or when local mongo is not running, provide zero-friction fallback via MongoMemoryServer
    if (process.env.NODE_ENV !== 'production') {
      try {
        console.log('[Database] Starting in-memory MongoDB fallback for local development/testing...');
        const { MongoMemoryServer } = await import('mongodb-memory-server');
        mongoMemoryServer = await MongoMemoryServer.create();
        const fallbackUri = mongoMemoryServer.getUri();
        const fallbackConn = await mongoose.connect(fallbackUri);
        console.log(`[Database] In-memory MongoDB Connected: ${fallbackUri}`);
        return fallbackConn;
      } catch (memErr) {
        console.error('[Database] Failed to start in-memory MongoDB fallback:', memErr);
        throw memErr;
      }
    }
    throw err;
  }
};

export const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    if (mongoMemoryServer) {
      await mongoMemoryServer.stop();
    }
    console.log('[Database] MongoDB disconnected cleanly.');
  } catch (err) {
    console.error('[Database] Error disconnecting MongoDB:', err);
  }
};
