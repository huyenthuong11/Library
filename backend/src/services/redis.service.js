import { createClient } from 'redis';

const client = createClient({
  url: process.env.REDIS_URL
});

client.on('error', (err) => {
  console.log('Redis Error: - redis.service.js:8', err);
});

await client.connect();

export default client;
