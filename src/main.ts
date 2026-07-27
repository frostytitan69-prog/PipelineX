import { Server } from 'http';
import { createApp } from './app';
import { env } from './config/env.config';
import { disconnectPrisma } from './database/prisma.service';
import { disconnectRedis } from './database/redis.service';

const startServer = (): void => {
  const app = createApp();

  const server: Server = app.listen(env.PORT, () => {
    console.log(`🚀 PipelineX Server running on http://localhost:${env.PORT} in ${env.NODE_ENV} mode`);
    console.log(`🏥 Health Check available at http://localhost:${env.PORT}/api/v1/health`);
  });

  const handleShutdown = async (signal: string): Promise<void> => {
    console.log(`\n🛑 Received ${signal}. Starting graceful shutdown...`);

    server.close(async () => {
      console.log('🔒 HTTP server closed');
      try {
        await disconnectPrisma();
        await disconnectRedis();
        console.log('✅ Graceful shutdown completed cleanly');
        process.exit(0);
      } catch (err) {
        console.error('❌ Error during shutdown:', err);
        process.exit(1);
      }
    });

    // Force exit after 10s if shutdown hangs
    setTimeout(() => {
      console.error('⚠️ Forcefully shutting down due to timeout');
      process.exit(1);
    }, 10000);
  };

  process.on('SIGTERM', () => handleShutdown('SIGTERM'));
  process.on('SIGINT', () => handleShutdown('SIGINT'));
};

startServer();
