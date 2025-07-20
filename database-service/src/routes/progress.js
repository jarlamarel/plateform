const express = require('express');
const Progress = require('../models/Progress');
const Course = require('../models/Course');
const Subscription = require('../models/Subscription');
const router = express.Router();

// Obtenir la progression d'un utilisateur pour tous ses cours
router.get('/', async (req, res) => {
  try {
    const progress = await Progress.find({ user: req.user._id })
      .populate('course', 'title thumbnail')
      .populate('subscription', 'status endDate')
      .sort({ updatedAt: -1 });

    res.json(progress.map(p => p.getStats()));
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération de la progression', error: error.message });
  }
});

// Obtenir la progression pour un cours spécifique
router.get('/course/:courseId', async (req, res) => {
  try {
    const progress = await Progress.findOne({
      user: req.user._id,
      course: req.params.courseId,
    })
    .populate('course', 'title thumbnail lessons')
    .populate('subscription', 'status endDate');

    if (!progress) {
      return res.status(404).json({ message: 'Progression non trouvée' });
    }

    res.json(progress.getStats());
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération de la progression', error: error.message });
  }
});

// Mettre à jour la progression d'une leçon
router.put('/course/:courseId/lesson/:lessonId', async (req, res) => {
  try {
    // Vérifier si l'utilisateur a un abonnement actif pour ce cours
    const subscription = await Subscription.findOne({
      user: req.user._id,
      course: req.params.courseId,
      status: 'active',
    });

    if (!subscription) {
      return res.status(403).json({ message: 'Vous devez avoir un abonnement actif pour ce cours' });
    }

    let progress = await Progress.findOne({
      user: req.user._id,
      course: req.params.courseId,
    });

    if (!progress) {
      // Créer une nouvelle progression si elle n'existe pas
      progress = new Progress({
        user: req.user._id,
        course: req.params.courseId,
        subscription: subscription._id,
      });
    }

    // Mettre à jour la progression de la leçon
    await progress.updateLessonProgress(req.params.lessonId, {
      completed: req.body.completed,
      timeSpent: req.body.timeSpent,
      quizScore: req.body.quizScore,
      notes: req.body.notes,
    });

    res.json(progress.getStats());
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la mise à jour de la progression', error: error.message });
  }
});

// Télécharger une ressource
router.post('/course/:courseId/lesson/:lessonId/resource', async (req, res) => {
  try {
    const progress = await Progress.findOne({
      user: req.user._id,
      course: req.params.courseId,
    });

    if (!progress) {
      return res.status(404).json({ message: 'Progression non trouvée' });
    }

    const lessonProgress = progress.lessonsProgress.find(
      lp => lp.lesson.toString() === req.params.lessonId
    );

    if (!lessonProgress) {
      return res.status(404).json({ message: 'Leçon non trouvée' });
    }

    lessonProgress.resourcesDownloaded.push({
      title: req.body.title,
      url: req.body.url,
      downloadedAt: new Date(),
    });

    await progress.save();
    res.json(progress.getStats());
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de l\'enregistrement du téléchargement', error: error.message });
  }
});

// Générer un certificat
router.post('/course/:courseId/certificate', async (req, res) => {
  try {
    const progress = await Progress.findOne({
      user: req.user._id,
      course: req.params.courseId,
    });

    if (!progress) {
      return res.status(404).json({ message: 'Progression non trouvée' });
    }

    if (!progress.completed) {
      return res.status(400).json({ message: 'Vous devez compléter le cours pour obtenir un certificat' });
    }

    const course = await Course.findById(req.params.courseId);
    const certificateData = {
      name: `Certificat de complétion - ${course.title}`,
      url: `/certificates/${req.user._id}_${course._id}.pdf`, // URL fictive, à implémenter
    };

    await progress.addCertificate(certificateData);
    res.json(progress.getStats());
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la génération du certificat', error: error.message });
  }
});

// Obtenir les statistiques globales de l'utilisateur
router.get('/stats', async (req, res) => {
  try {
    const progress = await Progress.find({ user: req.user._id })
      .populate('course', 'title');

    const stats = {
      totalCourses: progress.length,
      completedCourses: progress.filter(p => p.completed).length,
      totalTimeSpent: progress.reduce((acc, p) => acc + p.totalTimeSpent, 0),
      certificates: progress.reduce((acc, p) => acc + p.certificates.length, 0),
      coursesInProgress: progress.filter(p => !p.completed).map(p => ({
        courseId: p.course._id,
        title: p.course.title,
        progress: p.overallProgress,
      })),
    };

    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération des statistiques', error: error.message });
  }
});

module.exports = router; 