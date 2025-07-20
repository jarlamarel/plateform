const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../index');
const Notification = require('../../models/Notification');

describe('Notification Middleware Tests', () => {
  let authToken;
  let testUser;

  beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_URI_TEST || 'mongodb://localhost:27017/notification_middleware_test');
    testUser = new mongoose.Types.ObjectId();
    authToken = 'test-token';
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    await Notification.deleteMany({});
  });

  describe('Authentication Middleware', () => {
    it('should authenticate valid token', async () => {
      const response = await request(app)
        .get('/api/notifications')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).not.toBe(401);
    });

    it('should reject invalid token', async () => {
      const response = await request(app)
        .get('/api/notifications')
        .set('Authorization', 'Bearer invalid-token');

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });

    it('should reject missing token', async () => {
      const response = await request(app)
        .get('/api/notifications');

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });

    it('should reject malformed authorization header', async () => {
      const response = await request(app)
        .get('/api/notifications')
        .set('Authorization', 'invalid-format');

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('Validation Middleware', () => {
    it('should validate notification creation data', async () => {
      const validData = {
        type: 'email',
        userId: testUser,
        title: 'Test Notification',
        message: 'Test message',
        metadata: {
          email: 'test@example.com'
        }
      };

      const response = await request(app)
        .post('/api/notifications/send')
        .set('Authorization', `Bearer ${authToken}`)
        .send(validData);

      expect(response.status).toBe(201);
    });

    it('should reject invalid notification type', async () => {
      const invalidData = {
        type: 'invalid_type',
        userId: testUser,
        title: 'Test Notification',
        message: 'Test message'
      };

      const response = await request(app)
        .post('/api/notifications/send')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidData);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('should reject missing required fields', async () => {
      const invalidData = {
        type: 'email',
        userId: testUser
        // title et message manquants
      };

      const response = await request(app)
        .post('/api/notifications/send')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidData);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('should validate notification update data', async () => {
      const notification = await Notification.create({
        user: testUser,
        type: 'email',
        title: 'Test Notification',
        message: 'Test message',
        status: 'sent'
      });

      const response = await request(app)
        .put(`/api/notifications/${notification._id}/read`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
    });
  });

  describe('Error Handling Middleware', () => {
    it('should handle not found errors', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();

      const response = await request(app)
        .get(`/api/notifications/${nonExistentId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error');
    });

    it('should handle validation errors', async () => {
      const invalidData = {
        type: 'email',
        userId: testUser,
        title: 'Test Notification'
        // message manquant
      };

      const response = await request(app)
        .post('/api/notifications/send')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidData);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('should handle server errors', async () => {
      // Simuler une erreur serveur en forçant une erreur de base de données
      jest.spyOn(Notification, 'find').mockImplementation(() => {
        throw new Error('Database error');
      });

      const response = await request(app)
        .get('/api/notifications')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error');

      // Restaurer l'implémentation originale
      jest.restoreAllMocks();
    });
  });

  describe('Rate Limiting Middleware', () => {
    it('should limit requests per IP', async () => {
      // Simuler plusieurs requêtes rapides
      const requests = Array(100).fill().map(() => 
        request(app)
          .get('/api/notifications')
          .set('Authorization', `Bearer ${authToken}`)
      );

      const responses = await Promise.all(requests);
      const tooManyRequests = responses.filter(r => r.status === 429);

      expect(tooManyRequests.length).toBeGreaterThan(0);
    });

    it('should reset rate limit after window', async () => {
      // Attendre que la fenêtre de limitation se réinitialise
      await new Promise(resolve => setTimeout(resolve, 60000));

      const response = await request(app)
        .get('/api/notifications')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).not.toBe(429);
    });
  });

  describe('Logging Middleware', () => {
    it('should log successful requests', async () => {
      const consoleSpy = jest.spyOn(console, 'log');

      await request(app)
        .get('/api/notifications')
        .set('Authorization', `Bearer ${authToken}`);

      expect(consoleSpy).toHaveBeenCalled();
      expect(consoleSpy.mock.calls[0][0]).toContain('GET /api/notifications');

      consoleSpy.mockRestore();
    });

    it('should log error requests', async () => {
      const consoleSpy = jest.spyOn(console, 'error');

      await request(app)
        .get('/api/notifications/invalid-id')
        .set('Authorization', `Bearer ${authToken}`);

      expect(consoleSpy).toHaveBeenCalled();
      expect(consoleSpy.mock.calls[0][0]).toContain('Error');

      consoleSpy.mockRestore();
    });
  });
}); 