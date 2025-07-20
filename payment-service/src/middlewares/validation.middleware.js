const { body, validationResult } = require('express-validator');

// Validation des paiements
const validatePayment = [
  body('amount')
    .isNumeric()
    .withMessage('Le montant doit être un nombre')
    .isFloat({ min: 0.01 })
    .withMessage('Le montant doit être supérieur à 0'),

  body('currency')
    .isString()
    .isIn(['EUR', 'USD', 'GBP'])
    .withMessage('La devise doit être EUR, USD ou GBP'),

  body('courseId')
    .isMongoId()
    .withMessage('ID de cours invalide'),

  // Middleware pour vérifier les erreurs de validation
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

// Validation des remboursements
const validateRefund = [
  body('reason')
    .isString()
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage('La raison du remboursement doit contenir entre 10 et 500 caractères'),

  // Middleware pour vérifier les erreurs de validation
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

module.exports = {
  validatePayment,
  validateRefund
}; 