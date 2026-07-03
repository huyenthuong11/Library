import { createClient } from 'redis';

const client = createClient({
  url: 'redis://redis:6379'
});

client.on('error', (err) => {
  console.log('Redis Error: - redis.service.js:8', err);
});

await client.connect();

export default client;
