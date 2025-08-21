# Service de Paiement

Ce service gère les paiements et les abonnements pour la plateforme de cours en ligne.

## Fonctionnalités

- Intégration avec Stripe pour les paiements
- Gestion des paiements par carte bancaire
- Gestion des remboursements
- Historique des transactions
- Abonnements et paiements récurrents

## Prérequis

- Node.js (v14 ou supérieur)
- MongoDB
- Compte Stripe

## Installation

1. Cloner le repository
2. Installer les dépendances :
```bash
npm install
```

3. Créer un fichier `.env` à la racine du projet avec les variables suivantes :
```env
# Configuration du serveur
PORT=3005
NODE_ENV=development

# Configuration de la base de données
MONGODB_URI=mongodb://localhost:27017/payment-service

# Configuration de Stripe
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

# Configuration JWT
JWT_SECRET=your_jwt_secret
JWT_EXPIRATION=24h

# Configuration des URLs
FRONTEND_URL=http://localhost:3000
AUTH_SERVICE_URL=http://localhost:3001
COURSE_SERVICE_URL=http://localhost:3003
```

## Démarrage

Pour le développement :
```bash
npm run dev
```

Pour la production :
```bash
npm start
```

## API Endpoints

### Paiements

- `POST /api/payments/intent` - Créer une intention de paiement
- `POST /api/payments/confirm/:paymentIntentId` - Confirmer un paiement
- `POST /api/payments/refund/:paymentId` - Rembourser un paiement
- `GET /api/payments/history` - Obtenir l'historique des paiements
- `GET /api/payments/:paymentId` - Obtenir les détails d'un paiement

### Abonnements

- `POST /api/subscriptions` - Créer un abonnement
- `DELETE /api/subscriptions/:subscriptionId` - Annuler un abonnement
- `GET /api/subscriptions/:subscriptionId` - Obtenir les détails d'un abonnement

## Tests

```bash
npm test
```

## Documentation

La documentation de l'API est disponible à l'URL `/api-docs` lorsque le serveur est en cours d'exécution.

## Sécurité

- Toutes les routes sont protégées par authentification JWT
- Validation des entrées avec express-validator
- Protection contre les attaques CSRF
- Rate limiting pour prévenir les abus
- Logging des erreurs et des transactions

## Contribution

1. Fork le projet
2. Créer une branche pour votre fonctionnalité
3. Commiter vos changements
4. Pousser vers la branche
5. Créer une Pull Request 