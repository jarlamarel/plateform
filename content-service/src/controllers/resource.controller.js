const mongoose = require('mongoose');
const Resource = require('../models/resource.model');
const Course = require('../models/course.model');
const Lesson = require('../models/lesson.model');
const fileStorage = require('../services/fileStorage.service');
const logger = require('../utils/logger');

// Obtenir toutes les ressources
exports.getAllResources = async (req, res) => {
  try {
    // Vérifier si MongoDB est connecté
    if (mongoose.connection.readyState !== 1) {
      // Mode démo - retourner des données fictives
      const demoResources = [
        {
          _id: 'demo-resource-1',
          title: 'Guide JavaScript PDF',
          description: 'Guide complet pour apprendre JavaScript',
          type: 'document',
          file: {
            url: 'https://example.com/guide-js.pdf',
            key: 'guide-js.pdf',
            size: 2048576,
            mimeType: 'application/pdf'
          },
          courseId: 'demo-course-1',
          lessonId: 'demo-lesson-1',
          instructorId: { name: 'John Doe', email: 'john@example.com' },
          downloads: 15,
          isPublic: true
        },
        {
          _id: 'demo-resource-2',
          title: 'Vidéo Introduction React',
          description: 'Vidéo d\'introduction à React',
          type: 'video',
          file: {
            url: 'https://example.com/intro-react.mp4',
            key: 'intro-react.mp4',
            size: 52428800,
            mimeType: 'video/mp4'
          },
          courseId: 'demo-course-2',
          lessonId: 'demo-lesson-2',
          instructorId: { name: 'Jane Smith', email: 'jane@example.com' },
          downloads: 8,
          isPublic: false
        }
      ];
      
      return res.json(demoResources);
    }

    const { type, courseId, lessonId, search } = req.query;
    const query = { isDeleted: false };

    if (type) query.type = type;
    if (courseId) query.courseId = courseId;
    if (lessonId) query.lessonId = lessonId;
    if (search) {
      query.$text = { $search: search };
    }

    const resources = await Resource.find(query)
      .populate('courseId', 'title')
      .populate('lessonId', 'title')
      .populate('instructorId', 'name email')
      .sort('-createdAt');

    res.json(resources);
  } catch (error) {
    logger.error('Erreur lors de la récupération des ressources:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des ressources' });
  }
};

// Obtenir une ressource par son ID
exports.getResourceById = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id)
      .populate('courseId', 'title')
      .populate('lessonId', 'title')
      .populate('instructorId', 'name email');

    if (!resource) {
      return res.status(404).json({ error: 'Ressource non trouvée' });
    }

    res.json(resource);
  } catch (error) {
    logger.error('Erreur lors de la récupération de la ressource:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération de la ressource' });
  }
};

// Créer une nouvelle ressource
exports.createResource = async (req, res) => {
  try {
    const resourceData = {
      ...req.body,
      instructorId: req.user.id,
    };

    const resource = new Resource(resourceData);
    await resource.save();

    logger.info(`Nouvelle ressource créée: ${resource._id}`);
    res.status(201).json(resource);
  } catch (error) {
    logger.error('Erreur lors de la création de la ressource:', error);
    res.status(500).json({ error: 'Erreur lors de la création de la ressource' });
  }
};

