const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const twilio = require('twilio');
const router = express.Router();

// Initialisation du client Twilio (optionnel)
let twilioClient = null;
if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
  twilioClient = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
  );
}

// Route d'inscription
router.post('/register', async (req, res) => {
  try {
    const { email, password, firstName, lastName, phoneNumber } = req.body;

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
      phoneNumber,
    });

    await user.save();

    // Générer le token JWT
    const token = user.generateAuthToken();

    res.status(201).json({
      message: 'Utilisateur créé avec succès',
      token,
      user: user.getPublicProfile(),
    });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la création de l\'utilisateur', error: error.message });
  }
});

// Route de connexion
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Trouver l'utilisateur
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
    }

    // Vérifier le mot de passe
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
    }

    // Mettre à jour la dernière connexion
    user.lastLogin = new Date();
    await user.save();

    // Générer le token JWT
    const token = user.generateAuthToken();

    res.json({
      message: 'Connexion réussie',
      token,
      user: user.getPublicProfile(),
    });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la connexion', error: error.message });
  }
});

// Routes OAuth
router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    const token = req.user.generateAuthToken();
    res.redirect(`${process.env.FRONTEND_URL}/oauth-callback?token=${token}`);
  }
);

router.get('/facebook',
  passport.authenticate('facebook', { scope: ['email'] })
);

router.get('/facebook/callback',
  passport.authenticate('facebook', { failureRedirect: '/login' }),
  (req, res) => {
    const token = req.user.generateAuthToken();
    res.redirect(`${process.env.FRONTEND_URL}/oauth-callback?token=${token}`);
  }
);

router.get('/github',
  passport.authenticate('github', { scope: ['user:email'] })
);

router.get('/github/callback',
  passport.authenticate('github', { failureRedirect: '/login' }),
  (req, res) => {
    const token = req.user.generateAuthToken();
    res.redirect(`${process.env.FRONTEND_URL}/oauth-callback?token=${token}`);
  }
);

// Route pour la double authentification
router.post('/2fa/send', async (req, res) => {
  try {
    const { phoneNumber } = req.body;
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

    if (!twilioClient) {
      return res.status(501).json({ message: 'Service SMS non configuré' });
    }

    // Envoyer le code via SMS
    await twilioClient.messages.create({
      body: `Votre code de vérification est : ${verificationCode}`,
      to: phoneNumber,
      from: process.env.TWILIO_PHONE_NUMBER,
    });

    // Stocker le code dans la session ou la base de données
    // Note: Dans un environnement de production, utilisez un service de cache comme Redis
    req.session.verificationCode = verificationCode;
    req.session.verificationPhone = phoneNumber;

    res.json({ message: 'Code de vérification envoyé' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de l\'envoi du code', error: error.message });
  }
});

router.post('/2fa/verify', async (req, res) => {
  try {
    const { code } = req.body;
    const storedCode = req.session.verificationCode;
    const phoneNumber = req.session.verificationPhone;

    if (code !== storedCode) {
      return res.status(400).json({ message: 'Code de vérification incorrect' });
    }

    // Mettre à jour le statut de vérification du téléphone
    const user = await User.findOne({ phoneNumber });
    if (user) {
      user.isPhoneVerified = true;
      await user.save();
    }

    // Nettoyer la session
    delete req.session.verificationCode;
    delete req.session.verificationPhone;

    res.json({ message: 'Numéro de téléphone vérifié avec succès' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la vérification', error: error.message });
  }
});

// Route pour la réinitialisation du mot de passe
router.post('/reset-password', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    // Générer un token de réinitialisation
    const resetToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Sauvegarder le token
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 heure
    await user.save();

    // Envoyer l'email de réinitialisation
    // Note: Implémenter l'envoi d'email ici

    res.json({ message: 'Instructions de réinitialisation envoyées par email' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la réinitialisation', error: error.message });
  }
});

// Middleware to check JWT (if using JWT)


router.get('/me', async (req, res) => {
  // If using JWT in Authorization header
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided' });
  }
  const token = authHeader.split(' ')[1];
  console.log(token);
  try {
    const decoded = jwt.verify(token, 'votre_secret_jwt'); // Use your real secret!
    const user = await User.findById(decoded._id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(401).json({ message: 'Invalid token' });
    console.log(err);
  }
});

module.exports = router; 