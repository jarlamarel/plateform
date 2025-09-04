# 🚀 Guide de Déploiement Vercel - Windows

## 📋 Prérequis Windows

1. **Node.js** : [nodejs.org](https://nodejs.org) (version 16+)
2. **Git** : [git-scm.com](https://git-scm.com)
3. **PowerShell** : Inclus avec Windows 10/11
4. **Compte Vercel** : [vercel.com](https://vercel.com)
5. **Base de données MongoDB Atlas** (gratuit)

## 🔧 Installation des Outils

### 1. Installer Node.js
```powershell
# Vérifier si Node.js est installé
node --version
npm --version

# Si non installé, téléchargez depuis nodejs.org
```

### 2. Installer Vercel CLI
```powershell
# Ouvrir PowerShell en tant qu'administrateur
npm install -g vercel

# Vérifier l'installation
vercel --version
```

### 3. Installer Git
```powershell
# Vérifier si Git est installé
git --version

# Si non installé, téléchargez depuis git-scm.com
```

## 🚀 Méthodes de Déploiement

### Option 1 : Script PowerShell (Recommandé)

1. **Ouvrir PowerShell** dans le dossier du projet
2. **Exécuter le script** :
   ```powershell
   # Autoriser l'exécution de scripts (si nécessaire)
   Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

   # Exécuter le script
   .\deploy-vercel.ps1
   ```

3. **Suivre les instructions** du script

### Option 2 : Script Batch

1. **Ouvrir l'invite de commandes** dans le dossier du projet
2. **Exécuter le script** :
   ```cmd
   deploy-vercel.bat
   ```

### Option 3 : Déploiement Manuel

#### Étape 1 : Préparer MongoDB Atlas

1. **Créer un compte** sur [MongoDB Atlas](https://www.mongodb.com/atlas)
2. **Créer un cluster gratuit** (M0)
3. **Configurer un utilisateur** de base de données
4. **Obtenez votre URI** de connexion :
   ```
   mongodb+srv://username:password@cluster.mongodb.net/course-platform
   ```

#### Étape 2 : Déployer le Frontend

```powershell
# Aller dans le dossier frontend
cd frontend-service

# Se connecter à Vercel (première fois)
vercel login

# Déployer
vercel --prod
```

#### Étape 3 : Déployer les Services Backend

```powershell
# Pour chaque service
cd auth-service
vercel --prod

cd ../content-service
vercel --prod

cd ../payment-service
vercel --prod

# etc.
```

## 🔧 Configuration des Variables d'Environnement

### Via l'Interface Web Vercel

1. **Aller sur** [vercel.com/dashboard](https://vercel.com/dashboard)
2. **Sélectionner votre projet**
3. **Aller dans Settings > Environment Variables**
4. **Ajouter les variables** :

#### Variables Communes
```bash
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/course-platform
JWT_SECRET=your-super-secret-jwt-key-here
FRONTEND_URL=https://your-frontend.vercel.app
```

#### Variables Spécifiques par Service

**Auth Service :**
```bash
SESSION_SECRET=your-session-secret
FACEBOOK_APP_ID=your-facebook-app-id
FACEBOOK_APP_SECRET=your-facebook-app-secret
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
```

**Payment Service :**
```bash
STRIPE_SECRET_KEY=sk_test_your-stripe-secret-key
STRIPE_WEBHOOK_SECRET=whsec_your-webhook-secret
```

**Content Service :**
```bash
UPLOAD_PATH=/tmp/uploads
MAX_FILE_SIZE=100000000
```

### Via Vercel CLI

```powershell
# Ajouter une variable d'environnement
vercel env add MONGODB_URI production "mongodb+srv://..."

# Lister les variables
vercel env ls

# Supprimer une variable
vercel env rm MONGODB_URI production
```

## 🔧 Configuration Stripe (Optionnel)

1. **Créer un compte** sur [stripe.com](https://stripe.com)
2. **Obtenir les clés API** dans le dashboard
3. **Configurer les webhooks** :
   - URL : `https://your-payment-service.vercel.app/api/webhooks/stripe`
   - Événements : `payment_intent.succeeded`, `payment_intent.payment_failed`

## 🔧 Configuration des Notifications Push

```powershell
# Aller dans le service de notification
cd notification-service

# Générer les clés VAPID
node generate-vapid-keys.js

# Copier les clés générées dans les variables d'environnement
```

## 🧪 Tests Post-Déploiement

### Test des Endpoints de Santé

```powershell
# Test avec PowerShell
Invoke-RestMethod -Uri "https://your-auth-service.vercel.app/api/health"

# Test avec curl (si installé)
curl https://your-auth-service.vercel.app/api/health
```

### Test de l'Application

1. **Ouvrir l'URL du frontend**
2. **Tester l'inscription/connexion**
3. **Tester la création de cours**
4. **Tester les paiements** (si configuré)

## 🔧 Dépannage Windows

### Problème : PowerShell Execution Policy

```powershell
# Vérifier la politique actuelle
Get-ExecutionPolicy

# Autoriser l'exécution de scripts
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Problème : Vercel CLI non trouvé

```powershell
# Réinstaller Vercel CLI
npm uninstall -g vercel
npm install -g vercel

# Vérifier le PATH
$env:PATH -split ';' | Where-Object { $_ -like '*npm*' }
```

### Problème : Git non trouvé

```powershell
# Vérifier si Git est dans le PATH
git --version

# Si non trouvé, ajouter Git au PATH manuellement
# Ou réinstaller Git avec l'option "Add to PATH"
```

### Problème : Node.js non trouvé

```powershell
# Vérifier l'installation
node --version

# Si non trouvé, réinstaller Node.js
# Assurez-vous de cocher "Add to PATH" lors de l'installation
```

## 📊 Monitoring et Logs

### Vercel Dashboard

1. **Aller sur** [vercel.com/dashboard](https://vercel.com/dashboard)
2. **Sélectionner votre projet**
3. **Voir les logs** dans l'onglet "Functions"
4. **Voir les métriques** dans l'onglet "Analytics"

### Logs Locaux

```powershell
# Voir les logs en temps réel
vercel logs --follow

# Voir les logs d'une fonction spécifique
vercel logs --function=api/index.js
```

## 🔄 Mise à Jour

### Mise à Jour Automatique

```powershell
# Pousser les changements sur GitHub
git add .
git commit -m "Update application"
git push

# Vercel déploie automatiquement
```

### Mise à Jour Manuelle

```powershell
# Redéployer un service spécifique
cd auth-service
vercel --prod

# Redéployer tous les services
.\deploy-vercel.ps1
```

## 💰 Coûts et Limitations

### Plan Gratuit Vercel
- **100GB** bandwidth/mois
- **1000** serverless function executions/jour
- **100GB** storage
- **10 secondes** timeout par fonction

### MongoDB Atlas Gratuit
- **512MB** stockage
- **Connexions partagées**

## 🚨 Limitations Importantes

1. **Stockage éphémère** : Les fichiers uploadés ne persistent pas
2. **Timeout** : 10 secondes max par fonction
3. **Cold starts** : Premier appel peut être lent

### Solutions pour les Limitations

1. **Stockage de fichiers** : Utiliser AWS S3 ou Cloudinary
2. **Base de données** : MongoDB Atlas (gratuit)
3. **Cache** : Utiliser Redis ou Vercel Edge Cache

## 📞 Support

### Documentation Officielle
- **Vercel** : [vercel.com/docs](https://vercel.com/docs)
- **MongoDB Atlas** : [docs.atlas.mongodb.com](https://docs.atlas.mongodb.com)
- **Stripe** : [stripe.com/docs](https://stripe.com/docs)

### Communauté
- **Stack Overflow** : Tag `vercel`
- **GitHub Issues** : Pour les problèmes spécifiques
- **Discord Vercel** : Communauté officielle

---

*Dernière mise à jour : Janvier 2025*

