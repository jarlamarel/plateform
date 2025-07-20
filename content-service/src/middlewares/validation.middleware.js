const { validationResult } = require('express-validator');
const logger = require('../utils/logger');

// Middleware de validation générique
exports.validate = (validations) => {
  return async (req, res, next) => {
    await Promise.all(validations.map((validation) => validation.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    logger.warn('Erreurs de validation:', {
      errors: errors.array(),
      path: req.path,
      method: req.method,
    });

    return res.status(400).json({
      error: 'Erreur de validation',
      details: errors.array().map((err) => ({
        field: err.param,
        message: err.msg,
        value: err.value,
      })),
    });
  };
};

// Middleware de validation pour les cours
exports.validateCourse = (req, res, next) => {
  const { title, description, price, category } = req.body;

  const errors = [];

  if (!title || title.length < 3 || title.length > 100) {
    errors.push({
      field: 'title',
      message: 'Le titre doit contenir entre 3 et 100 caractères',
    });
  }

  if (!description || description.length < 10 || description.length > 1000) {
    errors.push({
      field: 'description',
      message: 'La description doit contenir entre 10 et 1000 caractères',
    });
  }

  if (price !== undefined && (isNaN(price) || price < 0)) {
    errors.push({
      field: 'price',
      message: 'Le prix doit être un nombre positif',
    });
  }

  if (
    !category ||
    !['programming', 'design', 'business', 'marketing', 'other'].includes(category)
  ) {
    errors.push({
      field: 'category',
      message: 'Catégorie invalide',
    });
  }

  if (errors.length > 0) {
    logger.warn('Erreurs de validation du cours:', {
      errors,
      path: req.path,
      method: req.method,
    });

    return res.status(400).json({
      error: 'Erreur de validation du cours',
      details: errors,
    });
  }

  next();
};

// Middleware de validation pour les leçons
exports.validateLesson = (req, res, next) => {
  const { title, content, duration, order } = req.body;

  const errors = [];

  if (!title || title.length < 3 || title.length > 100) {
    errors.push({
      field: 'title',
      message: 'Le titre doit contenir entre 3 et 100 caractères',
    });
  }

  if (!content || content.length < 10) {
    errors.push({
      field: 'content',
      message: 'Le contenu doit contenir au moins 10 caractères',
    });
  }

  if (duration !== undefined && (isNaN(duration) || duration < 0)) {
    errors.push({
      field: 'duration',
      message: 'La durée doit être un nombre positif',
    });
  }

  if (order !== undefined && (isNaN(order) || order < 0)) {
    errors.push({
      field: 'order',
      message: "L'ordre doit être un nombre positif",
    });
  }

  if (errors.length > 0) {
    logger.warn('Erreurs de validation de la leçon:', {
      errors,
      path: req.path,
      method: req.method,
    });

    return res.status(400).json({
      error: 'Erreur de validation de la leçon',
      details: errors,
    });
  }

  next();
};

// Middleware de validation pour les ressources
exports.validateResource = (req, res, next) => {
  const { title, description, type } = req.body;

  const errors = [];

  if (!title || title.length < 3 || title.length > 100) {
    errors.push({
      field: 'title',
      message: 'Le titre doit contenir entre 3 et 100 caractères',
    });
  }

  if (!description || description.length < 10 || description.length > 500) {
    errors.push({
      field: 'description',
      message: 'La description doit contenir entre 10 et 500 caractères',
    });
  }

  if (!type || !['document', 'video', 'audio', 'image', 'other'].includes(type)) {
    errors.push({
      field: 'type',
      message: 'Type de ressource invalide',
    });
  }

  if (errors.length > 0) {
    logger.warn('Erreurs de validation de la ressource:', {
      errors,
      path: req.path,
      method: req.method,
    });

    return res.status(400).json({
      error: 'Erreur de validation de la ressource',
      details: errors,
    });
  }

  next();
};

// Middleware de validation pour les commentaires
exports.validateComment = (req, res, next) => {
  const { content } = req.body;

  const errors = [];

  if (!content || content.length < 1 || content.length > 500) {
    errors.push({
      field: 'content',
      message: 'Le commentaire doit contenir entre 1 et 500 caractères',
    });
  }

  if (errors.length > 0) {
    logger.warn('Erreurs de validation du commentaire:', {
      errors,
      path: req.path,
      method: req.method,
    });

    return res.status(400).json({
      error: 'Erreur de validation du commentaire',
      details: errors,
    });
  }

  next();
};

// Middleware de validation pour les paramètres de requête
exports.validateQueryParams = (req, res, next) => {
  const { page, limit, sort, order } = req.query;

  const errors = [];

  if (page !== undefined && (isNaN(page) || page < 1)) {
    errors.push({
      field: 'page',
      message: 'La page doit être un nombre positif',
    });
  }

  if (limit !== undefined && (isNaN(limit) || limit < 1 || limit > 100)) {
    errors.push({
      field: 'limit',
      message: 'La limite doit être un nombre entre 1 et 100',
    });
  }

  if (
    sort !== undefined &&
    !['title', 'createdAt', 'updatedAt', 'price', 'rating'].includes(sort)
  ) {
    errors.push({
      field: 'sort',
      message: 'Champ de tri invalide',
    });
  }

  if (order !== undefined && !['asc', 'desc'].includes(order.toLowerCase())) {
    errors.push({
      field: 'order',
      message: 'Ordre de tri invalide (asc ou desc)',
    });
  }

  if (errors.length > 0) {
    logger.warn('Erreurs de validation des paramètres de requête:', {
      errors,
      path: req.path,
      method: req.method,
    });

    return res.status(400).json({
      error: 'Erreur de validation des paramètres de requête',
      details: errors,
    });
  }

  next();
};
