const logger = require('../utils/logger');

// Gestionnaire d'erreurs général
exports.errorHandler = (err, req, res, next) => {
  logger.error('Erreur:', err);

  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Erreur de validation',
      details: Object.values(err.errors).map(error => error.message),
    });
  }

  if (err.name === 'CastError') {
    return res.status(400).json({
      error: 'Format d\'ID invalide',
    });
  }

  if (err.code === 11000) {
    return res.status(409).json({
      error: 'Conflit de données',
      details: 'Une ressource avec ces informations existe déjà',
    });
  }

  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      error: 'Token invalide',
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      error: 'Token expiré',
    });
  }

  res.status(500).json({
    error: 'Erreur interne du serveur',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
};

// Gestionnaire pour les routes non trouvées
exports.notFoundHandler = (req, res, next) => {
  logger.warn(`Route non trouvée: ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    error: 'Route non trouvée',
  });
};

// Gestionnaire pour les erreurs de validation
exports.validationErrorHandler = (err, req, res, next) => {
  if (err.name === 'ValidationError') {
    logger.warn('Erreur de validation:', err.errors);
    return res.status(400).json({
      error: 'Erreur de validation',
      details: Object.values(err.errors).map(error => error.message),
    });
  }
  next(err);
};

// Gestionnaire pour les erreurs de base de données
exports.databaseErrorHandler = (err, req, res, next) => {
  if (err.name === 'MongoError' || err.name === 'MongooseError') {
    logger.error('Erreur de base de données:', err);
    return res.status(500).json({
      error: 'Erreur de base de données',
      message: process.env.NODE_ENV === 'development' ? err.message : undefined,
    });
  }
  next(err);
};

// Gestionnaire pour les erreurs de fichiers
exports.fileErrorHandler = (err, req, res, next) => {
  if (err.name === 'MulterError') {
    logger.warn('Erreur de téléchargement de fichier:', err);
    return res.status(400).json({
      error: 'Erreur de téléchargement de fichier',
      details: err.message,
    });
  }
  next(err);
};

// Gestionnaire pour les erreurs d'authentification
exports.authErrorHandler = (err, req, res, next) => {
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    logger.warn('Erreur d\'authentification:', err);
    return res.status(401).json({
      error: err.name === 'TokenExpiredError' ? 'Token expiré' : 'Token invalide',
    });
  }
  next(err);
};

// Gestionnaire pour les erreurs de permission
exports.permissionErrorHandler = (err, req, res, next) => {
  if (err.name === 'PermissionError') {
    logger.warn('Erreur de permission:', err);
    return res.status(403).json({
      error: 'Accès non autorisé',
      details: err.message,
    });
  }
  next(err);
};

// Gestionnaire pour les erreurs de ressource non trouvée
exports.notFoundErrorHandler = (err, req, res, next) => {
  if (err.name === 'NotFoundError') {
    logger.warn('Ressource non trouvée:', err);
    return res.status(404).json({
      error: 'Ressource non trouvée',
      details: err.message,
    });
  }
  next(err);
}; 