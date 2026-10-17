import path from 'path';
import { fileURLToPath } from 'url';
import { app } from './app.js';
import { connectDb, isDbConnected } from './db.js';
import { isGeminiConfigured } from './gemini.service.js';

export { app };
export default app;

const PORT = process.env.PORT || 3000;

// Initialize database connection eagerly in local environment
connectDb();

// Start Express server only if executed as the main process (local development)
const isMain = process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1]);
if (isMain && process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`===============================================`);
    console.log(`  Saathi Backend Server running on port ${PORT}`);
    console.log(`  Gemini Configured: ${isGeminiConfigured()}`);
    console.log(`  Database Connected: ${isDbConnected()}`);
    console.log(`  Health Check: http://localhost:${PORT}/api/health`);
    console.log(`===============================================`);
  });
}
