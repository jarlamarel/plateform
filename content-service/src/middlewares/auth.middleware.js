const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');
const Course = require('../models/course.model');
const Lesson = require('../models/lesson.model');
const Resource = require('../models/resource.model');

const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: "Token d'authentification manquant" });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = {
      id: decoded.id,
      role: decoded.role,
    };

    next();
  } catch (error) {
    logger.error('Erreur de vérification du token:', error);
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expiré' });
    }
    return res.status(401).json({ error: 'Token invalide' });
  }
};

const requireRole = (role) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentification requise' });
    }

    if (req.user.role !== role && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Accès non autorisé' });
    }

    next();
  };
};

const requireOwnership = (resourceType) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentification requise' });
      }

      const resourceId = req.params.id;
      let resource;

      switch (resourceType) {
        case 'course':
          resource = await Course.findById(resourceId);
          break;
        case 'lesson':
          resource = await Lesson.findById(resourceId);
          break;
        case 'resource':
          resource = await Resource.findById(resourceId);
          break;
        default:
          return res.status(400).json({ error: 'Type de ressource invalide' });
      }

      if (!resource) {
        return res.status(404).json({ error: 'Ressource non trouvée' });
      }

      if (
        resource.instructorId &&
        resource.instructorId.toString() !== req.user.id &&
        req.user.role !== 'admin'
      ) {
        return res.status(403).json({ error: 'Accès non autorisé' });
      }

      req.resource = resource;
      next();
    } catch (error) {
      logger.error('Erreur de vérification de la propriété:', error);
      res.status(500).json({ error: 'Erreur lors de la vérification de la propriété' });
    }
  };
};

const requireEnrollment = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentification requise' });
    }

    const courseId = req.params.id;
    const course = await Course.findById(courseId);

    if (!course) {
      return res.status(404).json({ error: 'Cours non trouvé' });
    }

    const isEnrolled = course.students && course.students.includes(req.user.id);
    if (!isEnrolled && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Vous devez être inscrit au cours pour accéder à cette ressource' });
    }

    req.course = course;
    next();
  } catch (error) {
    logger.error("Erreur de vérification de l'inscription:", error);
    res.status(500).json({ error: "Erreur lors de la vérification de l'inscription" });
  }
};

const requireResourceAccess = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentification requise' });
    }

    const resourceId = req.params.id;
    const resource = await Resource.findById(resourceId);

    if (!resource) {
      return res.status(404).json({ error: 'Ressource non trouvée' });
    }

    // Vérifier si la ressource est publique
    if (resource.isPublic) {
      return next();
    }

    // Vérifier si l'utilisateur est l'instructeur
    if (resource.instructorId && resource.instructorId.toString() === req.user.id) {
      return next();
    }

    // Vérifier si l'utilisateur est un étudiant inscrit au cours
    const course = await Course.findById(resource.courseId);
    if (!course) {
      return res.status(404).json({ error: 'Cours non trouvé' });
    }

    const isEnrolled = course.students && course.students.includes(req.user.id);
    if (!isEnrolled && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Accès non autorisé à cette ressource' });
    }

    next();
  } catch (error) {
    logger.error("Erreur de vérification de l'accès aux ressources:", error);
    res.status(500).json({ error: "Erreur lors de la vérification de l'accès aux ressources" });
  }
};

module.exports = {
  verifyToken,
  requireRole,
  requireOwnership,
  requireEnrollment,
  requireResourceAccess,
}; 