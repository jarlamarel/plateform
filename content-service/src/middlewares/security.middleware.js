const helmet = require('helmet');
const cors = require('cors');
const xss = require('xss-clean');
const hpp = require('hpp');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const logger = require('../utils/logger');

// Configuration CORS
const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : ['http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['X-RateLimit-Limit', 'X-RateLimit-Remaining', 'X-RateLimit-Reset'],
  credentials: true,
  maxAge: 86400, // 24 heures
};

// Configuration Helmet
const helmetOptions = {
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: true,
  crossOriginOpenerPolicy: true,
  crossOriginResourcePolicy: { policy: 'same-site' },
  dnsPrefetchControl: { allow: false },
  frameguard: { action: 'deny' },
  hidePoweredBy: true,
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
  ieNoOpen: true,
  noSniff: true,
  originAgentCluster: true,
  permittedCrossDomainPolicies: { permittedPolicies: 'none' },
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  xssFilter: true,
};

// Configuration du rate limiting
const rateLimitOptions = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limite de 100 requêtes par fenêtre
  message: {
    error: 'Trop de requêtes',
    details: 'Veuillez réessayer plus tard',
  },
  standardHeaders: true,
  legacyHeaders: false,
};

// Middleware de sécurité pour les API
exports.apiSecurity = [
  // Protection contre les attaques XSS
  xss(),
  
  // Protection contre les injections MongoDB
  mongoSanitize(),
  
  // Protection contre les attaques HTTP Parameter Pollution
  hpp(),
  
  // Configuration des en-têtes de sécurité
  helmet(helmetOptions),
  
  // Configuration CORS
  cors(corsOptions),
  
  // Rate limiting
  rateLimit(rateLimitOptions),
];

// Middleware de sécurité pour les fichiers statiques
exports.staticSecurity = [
  // Configuration des en-têtes de sécurité
  helmet({
    ...helmetOptions,
    contentSecurityPolicy: false, // Désactiver CSP pour les fichiers statiques
  }),
  
  // Configuration CORS
  cors(corsOptions),
];

// Middleware de sécurité pour les téléchargements
exports.downloadSecurity = [
  // Protection contre les attaques XSS
  xss(),
  
  // Configuration des en-têtes de sécurité
  helmet({
    ...helmetOptions,
    contentSecurityPolicy: false, // Désactiver CSP pour les téléchargements
  }),
  
  // Configuration CORS
  cors(corsOptions),
  
  // Rate limiting plus strict pour les téléchargements
  rateLimit({
    ...rateLimitOptions,
    windowMs: 60 * 60 * 1000, // 1 heure
    max: 10, // Limite de 10 téléchargements par heure
  }),
];

// Middleware de sécurité pour les uploads
exports.uploadSecurity = [
  // Protection contre les attaques XSS
  xss(),
  
  // Configuration des en-têtes de sécurité
  helmet({
    ...helmetOptions,
    contentSecurityPolicy: false, // Désactiver CSP pour les uploads
  }),
  
  // Configuration CORS
  cors(corsOptions),
  
  // Rate limiting plus strict pour les uploads
  rateLimit({
    ...rateLimitOptions,
    windowMs: 60 * 60 * 1000, // 1 heure
    max: 5, // Limite de 5 uploads par heure
  }),
];

// Middleware de sécurité pour les websockets
exports.websocketSecurity = [
  // Configuration des en-têtes de sécurité
  helmet({
    ...helmetOptions,
    contentSecurityPolicy: false, // Désactiver CSP pour les websockets
  }),
  
  // Configuration CORS
  cors(corsOptions),
];

// Middleware de sécurité pour les graphiques
exports.graphSecurity = [
  // Protection contre les attaques XSS
  xss(),
  
  // Configuration des en-têtes de sécurité
  helmet({
    ...helmetOptions,
    contentSecurityPolicy: {
      ...helmetOptions.contentSecurityPolicy,
      directives: {
        ...helmetOptions.contentSecurityPolicy.directives,
        scriptSrc: [...helmetOptions.contentSecurityPolicy.directives.scriptSrc, 'https://cdn.jsdelivr.net'],
        styleSrc: [...helmetOptions.contentSecurityPolicy.directives.styleSrc, 'https://cdn.jsdelivr.net'],
      },
    },
  }),
  
  // Configuration CORS
  cors(corsOptions),
];

// Middleware de sécurité pour les webhooks
exports.webhookSecurity = [
  // Protection contre les attaques XSS
  xss(),
  
  // Configuration des en-têtes de sécurité
  helmet({
    ...helmetOptions,
    contentSecurityPolicy: false, // Désactiver CSP pour les webhooks
  }),
  
  // Configuration CORS
  cors(corsOptions),
  
  // Rate limiting plus strict pour les webhooks
  rateLimit({
    ...rateLimitOptions,
    windowMs: 60 * 1000, // 1 minute
    max: 60, // Limite de 60 requêtes par minute
  }),
];

// Middleware de sécurité pour les API publiques
exports.publicApiSecurity = [
  // Protection contre les attaques XSS
  xss(),
  
  // Configuration des en-têtes de sécurité
  helmet({
    ...helmetOptions,
    contentSecurityPolicy: false, // Désactiver CSP pour les API publiques
  }),
  
  // Configuration CORS
  cors({
    ...corsOptions,
    origin: '*', // Autoriser toutes les origines pour les API publiques
  }),
  
  // Rate limiting plus strict pour les API publiques
  rateLimit({
    ...rateLimitOptions,
    windowMs: 60 * 1000, // 1 minute
    max: 30, // Limite de 30 requêtes par minute
  }),
]; 