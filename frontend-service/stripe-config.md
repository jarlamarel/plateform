# 🔑 Configuration Stripe - Variables d'Environnement

## 📋 **Fichier .env à créer**

Créez un fichier `.env` dans le répertoire `frontend-service/` avec le contenu suivant :

```env
# Configuration de l'API
REACT_APP_API_URL=http://localhost:3003/api/content
REACT_APP_PAYMENT_API_URL=http://localhost:3005/api/payments

# Configuration Stripe
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_votre_cle_publique_stripe_ici

# Configuration générale
REACT_APP_ENV=development
```

## 🔐 **Obtenir les Clés Stripe**

### **1. Créer un compte Stripe**
1. Aller sur https://dashboard.stripe.com/register
2. Créer un compte gratuit
3. Vérifier l'email

### **2. Récupérer les clés de test**
1. Aller dans **Developers → API Keys**
2. Copier la **Publishable key** (commence par `pk_test_`)
3. Copier la **Secret key** (commence par `sk_test_`)

### **3. Configurer le Payment Service**
Dans `payment-service/.env` :
```env
STRIPE_SECRET_KEY=sk_test_votre_cle_secrete_stripe_ici
STRIPE_PUBLISHABLE_KEY=pk_test_votre_cle_publique_stripe_ici
```

## 🧪 **Clés de Test (Temporaires)**

Pour tester rapidement, vous pouvez utiliser ces clés de test publiques :

```env
# Clés de test Stripe (publiques - pour développement uniquement)
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_51HvjFnGHc4XVTV5q3JxZ3Kf00Kz7QRsNp
```

⚠️ **Important** : Ces clés sont temporaires et pour test uniquement. Créez votre propre compte Stripe pour un usage réel.

## 🎯 **Cartes de Test**

Une fois configuré, vous pouvez tester avec ces numéros de cartes :

### **Paiements Réussis**
```
4242 4242 4242 4242  # Visa
4000 0056 0000 0008  # Visa (debit)
5555 5555 5555 4444  # Mastercard
```

### **Paiements Échoués**
```
4000 0000 0000 0002  # Generic decline
4000 0000 0000 9995  # Insufficient funds
4000 0000 0000 9987  # Lost card
```

### **Informations Complémentaires**
```
Date d'expiration : 12/34 (ou toute date future)
CVC : 123 (ou tout code à 3 chiffres)
Code postal : 12345 (ou tout code)
```

## 🚀 **Instructions d'Installation**

### **1. Installer les dépendances**
```bash
# Windows
.\install-stripe.bat

# Linux/Mac
chmod +x install-stripe.sh
./install-stripe.sh

# Ou manuellement
npm install @stripe/react-stripe-js@^2.4.0
```

### **2. Créer le fichier .env**
```bash
# Dans frontend-service/
touch .env
# Puis ajouter les variables ci-dessus
```

### **3. Redémarrer le serveur**
```bash
npm start
```

## ✅ **Vérification**

Une fois configuré, vous devriez voir :
- ✅ Plus d'erreurs de compilation
- ✅ Modal de paiement fonctionnel
- ✅ Formulaire Stripe Elements
- ✅ Bouton "Acheter pour X€" actif

## 🎉 **Résultat**

Votre intégration Stripe sera complètement fonctionnelle avec :
- 💳 Vraies cartes de test
- 🔒 Sécurité PCI compliant
- 🎨 Interface Material-UI élégante
- ⚡ Paiements en temps réel
