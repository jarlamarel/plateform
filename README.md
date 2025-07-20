# Plateforme de Cours en Ligne

Ce projet est une plateforme de cours en ligne basée sur une architecture de microservices.

## Structure du Projet

```
/auth-service        - Service d'authentification
/database-service    - Service de base de données
/metrics-service     - Service de métriques
/notification-service - Service de notifications
/ai-service         - Service d'intelligence artificielle
/payment-service    - Service de paiement
/frontend          - Application frontend React
```

## Technologies Utilisées

### Backend
- Node.js + Express.js
- MongoDB avec Mongoose
- Passport.js pour l'authentification
- JWT pour la sécurité
- SendGrid pour les emails
- Twilio pour les SMS
- Stripe pour les paiements
- Google Cloud AI
- Prometheus + Grafana pour les métriques

### Frontend
- React + Redux
- Axios pour les appels API
- Jest + React Testing Library pour les tests
- Cypress pour les tests E2E

## Prérequis

- Node.js (v18 ou supérieur)
- MongoDB
- Docker et Docker Compose
- Comptes développeur pour les services externes (Stripe, SendGrid, Twilio, etc.)

## Installation

1. Cloner le dépôt
```bash
git clone [URL_DU_REPO]
```

2. Installer les dépendances pour chaque service
```bash
cd [NOM_DU_SERVICE]
npm install
```

3. Configurer les variables d'environnement
```bash
cp .env.example .env
# Éditer le fichier .env avec vos configurations
```

4. Démarrer les services avec Docker Compose
```bash
docker-compose up
```

## Tests

Chaque service contient ses propres tests unitaires et d'intégration.

```bash
# Exécuter les tests pour un service spécifique
cd [NOM_DU_SERVICE]
npm test

# Exécuter les tests E2E
cd frontend
npm run cypress:open
```

## Documentation API

La documentation API est disponible via Swagger UI à l'adresse `/api-docs` de chaque service.

## Déploiement

Les instructions de déploiement sont disponibles dans le dossier `deployment/` de chaque service.

## Licence

MIT 