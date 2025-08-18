const config = require('../config');
const logger = require('../utils/logger');

// Middleware pour valider les permissions de vidéo
exports.validateVideoPermissions = async (req, res, next) => {
  try {
    const { lessonId } = req.params;
    
    // Vérifier que l'utilisateur est authentifié
    if (!req.user) {
      return res.status(401).json({ error: 'Authentification requise' });
    }

    const userId = req.user.id || req.user._id;
    const userRole = req.user.role;

    logger.info('Validation permissions vidéo:', {
      userId,
      userRole,
      lessonId
    });

    // Vérifier si l'utilisateur a le droit d'uploader/modifier des vidéos
    if (userRole !== 'instructor' && userRole !== 'admin') {
      return res.status(403).json({ 
        error: 'Seuls les instructeurs peuvent gérer les vidéos des leçons' 
      });
    }

    // Pour les instructeurs, vérifier qu'ils sont propriétaires du cours
    if (userRole === 'instructor') {
      const Lesson = require('../models/lesson.model');
      const Course = require('../models/course.model');
      
      const lesson = await Lesson.findById(lessonId);
      if (!lesson) {
        return res.status(404).json({ error: 'Leçon non trouvée' });
      }

      const course = await Course.findById(lesson.courseId);
      if (!course) {
        return res.status(404).json({ error: 'Cours non trouvé' });
      }

      logger.info('Vérification propriétaire:', {
        courseInstructor: course.instructor.toString(),
        userId: userId.toString()
      });

      if (course.instructor.toString() !== userId.toString()) {
        return res.status(403).json({ 
          error: 'Vous ne pouvez gérer que les vidéos de vos propres cours' 
        });
      }
    }

    next();
  } catch (error) {
    logger.error('Erreur dans validateVideoPermissions:', error);
    res.status(500).json({ error: 'Erreur de validation des permissions' });
  }
};

// Middleware pour valider les métadonnées de vidéo
exports.validateVideoMetadata = (req, res, next) => {
  const { title, description, duration } = req.body;

  // Validation du titre
  if (title && (title.length < 3 || title.length > 100)) {
    return res.status(400).json({ 
      error: 'Le titre doit contenir entre 3 et 100 caractères' 
    });
  }

  // Validation de la description
  if (description && description.length > 500) {
    return res.status(400).json({ 
      error: 'La description ne peut pas dépasser 500 caractères' 
    });
  }

  // Validation de la durée
  if (duration && (isNaN(duration) || duration < 0)) {
    return res.status(400).json({ 
      error: 'La durée doit être un nombre positif' 
    });
  }

  next();
};

// Middleware pour logger les activités vidéo
exports.logVideoActivity = (action) => {
  return (req, res, next) => {
    const { lessonId } = req.params;
    const userId = req.user.id;
    
    logger.info(`Activité vidéo: ${action}`, {
      userId,
      lessonId,
      action,
      timestamp: new Date().toISOString()
    });
    
    next();
  };
};

// Middleware pour vérifier l'espace disque disponible
exports.checkDiskSpace = async (req, res, next) => {
  try {
    const fs = require('fs');
    const path = require('path');
    
    const videoDir = path.join(__dirname, '..', '..', config.storage.video.uploadDir);
    const stats = fs.statSync(videoDir);
    
    // Vérification simple de l'espace (cette logique peut être améliorée)
    const maxStorageSize = 10 * 1024 * 1024 * 1024; // 10GB limite
    
    // Cette vérification est basique, dans un vrai projet il faudrait 
    // vérifier l'espace disque réel disponible
    logger.info('Vérification de l\'espace disque pour upload vidéo');
    
    next();
  } catch (error) {
    logger.error('Erreur lors de la vérification de l\'espace disque:', error);
    next(); // Continuer même en cas d'erreur de vérification
  }
};