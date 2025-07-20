const express = require('express');
const Notification = require('../models/Notification');
const emailService = require('../services/emailService');
const smsService = require('../services/smsService');
const pushService = require('../services/pushService');
const { authenticateToken, validateToken, checkRole } = require('../middlewares/auth');
const router = express.Router();

// Routes protégées par authentification
router.use(authenticateToken);
router.use(validateToken);

// Obtenir toutes les notifications d'un utilisateur
router.get('/', async (req, res) => {
  try {
    const { type, status, read, page = 1, limit = 20 } = req.query;
    const query = { user: req.user._id };

    if (type) query.type = type;
    if (status) query.status = status;
    if (read !== undefined) query.read = read === 'true';

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Notification.countDocuments(query);

    res.json({
      notifications: notifications.map(n => n.getInfo()),
      total,
      pages: Math.ceil(total / limit),
      currentPage: parseInt(page)
    });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération des notifications', error: error.message });
  }
});

// Obtenir une notification spécifique
router.get('/:id', async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({ message: 'Notification non trouvée' });
    }

    if (notification.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Accès non autorisé' });
    }

    res.json(notification.getInfo());
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération de la notification', error: error.message });
  }
});

// Marquer une notification comme lue
router.put('/:id/read', async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({ message: 'Notification non trouvée' });
    }

    if (notification.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Accès non autorisé' });
    }

    await notification.markAsRead();
    res.json(notification.getInfo());
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la mise à jour de la notification', error: error.message });
  }
});

// Envoyer une notification (nécessite le rôle admin)
router.post('/send', checkRole('admin'), async (req, res) => {
  try {
    const { type, userId, title, message, priority = 'medium', metadata = {} } = req.body;

    const notification = new Notification({
      type,
      user: userId,
      title,
      message,
      priority,
      metadata
    });

    await notification.save();

    // Envoyer la notification selon son type
    switch (type) {
      case 'email':
        await emailService.sendEmail(
          metadata.email,
          title,
          message,
          metadata.html || message
        );
        break;

      case 'sms':
        await smsService.sendSMS(
          metadata.phoneNumber,
          message
        );
        break;

      case 'push':
        await pushService.sendPushNotification(
          metadata.subscription,
          { title, message, ...metadata }
        );
        break;
    }

    await notification.markAsSent();
    res.status(201).json(notification.getInfo());
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de l\'envoi de la notification', error: error.message });
  }
});

// Envoyer des notifications en masse (nécessite le rôle admin)
router.post('/send-bulk', checkRole('admin'), async (req, res) => {
  try {
    const { notifications } = req.body;
    const results = [];

    for (const notificationData of notifications) {
      const { type, userId, title, message, priority = 'medium', metadata = {} } = notificationData;

      const notification = new Notification({
        type,
        user: userId,
        title,
        message,
        priority,
        metadata
      });

      await notification.save();

      try {
        switch (type) {
          case 'email':
            await emailService.sendEmail(
              metadata.email,
              title,
              message,
              metadata.html || message
            );
            break;

          case 'sms':
            await smsService.sendSMS(
              metadata.phoneNumber,
              message
            );
            break;

          case 'push':
            await pushService.sendPushNotification(
              metadata.subscription,
              { title, message, ...metadata }
            );
            break;
        }

        await notification.markAsSent();
        results.push({ success: true, notification: notification.getInfo() });
      } catch (error) {
        await notification.markAsFailed(error.message);
        results.push({ success: false, error: error.message, notification: notification.getInfo() });
      }
    }

    res.status(201).json({ results });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de l\'envoi des notifications', error: error.message });
  }
});

// Supprimer une notification
router.delete('/:id', async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({ message: 'Notification non trouvée' });
    }

    if (notification.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Accès non autorisé' });
    }

    await notification.remove();
    res.json({ message: 'Notification supprimée avec succès' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la suppression de la notification', error: error.message });
  }
});

module.exports = router; 