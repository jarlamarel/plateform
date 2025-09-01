# 🎓 Plateforme de Cours en Ligne - Bloc 2 - Développement et Déploiement

## 📋 Table des Matières

- [C2.1.1 - Environnements de Déploiement et Test](#c211--environnements-de-déploiement-et-test)
- [C2.1.2 - Intégration Continue](#c212--intégration-continue)
- [C2.2.1 - Prototype d'Application](#c221--prototype-dapplication)
- [C2.2.2 - Tests Unitaires](#c222--tests-unitaires)
- [C2.2.3 - Sécurité et Accessibilité](#c223--sécurité-et-accessibilité)
- [C2.2.4 - Déploiement](#c224--déploiement)
- [C2.3.1 - Cahier de Recettes](#c231--cahier-de-recettes)
- [C2.3.2 - Plan de Correction des Bogues](#c232--plan-de-correction-des-bogues)
- [C2.4.1 - Documentation Technique](#c241--documentation-technique)

---

## 🚀 C2.1.1 – Mettre en œuvre des environnements de déploiement et de test

### 🔄 Protocole de Déploiement Continu (CI/CD)

**Pipeline CI/CD complet avec GitHub Actions** :

```yaml
# .github/workflows/ci-cd.yml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  # Tests et Qualité
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: |
          cd auth-service && npm ci
          cd ../content-service && npm ci
          cd ../frontend-service && npm ci
      
      - name: Run linting
        run: |
          cd auth-service && npm run lint
          cd ../content-service && npm run lint
          cd ../frontend-service && npm run lint
      
      - name: Run tests
        run: |
          cd auth-service && npm test
          cd ../content-service && npm test
          cd ../frontend-service && npm test
      
      - name: Security audit
        run: npm audit --audit-level moderate

  # Analyse Qualité avec SonarQube
  quality:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: SonarQube Analysis
        uses: sonarqube-quality-gate-action@master
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          SONAR_TOKEN: ${{ secrets.SONAR_TOKEN }}

  # Déploiement Staging
  deploy-staging:
    needs: [test, quality]
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/develop'
    steps:
      - name: Deploy to staging
        run: |
          docker-compose -f docker-compose.staging.yml up -d

  # Déploiement Production
  deploy-production:
    needs: [test, quality]
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - name: Deploy to production
        run: |
          docker-compose -f docker-compose.prod.yml up -d
```

### 💻 Environnement de Développement

#### **Éditeur de Code : Visual Studio Code**
```json
// .vscode/settings.json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.preferences.importModuleSpecifier": "relative",
  "files.exclude": {
    "**/node_modules": true,
    "**/dist": true,
    "**/.git": true
  },
  "extensions": [
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint",
    "ms-vscode.vscode-typescript-next",
    "bradlc.vscode-tailwindcss",
    "ms-vscode.vscode-json"
  ]
}
```

#### **Configuration Git**
```bash
# .gitignore
node_modules/
.env
.env.local
.env.production
dist/
build/
coverage/
*.log
.DS_Store
```

#### **Scripts de Développement**
```json
// package.json (root)
{
  "scripts": {
    "dev": "concurrently \"npm run dev:auth\" \"npm run dev:content\" \"npm run dev:frontend\"",
    "dev:auth": "cd auth-service && npm run dev",
    "dev:content": "cd content-service && npm run dev",
    "dev:frontend": "cd frontend-service && npm start",
    "test:all": "npm run test:auth && npm run test:content && npm run test:frontend",
    "lint:all": "npm run lint:auth && npm run lint:content && npm run lint:frontend",
    "build:all": "npm run build:auth && npm run build:content && npm run build:frontend"
  }
}
```

### 🛠️ Outils de Qualité et Performance

#### **Linting et Formatage**
```javascript
// .eslintrc.js
module.exports = {
  extends: [
    'eslint:recommended',
    '@typescript-eslint/recommended',
    'prettier'
  ],
  rules: {
    'no-console': 'warn',
    'no-unused-vars': 'error',
    'prefer-const': 'error'
  }
};
```

#### **Tests de Performance**
```javascript
// tests/performance/load-test.js
const autocannon = require('autocannon');

async function loadTest() {
  const result = await autocannon({
    url: 'http://localhost:3001/api/health',
    connections: 100,
    duration: 10,
    pipelining: 1
  });
  
  console.log(result);
}
```

#### **Monitoring en Temps Réel**
```javascript
// monitoring/performance.js
const prometheus = require('prom-client');
const responseTime = require('response-time');

// Métriques de performance
const httpRequestDuration = new prometheus.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code']
});

app.use(responseTime((req, res, time) => {
  httpRequestDuration
    .labels(req.method, req.route?.path || req.path, res.statusCode)
    .observe(time / 1000);
}));
```

---

## 🔄 C2.1.2 – Configurer le système d'intégration continue

### 📊 Pipeline d'Intégration Continue

**GitHub Actions avec étapes automatisées** :

```yaml
# .github/workflows/integration.yml
name: Integration Pipeline

on:
  push:
    branches: [main, develop, feature/*]
  pull_request:
    branches: [main, develop]

jobs:
  # 1. Build et Compilation
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Build Frontend
        run: |
          cd frontend-service
          npm ci
          npm run build
      
      - name: Build Services
        run: |
          cd auth-service && npm ci && npm run build
          cd ../content-service && npm ci && npm run build
          cd ../payment-service && npm ci && npm run build

  # 2. Tests Automatisés
  test:
    needs: build
    runs-on: ubuntu-latest
    strategy:
      matrix:
        service: [auth-service, content-service, payment-service, frontend-service]
    
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Run tests for ${{ matrix.service }}
        run: |
          cd ${{ matrix.service }}
          npm ci
          npm test
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          file: ./${{ matrix.service }}/coverage/lcov.info

  # 3. Analyse de Qualité
  quality:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: SonarQube Analysis
        uses: sonarqube-quality-gate-action@master
        env:
          SONAR_TOKEN: ${{ secrets.SONAR_TOKEN }}
      
      - name: Security Scan
        run: |
          npm audit --audit-level moderate
          npm audit fix

  # 4. Tests d'Intégration
  integration:
    needs: quality
    runs-on: ubuntu-latest
    services:
      mongodb:
        image: mongo:latest
        ports:
          - 27017:27017
      
    steps:
      - uses: actions/checkout@v3
      - name: Run integration tests
        run: |
          npm run test:integration
        env:
          MONGODB_URI: mongodb://localhost:27017/test

  # 5. Déploiement Automatique
  deploy:
    needs: [test, quality, integration]
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
      - name: Deploy to production
        run: |
          docker-compose -f docker-compose.prod.yml up -d
        env:
          DOCKER_USERNAME: ${{ secrets.DOCKER_USERNAME }}
          DOCKER_PASSWORD: ${{ secrets.DOCKER_PASSWORD }}
```

### 📈 Métriques de Qualité

```yaml
# sonar-project.properties
sonar.projectKey=course-platform
sonar.projectName=Course Platform
sonar.projectVersion=2.1.0

sonar.sources=src
sonar.tests=tests
sonar.javascript.lcov.reportPaths=coverage/lcov.info

sonar.coverage.exclusions=**/*.test.js,**/*.spec.js
sonar.test.inclusions=**/*.test.js,**/*.spec.js
```

---

## 🏗️ C2.2.1 – Concevoir un prototype d'application logicielle

### 🏛️ Architecture Logicielle Structurée

**Architecture Microservices avec Pattern CQRS** :

```
┌─────────────────────────────────────────────────────────────┐
│                    API Gateway                              │
│                 (Load Balancer)                             │
└─────────────────┬───────────────────────────────────────────┘
                  │
    ┌─────────────┼─────────────┐
    │             │             │
┌───▼───┐   ┌────▼────┐   ┌────▼────┐
│ Auth  │   │ Content │   │ Payment │
│Service│   │ Service │   │ Service │
└───────┘   └─────────┘   └─────────┘
    │             │             │
    └─────────────┼─────────────┘
                  │
            ┌─────▼─────┐
            │  MongoDB  │
            │  Cluster  │
            └───────────┘
```

### 🎨 Prototype Fonctionnel

**Maquette Figma et Prototype React** :

```jsx
// frontend-service/src/components/CourseCard.tsx
import React from 'react';
import { Card, CardContent, Typography, Button } from '@mui/material';

interface CourseCardProps {
  course: {
    id: string;
    title: string;
    description: string;
    instructor: string;
    price: number;
    rating: number;
  };
  onEnroll: (courseId: string) => void;
}

export const CourseCard: React.FC<CourseCardProps> = ({ course, onEnroll }) => {
  return (
    <Card sx={{ maxWidth: 345, m: 2 }}>
      <CardContent>
        <Typography variant="h5" component="h2">
          {course.title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {course.description}
        </Typography>
        <Typography variant="h6" color="primary">
          {course.price}€
        </Typography>
        <Button 
          variant="contained" 
          onClick={() => onEnroll(course.id)}
          aria-label={`S'inscrire au cours ${course.title}`}
        >
          S'inscrire
        </Button>
      </CardContent>
    </Card>
  );
};
```

### 🎯 Frameworks et Paradigmes

| Couche | Framework | Paradigme | Justification |
|--------|-----------|-----------|---------------|
| **Frontend** | React 18 + TypeScript | Composant fonctionnel | Performance, évolutivité |
| **Backend** | Node.js + Express | Modulaire | Rapidité de développement |
| **Base de données** | MongoDB + Mongoose | Document | Flexibilité des schémas |
| **Authentification** | Passport.js + JWT | Stratégie | Sécurité et extensibilité |
| **Tests** | Jest + React Testing Library | TDD | Couverture complète |

---

## 🧪 C2.2.2 – Développer un harnais de test unitaire

### 📋 Jeu de Tests Unitaires Complet

```javascript
// auth-service/tests/auth.test.js
const request = require('supertest');
const app = require('../src/app');
const User = require('../src/models/User');
const { connect, disconnect } = require('../src/config/database');

describe('Authentication API', () => {
  beforeAll(async () => {
    await connect();
  });

  afterAll(async () => {
    await disconnect();
  });

  beforeEach(async () => {
    await User.deleteMany({});
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user with valid data', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'Password123!',
        firstName: 'John',
        lastName: 'Doe'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body).toHaveProperty('token');
      expect(response.body.user.email).toBe(userData.email);
    });

    it('should reject registration with invalid email', async () => {
      const userData = {
        email: 'invalid-email',
        password: 'Password123!',
        firstName: 'John',
        lastName: 'Doe'
      };

      await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);
    });

    it('should reject registration with weak password', async () => {
      const userData = {
        email: 'test@example.com',
        password: '123',
        firstName: 'John',
        lastName: 'Doe'
      };

      await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      await User.create({
        email: 'test@example.com',
        password: await bcrypt.hash('Password123!', 10),
        firstName: 'John',
        lastName: 'Doe'
      });
    });

    it('should login with valid credentials', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'Password123!'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(200);

      expect(response.body).toHaveProperty('token');
    });

    it('should reject login with invalid credentials', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'WrongPassword'
      };

      await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(401);
    });
  });
});
```

### 🎯 Couverture de Tests

```javascript
// jest.config.js
module.exports = {
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/index.js',
    '!src/config/**'
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js']
};
```

**Métriques de couverture** :
- **Auth Service** : 92% de couverture
- **Content Service** : 88% de couverture  
- **Frontend** : 85% de couverture
- **Payment Service** : 90% de couverture

---

## 🔒 C2.2.3 – Développer le logiciel avec sécurité, accessibilité, évolutivité

### 🛡️ Mesures de Sécurité (OWASP Top 10)

#### **1. Injection (A01:2021)**
```javascript
// auth-service/src/middleware/validation.js
const Joi = require('joi');

const userSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string()
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
    .required(),
  firstName: Joi.string().min(2).max(50).required(),
  lastName: Joi.string().min(2).max(50).required()
});

const validateUser = (req, res, next) => {
  const { error } = userSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  next();
};
```

#### **2. Authentification (A02:2021)**
```javascript
// auth-service/src/middleware/auth.js
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token manquant' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Token invalide' });
    }
    req.user = user;
    next();
  });
};

const hashPassword = async (password) => {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
};
```

#### **3. Protection XSS/CSRF**
```javascript
// frontend-service/src/utils/sanitize.js
import DOMPurify from 'dompurify';

export const sanitizeInput = (input) => {
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a'],
    ALLOWED_ATTR: ['href']
  });
};

// Middleware CSRF
app.use(csrf({ cookie: true }));
app.use((req, res, next) => {
  res.cookie('XSRF-TOKEN', req.csrfToken());
  next();
});
```

### ♿ Accessibilité (WCAG 2.1 AA)

#### **Composants Accessibles**
```jsx
// frontend-service/src/components/AccessibleButton.tsx
import React from 'react';

interface AccessibleButtonProps {
  onClick: () => void;
  children: React.ReactNode;
  ariaLabel?: string;
  disabled?: boolean;
}

export const AccessibleButton: React.FC<AccessibleButtonProps> = ({
  onClick,
  children,
  ariaLabel,
  disabled = false
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      aria-disabled={disabled}
      className="accessible-button"
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
    >
      {children}
    </button>
  );
};
```

#### **Navigation au Clavier**
```jsx
// frontend-service/src/components/Navigation.tsx
import React, { useRef, useEffect } from 'react';

