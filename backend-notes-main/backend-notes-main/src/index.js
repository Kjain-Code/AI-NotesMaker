import Fastify from 'fastify';
import cors from '@fastify/cors';
import multipart from '@fastify/multipart';
import formbody from '@fastify/formbody';

import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

// Routes
import uploadRoutes from './routes/upload.js';
import processRoutes from './routes/process.js';
import youtubeRoutes from './routes/youtube.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Initialize server
async function init() {
  const fastify = Fastify({
    logger: true,
    bodyLimit: 104857600 // 100MB
  });

  // Register plugins
  await fastify.register(cors, {
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
    credentials: true
  });

  await fastify.register(multipart, {
    limits: {
      fileSize: 104857600 // 100MB
    }
  });

  await fastify.register(formbody);

  // Explicitly add JSON content-type parser
  fastify.addContentTypeParser('application/json', { parseAs: 'string' }, function (req, body, done) {
    try {
      const json = JSON.parse(body);
      done(null, json);
    } catch (err) {
      err.statusCode = 400;
      done(err, undefined);
    }
  });


  // Ensure uploads directory exists
  const uploadsDir = join(__dirname, '../uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  // Register routes
  await fastify.register(uploadRoutes, { prefix: '/api/upload' });
  await fastify.register(processRoutes, { prefix: '/api/process' });
  await fastify.register(youtubeRoutes, { prefix: '/api/youtube' });

  // Health check
  fastify.get('/health', async (request, reply) => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  });

  // Render root route
  fastify.get('/', async () => {
    return {
      status: 'Backend is live 🚀',
      endpoints: {
        upload: '/api/upload',
        process: '/api/process',
        youtube: '/api/youtube/transcript',
        health: '/health'
      }
    };
  });


  // Start server
  try {
    const port = process.env.PORT || 3001;
    await fastify.listen({ port, host: '0.0.0.0' });
    console.log(`Server running on http://localhost:${port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}

init();
