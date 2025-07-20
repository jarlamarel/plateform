const express = require('express');
const Course = require('../models/Course');
const router = express.Router();

// Obtenir tous les cours
router.get('/', async (req, res) => {
  try {
    const { category, level, search, sort, page = 1, limit = 10 } = req.query;
    const query = { isPublished: true };

    // Filtres
    if (category) query.category = category;
    if (level) query.level = level;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    // Tri
    let sortOption = {};
    if (sort) {
      switch (sort) {
        case 'price_asc':
          sortOption = { price: 1 };
          break;
        case 'price_desc':
          sortOption = { price: -1 };
          break;
        case 'rating':
          sortOption = { rating: -1 };
          break;
        case 'newest':
          sortOption = { createdAt: -1 };
          break;
        default:
          sortOption = { createdAt: -1 };
      }
    }

    const courses = await Course.find(query)
      .sort(sortOption)
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate('instructor', 'firstName lastName');

    const total = await Course.countDocuments(query);

    res.json({
      courses: courses.map(course => course.getPublicInfo()),
      total,
      pages: Math.ceil(total / limit),
      currentPage: page,
    });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération des cours', error: error.message });
  }
});

// Obtenir un cours spécifique
router.get('/:id', async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('instructor', 'firstName lastName');

    if (!course) {
      return res.status(404).json({ message: 'Cours non trouvé' });
    }

    res.json(course.getPublicInfo());
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération du cours', error: error.message });
  }
});

// Créer un nouveau cours (instructeur uniquement)
router.post('/', async (req, res) => {
  try {
    if (req.user.role !== 'instructor') {
      return res.status(403).json({ message: 'Accès non autorisé' });
    }

    const course = new Course({
      ...req.body,
      instructor: req.user._id,
    });

    await course.save();
    res.status(201).json(course.getPublicInfo());
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la création du cours', error: error.message });
  }
});

// Mettre à jour un cours
router.put('/:id', async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ message: 'Cours non trouvé' });
    }

    if (course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Accès non autorisé' });
    }

    Object.assign(course, req.body);
    await course.save();

    res.json(course.getPublicInfo());
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la mise à jour du cours', error: error.message });
  }
});

// Supprimer un cours
router.delete('/:id', async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ message: 'Cours non trouvé' });
    }

    if (course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Accès non autorisé' });
    }

    await course.remove();
    res.json({ message: 'Cours supprimé avec succès' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la suppression du cours', error: error.message });
  }
});

// Publier un cours
router.post('/:id/publish', async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ message: 'Cours non trouvé' });
    }

    if (course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Accès non autorisé' });
    }

    course.isPublished = true;
    await course.save();

    res.json(course.getPublicInfo());
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la publication du cours', error: error.message });
  }
});

// Ajouter une leçon à un cours
router.post('/:id/lessons', async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ message: 'Cours non trouvé' });
    }

    if (course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Accès non autorisé' });
    }

    course.lessons.push(req.body);
    await course.save();

    res.json(course.getPublicInfo());
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de l\'ajout de la leçon', error: error.message });
  }
});

// Mettre à jour une leçon
router.put('/:courseId/lessons/:lessonId', async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId);

    if (!course) {
      return res.status(404).json({ message: 'Cours non trouvé' });
    }

    if (course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Accès non autorisé' });
    }

    const lesson = course.lessons.id(req.params.lessonId);
    if (!lesson) {
      return res.status(404).json({ message: 'Leçon non trouvée' });
    }

    Object.assign(lesson, req.body);
    await course.save();

    res.json(course.getPublicInfo());
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la mise à jour de la leçon', error: error.message });
  }
});

// Supprimer une leçon
router.delete('/:courseId/lessons/:lessonId', async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId);

    if (!course) {
      return res.status(404).json({ message: 'Cours non trouvé' });
    }

    if (course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Accès non autorisé' });
    }

    course.lessons.pull(req.params.lessonId);
    await course.save();

    res.json(course.getPublicInfo());
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la suppression de la leçon', error: error.message });
  }
});

module.exports = router; 