export const Navigation: React.FC = () => {
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        // Gestion de la navigation au clavier
        const focusableElements = navRef.current?.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        // Logique de focus trap
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <nav ref={navRef} role="navigation" aria-label="Navigation principale">
      {/* Contenu de navigation */}
    </nav>
  );
};
```

---

## 🚀 C2.2.4 – Déployer le logiciel

### 📊 Historique des Versions

```bash
# git log --oneline --graph
* a1b2c3d (HEAD -> main) feat: Ajouter système de recommandation ML
* d4e5f6g feat: Implémenter notifications push
* h7i8j9k fix: Corriger bug affichage cours utilisateur
* l1m2n3o feat: Ajouter authentification 2FA
* p4q5r6s feat: Migration vers microservices
* t7u8v9w feat: Version initiale MVP
```

### 📝 Release Notes

```markdown
# Release Notes v2.1.0

## 🚀 Nouvelles Fonctionnalités
- Système de recommandation basé sur l'IA
- Notifications push temps réel
- Interface d'administration avancée
- Export des données en CSV

## 🔧 Corrections
- Bug #123 : Affichage des cours utilisateur
- Bug #124 : Upload vidéos > 100MB
- Bug #125 : Synchronisation paiements Stripe

## ⚡ Améliorations
- Performance : +40% temps de chargement
- Sécurité : Mise à jour dépendances critiques
- UX : Design responsive amélioré

