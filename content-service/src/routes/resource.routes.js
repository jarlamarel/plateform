const express = require('express');
const router = express.Router();
const resourceController = require('../controllers/resource.controller');
const { verifyToken, requireRole, requireOwnership } = require('../middlewares/auth.middleware');
const { validateResource } = require('../middlewares/validation.middleware');
const upload = require('../middlewares/upload.middleware');

// Routes publiques
router.get('/', resourceController.getAllResources);
router.get('/:id', resourceController.getResourceById);
router.get('/stats', resourceController.getResourceStats);
router.get('/lesson/:lessonId', resourceController.getResourcesByLesson);
router.get('/course/:courseId', resourceController.getResourcesByCourse);

// Routes protégées (authentification requise)
router.use(verifyToken);

// Routes pour les instructeurs
router.post('/', requireRole('instructor'), validateResource, resourceController.createResource);
router.put('/:id', requireRole('instructor'), requireOwnership('resource'), validateResource, resourceController.updateResource);
router.delete('/:id', requireRole('instructor'), requireOwnership('resource'), resourceController.deleteResource);

// Routes pour les versions
router.post('/:id/versions', requireRole('instructor'), requireOwnership('resource'), resourceController.addVersion);
router.delete('/:id/versions/:versionId', requireRole('instructor'), requireOwnership('resource'), resourceController.removeVersion);

// Routes pour les téléchargements
router.post('/:id/downloads', resourceController.incrementDownloads);

// Routes pour le téléchargement
router.get('/:id/download', resourceController.downloadResource);

// Routes pour les métadonnées
router.get('/:id/metadata', resourceController.getResourceMetadata);

// Routes pour les versions
router.get('/:id/versions', resourceController.getResourceVersions);

module.exports = router; 