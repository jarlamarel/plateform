const express = require('express');
const router = express.Router();
const courseController = require('../controllers/course.controller');
const { verifyToken, requireRole, requireOwnership } = require('../middlewares/auth.middleware');
const { validateCourse } = require('../middlewares/validation.middleware');

// Routes publiques
router.get('/', courseController.getAllCourses);
router.get('/:id', courseController.getCourseById);
router.get('/:id/rating', courseController.getCourseRating);
router.get('/:id/reviews', (req, res) => {
  // Route temporaire pour les reviews - retourne une structure compatible avec le frontend
  res.json({
    averageRating: 0,
    totalReviews: 0,
    reviews: []
  });
});

// Routes protégées (authentification requise)
router.use(verifyToken);

// Route pour les cours inscrits (doit être avant /:id pour éviter les conflits)
router.get('/enrolled', (req, res) => {
  // Route temporaire pour les cours inscrits
  res.json([]);
});

// Routes pour les étudiants
router.post('/:id/enroll', courseController.enrollInCourse);
router.post('/:id/unenroll', courseController.unenrollFromCourse);
router.post('/:id/rate', courseController.rateCourse);

// Routes pour la progression
router.get('/:id/progress', (req, res) => {
  // Route temporaire pour la progression
  res.json({
    completedLessons: [],
    progress: 0
  });
});

router.post('/:id/lessons/:lessonId/complete', (req, res) => {
  // Route temporaire pour marquer une leçon comme terminée
  res.json({ message: 'Leçon marquée comme terminée' });
});

// Routes pour les instructeurs
router.post('/', requireRole('instructor'), validateCourse, courseController.createCourse);
router.put(
  '/:id',
  requireRole('instructor'),
  requireOwnership('course'),
  validateCourse,
  courseController.updateCourse
);
router.delete(
  '/:id',
  requireRole('instructor'),
  requireOwnership('course'),
  courseController.deleteCourse
);

// Route pour mettre à jour l'image du cours
router.put(
  '/:id/image',
  requireRole('instructor'),
  requireOwnership('course'),
  courseController.updateCourseImage
);

// Routes pour les leçons
router.get('/:id/lessons', courseController.getCourseLessons);
router.post(
  '/:id/lessons',
  requireRole('instructor'),
  requireOwnership('course'),
  courseController.addLesson
);
router.put(
  '/:id/lessons/:lessonId',
  requireRole('instructor'),
  requireOwnership('course'),
  courseController.updateLesson
);
router.delete(
  '/:id/lessons/:lessonId',
  requireRole('instructor'),
  requireOwnership('course'),
  courseController.deleteLesson
);

// Route pour réorganiser les leçons
router.put(
  '/:id/lessons/reorder',
  requireRole('instructor'),
  requireOwnership('course'),
  courseController.reorderLessons
);

// Routes pour les ressources
router.post(
  '/:id/resources',
  requireRole('instructor'),
  requireOwnership('Course'),
  courseController.addResource
);
router.delete(
  '/:id/resources/:resourceId',
  requireRole('instructor'),
  requireOwnership('Course'),
  courseController.deleteResource
);

module.exports = router; 