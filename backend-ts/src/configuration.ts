export default () => ({
  session: {
    cookieName: 'sessionId',
    maxAge: 24 * 60 * 60 * 1000, // 24 Stunden in Millisekunden
    maxAgeSeconds: 86400, // 24 Stunden in Sekunden für Redis
  },
  tempSession: {
    cookieName: 'tempSessionId',
    maxAge: 60 * 60 * 1000, // 1 Stunde in Millisekunden
    maxAgeSeconds: 3600, // 1 Stunde in Sekunden für Redis
  },
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
  },
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: 5432,
    username: process.env.DB_USERNAME || 'root',
    password: process.env.DB_PASSWORD || 'test123',
    database: process.env.DB_NAME || 'fire_backend',
  },
  app: {
    environment: process.env.NODE_ENV || 'development',
    isProduction: process.env.NODE_ENV === 'production',
  },
});
