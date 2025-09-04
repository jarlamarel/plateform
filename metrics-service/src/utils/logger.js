const winston = require('winston');
const path = require('path');

// Configuration des formats
const logFormat = winston.format.combine(
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss'
  }),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss'
  }),
  winston.format.printf(({ timestamp, level, message, stack, ...meta }) => {
    let log = `${timestamp} [${level}]: ${message}`;
    
    if (Object.keys(meta).length > 0) {
      log += ` ${JSON.stringify(meta)}`;
    }
    
    if (stack) {
      log += `\n${stack}`;
    }
    
    return log;
  })
);

// Configuration du logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  defaultMeta: { service: 'metrics-service' },
  transports: [
    // Logs d'erreur
    new winston.transports.File({
      filename: path.join(__dirname, '../../logs/error.log'),
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5
    }),
    
    // Logs combinés
    new winston.transports.File({
      filename: path.join(__dirname, '../../logs/combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5
    })
  ]
});

// Ajouter le transport console en développement
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: consoleFormat
  }));
}

// Fonction pour logger les métriques
logger.metric = (level, metricName, serviceName, value, metadata = {}) => {
  logger.log(level, `Metric: ${metricName}`, {
    metricName,
    serviceName,
    value,
    ...metadata
  });
};

// Fonction pour logger les événements de collecte
logger.collection = (level, collectionType, count, duration, metadata = {}) => {
  logger.log(level, `Collection: ${collectionType}`, {
    collectionType,
    count,
    duration,
    ...metadata
  });
};

// Fonction pour logger les erreurs de service
logger.serviceError = (serviceName, error, metadata = {}) => {
  logger.error(`Service Error: ${serviceName}`, {
    serviceName,
    error: error.message,
    stack: error.stack,
    ...metadata
  });
};

// Fonction pour logger les performances
logger.performance = (operation, duration, metadata = {}) => {
  logger.info(`Performance: ${operation}`, {
    operation,
    duration,
    ...metadata
  });
};

// Gestion des erreurs non capturées
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

module.exports = logger;



