const compression = require('compression');
const logger = require('../utils/logger');

// Configuration de la compression
const compressionOptions = {
  // Niveau de compression (1-9, 9 étant le plus élevé)
  level: 6,
  
  // Seuil de taille en octets pour activer la compression
  threshold: 1024, // 1KB
  
  // Types MIME à compresser
  filter: (req, res) => {
    // Ne pas compresser les requêtes non-GET
    if (req.method !== 'GET') {
      return false;
    }

    // Vérifier le type de contenu
    const contentType = res.getHeader('Content-Type');
    if (!contentType) {
      return false;
    }

    // Types MIME à compresser
    const compressibleTypes = [
      'text/plain',
      'text/html',
      'text/css',
      'text/javascript',
      'application/javascript',
      'application/json',
      'application/xml',
      'application/x-www-form-urlencoded',
      'image/svg+xml',
      'application/x-font-ttf',
      'application/x-font-opentype',
      'application/vnd.ms-fontobject',
      'application/x-font-woff',
      'application/x-font-woff2',
    ];

    return compressibleTypes.some(type => contentType.includes(type));
  },

  // Options de compression spécifiques
  options: {
    // Niveau de compression pour les fichiers statiques
    static: {
      level: 9,
    },
    // Niveau de compression pour les réponses dynamiques
    dynamic: {
      level: 6,
    },
  },
};

// Middleware de compression pour les fichiers statiques
exports.staticCompression = compression({
  ...compressionOptions,
  ...compressionOptions.options.static,
  filter: (req, res) => {
    // Ne compresser que les fichiers statiques
    return req.path.startsWith('/static/') || req.path.startsWith('/public/');
  },
});

// Middleware de compression pour les réponses dynamiques
exports.dynamicCompression = compression({
  ...compressionOptions,
  ...compressionOptions.options.dynamic,
  filter: (req, res) => {
    // Ne pas compresser les fichiers statiques
    return !req.path.startsWith('/static/') && !req.path.startsWith('/public/');
  },
});

// Middleware de compression pour les API
exports.apiCompression = compression({
  ...compressionOptions,
  filter: (req, res) => {
    // Ne compresser que les réponses API
    return req.path.startsWith('/api/');
  },
});

// Middleware de compression pour les ressources
exports.resourceCompression = compression({
  ...compressionOptions,
  filter: (req, res) => {
    // Ne compresser que les ressources
    return req.path.startsWith('/resources/');
  },
});

// Middleware de compression pour les téléchargements
exports.downloadCompression = compression({
  ...compressionOptions,
  filter: (req, res) => {
    // Ne compresser que les téléchargements
    return req.path.startsWith('/downloads/');
  },
});

// Middleware de compression pour les images
exports.imageCompression = compression({
  ...compressionOptions,
  filter: (req, res) => {
    // Ne compresser que les images
    const contentType = res.getHeader('Content-Type');
    return contentType && contentType.startsWith('image/');
  },
});

// Middleware de compression pour les documents
exports.documentCompression = compression({
  ...compressionOptions,
  filter: (req, res) => {
    // Ne compresser que les documents
    const contentType = res.getHeader('Content-Type');
    return contentType && (
      contentType.includes('application/pdf') ||
      contentType.includes('application/msword') ||
      contentType.includes('application/vnd.openxmlformats-officedocument.wordprocessingml.document') ||
      contentType.includes('application/vnd.ms-excel') ||
      contentType.includes('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') ||
      contentType.includes('application/vnd.ms-powerpoint') ||
      contentType.includes('application/vnd.openxmlformats-officedocument.presentationml.presentation')
    );
  },
});

// Middleware de compression pour les vidéos
exports.videoCompression = compression({
  ...compressionOptions,
  filter: (req, res) => {
    // Ne compresser que les vidéos
    const contentType = res.getHeader('Content-Type');
    return contentType && contentType.startsWith('video/');
  },
});

// Middleware de compression pour les audios
exports.audioCompression = compression({
  ...compressionOptions,
  filter: (req, res) => {
    // Ne compresser que les audios
    const contentType = res.getHeader('Content-Type');
    return contentType && contentType.startsWith('audio/');
  },
});

// Middleware de compression pour les polices
exports.fontCompression = compression({
  ...compressionOptions,
  filter: (req, res) => {
    // Ne compresser que les polices
    const contentType = res.getHeader('Content-Type');
    return contentType && (
      contentType.includes('font/') ||
      contentType.includes('application/x-font-ttf') ||
      contentType.includes('application/x-font-opentype') ||
      contentType.includes('application/vnd.ms-fontobject') ||
      contentType.includes('application/x-font-woff') ||
      contentType.includes('application/x-font-woff2')
    );
  },
}); 