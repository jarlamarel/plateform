const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payment.controller');
const { authenticateToken, validateToken } = require('../middlewares/auth.middleware');
const { validatePayment } = require('../middlewares/validation.middleware');

// Middleware d'authentification pour toutes les routes
router.use(authenticateToken);
router.use(validateToken);

// Créer une intention de paiement
router.post('/intent', validatePayment, paymentController.createPaymentIntent);

// Confirmer un paiement
router.post('/confirm/:paymentIntentId', paymentController.confirmPayment);

// Rembourser un paiement
router.post('/refund/:paymentId', paymentController.refundPayment);

// Obtenir l'historique des paiements d'un utilisateur
router.get('/history', paymentController.getUserPayments);

// Obtenir les détails d'un paiement
router.get('/:paymentId', paymentController.getPaymentDetails);

module.exports = router; 