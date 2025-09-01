# Service de Métriques

Service de collecte, stockage et visualisation des métriques pour la plateforme de cours en ligne.

## 🎯 Objectifs

- **Collecte de métriques** en temps réel des différents microservices
- **Stockage et gestion** efficace des données de métriques
- **Création de tableaux de bord** pour la visualisation des données
- **Fonctionnalités de reporting** et d'analyse des tendances

## 🏗️ Architecture

```
metrics-service/
├── src/
│   ├── models/           # Modèles de données MongoDB
│   ├── routes/           # Routes API REST
│   ├── services/         # Logique métier
│   ├── middlewares/      # Middlewares Express
│   ├── utils/            # Utilitaires
│   └── index.js          # Point d'entrée
├── logs/                 # Fichiers de logs
├── package.json
├── Dockerfile
└── README.md
```

## 🚀 Installation

### Prérequis

- Node.js 16+
- MongoDB
- Docker (optionnel)

### Installation locale

```bash
# Cloner le projet
cd metrics-service

# Installer les dépendances
npm install

# Configurer les variables d'environnement
cp .env.example .env

# Démarrer le service
npm run dev
```

### Installation avec Docker

```bash
# Construire l'image
docker build -t metrics-service .

# Démarrer le conteneur
docker run -p 3006:3006 metrics-service
```

## ⚙️ Configuration

### Variables d'environnement

```env
# Serveur
PORT=3006
NODE_ENV=development

# Base de données
MONGODB_URI=mongodb://localhost:27017/metrics

# Authentification
JWT_SECRET=your_jwt_secret

# Services
AUTH_SERVICE_URL=http://localhost:3001
CONTENT_SERVICE_URL=http://localhost:3002
DATABASE_SERVICE_URL=http://localhost:3003
NOTIFICATION_SERVICE_URL=http://localhost:3004
PAYMENT_SERVICE_URL=http://localhost:3005

# Frontend
FRONTEND_URL=http://localhost:3000

# Logging
LOG_LEVEL=info
```

## 📊 Fonctionnalités

### 1. Collecte de Métriques

#### Métriques Système
- Utilisation CPU (1min, 5min, 15min)
- Utilisation mémoire (pourcentage, octets utilisés/libres)
- Trafic réseau
- Informations système

#### Métriques de Services
- Santé des services (uptime, temps de réponse)
- Métriques de performance
- Métriques d'erreur
- Métriques métier

#### Collecte Automatique
- Collecte toutes les 30 secondes
- Collecte manuelle via API
- Collecte par type (système, services, métier, erreurs)

### 2. Stockage et Gestion

#### Modèle de Données
```javascript
{
  serviceName: 'auth-service',
  metricType: 'performance',
  metricName: 'response_time',
  value: 150,
  unit: 'ms',
  tags: { userId: '123', endpoint: '/api/login' },
  timestamp: '2024-01-15T10:30:00Z',
  metadata: { additional: 'info' }
}
```

#### Types de Métriques
- `performance` : Temps de réponse, débit, etc.
- `usage` : Utilisation des ressources
- `error` : Erreurs et exceptions
- `business` : Métriques métier
- `system` : Métriques système

### 3. API REST

#### Endpoints Principaux

##### Métriques
- `GET /api/metrics` - Récupérer les métriques avec filtres
- `GET /api/metrics/aggregated` - Métriques agrégées
- `GET /api/metrics/latest` - Dernières métriques
- `POST /api/metrics` - Créer une métrique
- `POST /api/metrics/batch` - Créer plusieurs métriques
- `POST /api/metrics/collect` - Déclencher la collecte
- `GET /api/metrics/stats` - Statistiques générales

##### Tableaux de Bord
- `GET /api/dashboard` - Tableaux de bord de l'utilisateur
- `GET /api/dashboard/:id` - Récupérer un tableau de bord
- `GET /api/dashboard/:id/data` - Données du tableau de bord
- `POST /api/dashboard` - Créer un tableau de bord
- `PUT /api/dashboard/:id` - Mettre à jour un tableau de bord
- `DELETE /api/dashboard/:id` - Supprimer un tableau de bord

##### Analytics
- `GET /api/analytics/overview` - Vue d'ensemble
- `GET /api/analytics/service/:serviceName` - Analyse par service
- `GET /api/analytics/trends` - Analyse des tendances
- `GET /api/analytics/performance` - Analyse des performances
- `GET /api/analytics/errors` - Analyse des erreurs

##### Santé
- `GET /api/health` - Vérification de santé générale
- `GET /api/health/ready` - Vérification de disponibilité
- `GET /api/health/live` - Vérification de vivacité
- `GET /api/health/metrics` - Métriques Prometheus
- `GET /api/health/detailed` - Vérification détaillée

### 4. Tableaux de Bord

#### Types de Widgets
- **Chart** : Graphiques linéaires, barres, secteurs
- **Metric** : Affichage de valeurs avec tendances
- **Table** : Tableaux de données
- **Gauge** : Jauges et indicateurs
- **List** : Listes groupées

#### Fonctionnalités
- Création de tableaux de bord personnalisés
- Widgets configurables
- Filtres par service et période
- Thèmes (clair, sombre, auto)
- Rafraîchissement automatique
- Modèles prédéfinis

