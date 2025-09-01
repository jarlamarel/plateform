const logger = require('../utils/logger');

const errorMiddleware = (err, req, res, next) => {
  // Log de l'erreur
  logger.error('Erreur non gérée:', {
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  // Erreurs de validation Mongoose
  if (err.name === 'ValidationError') {
    const validationErrors = Object.values(err.errors).map(error => error.message);
    
    return res.status(400).json({
      success: false,
      message: 'Erreur de validation',
      errors: validationErrors
    });
  }

  // Erreurs de cast Mongoose (ObjectId invalide)
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: 'ID invalide',
      error: 'Le format de l\'ID fourni est incorrect'
    });
  }

  // Erreurs de duplication Mongoose
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(409).json({
      success: false,
      message: 'Conflit de données',
      error: `La valeur pour le champ '${field}' existe déjà`
    });
  }

  // Erreurs JWT
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Token invalide',
      error: 'Le token d\'authentification est invalide'
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token expiré',
      error: 'Le token d\'authentification a expiré'
    });
  }

  // Erreurs de limite de taux
  if (err.type === 'entity.too.large') {
    return res.status(413).json({
      success: false,
      message: 'Données trop volumineuses',
      error: 'La taille des données dépasse la limite autorisée'
    });
  }

  // Erreurs de timeout
  if (err.code === 'ETIMEDOUT' || err.code === 'ESOCKETTIMEDOUT') {
    return res.status(408).json({
      success: false,
      message: 'Délai d\'attente dépassé',
      error: 'La requête a pris trop de temps à traiter'
    });
  }

  // Erreurs de connexion à la base de données
  if (err.name === 'MongoNetworkError' || err.name === 'MongoServerSelectionError') {
    return res.status(503).json({
      success: false,
      message: 'Service temporairement indisponible',
      error: 'Impossible de se connecter à la base de données'
    });
  }

  // Erreurs de syntaxe JSON
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      success: false,
      message: 'JSON invalide',
      error: 'Le corps de la requête contient du JSON invalide'
    });
  }

  // Erreurs personnalisées
  if (err.isOperational) {
    return res.status(err.statusCode || 400).json({
      success: false,
      message: err.message,
      error: err.error || err.message
    });
  }

  // Erreur par défaut (500)
  const statusCode = err.statusCode || 500;
  const message = statusCode === 500 ? 'Erreur interne du serveur' : err.message;

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && {
      error: err.message,
      stack: err.stack
    })
  });
};

// Middleware pour capturer les erreurs asynchrones
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Classe d'erreur personnalisée
class AppError extends Error {
  constructor(message, statusCode, error = null) {
    super(message);
    this.statusCode = statusCode;
    this.error = error;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

// Fonctions utilitaires pour créer des erreurs
const createError = {
  badRequest: (message, error = null) => new AppError(message, 400, error),
  unauthorized: (message, error = null) => new AppError(message, 401, error),
  forbidden: (message, error = null) => new AppError(message, 403, error),
  notFound: (message, error = null) => new AppError(message, 404, error),
  conflict: (message, error = null) => new AppError(message, 409, error),
  tooManyRequests: (message, error = null) => new AppError(message, 429, error),
  internal: (message, error = null) => new AppError(message, 500, error),
  serviceUnavailable: (message, error = null) => new AppError(message, 503, error)
};

module.exports = {
  errorMiddleware,
  asyncHandler,
  AppError,
  createError
};


