require('dotenv').config();

module.exports = {
  // Configuration du serveur
  port: process.env.PORT || 3005,
  nodeEnv: process.env.NODE_ENV || 'development',

  // Configuration de la base de données
  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb+srv://dalidhouib08:100-Ocho@cluster0.zfkt3sa.mongodb.net/payments?retryWrites=true&w=majority&appName=Cluster0'
  },

  // Configuration de Stripe
  stripe: {
    secretKey:'sk_test_51RcrfTP8JvsmqhfIrdctfWECmr17k5cazv1gfwk7KUYYQOJNpItEqKE5fbAUzsbWOSTedDOhr9ZTJnu9BcoxCPlo00OXWIYk6g' ,
    publishableKey: 'pk_test_51RcrfTP8JvsmqhfIYXZyUQ9raCR89CMY4YmuCzRo4E0fk3yX4m7scNO77KVppsvwPtC8F1zlAlao6mNF4y96kDtF001D4BXyz0',
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET
  },

  // Configuration JWT
  jwt: {
    secret: process.env.JWT_SECRET || 'votre_secret_jwt',
    expiration: process.env.JWT_EXPIRATION || '24h'
  },

  // Configuration des URLs des services
  services: {
    frontend: process.env.FRONTEND_URL || 'http://localhost:3000',
    auth: process.env.AUTH_SERVICE_URL || 'http://localhost:3001',
    course: process.env.COURSE_SERVICE_URL || 'http://localhost:3003'
  },
  
  // URLs individuelles (pour compatibilité)
  authServiceUrl: process.env.AUTH_SERVICE_URL || 'http://localhost:3001',
  courseServiceUrl: process.env.COURSE_SERVICE_URL || 'http://localhost:3003',

  // Configuration des logs
  logging: {
    level: process.env.LOG_LEVEL || 'info'
  },

  // Configuration de sécurité
  security: {
    corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000, // 15 minutes
    rateLimitMaxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100
  }
};
