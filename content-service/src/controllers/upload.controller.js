const fileStorage = require('../services/fileStorage.service');
const logger = require('../utils/logger');

// Upload d'un seul fichier
exports.uploadSingle = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Aucun fichier fourni' });
    }

    const { subdirectory } = req.body;
    const fileInfo = await fileStorage.saveFile(req.file, subdirectory);

    res.status(201).json({
      message: 'Fichier uploadé avec succès',
      file: {
        id: fileInfo.fileName,
        originalName: fileInfo.originalName,
        fileName: fileInfo.fileName,
        size: fileInfo.size,
        mimeType: fileInfo.mimeType,
        url: fileInfo.url,
        path: fileInfo.relativePath
      }
    });
  } catch (error) {
    logger.error('Erreur lors de l\'upload du fichier:', error);
    res.status(500).json({ error: 'Erreur lors de l\'upload du fichier' });
  }
};

// Upload de plusieurs fichiers
exports.uploadMultiple = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'Aucun fichier fourni' });
    }

    const { subdirectory } = req.body;
    const uploadedFiles = [];

    for (const file of req.files) {
      const fileInfo = await fileStorage.saveFile(file, subdirectory);
      uploadedFiles.push({
        id: fileInfo.fileName,
        originalName: fileInfo.originalName,
        fileName: fileInfo.fileName,
        size: fileInfo.size,
        mimeType: fileInfo.mimeType,
        url: fileInfo.url,
        path: fileInfo.relativePath
      });
    }

    res.status(201).json({
      message: `${uploadedFiles.length} fichier(s) uploadé(s) avec succès`,
      files: uploadedFiles
    });
  } catch (error) {
    logger.error('Erreur lors de l\'upload des fichiers:', error);
    res.status(500).json({ error: 'Erreur lors de l\'upload des fichiers' });
  }
};

// Supprimer un fichier
exports.deleteFile = async (req, res) => {
  try {
    const { filePath } = req.params;
    
    if (!filePath) {
      return res.status(400).json({ error: 'Chemin du fichier requis' });
    }

    const success = await fileStorage.deleteFile(filePath);
    
    if (success) {
      res.json({ message: 'Fichier supprimé avec succès' });
    } else {
      res.status(404).json({ error: 'Fichier non trouvé' });
    }
  } catch (error) {
    logger.error('Erreur lors de la suppression du fichier:', error);
    res.status(500).json({ error: 'Erreur lors de la suppression du fichier' });
  }
};

// Obtenir les informations d'un fichier
exports.getFileInfo = async (req, res) => {
  try {
    const { filePath } = req.params;
    
    if (!filePath) {
      return res.status(400).json({ error: 'Chemin du fichier requis' });
    }

    const fileInfo = await fileStorage.getFileInfo(filePath);
    
    if (fileInfo) {
      res.json(fileInfo);
    } else {
      res.status(404).json({ error: 'Fichier non trouvé' });
    }
  } catch (error) {
    logger.error('Erreur lors de la récupération des infos du fichier:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des infos du fichier' });
  }
};

// Lister les fichiers dans un répertoire
exports.listFiles = async (req, res) => {
  try {
    const { directory } = req.query;
    const files = await fileStorage.listFiles(directory || '');
    
    res.json({
      directory: directory || '',
      files: files,
      count: files.length
    });
  } catch (error) {
    logger.error('Erreur lors de la liste des fichiers:', error);
    res.status(500).json({ error: 'Erreur lors de la liste des fichiers' });
  }
};

// Créer une version d'un fichier
exports.createVersion = async (req, res) => {
  try {
    const { originalFilePath } = req.params;
    
    if (!req.file) {
      return res.status(400).json({ error: 'Aucun fichier fourni' });
    }

    if (!originalFilePath) {
      return res.status(400).json({ error: 'Chemin du fichier original requis' });
    }

    const versionInfo = await fileStorage.createVersion(originalFilePath, req.file);

    res.status(201).json({
      message: 'Version créée avec succès',
      version: versionInfo
    });
  } catch (error) {
    logger.error('Erreur lors de la création de la version:', error);
    res.status(500).json({ error: 'Erreur lors de la création de la version' });
  }
};

// Télécharger un fichier
exports.downloadFile = async (req, res) => {
  try {
    const { filePath } = req.params;
    
    if (!filePath) {
      return res.status(400).json({ error: 'Chemin du fichier requis' });
    }

    const fullPath = fileStorage.getFullPath(filePath);
    const fs = require('fs');
    
    if (fs.existsSync(fullPath)) {
      res.download(fullPath);
    } else {
      res.status(404).json({ error: 'Fichier non trouvé' });
    }
  } catch (error) {
    logger.error('Erreur lors du téléchargement du fichier:', error);
    res.status(500).json({ error: 'Erreur lors du téléchargement du fichier' });
  }
}; 