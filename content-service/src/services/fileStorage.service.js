const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');
const logger = require('../utils/logger');

class LocalFileStorageService {
  constructor() {
    this.uploadDir = process.env.UPLOAD_DIR || 'uploads';
    this.baseUrl = process.env.BASE_URL || 'http://localhost:3003';
    this.ensureUploadDirectory();
  }

  // Créer le répertoire d'upload s'il n'existe pas
  async ensureUploadDirectory() {
    try {
      await fs.access(this.uploadDir);
    } catch (error) {
      await fs.mkdir(this.uploadDir, { recursive: true });
      logger.info(`Répertoire d'upload créé: ${this.uploadDir}`);
    }
  }

  // Générer un nom de fichier unique
  generateUniqueFileName(originalName) {
    const timestamp = Date.now();
    const randomString = crypto.randomBytes(8).toString('hex');
    const extension = path.extname(originalName);
    const nameWithoutExt = path.basename(originalName, extension);
    return `${timestamp}-${randomString}-${nameWithoutExt}${extension}`;
  }

  // Sauvegarder un fichier
  async saveFile(file, subdirectory = '') {
    try {
      const fileName = this.generateUniqueFileName(file.originalname);
      const relativePath = subdirectory ? path.join(subdirectory, fileName) : fileName;
      const fullPath = path.join(this.uploadDir, relativePath);
      
      // Créer le sous-répertoire s'il n'existe pas
      if (subdirectory) {
        const subDirPath = path.join(this.uploadDir, subdirectory);
        await fs.mkdir(subDirPath, { recursive: true });
      }

      // Déplacer le fichier temporaire vers sa destination finale
      await fs.rename(file.path, fullPath);

      const fileInfo = {
        originalName: file.originalname,
        fileName: fileName,
        path: fullPath,
        relativePath: relativePath,
        size: file.size,
        mimeType: file.mimetype,
        url: `${this.baseUrl}/uploads/${relativePath}`,
        key: relativePath // Pour compatibilité avec l'ancien système S3
      };

      logger.info(`Fichier sauvegardé: ${fileInfo.url}`);
      return fileInfo;
    } catch (error) {
      logger.error('Erreur lors de la sauvegarde du fichier:', error);
      throw new Error('Erreur lors de la sauvegarde du fichier');
    }
  }

  // Supprimer un fichier
  async deleteFile(filePath) {
    try {
      const fullPath = path.join(this.uploadDir, filePath);
      await fs.unlink(fullPath);
      logger.info(`Fichier supprimé: ${fullPath}`);
      return true;
    } catch (error) {
      logger.error('Erreur lors de la suppression du fichier:', error);
      return false;
    }
  }

  // Vérifier si un fichier existe
  async fileExists(filePath) {
    try {
      const fullPath = path.join(this.uploadDir, filePath);
      await fs.access(fullPath);
      return true;
    } catch (error) {
      return false;
    }
  }

  // Obtenir les informations d'un fichier
  async getFileInfo(filePath) {
    try {
      const fullPath = path.join(this.uploadDir, filePath);
      const stats = await fs.stat(fullPath);
      return {
        size: stats.size,
        created: stats.birthtime,
        modified: stats.mtime,
        path: fullPath,
        url: `${this.baseUrl}/uploads/${filePath}`
      };
    } catch (error) {
      logger.error('Erreur lors de la récupération des infos du fichier:', error);
      return null;
    }
  }

  // Créer une version d'un fichier (copie)
  async createVersion(originalFilePath, newFile) {
    try {
      const versionFileName = this.generateUniqueFileName(newFile.originalname);
      const versionPath = path.join(path.dirname(originalFilePath), `v${Date.now()}-${versionFileName}`);
      const fullVersionPath = path.join(this.uploadDir, versionPath);

      // Créer le répertoire s'il n'existe pas
      const versionDir = path.dirname(fullVersionPath);
      await fs.mkdir(versionDir, { recursive: true });

      // Déplacer le nouveau fichier
      await fs.rename(newFile.path, fullVersionPath);

      return {
        fileName: versionFileName,
        path: versionPath,
        url: `${this.baseUrl}/uploads/${versionPath}`,
        size: newFile.size,
        mimeType: newFile.mimetype,
        createdAt: new Date()
      };
    } catch (error) {
      logger.error('Erreur lors de la création de la version:', error);
      throw new Error('Erreur lors de la création de la version');
    }
  }

  // Lister les fichiers dans un répertoire
  async listFiles(directory = '') {
    try {
      const fullPath = path.join(this.uploadDir, directory);
      const files = await fs.readdir(fullPath);
      const fileList = [];

      for (const file of files) {
        const filePath = path.join(fullPath, file);
        const stats = await fs.stat(filePath);
        
        if (stats.isFile()) {
          fileList.push({
            name: file,
            path: path.join(directory, file),
            size: stats.size,
            created: stats.birthtime,
            modified: stats.mtime,
            url: `${this.baseUrl}/uploads/${path.join(directory, file)}`
          });
        }
      }

      return fileList;
    } catch (error) {
      logger.error('Erreur lors de la liste des fichiers:', error);
      return [];
    }
  }

  // Obtenir le chemin complet d'un fichier
  getFullPath(relativePath) {
    return path.join(this.uploadDir, relativePath);
  }

  // Obtenir l'URL publique d'un fichier
  getPublicUrl(relativePath) {
    return `${this.baseUrl}/uploads/${relativePath}`;
  }
}

module.exports = new LocalFileStorageService(); 