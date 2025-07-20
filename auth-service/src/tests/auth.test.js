const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../index');
const User = require('../models/User');

describe('Auth Service Tests', () => {
  beforeAll(async () => {
    // Connexion à la base de données de test
    await mongoose.connect(process.env.MONGODB_URI_TEST || 'mongodb://localhost:27017/auth_test');
  });

  afterAll(async () => {
    // Nettoyage et déconnexion
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    // Nettoyer la collection des utilisateurs avant chaque test
    await User.deleteMany({});
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
        phoneNumber: '+1234567890'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('token');
      expect(response.body.user).toHaveProperty('email', userData.email);
      expect(response.body.user).not.toHaveProperty('password');
    });

    it('should not register a user with existing email', async () => {
      // Créer un utilisateur
      await User.create({
        email: 'test@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe'
      });

      // Tenter de créer un autre utilisateur avec le même email
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          password: 'password456',
          firstName: 'Jane',
          lastName: 'Doe'
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message', 'Cet email est déjà utilisé');
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      // Créer un utilisateur de test
      await User.create({
        email: 'test@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe'
      });
    });

    it('should login successfully with correct credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
      expect(response.body.user).toHaveProperty('email', 'test@example.com');
    });

    it('should not login with incorrect password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword'
        });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('message', 'Email ou mot de passe incorrect');
    });
  });

  describe('POST /api/auth/2fa/send', () => {
    it('should send verification code successfully', async () => {
      const response = await request(app)
        .post('/api/auth/2fa/send')
        .send({
          phoneNumber: '+1234567890'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Code de vérification envoyé');
    });
  });

  describe('POST /api/auth/reset-password', () => {
    beforeEach(async () => {
      // Créer un utilisateur de test
      await User.create({
        email: 'test@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe'
      });
    });

    it('should send reset password email for existing user', async () => {
      const response = await request(app)
        .post('/api/auth/reset-password')
        .send({
          email: 'test@example.com'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Instructions de réinitialisation envoyées par email');
    });

    it('should return 404 for non-existing user', async () => {
      const response = await request(app)
        .post('/api/auth/reset-password')
        .send({
          email: 'nonexistent@example.com'
        });

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('message', 'Utilisateur non trouvé');
    });
  });
}); 