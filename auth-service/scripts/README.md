# Scripts de Test - Service d'Authentification

Ce dossier contient des scripts utilitaires pour tester et diagnostiquer le service d'authentification.

## 🎓 Fonctionnalité des Cours Utilisateur

### Vue d'ensemble

La fonctionnalité des cours utilisateur permet d'afficher les cours auxquels un utilisateur est inscrit dans la section "Mes Cours" de son profil. Cette fonctionnalité comprend :

- **Affichage des cours** : Liste des cours avec progression et statut
- **Gestion du progrès** : Suivi de l'avancement dans chaque cours
- **Statuts des cours** : En cours, terminés, non commencés
- **Interface utilisateur** : Cartes de cours avec informations détaillées

### Architecture

#### Frontend
- **Service** : `frontend-service/src/services/userCourses.service.ts`
- **Composant** : `frontend-service/src/components/UserCourseCard.tsx`
- **Page** : `frontend-service/src/pages/Profile.tsx` (onglet "Mes Cours")

#### Backend
- **Modèle** : `auth-service/src/models/UserCourse.js`
- **Routes** : `auth-service/src/routes/users.js` (routes `/me/courses/*`)

## 📁 Scripts Disponibles

### 1. add-user-courses.js

Script pour ajouter des cours de test pour les utilisateurs.

**Utilisation** :
```bash
cd auth-service
node scripts/add-user-courses.js
```

**Fonctionnalités** :
- Création d'un utilisateur de test si nécessaire
- Ajout de 5 cours de test avec différents statuts
- Statistiques des cours ajoutés

### 2. test-user-courses-api.js

Script pour tester l'API des cours utilisateur.

**Utilisation** :
```bash
cd auth-service
node scripts/test-user-courses-api.js
```

**Tests effectués** :
- Connexion utilisateur
- Récupération de tous les cours
- Récupération des cours en cours
- Récupération des cours terminés
- Récupération de tous les cours inscrits
- Mise à jour du progrès
- Marquage comme terminé

### 3. test-profile-update.js

Script pour tester la mise à jour du profil utilisateur.

### 4. test-profile-fix.js

Script pour tester la correction de l'URL de mise à jour du profil.

## 🗄️ Modèle UserCourse

### Structure

```javascript
{
  userId: ObjectId,           // Référence vers l'utilisateur
  courseId: ObjectId,         // Référence vers le cours
  progress: Number,           // Progression (0-100)
  completed: Boolean,         // Cours terminé
  enrolledAt: Date,          // Date d'inscription
  lastAccessedAt: Date,      // Dernière visite
  completedAt: Date,         // Date de fin
  lessonsCompleted: Array,   // Leçons complétées
  notes: Array,              // Notes de l'utilisateur
  certificates: Array        // Certificats obtenus
}
```

### Méthodes

- `calculateProgress()` : Calcule automatiquement le progrès
- `markAsCompleted()` : Marque le cours comme terminé
- `addCompletedLesson()` : Ajoute une leçon complétée
- `addNote()` : Ajoute une note

## 🔌 API Endpoints

### GET /api/users/me/courses
Récupère tous les cours de l'utilisateur avec pagination.

**Paramètres** :
- `page` : Numéro de page (défaut: 1)
- `limit` : Nombre de cours par page (défaut: 10)

**Réponse** :
```json
{
  "courses": [...],
  "total": 5,
  "page": 1,
  "totalPages": 1,
  "hasNextPage": false,
  "hasPrevPage": false
}
```

### GET /api/users/me/courses/in-progress
Récupère les cours en cours de l'utilisateur.

### GET /api/users/me/courses/completed
Récupère les cours terminés de l'utilisateur.

### GET /api/users/me/courses/enrolled
Récupère tous les cours inscrits de l'utilisateur.

### PUT /api/users/me/courses/:courseId/progress
Met à jour le progrès d'un cours.

**Body** :
```json
{
  "progress": 75
}
```

### PUT /api/users/me/courses/:courseId/complete
Marque un cours comme terminé.

## 🎨 Interface Utilisateur

### Composant UserCourseCard

Affiche une carte de cours avec :
- **Image du cours** : Thumbnail
- **Informations** : Titre, description, instructeur
- **Progression** : Barre de progression avec pourcentage
- **Statut** : Badge "Terminé" si applicable
- **Actions** : Bouton "Continuer" ou "Revoir"
- **Métadonnées** : Durée, niveau, catégorie, date d'inscription

### Onglet "Mes Cours"

Organisé en trois sections :
1. **Cours en cours** : Cours avec progression > 0 et non terminés
2. **Cours terminés** : Cours marqués comme terminés
3. **Tous mes cours** : Tous les cours inscrits

## 🧪 Données de Test

Le script `add-user-courses.js` ajoute 5 cours de test :

1. **Introduction à JavaScript** (75% - En cours)
2. **React pour débutants** (100% - Terminé)
3. **Design UI/UX Avancé** (25% - En cours)
4. **Marketing Digital Complet** (0% - Non commencé)
5. **Python pour Data Science** (90% - En cours)

## 🚀 Installation et Test

### 1. Prérequis
- Service d'authentification démarré sur le port 3001
- MongoDB connecté
- Utilisateur de test existant (momo@gmail.com)

### 2. Ajouter les données de test
```bash
cd auth-service
node scripts/add-user-courses.js
```

### 3. Tester l'API
```bash
node scripts/test-user-courses-api.js
```

### 4. Tester l'interface
- Aller sur `http://localhost:3000/profile`
- Cliquer sur l'onglet "Mes Cours"
- Vérifier l'affichage des cours

## 🔧 Dépannage

### Problèmes Courants

1. **Aucun cours affiché** :
   - Vérifier que les données de test ont été ajoutées
   - Vérifier la connexion MongoDB
   - Vérifier les logs du service d'authentification

2. **Erreur 404 sur les routes** :
   - Vérifier que le service d'authentification est démarré
   - Vérifier que les routes sont bien définies

3. **Erreur de population** :
   - Vérifier que les IDs de cours existent dans la base de données
   - Vérifier les références entre les modèles

### Logs de Débogage

Les routes ajoutent des logs détaillés :
```javascript
console.error('Erreur lors de la récupération des cours:', error);
```

## 📝 Notes Importantes

1. **IDs de cours** : Les scripts utilisent des IDs fictifs. En production, utilisez de vrais IDs de cours.
2. **Population** : Les routes utilisent `populate()` pour récupérer les détails des cours et instructeurs.
3. **Authentification** : Toutes les routes nécessitent un token JWT valide.
4. **Performance** : Les requêtes sont optimisées avec des index MongoDB.

## 🔄 Prochaines Étapes

1. **Intégration avec le service de contenu** : Récupérer les vrais IDs de cours
2. **Synchronisation** : Mettre à jour le progrès en temps réel
3. **Notifications** : Alertes pour les cours non terminés
4. **Certificats** : Génération automatique des certificats
5. **Analytics** : Statistiques d'apprentissage détaillées



