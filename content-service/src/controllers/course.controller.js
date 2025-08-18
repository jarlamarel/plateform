const mongoose = require('mongoose');
const axios = require('axios');
const Course = require('../models/course.model');
const Lesson = require('../models/lesson.model');
const Resource = require('../models/resource.model');
const logger = require('../utils/logger');
const config = require('../config');

// Obtenir tous les cours
exports.getAllCourses = async (req, res) => {
  try {
    // Vérifier si MongoDB est connecté
    if (mongoose.connection.readyState !== 1) {
      // Mode démo - retourner des données fictives
      const demoCourses = [
        {
          _id: 'demo-course-1',
          title: 'Introduction à JavaScript',
          description: 'Apprenez les bases de JavaScript',
          category: 'programming',
          level: 'beginner',
          price: 29.99,
          duration: 120,
          thumbnail: 'https://via.placeholder.com/300x200',
          instructor: { name: 'John Doe', email: 'john@example.com' },
          rating: { average: 4.5, count: 25 },
          createdAt: new Date()
        },
        {
          _id: 'demo-course-2',
          title: 'React pour débutants',
          description: 'Créez votre première application React',
          category: 'programming',
          level: 'beginner',
          price: 39.99,
          duration: 180,
          thumbnail: 'https://via.placeholder.com/300x200',
          instructor: { name: 'Jane Smith', email: 'jane@example.com' },
          rating: { average: 4.8, count: 42 },
          createdAt: new Date()
        }
      ];
      
      // Ajouter des headers pour éviter la mise en cache
      res.set({
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      });
      
      return res.json(demoCourses);
    }

    const { category, level, language, search } = req.query;
    const query = {}; // Start with empty query to see all courses

    if (category) query.category = category;
    if (level) query.level = level;
    if (language) query.language = language;
    if (search) {
      query.$text = { $search: search };
    }

    logger.info('Course query:', query);
    logger.info('MongoDB connection state:', mongoose.connection.readyState);

    const courses = await Course.find(query)
      .sort('-createdAt');

    logger.info('Courses found:', courses.length);
    if (courses.length > 0) {
      logger.info('First course:', { title: courses[0].title, status: courses[0].status, isDeleted: courses[0].isDeleted });
    }

    // If no courses found, return demo courses as fallback
    if (courses.length === 0) {
      logger.info('No courses found in database, returning demo courses');
      const demoCourses = [
        {
          _id: 'demo-course-1',
          title: 'Introduction à JavaScript',
          description: 'Apprenez les bases de JavaScript',
          category: 'programming',
          level: 'beginner',
          price: 29.99,
          duration: 120,
          thumbnail: 'https://via.placeholder.com/300x200',
          instructor: { name: 'John Doe', email: 'john@example.com' },
          rating: { average: 4.5, count: 25 },
          createdAt: new Date()
        },
        {
          _id: 'demo-course-2',
          title: 'React pour débutants',
          description: 'Créez votre première application React',
          category: 'programming',
          level: 'beginner',
          price: 39.99,
          duration: 180,
          thumbnail: 'https://via.placeholder.com/300x200',
          instructor: { name: 'Jane Smith', email: 'jane@example.com' },
          rating: { average: 4.8, count: 42 },
          createdAt: new Date()
        }
      ];
      
      res.set({
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      });
      
      return res.json(demoCourses);
    }

    // Ajouter des headers pour éviter la mise en cache
    res.set({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
    
    res.json(courses);
  } catch (error) {
    logger.error('Erreur lors de la récupération des cours:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des cours' });
  }
};

// Obtenir un cours par son ID
exports.getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('lessons');

    if (!course) {
      return res.status(404).json({ error: 'Cours non trouvé' });
    }

    // Récupérer les données de l'instructeur depuis l'auth-service
    let instructorData = null;
    if (course.instructor) {
      try {
        const authServiceUrl = config.services.auth.url;
        const instructorResponse = await axios.get(`${authServiceUrl}/api/users/${course.instructor}`);
        
        if (instructorResponse.data) {
          instructorData = {
            _id: instructorResponse.data._id,
            firstName: instructorResponse.data.firstName,
            lastName: instructorResponse.data.lastName,
            email: instructorResponse.data.email,
            role: instructorResponse.data.role
          };
        }
      } catch (error) {
        logger.warn(`Impossible de récupérer les données de l'instructeur ${course.instructor}:`, error.message);
        // On continue sans les données de l'instructeur plutôt que de faire échouer toute la requête
      }
    }

    // Adapter la structure pour le frontend
    const courseData = {
      ...course.toObject(),
      // Remplacer l'ID de l'instructeur par les données complètes
      instructor: instructorData,
      // Créer une structure de sections pour la compatibilité frontend
      sections: course.lessons && course.lessons.length > 0 ? [
        {
          _id: 'main-section',
          title: 'Contenu du cours',
          lessons: course.lessons.map(lesson => ({
            _id: lesson._id,
            title: lesson.title || 'Leçon sans titre',
            type: lesson.videoUrl ? 'video' : 'text',
            duration: lesson.duration || 0,
            completed: false,
            description: lesson.description || '',
            content: lesson.content || '',
            videoUrl: lesson.videoUrl || null
          }))
        }
      ] : [],
      // Garder aussi le format original pour la compatibilité
      totalStudents: course.enrolledStudents ? course.enrolledStudents.length : 0
    };

    res.json(courseData);
  } catch (error) {
    logger.error('Erreur lors de la récupération du cours:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération du cours' });
  }
};