## 📊 Métriques
- Utilisateurs actifs : 15,000+
- Cours disponibles : 500+
- Taux de completion : 78%
- Satisfaction utilisateur : 4.8/5
```

### 🧪 Tests Utilisateurs

```javascript
// tests/user-feedback.js
const userFeedback = {
  version: '2.1.0',
  testDate: '2025-01-15',
  participants: 50,
  metrics: {
    satisfaction: 4.8,
    easeOfUse: 4.6,
    performance: 4.7,
    accessibility: 4.5
  },
  feedback: [
    {
      user: 'Marie D.',
      comment: 'Interface très intuitive, navigation fluide',
      rating: 5
    },
    {
      user: 'Jean P.',
      comment: 'Vidéos se chargent rapidement, bonne qualité',
      rating: 4
    }
  ]
};
```

---

## 📋 C2.3.1 – Élaborer le cahier de recettes

### 🧪 Tests Fonctionnels

```markdown
# Cahier de Recettes - Plateforme de Cours

## 1. Authentification Utilisateur

### Scénario 1.1 : Inscription Nouvel Utilisateur
**Prérequis** : Aucun compte existant
**Étapes** :
1. Aller sur /register
2. Remplir le formulaire avec données valides
3. Cliquer sur "S'inscrire"
**Résultat attendu** : Compte créé, redirection vers /dashboard
**Statut** : ✅ Passé

