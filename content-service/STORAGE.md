# Système de Stockage Local

Le content-service utilise maintenant un système de stockage local pour les fichiers (vidéos, documents, images) au lieu d'AWS S3.

## Configuration

### Variables d'environnement

```env
# Configuration du stockage local
UPLOAD_DIR=uploads                    # Dossier de stockage des fichiers
BASE_URL=http://localhost:3003        # URL de base du service
```

### Structure des dossiers

```
content-service/
├── uploads/                          # Dossier principal des uploads
│   ├── videos/                       # Vidéos de cours
│   ├── documents/                    # Documents PDF, etc.
│   ├── images/                       # Images et thumbnails
│   └── audio/                        # Fichiers audio
```

## API Endpoints

### Upload de fichiers

#### Upload d'un seul fichier
```http
POST /api/content/uploads/upload
Content-Type: multipart/form-data

file: [fichier]
subdirectory: videos (optionnel)
```

**Réponse :**
```json
{
  "message": "Fichier uploadé avec succès",
  "file": {
    "id": "1703123456789-abc123-video.mp4",
    "originalName": "video.mp4",
    "fileName": "1703123456789-abc123-video.mp4",
    "size": 52428800,
    "mimeType": "video/mp4",
    "url": "http://localhost:3003/uploads/videos/1703123456789-abc123-video.mp4",
    "path": "videos/1703123456789-abc123-video.mp4"
  }
}
```

#### Upload de plusieurs fichiers
```http
POST /api/content/uploads/upload-multiple
Content-Type: multipart/form-data

files: [fichier1, fichier2, ...]
subdirectory: documents (optionnel)
```

### Gestion des fichiers

#### Lister les fichiers
```http
GET /api/content/uploads/files?directory=videos
```

#### Obtenir les infos d'un fichier
```http
GET /api/content/uploads/files/videos/1703123456789-abc123-video.mp4
```

#### Télécharger un fichier
```http
GET /api/content/uploads/download/videos/1703123456789-abc123-video.mp4
```

#### Supprimer un fichier (instructeur uniquement)
```http
DELETE /api/content/uploads/files/videos/1703123456789-abc123-video.mp4
```

#### Créer une version d'un fichier
```http
POST /api/content/uploads/files/videos/1703123456789-abc123-video.mp4/versions
Content-Type: multipart/form-data

file: [nouveau fichier]
```

## Types de fichiers supportés

### Vidéos
- MP4, WebM
- Taille max : 100MB

### Documents
- PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX
- Taille max : 100MB

### Images
- JPEG, PNG, GIF
- Taille max : 100MB

### Audio
- MP3, WAV
- Taille max : 100MB

## Sécurité

- **Authentification requise** pour l'upload et la suppression
- **Rôles** : Seuls les instructeurs peuvent supprimer des fichiers
- **Validation** : Vérification des types MIME et extensions
- **Noms uniques** : Génération automatique de noms de fichiers uniques

## Accès public

Les fichiers sont accessibles publiquement via :
```
http://localhost:3003/uploads/[chemin-du-fichier]
```

## Migration depuis S3

Si vous migrez depuis AWS S3 :

1. Téléchargez tous les fichiers depuis S3
2. Placez-les dans le dossier `uploads/` avec la même structure
3. Mettez à jour les URLs dans la base de données si nécessaire

## Avantages du stockage local

- ✅ Pas de coût externe
- ✅ Contrôle total des données
- ✅ Pas de dépendance à des services tiers
- ✅ Simplicité de déploiement

## Inconvénients

- ❌ Pas de scalabilité horizontale
- ❌ Pas de sauvegarde automatique
- ❌ Risque de perte de données si le serveur tombe
- ❌ Pas de CDN intégré

## Recommandations pour la production

1. **Sauvegarde régulière** du dossier `uploads/`
2. **Monitoring** de l'espace disque
3. **Nettoyage** des fichiers orphelins
4. **Considérer** un stockage cloud pour la production 