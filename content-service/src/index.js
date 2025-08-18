// ====================
// Content Service - index.js (version robuste)
// ====================
const path = require('path');
console.log('🚀 Démarrage du content-service...');
require('dotenv').config({ path: '.env' });


// Log des variables d'environnement pour le débogage


//require('dotenv').config();

const fs = require('fs');

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const config = require('./config');
const logger = require('./utils/logger');
const { errorHandler, notFoundHandler } = require('./middlewares/error.middleware');
console.log("test ");
// Création des dossiers nécessaires si absents
const uploadDir = config.storage.uploadDir || 'uploads';
const videoDir = config.storage.video.uploadDir || 'uploads/videos';
const logDir = config.logging.filePath || 'logs';

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log(`📁 Dossier '${uploadDir}' créé`);
}
if (!fs.existsSync(videoDir)) {
  fs.mkdirSync(videoDir, { recursive: true });
  console.log(`📁 Dossier '${videoDir}' créé`);
}
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
  console.log(`📁 Dossier '${logDir}' créé`);
}
console.log("test 2");
const app = express();

// Middlewares globaux
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('combined', { stream: { write: (message) => logger.info(message.trim()) } }));

// Limitation du nombre de requêtes
app.use(
  rateLimit({
    windowMs: config.rateLimit.windowMs,
    max: config.rateLimit.max,
    message: 'Trop de requêtes depuis cette IP, veuillez réessayer plus tard.',
  })
);
console.log("test 3");
// Fichiers statiques (uploads)
app.use('/uploads', express.static(uploadDir));

// Fichiers statiques pour les images (couvertures de cours, etc.)
const publicDir = path.join(__dirname, '..', 'public');
app.use('/images', express.static(path.join(publicDir, 'images')));

// Fichiers statiques pour les vidéos
const videoStaticDir = path.join(__dirname, '..', config.storage.video.uploadDir);
app.use('/videos', express.static(videoStaticDir));

// Route de santé publique
//*app.get('/health', (req, res) => {
  //res.status(200).json({ status: 'ok' });
//});

// Routes API protégées
app.use('/api/content', require('./routes'));

// Gestion des erreurs
app.use(notFoundHandler);
app.use(errorHandler);
console.log("test ");
// Connexion à la base de données
async function connectToDatabase() {
  try {
    console.log(process.env.MONGODB_URI);
    await mongoose.connect(process.env.MONGODB_URI);
    logger.info('✅ Connecté à MongoDB');
    console.log('✅ Connecté à MongoDB');
    return true;
  } catch (err) {
    logger.error('❌ Erreur de connexion à MongoDB:', err.message);
    console.error('❌ Erreur de connexion à MongoDB:', err.message);
    logger.warn('Le service continuera sans base de données (mode démo)');
    console.warn('⚠️  Le service continuera sans base de données (mode démo)');
    return false;
  }
}
console.log("test 4");
// Démarrage du serveur
async function startServer() {
  try {
    const dbConnected = await connectToDatabase();
    const port = config.server.port || 3003;
    const server = app.listen(port, (err) => {
      if (err) {
        logger.error('❌ Erreur lors du démarrage du serveur :', err);
        console.error('❌ Erreur lors du démarrage du serveur :', err);
        process.exit(1);
      }
      logger.info(`✅ Serveur démarré sur le port ${port}`);
      console.log(`✅ Serveur démarré sur le port ${port}`);
      if (!dbConnected) {
        logger.warn('⚠️  Mode démo activé - Base de données non disponible');
        console.warn('⚠️  Mode démo activé - Base de données non disponible');
      }
    });
    server.on('error', (err) => {
      logger.error('❌ Erreur serveur :', err);
      console.error('❌ Erreur serveur :', err);
      process.exit(1);
    });
  } catch (err) {
    logger.error('❌ Exception lors du démarrage du serveur :', err);
    console.error('❌ Exception lors du démarrage du serveur :', err);
    process.exit(1);
  }
}

startServer();
console.log("test 6");
// Gestion des erreurs non capturées
process.on('uncaughtException', (err) => {
  logger.error('Exception non capturée:', err);
  console.error('Exception non capturée:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  logger.error('Rejet de promesse non géré:', reason);
  console.error('Rejet de promesse non géré:', reason);
  process.exit(1);
});

module.exports = app; 