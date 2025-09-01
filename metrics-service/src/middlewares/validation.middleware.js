const Joi = require('joi');
const logger = require('../utils/logger');

// Schéma de validation pour une métrique
const metricSchema = Joi.object({
  serviceName: Joi.string()
    .valid('auth-service', 'content-service', 'database-service', 'notification-service', 'payment-service', 'frontend-service', 'system')
    .required()
    .messages({
      'any.required': 'Le nom du service est requis',
      'any.only': 'Nom de service invalide'
    }),

  metricType: Joi.string()
    .valid('performance', 'usage', 'error', 'business', 'system')
    .required()
    .messages({
      'any.required': 'Le type de métrique est requis',
      'any.only': 'Type de métrique invalide'
    }),

  metricName: Joi.string()
    .min(1)
    .max(100)
    .required()
    .messages({
      'string.empty': 'Le nom de la métrique ne peut pas être vide',
      'string.max': 'Le nom de la métrique ne peut pas dépasser 100 caractères',
      'any.required': 'Le nom de la métrique est requis'
    }),

  value: Joi.alternatives()
    .try(
      Joi.number(),
      Joi.string(),
      Joi.boolean()
    )
    .required()
    .messages({
      'any.required': 'La valeur de la métrique est requise',
      'alternatives.types': 'La valeur doit être un nombre, une chaîne ou un booléen'
    }),

  unit: Joi.string()
    .max(20)
    .optional()
    .messages({
      'string.max': 'L\'unité ne peut pas dépasser 20 caractères'
    }),

  tags: Joi.object()
    .pattern(Joi.string(), Joi.string())
    .optional()
    .messages({
      'object.unknown': 'Les tags doivent être des paires clé-valeur de chaînes'
    }),

  timestamp: Joi.date()
    .optional()
    .messages({
      'date.base': 'Le timestamp doit être une date valide'
    }),

  metadata: Joi.object()
    .optional()
    .messages({
      'object.base': 'Les métadonnées doivent être un objet'
    })
});

// Schéma de validation pour un tableau de bord
const dashboardSchema = Joi.object({
  name: Joi.string()
    .min(1)
    .max(100)
    .required()
    .messages({
      'string.empty': 'Le nom du tableau de bord ne peut pas être vide',
      'string.max': 'Le nom du tableau de bord ne peut pas dépasser 100 caractères',
      'any.required': 'Le nom du tableau de bord est requis'
    }),

  description: Joi.string()
    .max(500)
    .optional()
    .messages({
      'string.max': 'La description ne peut pas dépasser 500 caractères'
    }),

  isPublic: Joi.boolean()
    .optional()
    .messages({
      'boolean.base': 'isPublic doit être un booléen'
    }),

  isDefault: Joi.boolean()
    .optional()
    .messages({
      'boolean.base': 'isDefault doit être un booléen'
    }),

  widgets: Joi.array()
    .items(Joi.object({
      type: Joi.string()
        .valid('chart', 'metric', 'table', 'gauge', 'list')
        .required(),
      title: Joi.string()
        .min(1)
        .max(100)
        .required(),
      config: Joi.object({
        metricName: Joi.string().optional(),
        serviceName: Joi.string().optional(),
        chartType: Joi.string()
          .valid('line', 'bar', 'pie', 'area', 'gauge')
          .optional(),
        timeRange: Joi.string()
          .valid('1h', '6h', '24h', '7d', '30d', 'custom')
          .optional(),
        refreshInterval: Joi.number()
          .min(5)
          .max(3600)
          .optional(),
        position: Joi.object({
          x: Joi.number().min(0).optional(),
          y: Joi.number().min(0).optional(),
          width: Joi.number().min(1).max(12).optional(),
          height: Joi.number().min(1).max(12).optional()
        }).optional(),
        options: Joi.object().optional()
      }).optional()
    }))
    .optional()
    .messages({
      'array.base': 'Les widgets doivent être un tableau',
      'object.unknown': 'Configuration de widget invalide'
    }),

  theme: Joi.string()
    .valid('light', 'dark', 'auto')
    .optional()
    .messages({
      'any.only': 'Le thème doit être light, dark ou auto'
    }),

  refreshInterval: Joi.number()
    .min(10)
    .max(3600)
    .optional()
    .messages({
      'number.min': 'L\'intervalle de rafraîchissement doit être d\'au moins 10 secondes',
      'number.max': 'L\'intervalle de rafraîchissement ne peut pas dépasser 3600 secondes'
    }),

  filters: Joi.object({
    services: Joi.array()
      .items(Joi.string())
      .optional(),
    timeRange: Joi.string()
      .valid('1h', '6h', '24h', '7d', '30d', 'custom')
      .optional(),
    customFilters: Joi.object().optional()
  }).optional()
});

