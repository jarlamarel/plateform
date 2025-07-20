const express = require('express');
const Subscription = require('../models/Subscription');
const Course = require('../models/Course');
const router = express.Router();

// Obtenir tous les abonnements d'un utilisateur
router.get('/', async (req, res) => {
  try {
    const subscriptions = await Subscription.find({ user: req.user._id })
      .populate('course', 'title thumbnail price')
      .sort({ createdAt: -1 });

    res.json(subscriptions.map(sub => sub.getInfo()));
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération des abonnements', error: error.message });
  }
});

// Obtenir un abonnement spécifique
router.get('/:id', async (req, res) => {
  try {
    const subscription = await Subscription.findById(req.params.id)
      .populate('course', 'title thumbnail price');

    if (!subscription) {
      return res.status(404).json({ message: 'Abonnement non trouvé' });
    }

    if (subscription.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Accès non autorisé' });
    }

    res.json(subscription.getInfo());
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération de l\'abonnement', error: error.message });
  }
});

// Créer un nouvel abonnement
router.post('/', async (req, res) => {
  try {
    const { courseId, paymentId, amount, paymentMethod } = req.body;

    // Vérifier si le cours existe
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Cours non trouvé' });
    }

    // Vérifier si l'utilisateur a déjà un abonnement actif pour ce cours
    const existingSubscription = await Subscription.findOne({
      user: req.user._id,
      course: courseId,
      status: 'active',
    });

    if (existingSubscription) {
      return res.status(400).json({ message: 'Vous avez déjà un abonnement actif pour ce cours' });
    }

    // Calculer la date de fin (par exemple, 1 an)
    const endDate = new Date();
    endDate.setFullYear(endDate.getFullYear() + 1);

    const subscription = new Subscription({
      user: req.user._id,
      course: courseId,
      paymentId,
      amount,
      paymentMethod,
      endDate,
    });

    await subscription.save();

    // Incrémenter le nombre d'étudiants inscrits au cours
    await course.incrementEnrolledStudents();

    res.status(201).json(subscription.getInfo());
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la création de l\'abonnement', error: error.message });
  }
});

// Annuler un abonnement
router.post('/:id/cancel', async (req, res) => {
  try {
    const subscription = await Subscription.findById(req.params.id);

    if (!subscription) {
      return res.status(404).json({ message: 'Abonnement non trouvé' });
    }

    if (subscription.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Accès non autorisé' });
    }

    await subscription.cancel(req.body.reason);
    res.json(subscription.getInfo());
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de l\'annulation de l\'abonnement', error: error.message });
  }
});

// Renouveler un abonnement
router.post('/:id/renew', async (req, res) => {
  try {
    const subscription = await Subscription.findById(req.params.id);

    if (!subscription) {
      return res.status(404).json({ message: 'Abonnement non trouvé' });
    }

    if (subscription.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Accès non autorisé' });
    }

    await subscription.renew(req.body.months || 12);
    res.json(subscription.getInfo());
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors du renouvellement de l\'abonnement', error: error.message });
  }
});

// Effectuer un remboursement
router.post('/:id/refund', async (req, res) => {
  try {
    const subscription = await Subscription.findById(req.params.id);

    if (!subscription) {
      return res.status(404).json({ message: 'Abonnement non trouvé' });
    }

    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Accès non autorisé' });
    }

    await subscription.refund(req.body.amount);
    res.json(subscription.getInfo());
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors du remboursement', error: error.message });
  }
});

// Mettre à jour les informations de paiement
router.put('/:id/payment', async (req, res) => {
  try {
    const subscription = await Subscription.findById(req.params.id);

    if (!subscription) {
      return res.status(404).json({ message: 'Abonnement non trouvé' });
    }

    if (subscription.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Accès non autorisé' });
    }

    Object.assign(subscription, {
      paymentMethod: req.body.paymentMethod,
      autoRenew: req.body.autoRenew,
    });

    await subscription.save();
    res.json(subscription.getInfo());
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la mise à jour des informations de paiement', error: error.message });
  }
});

module.exports = router; 