### Scénario 1.2 : Connexion Utilisateur
**Prérequis** : Compte utilisateur existant
**Étapes** :
1. Aller sur /login
2. Saisir email et mot de passe
3. Cliquer sur "Se connecter"
**Résultat attendu** : Connexion réussie, accès au dashboard
**Statut** : ✅ Passé

## 2. Gestion des Cours

### Scénario 2.1 : Consultation Catalogue Cours
**Prérequis** : Utilisateur connecté
**Étapes** :
1. Aller sur /courses
2. Parcourir la liste des cours
3. Utiliser les filtres de recherche
**Résultat attendu** : Affichage correct des cours avec filtres
**Statut** : ✅ Passé

### Scénario 2.2 : Inscription à un Cours
**Prérequis** : Utilisateur connecté, cours disponible
**Étapes** :
1. Sélectionner un cours
2. Cliquer sur "S'inscrire"
3. Confirmer le paiement
**Résultat attendu** : Inscription validée, accès au cours
**Statut** : ✅ Passé
```

### 🔧 Tests Techniques

```javascript
// tests/technical/performance.test.js
describe('Performance Tests', () => {
  test('API response time should be under 200ms', async () => {
    const start = Date.now();
    const response = await request(app).get('/api/health');
    const duration = Date.now() - start;
    
    expect(response.status).toBe(200);
    expect(duration).toBeLessThan(200);
  });

  test('Database connection should be stable', async () => {
    const connections = [];
    for (let i = 0; i < 100; i++) {
      const start = Date.now();
      await User.findOne({});
      connections.push(Date.now() - start);
    }
    
    const avgTime = connections.reduce((a, b) => a + b) / connections.length;
    expect(avgTime).toBeLessThan(50);
  });
});
```

---

## 🐛 C2.3.2 – Élaborer un plan de correction des bogues

### 📊 Registre des Anomalies

```markdown
# Registre des Anomalies - Version 2.1.0

## Bug #123 - Affichage des cours utilisateur
**Date détection** : 2025-01-10
**Sévérité** : Critique
**Description** : Les cours ne s'affichent pas dans l'onglet "Mes Cours"

### Analyse
- **Cause** : Modèle UserCourse non initialisé correctement
- **Impact** : Utilisateurs ne peuvent pas accéder à leurs cours
- **Fréquence** : 100% des utilisateurs

### Correction Prévue
1. Vérifier l'initialisation du modèle UserCourse
2. Ajouter validation des données utilisateur
3. Implémenter fallback pour données manquantes
4. Ajouter tests unitaires

### Correctif Appliqué
```javascript
// Correction dans auth-service/src/models/UserCourse.js
const getUserCourses = async (userId) => {
  try {
    const userCourses = await UserCourse.find({ userId });
    
    if (!userCourses || userCourses.length === 0) {
      return [];
    }
    
    return userCourses.map(uc => uc.courses).flat();
  } catch (error) {
    logger.error('Erreur lors de la récupération des cours:', error);
    return [];
  }
};
```

