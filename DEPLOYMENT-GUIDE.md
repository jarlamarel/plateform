# 🚀 Guide de Déploiement sur Vercel

## 📋 Prérequis

1. **Compte Vercel** : [vercel.com](https://vercel.com)
2. **Compte GitHub/GitLab/Bitbucket**
3. **Base de données MongoDB Atlas** (gratuit)
4. **Compte Stripe** (pour les paiements)

## 🗂️ Structure des Projets

Chaque service sera déployé comme un projet Vercel séparé :

```
📁 course-platform/
├── 📁 frontend-service/     → Projet Vercel #1
├── 📁 auth-service/         → Projet Vercel #2
├── 📁 content-service/      → Projet Vercel #3
├── 📁 payment-service/      → Projet Vercel #4
├── 📁 notification-service/ → Projet Vercel #5
├── 📁 database-service/     → Projet Vercel #6
└── 📁 metrics-service/      → Projet Vercel #7
```

## 🔧 Configuration de la Base de Données

### 1. MongoDB Atlas Setup
1. Créez un compte sur [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Créez un cluster gratuit
3. Configurez un utilisateur de base de données
4. Obtenez votre URI de connexion

### 2. Variables d'Environnement Communes
```bash
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/course-platform
JWT_SECRET=your-super-secret-jwt-key
FRONTEND_URL=https://your-frontend.vercel.app
```

## 🚀 Déploiement Étape par Étape

### Étape 1 : Frontend Service

1. **Poussez le code sur GitHub**
2. **Connectez-vous à Vercel**
3. **Importez le projet `frontend-service`**
4. **Configurez les variables d'environnement** :
   ```bash
   REACT_APP_API_URL=https://your-auth-service.vercel.app/api
   REACT_APP_CONTENT_API=https://your-content-service.vercel.app/api
   REACT_APP_PAYMENT_API=https://your-payment-service.vercel.app/api
   REACT_APP_NOTIFICATION_API=https://your-notification-service.vercel.app/api
   ```
5. **Déployez**

### Étape 2 : Auth Service

1. **Importez le projet `auth-service`**
2. **Configurez les variables d'environnement** :
   ```bash
   MONGODB_URI=@mongodb_uri
   JWT_SECRET=@jwt_secret
   SESSION_SECRET=@session_secret
   FACEBOOK_APP_ID=@facebook_app_id
   FACEBOOK_APP_SECRET=@facebook_app_secret
   GOOGLE_CLIENT_ID=@google_client_id
   GOOGLE_CLIENT_SECRET=@google_client_secret
   GITHUB_CLIENT_ID=@github_client_id
   GITHUB_CLIENT_SECRET=@github_client_secret
   TWILIO_ACCOUNT_SID=@twilio_account_sid
   TWILIO_AUTH_TOKEN=@twilio_auth_token
   FRONTEND_URL=https://your-frontend.vercel.app
   ```
3. **Déployez**

### Étape 3 : Content Service

1. **Importez le projet `content-service`**
2. **Configurez les variables d'environnement** :
   ```bash
   MONGODB_URI=@mongodb_uri
   JWT_SECRET=@jwt_secret
   UPLOAD_PATH=/tmp/uploads
   MAX_FILE_SIZE=100000000
   FRONTEND_URL=https://your-frontend.vercel.app
   ```
3. **Déployez**

### Étape 4 : Payment Service

1. **Importez le projet `payment-service`**
2. **Configurez les variables d'environnement** :
   ```bash
   MONGODB_URI=@mongodb_uri
   STRIPE_SECRET_KEY=@stripe_secret_key
   STRIPE_WEBHOOK_SECRET=@stripe_webhook_secret
   JWT_SECRET=@jwt_secret
   FRONTEND_URL=https://your-frontend.vercel.app
   ```
3. **Déployez**

### Étape 5 : Notification Service

1. **Importez le projet `notification-service`**
2. **Configurez les variables d'environnement** :
   ```bash
   MONGODB_URI=@mongodb_uri
   VAPID_PUBLIC_KEY=@vapid_public_key
   VAPID_PRIVATE_KEY=@vapid_private_key
   JWT_SECRET=@jwt_secret
   FRONTEND_URL=https://your-frontend.vercel.app
   ```
3. **Déployez**

### Étape 6 : Database Service

1. **Importez le projet `database-service`**
2. **Configurez les variables d'environnement** :
   ```bash
   MONGODB_URI=@mongodb_uri
   JWT_SECRET=@jwt_secret
   FRONTEND_URL=https://your-frontend.vercel.app
   ```
3. **Déployez**

### Étape 7 : Metrics Service

1. **Importez le projet `metrics-service`**
2. **Configurez les variables d'environnement** :
   ```bash
   MONGODB_URI=@mongodb_uri
   JWT_SECRET=@jwt_secret
   PROMETHEUS_PORT=9090
   FRONTEND_URL=https://your-frontend.vercel.app
   ```
3. **Déployez**

## 🔗 Configuration des URLs

Après le déploiement, mettez à jour les URLs dans le frontend :

```javascript
// src/services/api.ts
const API_BASE_URLS = {
  auth: 'https://your-auth-service.vercel.app/api',
  content: 'https://your-content-service.vercel.app/api',
  payment: 'https://your-payment-service.vercel.app/api',
  notification: 'https://your-notification-service.vercel.app/api',
  database: 'https://your-database-service.vercel.app/api',
  metrics: 'https://your-metrics-service.vercel.app/api'
};
```

## 🔧 Configuration Stripe

1. **Créez un compte Stripe**
2. **Obtenez vos clés API** (test et production)
3. **Configurez les webhooks** :
   - URL : `https://your-payment-service.vercel.app/api/webhooks/stripe`
   - Événements : `payment_intent.succeeded`, `payment_intent.payment_failed`

## 🔧 Configuration des Notifications Push

1. **Générez les clés VAPID** :
   ```bash
   cd notification-service
   node generate-vapid-keys.js
   ```
2. **Configurez les variables d'environnement** avec les clés générées

## 🧪 Tests Post-Déploiement

1. **Testez les endpoints de santé** :
   ```bash
   curl https://your-auth-service.vercel.app/api/health
   curl https://your-content-service.vercel.app/api/health
   # etc.
   ```

2. **Testez l'authentification** :
   - Inscription
   - Connexion
   - OAuth (Google, Facebook, GitHub)

3. **Testez les fonctionnalités principales** :
   - Création de cours
   - Upload de vidéos
   - Paiements
   - Notifications

## 📊 Monitoring

1. **Vercel Analytics** : Intégré automatiquement
2. **Logs** : Disponibles dans le dashboard Vercel
3. **Métriques** : Via le service metrics

## 🔒 Sécurité

1. **HTTPS** : Automatique avec Vercel
2. **CORS** : Configuré pour chaque service
3. **Rate Limiting** : Implémenté
4. **Helmet** : Sécurité des headers

## 💰 Coûts

- **Vercel Hobby** : Gratuit (limitations)
  - 100GB bandwidth/mois
  - 1000 serverless function executions/jour
  - 100GB storage

- **MongoDB Atlas** : Gratuit (512MB)

## 🚨 Limitations Vercel

1. **Fonctions Serverless** : Timeout de 10 secondes (Hobby)
2. **Stockage** : Éphémère (pas de stockage permanent)
3. **Uploads** : Utilisez un service externe (AWS S3, Cloudinary)

## 🔄 Mise à Jour

Pour mettre à jour un service :
1. Poussez les changements sur GitHub
2. Vercel déploie automatiquement
3. Testez les nouvelles fonctionnalités

## 📞 Support

- **Vercel Documentation** : [vercel.com/docs](https://vercel.com/docs)
- **MongoDB Atlas** : [docs.atlas.mongodb.com](https://docs.atlas.mongodb.com)
- **Stripe Documentation** : [stripe.com/docs](https://stripe.com/docs)

---

*Dernière mise à jour : Janvier 2025*

