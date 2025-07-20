const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const logger = require('../utils/logger');

class StripeService {
  // Créer un client Stripe
  async createCustomer(email, name) {
    try {
      const customer = await stripe.customers.create({
        email,
        name,
      });
      return customer;
    } catch (error) {
      logger.error('Erreur lors de la création du client Stripe:', error);
      throw error;
    }
  }

  // Créer une intention de paiement
  async createPaymentIntent(amount, currency, customerId, metadata = {}) {
    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount,
        currency,
        customer: customerId,
        metadata,
      });
      return paymentIntent;
    } catch (error) {
      logger.error('Erreur lors de la création de l\'intention de paiement:', error);
      throw error;
    }
  }

  // Confirmer un paiement
  async confirmPayment(paymentIntentId) {
    try {
      const paymentIntent = await stripe.paymentIntents.confirm(paymentIntentId);
      return paymentIntent;
    } catch (error) {
      logger.error('Erreur lors de la confirmation du paiement:', error);
      throw error;
    }
  }

  // Rembourser un paiement
  async refundPayment(paymentIntentId, amount = null) {
    try {
      const refundParams = {
        payment_intent: paymentIntentId,
      };
      if (amount) {
        refundParams.amount = amount;
      }
      const refund = await stripe.refunds.create(refundParams);
      return refund;
    } catch (error) {
      logger.error('Erreur lors du remboursement:', error);
      throw error;
    }
  }

  // Créer un abonnement
  async createSubscription(customerId, priceId) {
    try {
      const subscription = await stripe.subscriptions.create({
        customer: customerId,
        items: [{ price: priceId }],
        payment_behavior: 'default_incomplete',
        expand: ['latest_invoice.payment_intent'],
      });
      return subscription;
    } catch (error) {
      logger.error('Erreur lors de la création de l\'abonnement:', error);
      throw error;
    }
  }

  // Annuler un abonnement
  async cancelSubscription(subscriptionId) {
    try {
      const subscription = await stripe.subscriptions.del(subscriptionId);
      return subscription;
    } catch (error) {
      logger.error('Erreur lors de l\'annulation de l\'abonnement:', error);
      throw error;
    }
  }

  // Récupérer les détails d'un paiement
  async getPaymentIntent(paymentIntentId) {
    try {
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      return paymentIntent;
    } catch (error) {
      logger.error('Erreur lors de la récupération du paiement:', error);
      throw error;
    }
  }

  // Récupérer les détails d'un client
  async getCustomer(customerId) {
    try {
      const customer = await stripe.customers.retrieve(customerId);
      return customer;
    } catch (error) {
      logger.error('Erreur lors de la récupération du client:', error);
      throw error;
    }
  }

  // Récupérer les détails d'un abonnement
  async getSubscription(subscriptionId) {
    try {
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      return subscription;
    } catch (error) {
      logger.error('Erreur lors de la récupération de l\'abonnement:', error);
      throw error;
    }
  }
}

module.exports = new StripeService(); 