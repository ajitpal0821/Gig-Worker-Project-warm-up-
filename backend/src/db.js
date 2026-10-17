import mongoose from 'mongoose';

/**
 * Global cache for MongoDB connection across warm serverless invocations.
 * Prevents connection leakage and exhaustion in serverless environments (e.g. Vercel).
 */
let cachedPromise = null;
let isConnected = false;

/**
 * Connect to MongoDB safely with serverless connection pooling & caching.
 * Reuses existing connection across warm invocations.
 */
export async function connectDb(customUri = null) {
  const uri = customUri || process.env.MONGODB_URI;

  if (!uri) {
    console.warn('[MongoDB] Warning: MONGODB_URI is not defined in environment variables. Database features will return 503 until configured.');
    isConnected = false;
    return false;
  }

  // If already connected and ready, reuse connection immediately
  if (mongoose.connection.readyState === 1) {
    isConnected = true;
    return true;
  }

  // If connection is in progress, reuse the cached promise
  if (cachedPromise) {
    try {
      await cachedPromise;
      return mongoose.connection.readyState === 1;
    } catch {
      cachedPromise = null;
    }
  }

  try {
    mongoose.set('strictQuery', true);
    cachedPromise = mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
      autoIndex: true,
      maxPoolSize: 10
    });

    await cachedPromise;
    console.log('[MongoDB] Connected successfully to database.');
    return true;
  } catch (error) {
    cachedPromise = null;
    isConnected = false;
    console.error('[MongoDB] Connection error (safe log):', error.message);
    return false;
  }
}

/**
 * Check if MongoDB connection is active
 */
export function isDbConnected() {
  return mongoose.connection.readyState === 1;
}

/**
 * Gracefully close MongoDB connection (e.g. during test teardown)
 */
export async function closeDb() {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  cachedPromise = null;
  isConnected = false;
}
