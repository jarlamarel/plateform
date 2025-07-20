const Payment = require('../models/payment.model');
const stripeService = require('../services/stripe.service');
const logger = require('../utils/logger');

class PaymentController {
  // Créer une intention de paiement
  async createPaymentIntent(req, res) {
    try {
      const { amount, currency, courseId } = req.body;
      const userId = req.user._id;

      // Créer ou récupérer le client Stripe
      let customer = await stripeService.getCustomer(req.user.stripeCustomerId);
      if (!customer) {
        customer = await stripeService.createCustomer(req.user.email, req.user.name);
        // Mettre à jour l'utilisateur avec l'ID client Stripe
        req.user.stripeCustomerId = customer.id;
        await req.user.save();
      }

      // Créer l'intention de paiement
      const paymentIntent = await stripeService.createPaymentIntent(
        amount,
        currency,
        customer.id,
        { courseId: courseId.toString(), userId: userId.toString() }
      );

      res.json({
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id
      });
    } catch (error) {
      logger.error('Erreur lors de la création de l\'intention de paiement:', error);
      res.status(500).json({ message: 'Erreur lors de la création du paiement', error: error.message });
    }
  }

  // Confirmer un paiement
  async confirmPayment(req, res) {
    try {
      const { paymentIntentId } = req.params;
      const paymentIntent = await stripeService.confirmPayment(paymentIntentId);

      // Créer l'enregistrement de paiement
      const payment = new Payment({
        userId: req.user._id,
        courseId: paymentIntent.metadata.courseId,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        status: paymentIntent.status === 'succeeded' ? 'completed' : 'failed',
        paymentMethod: paymentIntent.payment_method_types[0],
        stripePaymentId: paymentIntent.id,
        stripeCustomerId: paymentIntent.customer,
        metadata: paymentIntent.metadata
      });

      await payment.save();

      res.json(payment);
    } catch (error) {
      logger.error('Erreur lors de la confirmation du paiement:', error);
      res.status(500).json({ message: 'Erreur lors de la confirmation du paiement', error: error.message });
    }
  }

  // Rembourser un paiement
  async refundPayment(req, res) {
    try {
      const { paymentId } = req.params;
      const { reason } = req.body;

      const payment = await Payment.findById(paymentId);
      if (!payment) {
        return res.status(404).json({ message: 'Paiement non trouvé' });
      }

      // Vérifier que l'utilisateur est autorisé à effectuer le remboursement
      if (payment.userId.toString() !== req.user._id.toString() && !req.user.isAdmin) {
        return res.status(403).json({ message: 'Non autorisé' });
      }

      // Effectuer le remboursement via Stripe
      await stripeService.refundPayment(payment.stripePaymentId);

      // Mettre à jour le statut du paiement
      await payment.markAsRefunded(reason);

      res.json(payment);
    } catch (error) {
      logger.error('Erreur lors du remboursement:', error);
      res.status(500).json({ message: 'Erreur lors du remboursement', error: error.message });
    }
  }

  // Obtenir l'historique des paiements d'un utilisateur
  async getUserPayments(req, res) {
    try {
      const payments = await Payment.find({ userId: req.user._id })
        .sort({ createdAt: -1 })
        .populate('courseId', 'title');

      res.json(payments);
    } catch (error) {
      logger.error('Erreur lors de la récupération des paiements:', error);
      res.status(500).json({ message: 'Erreur lors de la récupération des paiements', error: error.message });
    }
  }

  // Obtenir les détails d'un paiement
  async getPaymentDetails(req, res) {
    try {
      const payment = await Payment.findById(req.params.paymentId)
        .populate('courseId', 'title');

      if (!payment) {
        return res.status(404).json({ message: 'Paiement non trouvé' });
      }

      // Vérifier que l'utilisateur est autorisé à voir les détails
      if (payment.userId.toString() !== req.user._id.toString() && !req.user.isAdmin) {
        return res.status(403).json({ message: 'Non autorisé' });
      }

      res.json(payment);
    } catch (error) {
      logger.error('Erreur lors de la récupération des détails du paiement:', error);
      res.status(500).json({ message: 'Erreur lors de la récupération des détails du paiement', error: error.message });
    }
  }
}

module.exports = new PaymentController(); 