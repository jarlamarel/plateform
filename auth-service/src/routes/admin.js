const express = require('express');
const User = require('../models/User');
const { verifyToken, requireRole } = require('../middleware/auth');
const router = express.Router();

// Middleware d'authentification pour toutes les routes admin
router.use(verifyToken);

// Route pour promouvoir un utilisateur (admin seulement)
router.put('/users/:id/role', requireRole('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    // Validation du rôle
    if (!['user', 'instructor', 'admin'].includes(role)) {
      return res.status(400).json({ 
        message: 'Rôle invalide. Utilisez: user, instructor, ou admin' 
      });
    }

    // Trouver et mettre à jour l'utilisateur
    const user = await User.findByIdAndUpdate(
      id,
      { role },
      { new: true, select: '-password' }
    );

    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    res.json({
      message: `Rôle mis à jour avec succès`,
      user: user.getPublicProfile()
    });

  } catch (error) {
    res.status(500).json({ 
      message: 'Erreur lors de la mise à jour du rôle', 
      error: error.message 
    });
  }
});

// Route pour lister tous les utilisateurs (admin seulement)
router.get('/users', requireRole('admin'), async (req, res) => {
  try {
    const { page = 1, limit = 10, role, search } = req.query;
    
    // Construire la requête de filtrage
    const filter = {};
    if (role) filter.role = role;
    if (search) {
      filter.$or = [
        { email: { $regex: search, $options: 'i' } },
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } }
      ];
    }

    // Pagination
    const skip = (page - 1) * limit;
    const users = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments(filter);

    res.json({
      users: users.map(user => user.getPublicProfile()),
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        count: users.length,
        totalUsers: total
      }
    });

  } catch (error) {
    res.status(500).json({ 
      message: 'Erreur lors de la récupération des utilisateurs', 
      error: error.message 
    });
  }
});

// Route pour obtenir les statistiques des utilisateurs
router.get('/stats', requireRole('admin'), async (req, res) => {
  try {
    const stats = await User.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 }
        }
      }
    ]);

    const totalUsers = await User.countDocuments();
    const recentUsers = await User.countDocuments({
      createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
    });

    const formattedStats = {
      total: totalUsers,
      recentUsers: recentUsers,
      byRole: stats.reduce((acc, stat) => {
        acc[stat._id] = stat.count;
        return acc;
      }, {})
    };

    res.json(formattedStats);

  } catch (error) {
    res.status(500).json({ 
      message: 'Erreur lors de la récupération des statistiques', 
      error: error.message 
    });
  }
});

// Route pour créer un utilisateur avec un rôle spécifique (admin seulement)
router.post('/users', requireRole('admin'), async (req, res) => {
  try {
    const { email, password, firstName, lastName, role = 'user' } = req.body;

    // Validation du rôle
    if (!['user', 'instructor', 'admin'].includes(role)) {
      return res.status(400).json({ 
        message: 'Rôle invalide. Utilisez: user, instructor, ou admin' 
      });
    }

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Cet email est déjà utilisé' });
    }

    // Créer le nouvel utilisateur
    const user = new User({
      email,
      password,
      firstName,
      lastName,
      role,
      isEmailVerified: true // Auto-vérifier pour les comptes créés par admin
    });

    await user.save();

    res.status(201).json({
      message: 'Utilisateur créé avec succès',
      user: user.getPublicProfile()
    });

  } catch (error) {
    res.status(500).json({ 
      message: 'Erreur lors de la création de l\'utilisateur', 
      error: error.message 
    });
  }
});

module.exports = router;
