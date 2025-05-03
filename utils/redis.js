const redis = require('redis');

const client = redis.createClient({
  url: 'redis://localhost:6379'
});

client.on('connect', () => {
  console.log('Connected to Redis');
});

client.on('error', (err) => {
  console.log('Redis error:', err);
});

// CONNECT before exporting
(async () => {
  try {
    await client.connect();
  } catch (e) {
    console.error('Could not connect to Redis:', e);
  }
})();

module.exports = client;