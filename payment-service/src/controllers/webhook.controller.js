const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Payment = require('../models/payment.model');
const logger = require('../utils/logger');
const config = require('../config');
const axios = require('axios');

class WebhookController {
  // Traiter les webhooks Stripe
  async handleStripeWebhook(req, res) {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
      // Vérifier la signature du webhook
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        config.stripe.webhookSecret
      );
    } catch (err) {
      logger.error('Erreur de signature webhook:', err.message);
      return res.status(400).send(`Webhook signature verification failed: ${err.message}`);
    }

    try {
      // Traiter l'événement selon son type
      switch (event.type) {
        case 'payment_intent.succeeded':
          await this.handlePaymentSucceeded(event.data.object);
          break;

        case 'payment_intent.payment_failed':
          await this.handlePaymentFailed(event.data.object);
          break;

        case 'payment_intent.canceled':
          await this.handlePaymentCanceled(event.data.object);
          break;

        case 'charge.dispute.created':
          await this.handleChargeDispute(event.data.object);
          break;

        case 'invoice.payment_succeeded':
          await this.handleSubscriptionPayment(event.data.object);
          break;

        default:
          logger.info(`Événement webhook non traité: ${event.type}`);
      }

      res.json({ received: true });
    } catch (error) {
      logger.error('Erreur lors du traitement du webhook:', error);
      res.status(500).json({ error: 'Erreur lors du traitement du webhook' });
    }
  }

  // Traiter un paiement réussi
  async handlePaymentSucceeded(paymentIntent) {
    try {
      logger.info(`Paiement réussi: ${paymentIntent.id}`);

      // Mettre à jour le paiement en base de données
      const payment = await Payment.findOneAndUpdate(
        { stripePaymentId: paymentIntent.id },
        { 
          status: 'completed',
          updatedAt: new Date()
        },
        { new: true }
      );

      if (!payment) {
        logger.error(`Paiement non trouvé pour PaymentIntent: ${paymentIntent.id}`);
        return;
      }

      // Inscrire l'utilisateur au cours via le content-service
      await this.enrollUserInCourse(payment.userId, payment.courseId);

      // Envoyer notification de succès
      await this.sendPaymentNotification(payment, 'success');

      logger.info(`Utilisateur ${payment.userId} inscrit au cours ${payment.courseId}`);
    } catch (error) {
      logger.error('Erreur lors du traitement du paiement réussi:', error);
    }
  }

  // Traiter un paiement échoué
  async handlePaymentFailed(paymentIntent) {
    try {
      logger.info(`Paiement échoué: ${paymentIntent.id}`);

      // Mettre à jour le paiement en base de données
      await Payment.findOneAndUpdate(
        { stripePaymentId: paymentIntent.id },
        { 
          status: 'failed',
          updatedAt: new Date()
        }
      );

      // Envoyer notification d'échec
      const payment = await Payment.findOne({ stripePaymentId: paymentIntent.id });
      if (payment) {
        await this.sendPaymentNotification(payment, 'failed');
      }

      logger.info(`Paiement marqué comme échoué: ${paymentIntent.id}`);
    } catch (error) {
      logger.error('Erreur lors du traitement du paiement échoué:', error);
    }
  }

  // Traiter un paiement annulé
  async handlePaymentCanceled(paymentIntent) {
    try {
      logger.info(`Paiement annulé: ${paymentIntent.id}`);

      await Payment.findOneAndUpdate(
        { stripePaymentId: paymentIntent.id },
        { 
          status: 'canceled',
          updatedAt: new Date()
        }
      );
    } catch (error) {
      logger.error('Erreur lors du traitement du paiement annulé:', error);
    }
  }

  // Traiter un litige
  async handleChargeDispute(dispute) {
    try {
      logger.warn(`Litige créé: ${dispute.id} pour charge: ${dispute.charge}`);

      // Marquer le paiement comme disputé
      const payment = await Payment.findOne({ stripePaymentId: dispute.payment_intent });
      if (payment) {
        payment.status = 'disputed';
        payment.metadata = payment.metadata || new Map();
        payment.metadata.set('disputeId', dispute.id);
        payment.metadata.set('disputeReason', dispute.reason);
        await payment.save();

        // Notifier les administrateurs
        await this.notifyAdminsOfDispute(payment, dispute);
      }
    } catch (error) {
      logger.error('Erreur lors du traitement du litige:', error);
    }
  }

  // Traiter un paiement d'abonnement
  async handleSubscriptionPayment(invoice) {
    try {
      logger.info(`Paiement d'abonnement réussi: ${invoice.id}`);
      
      // Logique pour les abonnements récurrents
      // À implémenter selon les besoins
    } catch (error) {
      logger.error('Erreur lors du traitement du paiement d\'abonnement:', error);
    }
  }

  // Inscrire l'utilisateur au cours via content-service
  async enrollUserInCourse(userId, courseId) {
    try {
      const response = await axios.post(
        `${config.services.course}/courses/${courseId}/enroll`,
        { userId },
        {
          headers: {
            'Content-Type': 'application/json',
            'X-Service-Auth': 'payment-service' // Auth inter-service
          }
        }
      );

      logger.info(`Inscription réussie: utilisateur ${userId} au cours ${courseId}`);
      return response.data;
    } catch (error) {
      logger.error('Erreur lors de l\'inscription au cours:', error);
      throw error;
    }
  }

  // Envoyer notification de paiement
  async sendPaymentNotification(payment, type) {
    try {
      const notificationData = {
        userId: payment.userId,
        type: `payment_${type}`,
        title: type === 'success' ? 'Paiement réussi' : 'Paiement échoué',
        message: type === 'success' 
          ? `Votre paiement de ${payment.amount / 100}€ a été traité avec succès.`
          : `Votre paiement de ${payment.amount / 100}€ a échoué. Veuillez réessayer.`,
        metadata: {
          paymentId: payment._id,
          courseId: payment.courseId,
          amount: payment.amount
        }
      };

      // Envoyer via notification-service si disponible
      if (process.env.NOTIFICATION_SERVICE_URL) {
        await axios.post(
          `${process.env.NOTIFICATION_SERVICE_URL}/api/notifications`,
          notificationData
        );
      }
    } catch (error) {
      logger.error('Erreur lors de l\'envoi de notification:', error);
    }
  }

  // Notifier les admins d'un litige
  async notifyAdminsOfDispute(payment, dispute) {
    try {
      logger.warn(`Notification admin pour litige: ${dispute.id}`);
      // Implémenter la notification admin
    } catch (error) {
      logger.error('Erreur lors de la notification admin:', error);
    }
  }
}

module.exports = new WebhookController();
