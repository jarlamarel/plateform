const morgan = require('morgan');
const winston = require('winston');
const { format } = winston;
const logger = require('../utils/logger');

// Format de log personnalisé
const logFormat = format.combine(
  format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  format.errors({ stack: true }),
  format.splat(),
  format.json()
);

// Configuration des transports
const transports = [
  // Console transport
  new winston.transports.Console({
    format: format.combine(
      format.colorize(),
      format.simple()
    ),
  }),
  // Fichier de log des erreurs
  new winston.transports.File({
    filename: 'logs/error.log',
    level: 'error',
    maxsize: 5242880, // 5MB
    maxFiles: 5,
  }),
  // Fichier de log combiné
  new winston.transports.File({
    filename: 'logs/combined.log',
    maxsize: 5242880, // 5MB
    maxFiles: 5,
  }),
];

// Configuration de Morgan
const morganFormat = ':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" :response-time ms';

// Middleware de logging pour les requêtes HTTP
exports.httpLogger = morgan(morganFormat, {
  stream: {
    write: (message) => {
      logger.info(message.trim());
    },
  },
});

// Middleware de logging pour les erreurs
exports.errorLogger = (err, req, res, next) => {
  logger.error('Erreur:', {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    ip: req.ip,
    user: req.user ? req.user.id : 'non authentifié',
  });
  next(err);
};

// Middleware de logging pour les performances
exports.performanceLogger = (req, res, next) => {
  const start = process.hrtime();

  res.on('finish', () => {
    const [seconds, nanoseconds] = process.hrtime(start);
    const duration = seconds * 1000 + nanoseconds / 1000000;

    logger.info('Performance:', {
      path: req.path,
      method: req.method,
      status: res.statusCode,
      duration: `${duration.toFixed(2)}ms`,
      user: req.user ? req.user.id : 'non authentifié',
    });
  });

  next();
};

// Middleware de logging pour les requêtes API
exports.apiLogger = (req, res, next) => {
  logger.info('Requête API:', {
    path: req.path,
    method: req.method,
    query: req.query,
    body: req.body,
    user: req.user ? req.user.id : 'non authentifié',
    ip: req.ip,
  });
  next();
};

// Middleware de logging pour les téléchargements
exports.downloadLogger = (req, res, next) => {
  logger.info('Téléchargement:', {
    path: req.path,
    method: req.method,
    file: req.params.file,
    user: req.user ? req.user.id : 'non authentifié',
    ip: req.ip,
  });
  next();
};

// Middleware de logging pour les uploads
exports.uploadLogger = (req, res, next) => {
  logger.info('Upload:', {
    path: req.path,
    method: req.method,
    files: req.files,
    user: req.user ? req.user.id : 'non authentifié',
    ip: req.ip,
  });
  next();
};

// Middleware de logging pour les websockets
exports.websocketLogger = (socket, next) => {
  logger.info('Connexion WebSocket:', {
    id: socket.id,
    user: socket.user ? socket.user.id : 'non authentifié',
    ip: socket.handshake.address,
  });
  next();
};

// Middleware de logging pour les graphiques
exports.graphLogger = (req, res, next) => {
  logger.info('Requête GraphQL:', {
    query: req.body.query,
    variables: req.body.variables,
    user: req.user ? req.user.id : 'non authentifié',
    ip: req.ip,
  });
  next();
};

// Middleware de logging pour les webhooks
exports.webhookLogger = (req, res, next) => {
  logger.info('Webhook:', {
    path: req.path,
    method: req.method,
    body: req.body,
    headers: req.headers,
    ip: req.ip,
  });
  next();
};

// Middleware de logging pour les recherches
exports.searchLogger = (req, res, next) => {
  logger.info('Recherche:', {
    path: req.path,
    method: req.method,
    query: req.query,
    user: req.user ? req.user.id : 'non authentifié',
    ip: req.ip,
  });
  next();
};

// Middleware de logging pour les commentaires
exports.commentLogger = (req, res, next) => {
  logger.info('Commentaire:', {
    path: req.path,
    method: req.method,
    body: req.body,
    user: req.user ? req.user.id : 'non authentifié',
    ip: req.ip,
  });
  next();
};

// Middleware de logging pour les notifications
exports.notificationLogger = (req, res, next) => {
  logger.info('Notification:', {
    path: req.path,
    method: req.method,
    body: req.body,
    user: req.user ? req.user.id : 'non authentifié',
    ip: req.ip,
  });
  next();
};

// Middleware de logging pour les statistiques
exports.statsLogger = (req, res, next) => {
  logger.info('Statistiques:', {
    path: req.path,
    method: req.method,
    query: req.query,
    user: req.user ? req.user.id : 'non authentifié',
    ip: req.ip,
  });
  next();
}; 