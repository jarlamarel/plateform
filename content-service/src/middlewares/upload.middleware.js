const multer = require('multer');
const path = require('path');
const crypto = require('crypto');
const logger = require('../utils/logger');

// Configuration du stockage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = crypto.randomBytes(16).toString('hex');
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  },
});

// Filtre des types de fichiers
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'image/jpeg',
    'image/png',
    'image/gif',
    'video/mp4',
    'video/webm',
    'audio/mpeg',
    'audio/wav',
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Type de fichier non supporté'), false);
  }
};

// Configuration de Multer
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB pour les vidéos
  },
});

// Middleware de gestion des erreurs de téléchargement
const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        error: 'Le fichier est trop volumineux',
        details: 'La taille maximale autorisée est de 50MB',
      });
    }
    return res.status(400).json({
      error: 'Erreur lors du téléchargement du fichier',
      details: err.message,
    });
  }

  if (err) {
    logger.error('Erreur de téléchargement:', err);
    return res.status(400).json({
      error: 'Erreur lors du téléchargement du fichier',
      details: err.message,
    });
  }

  next();
};

// Middleware pour le téléchargement d'un seul fichier
exports.uploadSingle = (fieldName) => [
  upload.single(fieldName),
  handleUploadError,
];

// Middleware pour le téléchargement de plusieurs fichiers
exports.uploadMultiple = (fieldName, maxCount) => [
  upload.array(fieldName, maxCount),
  handleUploadError,
];

// Middleware pour le téléchargement de fichiers spécifiques
exports.uploadFields = (fields) => [
  upload.fields(fields),
  handleUploadError,
];

// Middleware pour la validation des fichiers
exports.validateFile = (req, res, next) => {
  if (!req.file && !req.files) {
    return res.status(400).json({
      error: 'Aucun fichier n\'a été téléchargé',
    });
  }

  const file = req.file || req.files[0];
  if (!file) {
    return res.status(400).json({
      error: 'Fichier invalide',
    });
  }

  // Vérifier l'extension du fichier
  const ext = path.extname(file.originalname).toLowerCase();
  const allowedExtensions = [
    '.pdf',
    '.doc',
    '.docx',
    '.xls',
    '.xlsx',
    '.ppt',
    '.pptx',
    '.jpg',
    '.jpeg',
    '.png',
    '.gif',
    '.mp4',
    '.webm',
    '.mp3',
    '.wav',
  ];

  if (!allowedExtensions.includes(ext)) {
    return res.status(400).json({
      error: 'Extension de fichier non supportée',
      details: 'Les extensions autorisées sont: ' + allowedExtensions.join(', '),
    });
  }

  next();
};

// Middleware pour le nettoyage des fichiers temporaires
exports.cleanupTempFiles = (req, res, next) => {
  res.on('finish', () => {
    if (req.file) {
      const fs = require('fs');
      const filePath = req.file.path;
      fs.unlink(filePath, (err) => {
        if (err) {
          logger.error('Erreur lors de la suppression du fichier temporaire:', err);
        }
      });
    }
  });
  next();
}; 