// Mettre à jour une ressource
exports.updateResource = async (req, res) => {
  try {
    const resource = await Resource.findByIdAndUpdate(
      req.params.id,
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
      req.params.id,
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

// Obtenir les statistiques des ressources
exports.getResourceStats = async (req, res) => {
  try {
    const stats = await Resource.aggregate([
      { $match: { isDeleted: false } },
      {
        $group: {
          _id: null,
          totalResources: { $sum: 1 },
          totalDownloads: { $sum: '$downloads' },
          averageDownloads: { $avg: '$downloads' }
        }
      }
    ]);

    res.json(stats[0] || { totalResources: 0, totalDownloads: 0, averageDownloads: 0 });
  } catch (error) {
    logger.error('Erreur lors de la récupération des statistiques:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des statistiques' });
  }
};

// Obtenir les ressources par leçon
exports.getResourcesByLesson = async (req, res) => {
  try {
    const resources = await Resource.find({
      lessonId: req.params.lessonId,
      isDeleted: false,
    }).sort('-createdAt');

    res.json(resources);
  } catch (error) {
    logger.error('Erreur lors de la récupération des ressources par leçon:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des ressources par leçon' });
  }
};

// Obtenir les ressources par cours
exports.getResourcesByCourse = async (req, res) => {
  try {
    const resources = await Resource.find({
      courseId: req.params.courseId,
      isDeleted: false,
    }).sort('-createdAt');

    res.json(resources);
  } catch (error) {
    logger.error('Erreur lors de la récupération des ressources par cours:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des ressources par cours' });
  }
};

// Ajouter une version
exports.addVersion = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);
    if (!resource) {
      return res.status(404).json({ error: 'Ressource non trouvée' });
    }

    await resource.addVersion(req.body);
    logger.info(`Nouvelle version ajoutée à la ressource ${resource._id}`);
    res.json({ message: 'Version ajoutée avec succès' });
  } catch (error) {
    logger.error('Erreur lors de l\'ajout de la version:', error);
    res.status(500).json({ error: 'Erreur lors de l\'ajout de la version' });
  }
};

// Supprimer une version
exports.removeVersion = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);
    if (!resource) {
      return res.status(404).json({ error: 'Ressource non trouvée' });
    }

    const versionIndex = parseInt(req.params.versionId);
    await resource.removeVersion(versionIndex);
    logger.info(`Version supprimée de la ressource ${resource._id}`);
    res.json({ message: 'Version supprimée avec succès' });
  } catch (error) {
    logger.error('Erreur lors de la suppression de la version:', error);
    res.status(500).json({ error: 'Erreur lors de la suppression de la version' });
  }
};

// Incrémenter les téléchargements
exports.incrementDownloads = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);
    if (!resource) {
      return res.status(404).json({ error: 'Ressource non trouvée' });
    }

    await resource.incrementDownloads();
    logger.info(`Téléchargement incrémenté pour la ressource ${resource._id}`);
    res.json({ message: 'Téléchargement enregistré' });
  } catch (error) {
    logger.error('Erreur lors de l\'incrémentation des téléchargements:', error);
    res.status(500).json({ error: 'Erreur lors de l\'incrémentation des téléchargements' });
  }
};

// Télécharger une ressource
exports.downloadResource = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);
    if (!resource) {
      return res.status(404).json({ error: 'Ressource non trouvée' });
    }

    // Incrémenter les téléchargements
    await resource.incrementDownloads();

    // Rediriger vers l'URL du fichier
    res.redirect(resource.file.url);
  } catch (error) {
    logger.error('Erreur lors du téléchargement de la ressource:', error);
    res.status(500).json({ error: 'Erreur lors du téléchargement de la ressource' });
  }
};

// Obtenir les métadonnées d'une ressource
exports.getResourceMetadata = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);
    if (!resource) {
      return res.status(404).json({ error: 'Ressource non trouvée' });
    }

    const metadata = {
      title: resource.title,
      description: resource.description,
      type: resource.type,
      size: resource.file.size,
      mimeType: resource.file.mimeType,
      downloads: resource.downloads,
      createdAt: resource.createdAt,
      updatedAt: resource.updatedAt
    };

    res.json(metadata);
  } catch (error) {
    logger.error('Erreur lors de la récupération des métadonnées:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des métadonnées' });
  }
};

// Obtenir les versions d'une ressource
exports.getResourceVersions = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);
    if (!resource) {
      return res.status(404).json({ error: 'Ressource non trouvée' });
    }

    res.json(resource.versions);
  } catch (error) {
    logger.error('Erreur lors de la récupération des versions:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des versions' });
  }
}; 