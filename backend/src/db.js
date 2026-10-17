import mongoose from 'mongoose';

let isConnected = false;

/**
 * Connect to MongoDB safely.
 * Gracefully handles connection failures without crashing the application.
 */
export async function connectDb(customUri = null) {
  const uri = customUri || process.env.MONGODB_URI;

  if (!uri) {
    console.warn('[MongoDB] Warning: MONGODB_URI is not defined in environment variables. Database features will return 503 until configured.');
    isConnected = false;
    return false;
  }

  try {
    // Avoid re-connecting if already connected
    if (mongoose.connection.readyState === 1) {
      isConnected = true;
      return true;
    }

    mongoose.set('strictQuery', true);
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
      autoIndex: true
    });

    isConnected = true;
    console.log('[MongoDB] Connected successfully to database.');
    return true;
  } catch (error) {
    isConnected = false;
    console.error('[MongoDB] Connection error (safe log):', error.message);
    return false;
  }
}

/**
 * Check if MongoDB connection is active
 */
export function isDbConnected() {
  return isConnected && mongoose.connection.readyState === 1;
}

/**
 * Gracefully close MongoDB connection (e.g. during test teardown)
 */
export async function closeDb() {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  isConnected = false;
}
