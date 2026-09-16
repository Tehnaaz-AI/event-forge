import 'dotenv/config';
import app from './app.js';
import { connectDb } from './config/db.js';
import { initSuperAdmin } from './config/initAdmin.js';

const PORT = process.env.PORT || 5000;

async function start() {
  try {
    await connectDb();
    await initSuperAdmin();
    const server = app.listen(PORT, () => {
      console.log(`API ready on port ${PORT}`);
    });

    const shutdown = (signal) => {
      server.close(() => {
        process.exit(0);
      });
    };

    process.once('SIGUSR2', () => {
      server.close(() => {
        process.kill(process.pid, 'SIGUSR2');
      });
    });

    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));

  } catch (e) {
    console.error('Database connection failed:', e.message);
    process.exit(1);
  }
}

start();
