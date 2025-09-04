# 🔧 Guide de Dépannage - Cours Utilisateur

## Problème : Les cours ne s'affichent pas dans l'onglet "Mes Cours"

### 🚀 Étapes de Diagnostic

#### 1. Vérifier les Services
```bash
# Vérifier que le service d'authentification est démarré
cd auth-service
npm start

# Dans un autre terminal, vérifier le frontend
cd frontend-service
npm start
```

#### 2. Tester l'API d'Authentification
```bash
# Tester l'endpoint de santé
curl http://localhost:3001/api/health

# Réponse attendue :
# {
#   "status": "OK",
#   "timestamp": "2025-01-XX...",
#   "mongodb": "connected"
# }
```

#### 3. Ajouter les Données de Test
```bash
# Ajouter des cours de test pour l'utilisateur
cd auth-service
node scripts/add-user-courses.js
```

#### 4. Tester l'API des Cours
```bash
# Tester l'API des cours utilisateur
cd auth-service
node scripts/test-user-courses-api.js
```

#### 5. Diagnostic Complet
```bash
# Exécuter le script de diagnostic
cd frontend-service
node src/utils/debugUserCourses.js
```

### 🔍 Points de Vérification

#### A. Service d'Authentification
- ✅ Port 3001 accessible
- ✅ MongoDB connecté
- ✅ Routes `/api/users/me/courses/*` disponibles

#### B. Données de Test
- ✅ Utilisateur `momo@gmail.com` existe
- ✅ Cours de test ajoutés dans `UserCourse`
- ✅ IDs de cours valides

#### C. Frontend
- ✅ Service `userCourses.service.ts` fonctionne
- ✅ Composant `UserCourseCard.tsx` importé
- ✅ Onglet "Mes Cours" accessible

### 🐛 Problèmes Courants

#### 1. Service d'Authentification Non Démarré
**Symptôme** : Erreur de connexion au serveur
**Solution** :
```bash
cd auth-service
npm start
```

#### 2. MongoDB Non Connecté
**Symptôme** : Erreur de base de données
**Solution** :
```bash
# Vérifier que MongoDB est démarré
# Vérifier la variable d'environnement MONGODB_URI
```

#### 3. Aucune Donnée de Test
**Symptôme** : "Vous n'êtes inscrit à aucun cours"
**Solution** :
```bash
cd auth-service
node scripts/add-user-courses.js
```

#### 4. Erreur CORS
**Symptôme** : Erreur de requête bloquée
**Solution** : Vérifier la configuration CORS dans `auth-service`

#### 5. Token JWT Invalide
**Symptôme** : Erreur 401 Unauthorized
**Solution** : Se reconnecter dans l'application

### 📋 Checklist de Vérification

- [ ] Service d'authentification démarré sur le port 3001
- [ ] MongoDB connecté et accessible
- [ ] Utilisateur de test créé (`momo@gmail.com`)
- [ ] Cours de test ajoutés via le script
- [ ] API des cours testée et fonctionnelle
- [ ] Frontend redémarré après modifications
- [ ] Onglet "Mes Cours" cliqué dans le profil

### 🛠️ Commandes Utiles

```bash
# Redémarrer tous les services
cd auth-service && npm start &
cd frontend-service && npm start &

# Vérifier les logs
tail -f auth-service/combined.log

# Tester l'API manuellement
curl -H "Authorization: Bearer YOUR_TOKEN" \
     http://localhost:3001/api/users/me/courses/enrolled
```

### 📞 Support

Si le problème persiste après avoir suivi ce guide :

1. Vérifier les logs du service d'authentification
2. Vérifier la console du navigateur pour les erreurs
3. Exécuter le script de diagnostic complet
4. Vérifier que tous les fichiers ont été créés/modifiés correctement

### 🎯 Résolution Rapide

Pour une résolution rapide, exécutez ces commandes dans l'ordre :

```bash
# 1. Démarrer le service d'authentification
cd auth-service
npm start

# 2. Dans un nouveau terminal, ajouter les données de test
cd auth-service
node scripts/add-user-courses.js

# 3. Tester l'API
node scripts/test-user-courses-api.js

# 4. Démarrer le frontend
cd frontend-service
npm start

# 5. Aller sur http://localhost:3000/profile
# 6. Cliquer sur l'onglet "Mes Cours"
```



