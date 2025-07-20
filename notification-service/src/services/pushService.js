const webpush = require('web-push');
const logger = require('../utils/logger');

class PushService {
  constructor() {
    // Configuration des clés VAPID pour web-push
    webpush.setVapidDetails(
      'mailto:' + process.env.VAPID_EMAIL,
      process.env.VAPID_PUBLIC_KEY,
      process.env.VAPID_PRIVATE_KEY
    );
  }

  async sendPushNotification(subscription, payload) {
    try {
      const pushPayload = JSON.stringify(payload);
      await webpush.sendNotification(subscription, pushPayload);
      
      logger.info('Notification push envoyée avec succès');
      return {
        success: true
      };
    } catch (error) {
      logger.error('Erreur envoi notification push:', error);
      
      // Si l'erreur est due à une souscription invalide
      if (error.statusCode === 410) {
        return {
          success: false,
          error: 'Subscription expired',
          shouldDelete: true
        };
      }
      
      throw new Error('Échec de l\'envoi de la notification push');
    }
  }

  async sendBulkPushNotifications(subscriptions, payload) {
    try {
      const results = await Promise.allSettled(
        subscriptions.map(sub => this.sendPushNotification(sub, payload))
      );

      const successful = results.filter(r => r.status === 'fulfilled').length;
      const failed = results.filter(r => r.status === 'rejected').length;
      const expired = results.filter(r => 
        r.status === 'fulfilled' && r.value.shouldDelete
      ).length;

      logger.info(`Notifications push envoyées: ${successful} succès, ${failed} échecs, ${expired} expirées`);
      
      return {
        success: true,
        stats: {
          successful,
          failed,
          expired
        },
        results
      };
    } catch (error) {
      logger.error('Erreur envoi notifications push en masse:', error);
      throw new Error('Échec de l\'envoi des notifications push en masse');
    }
  }

  generateVAPIDKeys() {
    const vapidKeys = webpush.generateVAPIDKeys();
    return {
      publicKey: vapidKeys.publicKey,
      privateKey: vapidKeys.privateKey
    };
  }

  async validateSubscription(subscription) {
    try {
      await webpush.sendNotification(subscription, 'test');
      return true;
    } catch (error) {
      if (error.statusCode === 410) {
        return false;
      }
      throw error;
    }
  }
}

module.exports = new PushService(); 