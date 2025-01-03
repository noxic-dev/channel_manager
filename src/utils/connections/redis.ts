import { createClient } from 'redis';
import { config } from 'dotenv';

config();

const client = createClient({
  socket: {
    host: process.env.REDIS_HOST || '127.0.0.1',
    port: 6379
  },
  password: process.env.DATABASE_PASSWORD || undefined
});

client.on('connect', () => {
  console.log('Connected to Redis!');
});

client.on('error', (err) => {
  console.error('Redis connection error:', err);
});

(async () => {
  try {
    await client.connect();
  } catch (err) {
    console.error('Redis connection failed:', err);
  }
})();

export default client;
