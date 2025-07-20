# Service de Contenu

Ce service gère le contenu pédagogique de la plateforme, y compris les cours, les leçons et les ressources associées.

## Fonctionnalités

- Gestion des cours (création, modification, suppression)
- Gestion des leçons (création, modification, suppression)
- Gestion des ressources pédagogiques
- Système de prérequis pour les leçons
- Gestion des inscriptions aux cours
- Système de notation des cours
- Recherche et filtrage des cours

## Prérequis

- Node.js (v14 ou supérieur)
- MongoDB
- AWS S3 (pour le stockage des fichiers)

## Installation

1. Cloner le repository
```bash
git clone <repository-url>
cd content-service
```

2. Installer les dépendances
```bash
npm install
```

3. Configurer les variables d'environnement
```bash
cp .env.example .env
# Éditer le fichier .env avec vos configurations
```

4. Démarrer le service
```bash
# Mode développement
npm run dev

# Mode production
npm start
```

## Structure du Projet

```
content-service/
├── src/
│   ├── controllers/     # Contrôleurs
│   ├── models/         # Modèles Mongoose
│   ├── routes/         # Routes Express
│   ├── middlewares/    # Middlewares
│   ├── utils/          # Utilitaires
│   ├── tests/          # Tests
│   └── index.js        # Point d'entrée
├── logs/               # Logs
├── .env.example        # Exemple de configuration
├── jest.config.js      # Configuration Jest
└── package.json        # Dépendances
```

## API Endpoints

### Cours

- `GET /api/content/courses` - Liste tous les cours
- `GET /api/content/courses/:id` - Obtient un cours spécifique
- `POST /api/content/courses` - Crée un nouveau cours
- `PUT /api/content/courses/:id` - Met à jour un cours
- `DELETE /api/content/courses/:id` - Supprime un cours
- `POST /api/content/courses/:id/lessons` - Ajoute une leçon à un cours
- `POST /api/content/courses/:id/rating` - Met à jour la note d'un cours
- `POST /api/content/courses/:id/enroll` - Inscrit un étudiant à un cours
- `POST /api/content/courses/:id/unenroll` - Désinscrit un étudiant d'un cours

### Leçons

- `GET /api/content/lessons/course/:courseId` - Liste toutes les leçons d'un cours
- `GET /api/content/lessons/:id` - Obtient une leçon spécifique
- `POST /api/content/lessons` - Crée une nouvelle leçon
- `PUT /api/content/lessons/:id` - Met à jour une leçon
- `DELETE /api/content/lessons/:id` - Supprime une leçon
- `PUT /api/content/lessons/:id/order` - Met à jour l'ordre d'une leçon
- `POST /api/content/lessons/:id/resources` - Ajoute une ressource à une leçon
- `DELETE /api/content/lessons/:id/resources/:resourceId` - Supprime une ressource d'une leçon
- `POST /api/content/lessons/:id/prerequisites` - Ajoute un prérequis à une leçon
- `DELETE /api/content/lessons/:id/prerequisites/:prerequisiteId` - Supprime un prérequis d'une leçon

## Tests

```bash
# Exécuter tous les tests
npm test

# Exécuter les tests en mode watch
npm run test:watch

# Générer un rapport de couverture
npm run test:coverage
```

## Logs

Les logs sont stockés dans le dossier `logs/` avec les fichiers suivants :
- `error.log` - Logs d'erreurs
- `combined.log` - Tous les logs
- `exceptions.log` - Exceptions non capturées
- `rejections.log` - Rejets de promesses non capturés

## Sécurité

- Authentification JWT
- Validation des données avec Joi
- Protection contre les injections
- Rate limiting
- Headers de sécurité avec Helmet

## Contribution

1. Fork le projet
2. Créer une branche pour votre fonctionnalité
3. Commiter vos changements
4. Pousser vers la branche
5. Ouvrir une Pull Request

## Licence

MIT 