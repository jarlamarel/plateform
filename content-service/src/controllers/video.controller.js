const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Lesson = require('../models/lesson.model');
const Course = require('../models/course.model');
const logger = require('../utils/logger');
const config = require('../config');

// Configuration du stockage des vidéos
const videoStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, '..', '..', config.storage.video.uploadDir);
    
    // Créer le dossier s'il n'existe pas
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
      logger.info(`Dossier vidéos créé: ${uploadPath}`);
    }
    
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    // Générer un nom unique pour le fichier avec le courseId et lessonId
    const { lessonId } = req.params;
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    cb(null, `lesson-${lessonId}-${uniqueSuffix}${extension}`);
  }
});

// Filtre pour les types de fichiers vidéo
const videoFileFilter = (req, file, cb) => {
  if (config.storage.video.allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    const allowedFormats = config.storage.video.allowedFormats.join(', ');
    cb(new Error(`Type de fichier non supporté. Utilisez: ${allowedFormats}`), false);
  }
};

// Configuration multer pour les vidéos
const uploadVideo = multer({
  storage: videoStorage,
  fileFilter: videoFileFilter,
  limits: {
    fileSize: config.storage.video.maxFileSize,
  }
});

// Upload d'une vidéo pour une leçon
exports.uploadLessonVideo = async (req, res) => {
  try {
    const { lessonId } = req.params;
    const { title, description } = req.body;

    // Vérifier que la leçon existe
    const lesson = await Lesson.findById(lessonId);
    if (!lesson) {
      return res.status(404).json({ error: 'Leçon non trouvée' });
    }

    // Upload du fichier
    uploadVideo.single('video')(req, res, async (err) => {
      if (err) {
        logger.error('Erreur upload vidéo:', err);
        return res.status(400).json({ error: err.message });
      }

      if (!req.file) {
        return res.status(400).json({ error: 'Aucun fichier vidéo fourni' });
      }

      try {
        // Construire l'URL de la vidéo
        const videoUrl = `${config.storage.baseUrl}/videos/${req.file.filename}`;

        // Mettre à jour la leçon avec les informations de la vidéo
        lesson.videoUrl = videoUrl;
        lesson.videoType = 'local';
        lesson.videoFileName = req.file.filename;
        lesson.videoSize = req.file.size;
        lesson.videoMimeType = req.file.mimetype;
        
        if (title) lesson.title = title;
        if (description) lesson.description = description;

        await lesson.save();

        logger.info(`Vidéo uploadée pour la leçon ${lessonId}: ${req.file.filename}`);

        res.status(200).json({
          message: 'Vidéo uploadée avec succès',
          lesson: {
            id: lesson._id,
            title: lesson.title,
            videoUrl: lesson.videoUrl,
            videoType: lesson.videoType,
            fileSize: lesson.videoSize
          }
        });

      } catch (error) {
        // Supprimer le fichier en cas d'erreur de sauvegarde
        fs.unlink(req.file.path, () => {});
        throw error;
      }
    });

  } catch (error) {
    logger.error('Erreur lors de l\'upload de la vidéo:', error);
    res.status(500).json({ error: 'Erreur lors de l\'upload de la vidéo' });
  }
};

// Streaming de vidéo
exports.streamVideo = async (req, res) => {
  try {
    const { filename } = req.params;
    const videoPath = path.join(__dirname, '..', '..', config.storage.video.uploadDir, filename);

    // Vérifier que le fichier existe
    if (!fs.existsSync(videoPath)) {
      return res.status(404).json({ error: 'Vidéo non trouvée' });
    }

    const stat = fs.statSync(videoPath);
    const fileSize = stat.size;
    const range = req.headers.range;

    if (range) {
      // Streaming partiel (pour la navigation dans la vidéo)
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunksize = (end - start) + 1;
      const file = fs.createReadStream(videoPath, { start, end });
      const head = {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize,
        'Content-Type': 'video/mp4',
      };
      res.writeHead(206, head);
      file.pipe(res);
    } else {
      // Streaming complet
      const head = {
        'Content-Length': fileSize,
        'Content-Type': 'video/mp4',
      };
      res.writeHead(200, head);
      fs.createReadStream(videoPath).pipe(res);
    }

  } catch (error) {
    logger.error('Erreur lors du streaming de la vidéo:', error);
    res.status(500).json({ error: 'Erreur lors du streaming de la vidéo' });
  }
};

// Supprimer une vidéo
exports.deleteVideo = async (req, res) => {
  try {
    const { lessonId } = req.params;

    const lesson = await Lesson.findById(lessonId);
    if (!lesson) {
      return res.status(404).json({ error: 'Leçon non trouvée' });
    }

    // Supprimer le fichier physique si c'est une vidéo locale
    if (lesson.videoType === 'local' && lesson.videoFileName) {
      const videoPath = path.join(__dirname, '..', '..', config.storage.video.uploadDir, lesson.videoFileName);
      if (fs.existsSync(videoPath)) {
        fs.unlinkSync(videoPath);
        logger.info(`Fichier vidéo supprimé: ${lesson.videoFileName}`);
      }
    }

    // Supprimer les références vidéo de la leçon
    lesson.videoUrl = null;
    lesson.videoType = null;
    lesson.videoFileName = null;
    lesson.videoSize = null;
    lesson.videoMimeType = null;

    await lesson.save();

    res.json({ message: 'Vidéo supprimée avec succès' });

  } catch (error) {
    logger.error('Erreur lors de la suppression de la vidéo:', error);
    res.status(500).json({ error: 'Erreur lors de la suppression de la vidéo' });
  }
};

// Obtenir les informations d'une vidéo
exports.getVideoInfo = async (req, res) => {
  try {
    const { lessonId } = req.params;

    const lesson = await Lesson.findById(lessonId);
    if (!lesson) {
      return res.status(404).json({ error: 'Leçon non trouvée' });
    }

    if (!lesson.videoUrl) {
      return res.status(404).json({ error: 'Aucune vidéo associée à cette leçon' });
    }

    const videoInfo = {
      lessonId: lesson._id,
      lessonTitle: lesson.title,
      videoUrl: lesson.videoUrl,
      videoType: lesson.videoType,
      duration: lesson.duration
    };

    // Ajouter des infos supplémentaires pour les vidéos locales
    if (lesson.videoType === 'local') {
      videoInfo.fileName = lesson.videoFileName;
      videoInfo.fileSize = lesson.videoSize;
      videoInfo.mimeType = lesson.videoMimeType;
    }

    res.json(videoInfo);

  } catch (error) {
    logger.error('Erreur lors de la récupération des infos vidéo:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des infos vidéo' });
  }
};