const express = require('express');
const router = express.Router();

// Import des routes
const courseRoutes = require('./course.routes');
const lessonRoutes = require('./lesson.routes');
const resourceRoutes = require('./resource.routes');
const uploadRoutes = require('./upload.routes');

// Middleware d'authentification
const { verifyToken } = require('../middlewares/auth.middleware');

// Appliquer le middleware d'authentification à toutes les routes
router.use(verifyToken);

// Routes pour les cours
router.use('/courses', courseRoutes);

// Routes pour les leçons
router.use('/lessons', lessonRoutes);

// Routes pour les ressources
router.use('/resources', resourceRoutes);

// Routes pour les uploads de fichiers
router.use('/uploads', uploadRoutes);

module.exports = router; 