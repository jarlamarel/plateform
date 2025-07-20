const express = require('express');
const router = express.Router();
const lessonController = require('../controllers/lesson.controller');
const { verifyToken, requireRole, requireOwnership } = require('../middlewares/auth.middleware');
const { validateLesson } = require('../middlewares/validation.middleware');

// Routes publiques
router.get('/', lessonController.getAllLessons);
router.get('/:id', lessonController.getLessonById);
router.get('/:id/resources', lessonController.getLessonResources);

// Routes protégées (authentification requise)
router.use(verifyToken);

// Routes pour les instructeurs
router.post('/', requireRole('instructor'), validateLesson, lessonController.createLesson);
router.put('/:id', requireRole('instructor'), requireOwnership('lesson'), validateLesson, lessonController.updateLesson);
router.delete('/:id', requireRole('instructor'), requireOwnership('lesson'), lessonController.deleteLesson);

// Routes pour les ressources
router.post('/:id/resources', requireRole('instructor'), requireOwnership('lesson'), lessonController.addResource);
router.put('/:id/resources/:resourceId', requireRole('instructor'), requireOwnership('lesson'), lessonController.updateResource);
router.delete('/:id/resources/:resourceId', requireRole('instructor'), requireOwnership('lesson'), lessonController.deleteResource);

// Routes pour les prérequis
router.post('/:id/prerequisites', requireRole('instructor'), requireOwnership('Lesson'), lessonController.addPrerequisite);
router.delete('/:id/prerequisites/:prerequisiteId', requireRole('instructor'), requireOwnership('Lesson'), lessonController.removePrerequisite);

// Routes pour l'ordre des leçons
router.put('/:id/order', requireRole('instructor'), requireOwnership('Lesson'), lessonController.updateOrder);

// Routes pour la progression
router.post('/:id/complete', lessonController.markLessonAsComplete);
router.post('/:id/uncomplete', lessonController.markLessonAsIncomplete);

module.exports = router; 