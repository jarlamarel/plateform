const mongoose = require('mongoose');
const Lesson = require('../models/lesson.model');
const Course = require('../models/course.model');
const Resource = require('../models/resource.model');
const logger = require('../utils/logger');

// Obtenir toutes les leçons
exports.getAllLessons = async (req, res) => {
  try {
    // Vérifier si MongoDB est connecté
    if (mongoose.connection.readyState !== 1) {
      // Mode démo - retourner des données fictives
      const demoLessons = [
        {
          _id: 'demo-lesson-1',
          title: 'Variables et types de données',
          description: 'Apprenez à déclarer des variables et comprendre les types de données en JavaScript',
          content: 'Dans cette leçon, nous allons explorer...',
          courseId: 'demo-course-1',
          instructorId: { name: 'John Doe', email: 'john@example.com' },
          duration: 30,
          order: 1,
          isPublished: true
        },
        {
          _id: 'demo-lesson-2',
          title: 'Fonctions et portée',
          description: 'Découvrez comment créer et utiliser des fonctions',
          content: 'Les fonctions sont des blocs de code réutilisables...',
          courseId: 'demo-course-1',
          instructorId: { name: 'John Doe', email: 'john@example.com' },
          duration: 45,
          order: 2,
          isPublished: true
        }
      ];
      
      return res.json(demoLessons);
    }

    const { courseId, search } = req.query;
    const query = { isDeleted: false };

    if (courseId) query.courseId = courseId;
    if (search) {
      query.$text = { $search: search };
    }

    const lessons = await Lesson.find(query)
      .populate('courseId', 'title')
      .populate('instructorId', 'name email')
      .sort('order');

    res.json(lessons);
  } catch (error) {
    logger.error('Erreur lors de la récupération des leçons:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des leçons' });
  }
};

// Obtenir une leçon par son ID
exports.getLessonById = async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.id)
      .populate('courseId', 'title')
      .populate('instructorId', 'name email')
      .populate('resources');

    if (!lesson) {
      return res.status(404).json({ error: 'Leçon non trouvée' });
    }

    res.json(lesson);
  } catch (error) {
    logger.error('Erreur lors de la récupération de la leçon:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération de la leçon' });
  }
};

// Créer une nouvelle leçon
exports.createLesson = async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId || req.body.courseId);
    if (!course) {
      return res.status(404).json({ error: 'Cours non trouvé' });
    }

    const lessonData = {
      ...req.body,
      instructor: req.user.id,
      courseId: course._id,
    };

    const lesson = new Lesson(lessonData);
    await lesson.save();

    course.lessons.push(lesson._id);
    await course.save();

    logger.info(`Nouvelle leçon créée: ${lesson._id}`);
    res.status(201).json(lesson);
  } catch (error) {
    logger.error('Erreur lors de la création de la leçon:', error);
    res.status(500).json({ error: 'Erreur lors de la création de la leçon' });
  }
};

// Mettre à jour une leçon
exports.updateLesson = async (req, res) => {
  try {
    const lesson = await Lesson.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!lesson) {
      return res.status(404).json({ error: 'Leçon non trouvée' });
    }

    logger.info(`Leçon mise à jour: ${lesson._id}`);
    res.json(lesson);
  } catch (error) {
    logger.error('Erreur lors de la mise à jour de la leçon:', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour de la leçon' });
  }
};

// Supprimer une leçon
exports.deleteLesson = async (req, res) => {
  try {
    const lesson = await Lesson.findByIdAndUpdate(
      req.params.id,
      { isDeleted: true },
      { new: true }
    );

    if (!lesson) {
      return res.status(404).json({ error: 'Leçon non trouvée' });
    }

    const course = await Course.findById(lesson.courseId);
    course.lessons = course.lessons.filter(id => id.toString() !== lesson._id.toString());
    await course.save();

    logger.info(`Leçon supprimée: ${lesson._id}`);
    res.json({ message: 'Leçon supprimée avec succès' });
  } catch (error) {
    logger.error('Erreur lors de la suppression de la leçon:', error);
    res.status(500).json({ error: 'Erreur lors de la suppression de la leçon' });
  }
};

// Obtenir les ressources d'une leçon
exports.getLessonResources = async (req, res) => {
  try {
    const resources = await Resource.find({
      lessonId: req.params.id,
      isDeleted: false,
    }).sort('-createdAt');

    res.json(resources);
  } catch (error) {
    logger.error('Erreur lors de la récupération des ressources:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des ressources' });
  }
};

// Ajouter une ressource à une leçon
exports.addResource = async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.id);
    if (!lesson) {
      return res.status(404).json({ error: 'Leçon non trouvée' });
    }

    const resourceData = {
      ...req.body,
      lessonId: lesson._id,
      courseId: lesson.courseId,
      instructorId: req.user.id,
    };

    const resource = new Resource(resourceData);
    await resource.save();

    lesson.resources.push(resource._id);
    await lesson.save();

    logger.info(`Nouvelle ressource ajoutée à la leçon ${lesson._id}: ${resource._id}`);
    res.status(201).json(resource);
  } catch (error) {
    logger.error('Erreur lors de l\'ajout de la ressource:', error);
    res.status(500).json({ error: 'Erreur lors de l\'ajout de la ressource' });
  }
};