// Créer un nouveau cours
exports.createCourse = async (req, res) => {
  try {
    const courseData = {
      ...req.body,
      instructor: req.user.id,
    };

    const course = new Course(courseData);
    await course.save();

    logger.info(`Nouveau cours créé: ${course._id}`);
    res.status(201).json(course);
  } catch (error) {
    logger.error('Erreur lors de la création du cours:', error);
    res.status(500).json({ error: 'Erreur lors de la création du cours' });
  }
};

// Mettre à jour un cours
exports.updateCourse = async (req, res) => {
  try {
    const course = await Course.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!course) {
      return res.status(404).json({ error: 'Cours non trouvé' });
    }

    logger.info(`Cours mis à jour: ${course._id}`);
    res.json(course);
  } catch (error) {
    logger.error('Erreur lors de la mise à jour du cours:', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour du cours' });
  }
};

// Supprimer un cours
exports.deleteCourse = async (req, res) => {
  try {
    const course = await Course.findByIdAndUpdate(
      req.params.id,
      { isDeleted: true },
      { new: true }
    );

    if (!course) {
      return res.status(404).json({ error: 'Cours non trouvé' });
    }

    logger.info(`Cours supprimé: ${course._id}`);
    res.json({ message: 'Cours supprimé avec succès' });
  } catch (error) {
    logger.error('Erreur lors de la suppression du cours:', error);
    res.status(500).json({ error: 'Erreur lors de la suppression du cours' });
  }
};

// Obtenir les leçons d'un cours
exports.getCourseLessons = async (req, res) => {
  try {
    const lessons = await Lesson.find({ courseId: req.params.id, isDeleted: false })
      .sort('order');

    res.json(lessons);
  } catch (error) {
    logger.error('Erreur lors de la récupération des leçons:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des leçons' });
  }
};

// Ajouter une leçon à un cours
exports.addLesson = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ error: 'Cours non trouvé' });
    }

    // Validation des données d'entrée
    const { title, description, content, duration } = req.body;
    
    if (!title || title.trim().length < 3) {
      return res.status(400).json({ error: 'Le titre doit contenir au moins 3 caractères' });
    }
    
    if (!description || description.trim().length < 10) {
      return res.status(400).json({ error: 'La description doit contenir au moins 10 caractères' });
    }
    
    if (!content || content.trim().length === 0) {
      return res.status(400).json({ error: 'Le contenu est requis' });
    }

    // Obtenir l'instructeur (depuis l'authentification ou utiliser l'instructeur du cours)
    const instructorId = req.user?.id || req.user?._id || course.instructor;
    
    if (!instructorId) {
      return res.status(401).json({ error: 'Instructeur non identifié. Veuillez vous reconnecter.' });
    }

    const lessonData = {
      title: title.trim(),
      description: description.trim(),
      content: content.trim(),
      duration: parseInt(duration) || 0,
      courseId: course._id,
      instructor: instructorId,
    };

    logger.info('Données de la leçon à créer:', lessonData);

    const lesson = new Lesson(lessonData);
    await lesson.save();

    course.lessons.push(lesson._id);
    await course.save();

    logger.info(`Nouvelle leçon ajoutée au cours ${course._id}: ${lesson._id}`);
    res.status(201).json(lesson);
  } catch (error) {
    logger.error('Erreur lors de l\'ajout de la leçon:', error);
    
    // Gestion spécifique des erreurs de validation Mongoose
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        error: 'Erreur de validation',
        details: validationErrors
      });
    }
    
    res.status(500).json({ error: 'Erreur lors de l\'ajout de la leçon' });
  }
};

