require('dotenv').config();

module.exports = {
  // Configuration du serveur
  server: {
    port: process.env.PORT || 3003,
    env: process.env.NODE_ENV || 'development',
  },

  // Configuration de la base de données
  database: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/content-service',
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    },
  },

  // Configuration JWT
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key',
    expiresIn: process.env.JWT_EXPIRATION || '1d',
  },

  // Configuration du stockage local
  storage: {
    type: 'local', // 'local' ou 's3' pour une future migration
    uploadDir: process.env.UPLOAD_DIR || 'uploads',
    baseUrl: process.env.BASE_URL || 'http://localhost:3003',
    maxFileSize: 100 * 1024 * 1024, // 100MB pour les documents
    video: {
      uploadDir: process.env.VIDEO_UPLOAD_DIR || 'uploads/videos',
      maxFileSize: 500 * 1024 * 1024, // 500MB pour les vidéos
      allowedFormats: ['mp4', 'webm', 'mov', 'avi'],
      allowedMimeTypes: [
        'video/mp4',
        'video/webm', 
        'video/quicktime',
        'video/x-msvideo'
      ]
    }
  },

  // Configuration du rate limiting
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000, // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  },

  // Configuration des logs
  logging: {
    level: process.env.LOG_LEVEL || 'debug',
    filePath: process.env.LOG_FILE_PATH || 'logs',
  },

  // Configuration des services externes
  services: {
    auth: {
      url: process.env.AUTH_SERVICE_URL || 'http://localhost:3001',
    },
    payment: {
      url: process.env.PAYMENT_SERVICE_URL || 'http://localhost:3002',
    },
    notification: {
      url: process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:3004',
    },
  },

  // Configuration des uploads
  upload: {
    maxFileSize: 5 * 1024 * 1024, // 5MB
    allowedMimeTypes: [
      'image/jpeg',
      'image/png',
      'image/gif',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'video/mp4',
      'video/webm',
    ],
  },
}; 