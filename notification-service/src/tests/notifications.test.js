const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../index');
const Notification = require('../models/Notification');
const emailService = require('../services/emailService');
const smsService = require('../services/smsService');
const pushService = require('../services/pushService');

// Mock des services
jest.mock('../services/emailService');
jest.mock('../services/smsService');
jest.mock('../services/pushService');

describe('Notification Service Tests', () => {
  let authToken;

  beforeAll(async () => {
    // Connexion à la base de données de test
    await mongoose.connect(process.env.MONGODB_URI_TEST || 'mongodb://localhost:27017/notification_test');

    // Créer un token d'authentification pour les tests
    authToken = 'test-token';
  });

  afterAll(async () => {
    // Nettoyage et déconnexion
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    // Nettoyer la collection des notifications avant chaque test
    await Notification.deleteMany({});
  });

  describe('GET /api/notifications', () => {
    it('should get all notifications for a user', async () => {
      // Créer quelques notifications de test
      await Notification.create([
        {
          user: new mongoose.Types.ObjectId(),
          type: 'email',
          title: 'Test Email',
          message: 'Test message',
          status: 'sent'
        },
        {
          user: new mongoose.Types.ObjectId(),
          type: 'sms',
          title: 'Test SMS',
          message: 'Test message',
          status: 'pending'
        }
      ]);

      const response = await request(app)
        .get('/api/notifications')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('notifications');
      expect(response.body).toHaveProperty('total');
      expect(response.body).toHaveProperty('pages');
    });

    it('should filter notifications by type', async () => {
      const response = await request(app)
        .get('/api/notifications?type=email')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.notifications.every(n => n.type === 'email')).toBe(true);
    });
  });

  describe('POST /api/notifications/send', () => {
    it('should send an email notification', async () => {
      const notificationData = {
        type: 'email',
        userId: new mongoose.Types.ObjectId(),
        title: 'Test Email',
        message: 'Test message',
        metadata: {
          email: 'test@example.com'
        }
      };

      emailService.sendEmail.mockResolvedValue(true);

      const response = await request(app)
        .post('/api/notifications/send')
        .set('Authorization', `Bearer ${authToken}`)
        .send(notificationData);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('type', 'email');
      expect(response.body).toHaveProperty('status', 'sent');
    });

    it('should send an SMS notification', async () => {
      const notificationData = {
        type: 'sms',
        userId: new mongoose.Types.ObjectId(),
        title: 'Test SMS',
        message: 'Test message',
        metadata: {
          phoneNumber: '+1234567890'
        }
      };

      smsService.sendSMS.mockResolvedValue({ success: true });

      const response = await request(app)
        .post('/api/notifications/send')
        .set('Authorization', `Bearer ${authToken}`)
        .send(notificationData);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('type', 'sms');
      expect(response.body).toHaveProperty('status', 'sent');
    });

    it('should send a push notification', async () => {
      const notificationData = {
        type: 'push',
        userId: new mongoose.Types.ObjectId(),
        title: 'Test Push',
        message: 'Test message',
        metadata: {
          subscription: { endpoint: 'test-endpoint' }
        }
      };

      pushService.sendPushNotification.mockResolvedValue({ success: true });

      const response = await request(app)
        .post('/api/notifications/send')
        .set('Authorization', `Bearer ${authToken}`)
        .send(notificationData);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('type', 'push');
      expect(response.body).toHaveProperty('status', 'sent');
    });
  });

  describe('PUT /api/notifications/:id/read', () => {
    it('should mark a notification as read', async () => {
      const notification = await Notification.create({
        user: new mongoose.Types.ObjectId(),
        type: 'email',
        title: 'Test Email',
        message: 'Test message',
        status: 'sent'
      });

      const response = await request(app)
        .put(`/api/notifications/${notification._id}/read`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('read', true);
      expect(response.body).toHaveProperty('readAt');
    });
  });

  describe('DELETE /api/notifications/:id', () => {
    it('should delete a notification', async () => {
      const notification = await Notification.create({
        user: new mongoose.Types.ObjectId(),
        type: 'email',
        title: 'Test Email',
        message: 'Test message',
        status: 'sent'
      });

      const response = await request(app)
        .delete(`/api/notifications/${notification._id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Notification supprimée avec succès');

      const deletedNotification = await Notification.findById(notification._id);
      expect(deletedNotification).toBeNull();
    });
  });
}); 