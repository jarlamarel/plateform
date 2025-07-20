const express = require('express');
const router = express.Router();
const stripeService = require('../services/stripe.service');
const { authenticateToken, validateToken } = require('../middlewares/auth.middleware');

// Auth pour toutes les routes
router.use(authenticateToken);
router.use(validateToken);

// Créer un abonnement
router.post('/', async (req, res) => {
  try {
    const { customerId, priceId } = req.body;
    const subscription = await stripeService.createSubscription(customerId, priceId);
    res.status(201).json(subscription);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Annuler un abonnement
router.delete('/:subscriptionId', async (req, res) => {
  try {
    const { subscriptionId } = req.params;
    const subscription = await stripeService.cancelSubscription(subscriptionId);
    res.json(subscription);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Récupérer un abonnement (exemple minimal)
router.get('/:subscriptionId', async (req, res) => {
  try {
    const { subscriptionId } = req.params;
    // Stripe n'a pas de méthode directe pour get, mais on peut utiliser retrieve
    const subscription = await stripeService.getSubscription(subscriptionId);
    res.json(subscription);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router; 