// Mettre à jour une leçon
exports.updateLesson = async (req, res) => {
  try {
    const lesson = await Lesson.findByIdAndUpdate(
      req.params.lessonId,
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
      req.params.lessonId,
      { isDeleted: true },
      { new: true }
    );

    if (!lesson) {
      return res.status(404).json({ error: 'Leçon non trouvée' });
    }

    const course = await Course.findById(req.params.id);
    course.lessons = course.lessons.filter(id => id.toString() !== lesson._id.toString());
    await course.save();

    logger.info(`Leçon supprimée: ${lesson._id}`);
    res.json({ message: 'Leçon supprimée avec succès' });
  } catch (error) {
    logger.error('Erreur lors de la suppression de la leçon:', error);
    res.status(500).json({ error: 'Erreur lors de la suppression de la leçon' });
  }
};

// Inscrire un étudiant à un cours
exports.enrollInCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ error: 'Cours non trouvé' });
    }

    await course.enrollStudent(req.user.id);
    logger.info(`Étudiant ${req.user.id} inscrit au cours ${course._id}`);
    res.json({ message: 'Inscription réussie' });
  } catch (error) {
    logger.error('Erreur lors de l\'inscription au cours:', error);
    res.status(500).json({ error: 'Erreur lors de l\'inscription au cours' });
  }
};

// Désinscrire un étudiant d'un cours
exports.unenrollFromCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ error: 'Cours non trouvé' });
    }

    await course.unenrollStudent(req.user.id);
    logger.info(`Étudiant ${req.user.id} désinscrit du cours ${course._id}`);
    res.json({ message: 'Désinscription réussie' });
  } catch (error) {
    logger.error('Erreur lors de la désinscription du cours:', error);
    res.status(500).json({ error: 'Erreur lors de la désinscription du cours' });
  }
};

// Noter un cours
exports.rateCourse = async (req, res) => {
  try {
    const { rating } = req.body;
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'La note doit être comprise entre 1 et 5' });
    }

    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ error: 'Cours non trouvé' });
    }

    await course.updateRating(rating);
    logger.info(`Cours ${course._id} noté: ${rating}`);
    res.json({ message: 'Note enregistrée avec succès' });
  } catch (error) {
    logger.error('Erreur lors de la notation du cours:', error);
    res.status(500).json({ error: 'Erreur lors de la notation du cours' });
  }
};

// Obtenir la note d'un cours
exports.getCourseRating = async (req, res) => {
  try {
    // Vérifier si MongoDB est connecté
    if (mongoose.connection.readyState !== 1) {
      return res.json({
        average: 4.5,
        count: 25,
      });
    }

    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ error: 'Cours non trouvé' });
    }

    res.json({
      average: course.rating.average,
      count: course.rating.count,
    });
  } catch (error) {
    logger.error('Erreur lors de la récupération de la note du cours:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération de la note du cours' });
  }
};

// Réorganiser les leçons
exports.reorderLessons = async (req, res) => {
  try {
    const { lessonIds } = req.body;
    
    if (!Array.isArray(lessonIds)) {
      return res.status(400).json({ error: 'lessonIds doit être un tableau' });
    }

    // Mettre à jour l'ordre de chaque leçon
    for (let i = 0; i < lessonIds.length; i++) {
      await Lesson.findByIdAndUpdate(lessonIds[i], { order: i });
    }

    logger.info(`Leçons réorganisées pour le cours ${req.params.id}`);
    res.json({ message: 'Leçons réorganisées avec succès' });
  } catch (error) {
    logger.error('Erreur lors de la réorganisation des leçons:', error);
    res.status(500).json({ error: 'Erreur lors de la réorganisation des leçons' });
  }
};

// Ajouter une ressource
exports.addResource = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ error: 'Cours non trouvé' });
    }

    const resourceData = {
      ...req.body,
      courseId: course._id,
      instructor: req.user.id,
    };

    const resource = new Resource(resourceData);
    await resource.save();

    logger.info(`Nouvelle ressource ajoutée au cours ${course._id}: ${resource._id}`);
    res.status(201).json(resource);
  } catch (error) {
    logger.error('Erreur lors de l\'ajout de la ressource:', error);
    res.status(500).json({ error: 'Erreur lors de l\'ajout de la ressource' });
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

    logger.info(`Ressource supprimée: ${resource._id}`);
    res.json({ message: 'Ressource supprimée avec succès' });
  } catch (error) {
    logger.error('Erreur lors de la suppression de la ressource:', error);
    res.status(500).json({ error: 'Erreur lors de la suppression de la ressource' });
  }
}; 