// Schéma de validation pour les paramètres de requête de métriques
const metricsQuerySchema = Joi.object({
  serviceName: Joi.string()
    .valid('auth-service', 'content-service', 'database-service', 'notification-service', 'payment-service', 'frontend-service', 'system')
    .optional(),

  metricType: Joi.string()
    .valid('performance', 'usage', 'error', 'business', 'system')
    .optional(),

  metricName: Joi.string()
    .max(100)
    .optional(),

  startTime: Joi.date()
    .optional()
    .messages({
      'date.base': 'startTime doit être une date valide'
    }),

  endTime: Joi.date()
    .min(Joi.ref('startTime'))
    .optional()
    .messages({
      'date.base': 'endTime doit être une date valide',
      'date.min': 'endTime doit être postérieur à startTime'
    }),

  limit: Joi.number()
    .integer()
    .min(1)
    .max(1000)
    .optional()
    .messages({
      'number.base': 'limit doit être un nombre',
      'number.integer': 'limit doit être un entier',
      'number.min': 'limit doit être d\'au moins 1',
      'number.max': 'limit ne peut pas dépasser 1000'
    }),

  page: Joi.number()
    .integer()
    .min(1)
    .optional()
    .messages({
      'number.base': 'page doit être un nombre',
      'number.integer': 'page doit être un entier',
      'number.min': 'page doit être d\'au moins 1'
    }),

  sort: Joi.string()
    .valid('timestamp', 'serviceName', 'metricName', 'value')
    .optional()
    .messages({
      'any.only': 'Le champ de tri doit être timestamp, serviceName, metricName ou value'
    }),

  order: Joi.string()
    .valid('asc', 'desc')
    .optional()
    .messages({
      'any.only': 'L\'ordre doit être asc ou desc'
    })
});

// Fonction de validation générique
const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const errorMessages = error.details.map(detail => detail.message);
      logger.warn('Validation error:', { errors: errorMessages, body: req.body });
      
      return res.status(400).json({
        success: false,
        message: 'Données de validation invalides',
        errors: errorMessages
      });
    }

    // Remplacer req.body par les données validées
    req.body = value;
    next();
  };
};

// Fonction de validation pour les paramètres de requête
const validateQuery = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.query, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const errorMessages = error.details.map(detail => detail.message);
      logger.warn('Query validation error:', { errors: errorMessages, query: req.query });
      
      return res.status(400).json({
        success: false,
        message: 'Paramètres de requête invalides',
        errors: errorMessages
      });
    }

    // Remplacer req.query par les données validées
    req.query = value;
    next();
  };
};

// Validation spécifique pour les métriques
const validateMetricData = (data) => {
  return metricSchema.validate(data, { abortEarly: false });
};

// Validation spécifique pour les tableaux de bord
const validateDashboardData = (data) => {
  return dashboardSchema.validate(data, { abortEarly: false });
};

// Middlewares d'export
module.exports = {
  validateRequest,
  validateQuery,
  validateMetricData,
  validateDashboardData,
  metricSchema,
  dashboardSchema,
  metricsQuerySchema
};


