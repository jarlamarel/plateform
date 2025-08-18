const express = require('express');
const router = express.Router();

// Import des routes
const courseRoutes = require('./course.routes');
const lessonRoutes = require('./lesson.routes');
const resourceRoutes = require('./resource.routes');
const uploadRoutes = require('./upload.routes');
const videoRoutes = require('./video.routes');

// Middleware d'authentification
const { verifyToken } = require('../middlewares/auth.middleware');

// Routes pour les cours (certaines routes publiques, d'autres protégées)
router.use('/courses', courseRoutes);

// Routes pour les leçons (authentification requise)
router.use('/lessons', verifyToken, lessonRoutes);

// Routes pour les ressources (authentification requise)
router.use('/resources', verifyToken, resourceRoutes);

// Routes pour les uploads de fichiers (authentification requise)
router.use('/uploads', verifyToken, uploadRoutes);

// Routes pour les vidéos (authentification requise)
router.use('/videos', videoRoutes);

module.exports = router; 