// Mettre à jour une ressource
exports.updateResource = async (req, res) => {
  try {
    const resource = await Resource.findByIdAndUpdate(
      req.params.resourceId,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!resource) {
      return res.status(404).json({ error: 'Ressource non trouvée' });
    }

    logger.info(`Ressource mise à jour: ${resource._id}`);
    res.json(resource);
  } catch (error) {
    logger.error('Erreur lors de la mise à jour de la ressource:', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour de la ressource' });
  }
};

// Supprimer une ressource
exports.deleteResource = async (req, res) => {
  try {
    const resource = await Resource.findByIdAndUpdate(
      req.params.resourceId,
      { isDeleted: true },
      { new: true }
    );

    if (!resource) {
      return res.status(404).json({ error: 'Ressource non trouvée' });
    }

    const lesson = await Lesson.findById(req.params.id);
    lesson.resources = lesson.resources.filter(id => id.toString() !== resource._id.toString());
    await lesson.save();

    logger.info(`Ressource supprimée: ${resource._id}`);
    res.json({ message: 'Ressource supprimée avec succès' });
  } catch (error) {
    logger.error('Erreur lors de la suppression de la ressource:', error);
    res.status(500).json({ error: 'Erreur lors de la suppression de la ressource' });
  }
};

// Réorganiser les leçons
exports.reorderLessons = async (req, res) => {
  try {
    const { lessonIds } = req.body;
    if (!Array.isArray(lessonIds)) {
      return res.status(400).json({ error: 'Les IDs des leçons doivent être un tableau' });
    }

    const course = await Course.findById(req.params.courseId);
    if (!course) {
      return res.status(404).json({ error: 'Cours non trouvé' });
    }

    // Vérifier que toutes les leçons appartiennent au cours
    const lessons = await Lesson.find({
      _id: { $in: lessonIds },
      courseId: course._id,
    });

    if (lessons.length !== lessonIds.length) {
      return res.status(400).json({ error: 'Certaines leçons n\'appartiennent pas au cours' });
    }

    // Mettre à jour l'ordre des leçons
    const updatePromises = lessonIds.map((lessonId, index) => {
      return Lesson.findByIdAndUpdate(lessonId, { order: index + 1 });
    });

    await Promise.all(updatePromises);

    logger.info(`Ordre des leçons mis à jour pour le cours ${course._id}`);
    res.json({ message: 'Ordre des leçons mis à jour avec succès' });
  } catch (error) {
    logger.error('Erreur lors de la réorganisation des leçons:', error);
    res.status(500).json({ error: 'Erreur lors de la réorganisation des leçons' });
  }
};

// Ajouter un prérequis
exports.addPrerequisite = async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.id);
    if (!lesson) {
      return res.status(404).json({ error: 'Leçon non trouvée' });
    }

    const prerequisiteId = req.body.prerequisiteId;
    if (!prerequisiteId) {
      return res.status(400).json({ error: 'ID du prérequis requis' });
    }

    await lesson.addPrerequisite(prerequisiteId);
    logger.info(`Prérequis ajouté à la leçon ${lesson._id}: ${prerequisiteId}`);
    res.json({ message: 'Prérequis ajouté avec succès' });
  } catch (error) {
    logger.error('Erreur lors de l\'ajout du prérequis:', error);
    res.status(500).json({ error: 'Erreur lors de l\'ajout du prérequis' });
  }
};

// Supprimer un prérequis
exports.removePrerequisite = async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.id);
    if (!lesson) {
      return res.status(404).json({ error: 'Leçon non trouvée' });
    }

    const prerequisiteId = req.params.prerequisiteId;
    await lesson.removePrerequisite(prerequisiteId);
    logger.info(`Prérequis supprimé de la leçon ${lesson._id}: ${prerequisiteId}`);
    res.json({ message: 'Prérequis supprimé avec succès' });
  } catch (error) {
    logger.error('Erreur lors de la suppression du prérequis:', error);
    res.status(500).json({ error: 'Erreur lors de la suppression du prérequis' });
  }
};

// Mettre à jour l'ordre d'une leçon
exports.updateOrder = async (req, res) => {
  try {
    const { order } = req.body;
    if (typeof order !== 'number' || order < 0) {
      return res.status(400).json({ error: 'L\'ordre doit être un nombre positif' });
    }

    const lesson = await Lesson.findByIdAndUpdate(
      req.params.id,
      { order },
      { new: true, runValidators: true }
    );

    if (!lesson) {
      return res.status(404).json({ error: 'Leçon non trouvée' });
    }

    logger.info(`Ordre de la leçon mis à jour: ${lesson._id}`);
    res.json(lesson);
  } catch (error) {
    logger.error('Erreur lors de la mise à jour de l\'ordre:', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour de l\'ordre' });
  }
};

// Marquer une leçon comme complétée
exports.markLessonAsComplete = async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.id);
    if (!lesson) {
      return res.status(404).json({ error: 'Leçon non trouvée' });
    }

    await lesson.markAsComplete(req.user.id);
    logger.info(`Leçon marquée comme complétée: ${lesson._id} par ${req.user.id}`);
    res.json({ message: 'Leçon marquée comme complétée' });
  } catch (error) {
    logger.error('Erreur lors du marquage de la leçon:', error);
    res.status(500).json({ error: 'Erreur lors du marquage de la leçon' });
  }
};

// Marquer une leçon comme incomplète
exports.markLessonAsIncomplete = async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.id);
    if (!lesson) {
      return res.status(404).json({ error: 'Leçon non trouvée' });
    }

    await lesson.markAsIncomplete(req.user.id);
    logger.info(`Leçon marquée comme incomplète: ${lesson._id} par ${req.user.id}`);
    res.json({ message: 'Leçon marquée comme incomplète' });
  } catch (error) {
    logger.error('Erreur lors du marquage de la leçon:', error);
    res.status(500).json({ error: 'Erreur lors du marquage de la leçon' });
  }
}; 