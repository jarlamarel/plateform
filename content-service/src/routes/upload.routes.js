const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/upload.controller');
const { verifyToken, requireRole } = require('../middlewares/auth.middleware');
const { uploadSingle, uploadMultiple, validateFile } = require('../middlewares/upload.middleware');

// Routes publiques (pour les fichiers publics)
router.get('/files', uploadController.listFiles);
router.get('/files/:filePath', uploadController.getFileInfo);
router.get('/download/:filePath', uploadController.downloadFile);

// Routes protégées (authentification requise)
router.use(verifyToken);

// Upload d'un seul fichier
router.post('/upload', uploadSingle('file'), validateFile, uploadController.uploadSingle);

// Upload de plusieurs fichiers
router.post('/upload-multiple', uploadMultiple('files', 10), validateFile, uploadController.uploadMultiple);

// Créer une version d'un fichier
router.post('/files/:originalFilePath/versions', uploadSingle('file'), validateFile, uploadController.createVersion);

// Routes pour les instructeurs et admins
router.delete('/files/:filePath', requireRole('instructor'), uploadController.deleteFile);

module.exports = router; 