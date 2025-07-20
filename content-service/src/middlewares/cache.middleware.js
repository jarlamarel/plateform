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

// Durées de cache par défaut (en secondes)
const CACHE_DURATIONS = {
  COURSE: 3600, // 1 heure
  LESSON: 1800, // 30 minutes
  RESOURCE: 1800, // 30 minutes
  COMMENT: 300, // 5 minutes
  LIST: 300, // 5 minutes
  SEARCH: 300, // 5 minutes
};

// Middleware de cache générique
exports.cache = (duration = 300) => {
  return async (req, res, next) => {
    if (req.method !== 'GET') {
      return next();
    }

    const key = `cache:${req.originalUrl || req.url}`;

    try {
      const cachedResponse = await redis.get(key);
      if (cachedResponse) {
        logger.debug('Cache hit:', { key });
        return res.json(JSON.parse(cachedResponse));
      }

      // Intercepter la réponse
      const originalJson = res.json;
      res.json = function (body) {
        redis.setex(key, duration, JSON.stringify(body))
          .catch(err => logger.error('Erreur lors de la mise en cache:', err));
        return originalJson.call(this, body);
      };

      next();
    } catch (error) {
      logger.error('Erreur de cache:', error);
      next();
    }
  };
};

// Middleware de cache pour les cours
exports.cacheCourse = (req, res, next) => {
  const key = `cache:course:${req.params.id}`;
  return exports.cache(CACHE_DURATIONS.COURSE)(req, res, next);
};

// Middleware de cache pour les leçons
exports.cacheLesson = (req, res, next) => {
  const key = `cache:lesson:${req.params.id}`;
  return exports.cache(CACHE_DURATIONS.LESSON)(req, res, next);
};

// Middleware de cache pour les ressources
exports.cacheResource = (req, res, next) => {
  const key = `cache:resource:${req.params.id}`;
  return exports.cache(CACHE_DURATIONS.RESOURCE)(req, res, next);
};

// Middleware de cache pour les commentaires
exports.cacheComment = (req, res, next) => {
  const key = `cache:comment:${req.params.id}`;
  return exports.cache(CACHE_DURATIONS.COMMENT)(req, res, next);
};

// Middleware de cache pour les listes
exports.cacheList = (req, res, next) => {
  const key = `cache:list:${req.originalUrl}`;
  return exports.cache(CACHE_DURATIONS.LIST)(req, res, next);
};

// Middleware de cache pour les recherches
exports.cacheSearch = (req, res, next) => {
  const key = `cache:search:${req.originalUrl}`;
  return exports.cache(CACHE_DURATIONS.SEARCH)(req, res, next);
};

// Middleware pour invalider le cache
exports.invalidateCache = (pattern) => {
  return async (req, res, next) => {
    try {
      const keys = await redis.keys(`cache:${pattern}`);
      if (keys.length > 0) {
        await redis.del(keys);
        logger.debug('Cache invalidé:', { pattern, keys });
      }
      next();
    } catch (error) {
      logger.error('Erreur lors de l\'invalidation du cache:', error);
      next();
    }
  };
};

// Middleware pour invalider le cache d'un cours
exports.invalidateCourseCache = (req, res, next) => {
  return exports.invalidateCache(`course:${req.params.id}`)(req, res, next);
};

// Middleware pour invalider le cache d'une leçon
exports.invalidateLessonCache = (req, res, next) => {
  return exports.invalidateCache(`lesson:${req.params.id}`)(req, res, next);
};

// Middleware pour invalider le cache d'une ressource
exports.invalidateResourceCache = (req, res, next) => {
  return exports.invalidateCache(`resource:${req.params.id}`)(req, res, next);
};

// Middleware pour invalider le cache d'un commentaire
exports.invalidateCommentCache = (req, res, next) => {
  return exports.invalidateCache(`comment:${req.params.id}`)(req, res, next);
};

// Middleware pour invalider le cache des listes
exports.invalidateListCache = (req, res, next) => {
  return exports.invalidateCache('list:*')(req, res, next);
};

// Middleware pour invalider le cache des recherches
exports.invalidateSearchCache = (req, res, next) => {
  return exports.invalidateCache('search:*')(req, res, next);
};

// Middleware pour vider tout le cache
exports.clearCache = async (req, res, next) => {
  try {
    await redis.flushall();
    logger.info('Cache vidé');
    next();
  } catch (error) {
    logger.error('Erreur lors du vidage du cache:', error);
    next(error);
  }
}; 