# Configuration de la Base de Données - Plateforme de Cours

Ce guide vous explique comment créer manuellement les collections MongoDB pour la plateforme de cours.

## 🚀 Démarrage Rapide

### Sur Windows (PowerShell)
```powershell
# Naviguer vers le dossier content-service
cd content-service

# Créer les collections
.\scripts\setup-db.ps1

# Créer les collections avec données d'exemple
.\scripts\setup-db.ps1 --with-sample-data
```

### Sur Linux/Mac (Bash)
```bash
# Naviguer vers le dossier content-service
cd content-service

# Rendre le script exécutable (première fois seulement)
chmod +x scripts/setup-db.sh

# Créer les collections
./scripts/setup-db.sh

# Créer les collections avec données d'exemple
./scripts/setup-db.sh --with-sample-data
```

### Manuellement avec Node.js
```bash
# Naviguer vers le dossier content-service
cd content-service

# Installer les dépendances
npm install

# Créer les collections
node src/scripts/createCollections.js

# Vérifier les collections
node src/scripts/verifyCollections.js

# Créer avec données d'exemple
node src/scripts/createCollections.js --with-sample-data
```

## 📋 Prérequis

- **Node.js** (version 14 ou supérieure)
- **npm** (généralement installé avec Node.js)
- **MongoDB** (version 4.4 ou supérieure)
- **Accès à la base de données** (URL de connexion)

## 🔧 Configuration

### Variables d'environnement

Créez un fichier `.env` dans le dossier `content-service` :

```env
# URL de connexion MongoDB
MONGODB_URI=mongodb://localhost:27017/course-platform

# Ou pour une base de données distante
# MONGODB_URI=mongodb://username:password@host:port/database
```

### Configuration par défaut

Si aucune variable d'environnement n'est définie, le script utilise :
- **URL MongoDB** : `mongodb://localhost:27017/course-platform`
- **Base de données** : `course-platform`

## 📊 Collections Créées

### 1. Collection `courses`
**Structure principale :**
```javascript
{
  title: String,           // Titre du cours
  description: String,     // Description détaillée
  instructor: ObjectId,    // Référence vers l'instructeur
  category: String,        // programming, design, business, marketing, other
  level: String,          // beginner, intermediate, advanced
  price: Number,          // Prix en euros
  duration: Number,       // Durée en minutes
  thumbnail: String,      // URL de l'image
  lessons: [ObjectId],    // Références vers les leçons
  requirements: [String], // Prérequis
  objectives: [String],   // Objectifs d'apprentissage
  status: String,         // draft, published, archived
  rating: {               // Système de notation
    average: Number,
    count: Number
  },
  enrolledStudents: [ObjectId], // Étudiants inscrits
  tags: [String],         // Tags pour la recherche
  createdAt: Date,
  updatedAt: Date
}
```

**Index créés :**
- Recherche textuelle sur `title` et `description`
- Index composé sur `category` et `level`
- Index sur `instructor`
- Index sur `status`

### 2. Collection `lessons`
**Structure principale :**
```javascript
{
  title: String,          // Titre de la leçon
  description: String,    // Description
  content: String,        // Contenu de la leçon
  courseId: ObjectId,     // Référence vers le cours
  instructorId: ObjectId, // Référence vers l'instructeur
  duration: Number,       // Durée en minutes
  order: Number,          // Ordre dans le cours
  prerequisites: [ObjectId], // Leçons préalables
  resources: [ObjectId],  // Ressources associées
  completedBy: [{         // Suivi de progression
    user: ObjectId,
    completedAt: Date
  }],
  isPublished: Boolean,   // Statut de publication
  isDeleted: Boolean,     // Suppression logique
  createdAt: Date,
  updatedAt: Date
}
```

**Index créés :**
- Recherche textuelle sur `title` et `description`
- Index composé sur `courseId` et `order`
- Index sur `instructorId`
- Index sur `isDeleted`

### 3. Collection `resources`
**Structure principale :**
```javascript
{
  title: String,          // Titre de la ressource
  description: String,    // Description
  type: String,           // document, video, image, audio
  file: {                 // Informations sur le fichier
    url: String,          // URL de téléchargement
    key: String,          // Clé de stockage
    size: Number,         // Taille en octets
    mimeType: String      // Type MIME
  },
  courseId: ObjectId,     // Référence vers le cours
  lessonId: ObjectId,     // Référence vers la leçon
  instructorId: ObjectId, // Référence vers l'instructeur
  isPublic: Boolean,      // Visibilité publique
  versions: [{            // Historique des versions
    url: String,
    key: String,
    size: Number,
    mimeType: String,
    createdAt: Date
  }],
  downloads: Number,      // Nombre de téléchargements
  isDeleted: Boolean,     // Suppression logique
  createdAt: Date,
  updatedAt: Date
}
```

**Index créés :**
- Recherche textuelle sur `title` et `description`
- Index sur `courseId`
- Index sur `lessonId`
- Index sur `instructorId`
- Index sur `isDeleted`

## 🔍 Vérification

Après avoir créé les collections, vous pouvez vérifier leur état :

```bash
# Vérifier les collections
node src/scripts/verifyCollections.js
```

Le script affichera :
- ✅ Liste des collections créées
- ✅ Index configurés pour chaque collection
- ✅ Statistiques (nombre de documents, taille)
- ⚠️ Collections manquantes (si applicable)

## 📝 Données d'Exemple

Les données d'exemple incluent :
- **1 cours** : "Introduction à JavaScript"
- **2 leçons** : Variables et Fonctions
- **2 ressources** : Document PDF et vidéo MP4
- **1 instructeur fictif** (ObjectId généré)

## 🛠️ Dépannage

### Erreur de connexion MongoDB
```bash
# Vérifier que MongoDB est démarré
mongod --version

# Vérifier l'URL de connexion
echo $MONGODB_URI
```

### Erreur de permissions
```bash
# Vérifier les permissions sur la base de données
# Assurez-vous d'avoir les droits d'écriture
```

### Collections déjà existantes
- Les scripts peuvent être exécutés plusieurs fois
- Les index existants ne seront pas recréés
- Les données existantes ne seront pas supprimées

### Erreur Node.js/npm
```bash
# Vérifier les versions
node --version
npm --version

# Réinstaller les dépendances
rm -rf node_modules package-lock.json
npm install
```

## 📚 Ressources Supplémentaires

- [Documentation MongoDB](https://docs.mongodb.com/)
- [Guide Mongoose](https://mongoosejs.com/docs/)
- [Scripts de gestion](./src/scripts/README.md)

## 🤝 Support

Si vous rencontrez des problèmes :
1. Vérifiez les prérequis
2. Consultez la section dépannage
3. Vérifiez les logs d'erreur
4. Contactez l'équipe de développement 