### 5. Analyse et Rapports

#### Analyses Disponibles
- Vue d'ensemble des métriques
- Analyse par service
- Tendances temporelles
- Analyse des performances
- Analyse des erreurs
- Détection d'anomalies

#### Rapports
- Rapports quotidiens automatiques
- Rapports personnalisés
- Export de données
- Alertes et notifications

## 🔧 Utilisation

### Collecte de Métriques

#### Collecte Automatique
Le service collecte automatiquement les métriques toutes les 30 secondes.

#### Collecte Manuelle
```bash
# Collecter toutes les métriques
curl -X POST http://localhost:3006/api/metrics/collect

# Collecter un type spécifique
curl -X POST http://localhost:3006/api/metrics/collect \
  -H "Content-Type: application/json" \
  -d '{"type": "system"}'
```

#### Envoi de Métriques Personnalisées
```bash
curl -X POST http://localhost:3006/api/metrics \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "serviceName": "auth-service",
    "metricType": "business",
    "metricName": "login_attempts",
    "value": 42,
    "unit": "count",
    "tags": {
      "method": "email",
      "success": "true"
    }
  }'
```

### Création de Tableaux de Bord

#### Créer un Tableau de Bord
```bash
curl -X POST http://localhost:3006/api/dashboard \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name": "Mon Tableau de Bord",
    "description": "Surveillance des services",
    "widgets": [
      {
        "type": "chart",
        "title": "Utilisation CPU",
        "config": {
          "metricName": "cpu_load_1min",
          "serviceName": "system",
          "chartType": "line",
          "timeRange": "24h"
        }
      }
    ]
  }'
```

#### Utiliser un Modèle
```bash
curl -X POST http://localhost:3006/api/dashboard/from-template \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "templateId": "system-overview",
    "name": "Vue Système"
  }'
```

### Analyse des Données

#### Vue d'Ensemble
```bash
curl "http://localhost:3006/api/analytics/overview?startTime=2024-01-01&endTime=2024-01-31"
```

#### Analyse par Service
```bash
curl "http://localhost:3006/api/analytics/service/auth-service?period=7d"
```

#### Tendances
```bash
curl "http://localhost:3006/api/analytics/trends?metricName=response_time&serviceName=auth-service&period=30d"
```

## 📈 Monitoring

### Métriques Prometheus
Le service expose des métriques au format Prometheus sur `/api/health/metrics`.

### Logs
Les logs sont stockés dans le dossier `logs/` avec rotation automatique.

### Santé du Service
- `/api/health` : Vérification générale
- `/api/health/ready` : Prêt à recevoir des requêtes
- `/api/health/live` : Processus en vie

## 🔒 Sécurité

### Authentification
- JWT pour l'authentification
- Middleware d'autorisation
- Vérification des permissions

### Validation
- Validation des données d'entrée avec Joi
- Sanitisation des paramètres
- Protection contre les injections

### Rate Limiting
- Limitation à 100 requêtes par IP par 15 minutes
- Protection contre les abus

## 🚀 Déploiement

### Docker Compose
```yaml
metrics-service:
  build: ./metrics-service
  ports:
    - "3006:3006"
  environment:
    - MONGODB_URI=mongodb://mongodb:27017/metrics
    - JWT_SECRET=your_jwt_secret
  depends_on:
    - mongodb
  networks:
    - app-network
```

### Variables d'Environnement de Production
```env
NODE_ENV=production
MONGODB_URI=mongodb://mongodb:27017/metrics
JWT_SECRET=your_secure_jwt_secret
LOG_LEVEL=warn
```

## 🧪 Tests

```bash
# Tests unitaires
npm test

# Tests en mode watch
npm run test:watch

# Tests de couverture
npm run test:coverage
```

## 📝 API Documentation

### Swagger/OpenAPI
La documentation complète de l'API est disponible via Swagger UI.

### Exemples de Requêtes
Voir le dossier `examples/` pour des exemples d'utilisation.

## 🤝 Intégration

### Avec d'Autres Services
Le service peut être intégré avec :
- Prometheus pour la collecte
- Grafana pour la visualisation
- AlertManager pour les alertes
- Elasticsearch pour les logs

### Webhooks
Le service peut envoyer des webhooks lors d'événements importants :
- Seuils dépassés
- Anomalies détectées
- Erreurs critiques

## 📊 Métriques Exposées

### Métriques Système
- `system_memory_usage_bytes`
- `system_cpu_load_1min`
- `system_cpu_load_5min`
- `system_cpu_load_15min`

### Métriques Application
- `app_uptime_seconds`
- `app_requests_total`
- `db_connection_status`
- `db_metrics_total`
- `db_dashboards_total`

## 🔧 Maintenance

### Nettoyage Automatique
- Suppression des anciennes métriques (30 jours)
- Agrégation automatique des données
- Optimisation de la base de données

### Sauvegarde
- Sauvegarde automatique des configurations
- Export des données importantes
- Récupération en cas de panne

## 📞 Support

Pour toute question ou problème :
1. Consulter la documentation
2. Vérifier les logs
3. Contacter l'équipe de développement

## 📄 Licence

MIT License - Voir le fichier LICENSE pour plus de détails.


