const jwt = require('jsonwebtoken');
const config = require('../config');
const logger = require('../utils/logger');

// Middleware d'authentification : vérifie le token JWT
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Token manquant' });
  }

  try {
    const decoded = jwt.verify(token, config.jwt.secret);
    req.user = decoded;
    next();
  } catch (error) {
    logger.error('Erreur de vérification du token:', error);
    return res.status(401).json({ message: 'Token invalide' });
  }
};

// Middleware de validation du token (vérifie que req.user existe)
const validateToken = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Utilisateur non authentifié' });
  }
  next();
};

module.exports = {
  authenticateToken,
  validateToken,
}; 