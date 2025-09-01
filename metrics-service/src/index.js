const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const { createServer } = require('http');
const { Server } = require('socket.io');
const cron = require('node-cron');
require('dotenv').config();

const logger = require('./utils/logger');
const errorMiddleware = require('./middlewares/error.middleware');
const authMiddleware = require('./middlewares/auth.middleware');
const validationMiddleware = require('./middlewares/validation.middleware');

// Routes
const metricsRoutes = require('./routes/metrics.routes');
const dashboardRoutes = require('./routes/dashboard.routes');
const analyticsRoutes = require('./routes/analytics.routes');
const healthRoutes = require('./routes/health.routes');

// Services
const metricsCollector = require('./services/metricsCollector.service');
const metricsProcessor = require('./services/metricsProcessor.service');
const dashboardService = require('./services/dashboard.service');

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Configuration
const PORT = process.env.PORT || 3006;
const MONGODB_URI = process.env.MONGODB_URI 

// Middlewares de sécurité et performance
app.use(helmet());
app.use(compression());
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limite chaque IP à 100 requêtes par fenêtre
  message: 'Trop de requêtes depuis cette IP, veuillez réessayer plus tard.'
});
app.use('/api/', limiter);

// Logging
app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));

// Parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Routes
app.use('/api/health', healthRoutes);
app.use('/api/metrics', authMiddleware, metricsRoutes);
app.use('/api/dashboard', authMiddleware, dashboardRoutes);
app.use('/api/analytics', authMiddleware, analyticsRoutes);

// Socket.IO pour les métriques en temps réel
io.on('connection', (socket) => {
  logger.info(`Client connecté: ${socket.id}`);
  
  socket.on('subscribe-metrics', (data) => {
    socket.join(`metrics-${data.serviceName}`);
    logger.info(`Client ${socket.id} s'est abonné aux métriques de ${data.serviceName}`);
  });
  
  socket.on('disconnect', () => {
    logger.info(`Client déconnecté: ${socket.id}`);
  });
});

// Middleware d'erreur
app.use(errorMiddleware);

// Connexion à MongoDB
mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  logger.info('Connexion à MongoDB établie');
})
.catch((error) => {
  logger.error('Erreur de connexion à MongoDB:', error);
  process.exit(1);
});

// Tâches cron pour la collecte automatique de métriques
cron.schedule('*/30 * * * * *', async () => {
  try {
    await metricsCollector.collectSystemMetrics();
    await metricsCollector.collectServiceMetrics();
  } catch (error) {
    logger.error('Erreur lors de la collecte automatique de métriques:', error);
  }
});

// Tâche cron pour le nettoyage des anciennes métriques (tous les jours à 2h du matin)
cron.schedule('0 2 * * *', async () => {
  try {
    await metricsProcessor.cleanOldMetrics();
    logger.info('Nettoyage des anciennes métriques terminé');
  } catch (error) {
    logger.error('Erreur lors du nettoyage des métriques:', error);
  }
});

// Tâche cron pour la génération de rapports quotidiens (tous les jours à 6h du matin)
cron.schedule('0 6 * * *', async () => {
  try {
    await dashboardService.generateDailyReport();
    logger.info('Rapport quotidien généré');
  } catch (error) {
    logger.error('Erreur lors de la génération du rapport quotidien:', error);
  }
});

// Démarrage du serveur
server.listen(PORT, () => {
  logger.info(`Service de métriques démarré sur le port ${PORT}`);
  logger.info(`Mode: ${process.env.NODE_ENV || 'development'}`);
});

// Gestion gracieuse de l'arrêt
process.on('SIGTERM', () => {
  logger.info('SIGTERM reçu, arrêt gracieux...');
  server.close(() => {
    logger.info('Serveur fermé');
    mongoose.connection.close(() => {
      logger.info('Connexion MongoDB fermée');
      process.exit(0);
    });
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT reçu, arrêt gracieux...');
  server.close(() => {
    logger.info('Serveur fermé');
    mongoose.connection.close(() => {
      logger.info('Connexion MongoDB fermée');
      process.exit(0);
    });
  });
});

module.exports = { app, io };
