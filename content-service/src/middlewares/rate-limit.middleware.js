const rateLimit = require('express-rate-limit');
const RedisStore = require('rate-limit-redis');
const Redis = require('ioredis');
const logger = require('../utils/logger');

// Configuration Redis
const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD,
  retryStrategy: (times) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
});

redis.on('error', (err) => {
  logger.error('Erreur Redis:', err);
});

// Limiteur global
exports.globalLimiter = rateLimit({
  store: new RedisStore({
    client: redis,
    prefix: 'rate-limit:global:',
  }),
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limite de 100 requêtes par fenêtre
  message: {
    error: 'Trop de requêtes',
    details: 'Veuillez réessayer plus tard',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Limiteur pour l'authentification
exports.authLimiter = rateLimit({
  store: new RedisStore({
    client: redis,
    prefix: 'rate-limit:auth:',
  }),
  windowMs: 60 * 60 * 1000, // 1 heure
  max: 5, // Limite de 5 tentatives par heure
  message: {
    error: 'Trop de tentatives de connexion',
    details: 'Veuillez réessayer plus tard',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Limiteur pour les téléchargements
exports.downloadLimiter = rateLimit({
  store: new RedisStore({
    client: redis,
    prefix: 'rate-limit:download:',
  }),
  windowMs: 60 * 60 * 1000, // 1 heure
  max: 10, // Limite de 10 téléchargements par heure
  message: {
    error: 'Limite de téléchargement atteinte',
    details: 'Veuillez réessayer plus tard',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Limiteur pour les API
exports.apiLimiter = rateLimit({
  store: new RedisStore({
    client: redis,
    prefix: 'rate-limit:api:',
  }),
  windowMs: 60 * 1000, // 1 minute
  max: 60, // Limite de 60 requêtes par minute
  message: {
    error: 'Limite d\'API atteinte',
    details: 'Veuillez réessayer plus tard',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Limiteur pour les recherches
exports.searchLimiter = rateLimit({
  store: new RedisStore({
    client: redis,
    prefix: 'rate-limit:search:',
  }),
  windowMs: 60 * 1000, // 1 minute
  max: 30, // Limite de 30 recherches par minute
  message: {
    error: 'Limite de recherche atteinte',
    details: 'Veuillez réessayer plus tard',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Limiteur pour les commentaires
exports.commentLimiter = rateLimit({
  store: new RedisStore({
    client: redis,
    prefix: 'rate-limit:comment:',
  }),
  windowMs: 60 * 60 * 1000, // 1 heure
  max: 20, // Limite de 20 commentaires par heure
  message: {
    error: 'Limite de commentaires atteinte',
    details: 'Veuillez réessayer plus tard',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Middleware pour réinitialiser les limites
exports.resetLimits = async (req, res, next) => {
  try {
    const key = req.ip;
    await redis.del(`rate-limit:global:${key}`);
    await redis.del(`rate-limit:auth:${key}`);
    await redis.del(`rate-limit:download:${key}`);
    await redis.del(`rate-limit:api:${key}`);
    await redis.del(`rate-limit:search:${key}`);
    await redis.del(`rate-limit:comment:${key}`);
    next();
  } catch (error) {
    logger.error('Erreur lors de la réinitialisation des limites:', error);
    next(error);
  }
};

// Middleware pour vérifier les limites
exports.checkLimits = async (req, res, next) => {
  try {
    const key = req.ip;
    const limits = await Promise.all([
      redis.get(`rate-limit:global:${key}`),
      redis.get(`rate-limit:auth:${key}`),
      redis.get(`rate-limit:download:${key}`),
      redis.get(`rate-limit:api:${key}`),
      redis.get(`rate-limit:search:${key}`),
      redis.get(`rate-limit:comment:${key}`),
    ]);

    const [global, auth, download, api, search, comment] = limits.map(limit => limit ? JSON.parse(limit) : null);

    res.set('X-RateLimit-Global-Remaining', global ? global.remaining : 'N/A');
    res.set('X-RateLimit-Auth-Remaining', auth ? auth.remaining : 'N/A');
    res.set('X-RateLimit-Download-Remaining', download ? download.remaining : 'N/A');
    res.set('X-RateLimit-Api-Remaining', api ? api.remaining : 'N/A');
    res.set('X-RateLimit-Search-Remaining', search ? search.remaining : 'N/A');
    res.set('X-RateLimit-Comment-Remaining', comment ? comment.remaining : 'N/A');

    next();
  } catch (error) {
    logger.error('Erreur lors de la vérification des limites:', error);
    next(error);
  }
}; 