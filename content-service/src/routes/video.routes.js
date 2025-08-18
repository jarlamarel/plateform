const express = require('express');
const router = express.Router();
const videoController = require('../controllers/video.controller');
const { verifyToken, requireRole } = require('../middlewares/auth.middleware');
const { 
  validateVideoPermissions, 
  validateVideoMetadata, 
  logVideoActivity,
  checkDiskSpace 
} = require('../middlewares/video.middleware');

// Routes pour les vidéos (authentification requise)
router.use(verifyToken);

// Upload d'une vidéo pour une leçon (instructeurs seulement)
router.post('/lessons/:lessonId/upload', 
  validateVideoPermissions,
  validateVideoMetadata,
  checkDiskSpace,
  logVideoActivity('upload'),
  videoController.uploadLessonVideo
);

// Streaming d'une vidéo (accessible aux étudiants inscrits)
router.get('/stream/:filename', videoController.streamVideo);

// Obtenir les informations d'une vidéo
router.get('/lessons/:lessonId/info', videoController.getVideoInfo);

// Supprimer une vidéo (instructeurs seulement)
router.delete('/lessons/:lessonId', 
  validateVideoPermissions,
  logVideoActivity('delete'),
  videoController.deleteVideo
);

module.exports = router;