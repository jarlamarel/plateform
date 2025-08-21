const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const winston = require('winston');
const config = require('./config');

// Configuration du logger
const logger = winston.createLogger({
  level: config.logging.level,
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});

if (config.nodeEnv !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple(),
  }));
}

// Configuration de l'application Express
const app = express();

// Middleware de sécurité
app.use(helmet());
app.use(cors({
  origin: config.security.corsOrigin
}));
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: config.security.rateLimitWindowMs,
  max: config.security.rateLimitMaxRequests,
  message: 'Trop de requêtes, veuillez réessayer plus tard.'
});
app.use(limiter);

// Connexion à MongoDB
mongoose.connect(config.mongodb.uri)
.then(() => logger.info('Connecté à MongoDB'))
.catch((err) => logger.error('Erreur de connexion à MongoDB:', err));

// Routes
app.use('/api/payments', require('./routes/payment.routes'));
app.use('/api/subscriptions', require('./routes/subscription.routes'));
app.use('/api/webhooks', require('./routes/webhook.routes'));
app.use('/health', require('./routes/health.routes'));

// Documentation Swagger
const swaggerDocument = YAML.load('./swagger.yaml');
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Gestion des erreurs
app.use((err, req, res, next) => {
  logger.error(err.stack);
  res.status(500).json({
    message: 'Une erreur est survenue!',
    error: config.nodeEnv === 'development' ? err.message : undefined
  });
});

// Démarrage du serveur
app.listen(config.port, () => {
  logger.info(`Service de paiement démarré sur le port ${config.port}`);
}); 