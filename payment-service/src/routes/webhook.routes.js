const express = require('express');
const router = express.Router();
const webhookController = require('../controllers/webhook.controller');

// Route pour les webhooks Stripe (pas d'auth car Stripe envoie directement)
router.post('/stripe', express.raw({ type: 'application/json' }), webhookController.handleStripeWebhook);

module.exports = router;