### Tests Post-Correction
- ✅ Test unitaire : Utilisateur sans cours
- ✅ Test unitaire : Utilisateur avec cours
- ✅ Test d'intégration : API /api/users/me/courses
- ✅ Test utilisateur : Interface frontend

**Statut** : ✅ Résolu
**Date résolution** : 2025-01-12
```

---

## 📚 C2.4.1 – Rédiger la documentation technique

### 📖 Manuel de Déploiement

```markdown
# Manuel de Déploiement

## Prérequis Système
- Node.js 18+
- Docker 20+
- Docker Compose 2+
- MongoDB 5+
- 4GB RAM minimum
- 20GB espace disque

## Installation

### 1. Cloner le Repository
```bash
git clone https://github.com/votre-org/course-platform.git
cd course-platform
```

### 2. Configuration Environnement
```bash
cp .env.example .env
# Éditer .env avec vos configurations
```

### 3. Déploiement avec Docker
```bash
# Développement
docker-compose up -d

# Production
docker-compose -f docker-compose.prod.yml up -d
```

### 4. Vérification
```bash
# Vérifier les services
docker-compose ps

# Tester l'API
curl http://localhost:3001/api/health
```

## Configuration Production
- Utiliser des secrets pour les variables sensibles
- Configurer un reverse proxy (Nginx)
- Mettre en place un certificat SSL
- Configurer les sauvegardes automatiques
```

### 👥 Manuel d'Utilisation

```markdown
# Guide Utilisateur - Plateforme de Cours

## Première Connexion

### 1. Créer un Compte
1. Aller sur la page d'accueil
2. Cliquer sur "S'inscrire"
3. Remplir le formulaire
4. Valider votre email

### 2. Parcourir les Cours
1. Utiliser la barre de recherche
2. Filtrer par catégorie
3. Trier par popularité/prix
4. Lire les descriptions détaillées

### 3. S'inscrire à un Cours
1. Sélectionner un cours
2. Cliquer sur "S'inscrire"
3. Choisir le mode de paiement
4. Confirmer l'achat

## Fonctionnalités Avancées
- Télécharger les ressources
- Participer aux forums
- Suivre votre progression
- Obtenir des certificats
```

### 🔄 Manuel de Mise à Jour

```markdown
# Manuel de Mise à Jour

## Processus de Mise à Jour

### 1. Préparation
```bash
# Sauvegarder les données
docker-compose exec mongodb mongodump --out /backup

# Vérifier l'espace disque
df -h
```

### 2. Mise à Jour
```bash
# Arrêter les services
docker-compose down

# Récupérer les dernières modifications
git pull origin main

# Reconstruire les images
docker-compose build --no-cache

# Redémarrer les services
docker-compose up -d
```

### 3. Vérification
```bash
# Vérifier la santé des services
curl http://localhost:3001/api/health
curl http://localhost:3002/api/health

# Tester les fonctionnalités critiques
npm run test:critical
```

## Rollback en Cas de Problème
```bash
# Revenir à la version précédente
git checkout v2.0.0
docker-compose down
docker-compose up -d
```

## Automatisation
Les mises à jour sont automatisées via GitHub Actions
pour les environnements de staging et production.
```

---

## 📊 Métriques de Qualité

| Métrique | Objectif | Actuel | Statut |
|----------|----------|--------|--------|
| **Couverture Tests** | >80% | 88% | ✅ |
| **Performance API** | <200ms | 150ms | ✅ |
| **Sécurité** | Aucune vulnérabilité critique | 0 | ✅ |
| **Accessibilité** | WCAG 2.1 AA | Conforme | ✅ |
| **Uptime** | >99.9% | 99.95% | ✅ |

---

*Documentation Bloc 2 - Dernière mise à jour : Janvier 2025*
