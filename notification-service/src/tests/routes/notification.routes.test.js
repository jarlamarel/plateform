const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../index');
const Notification = require('../../models/Notification');
const emailService = require('../../services/emailService');
const smsService = require('../../services/smsService');
const pushService = require('../../services/pushService');

// Mock des services
jest.mock('../../services/emailService');
jest.mock('../../services/smsService');
jest.mock('../../services/pushService');

describe('Notification Routes Tests', () => {
  let authToken;
  let testUser;

  beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_URI_TEST || 'mongodb://localhost:27017/notification_routes_test');
    testUser = new mongoose.Types.ObjectId();
    authToken = 'test-token';
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    await Notification.deleteMany({});
    jest.clearAllMocks();
  });

  describe('GET /api/notifications', () => {
    it('should get all notifications for a user', async () => {
      // Créer des notifications de test
      await Notification.create([
        {
          user: testUser,
          type: 'email',
          title: 'Test Email 1',
          message: 'Test message 1',
          status: 'sent'
        },
        {
          user: testUser,
          type: 'sms',
          title: 'Test SMS 1',
          message: 'Test message 2',
          status: 'pending'
        }
      ]);

      const response = await request(app)
        .get('/api/notifications')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('notifications');
      expect(response.body).toHaveProperty('total', 2);
      expect(response.body).toHaveProperty('pages', 1);
    });

    it('should filter notifications by type', async () => {
      await Notification.create([
        {
          user: testUser,
          type: 'email',
          title: 'Test Email',
          message: 'Test message',
          status: 'sent'
        },
        {
          user: testUser,
          type: 'sms',
          title: 'Test SMS',
          message: 'Test message',
          status: 'sent'
        }
      ]);

      const response = await request(app)
        .get('/api/notifications?type=email')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.notifications).toHaveLength(1);
      expect(response.body.notifications[0].type).toBe('email');
    });

    it('should filter notifications by status', async () => {
      await Notification.create([
        {
          user: testUser,
          type: 'email',
          title: 'Test Email',
          message: 'Test message',
          status: 'sent'
        },
        {
          user: testUser,
          type: 'email',
          title: 'Test Email 2',
          message: 'Test message',
          status: 'pending'
        }
      ]);

      const response = await request(app)
        .get('/api/notifications?status=pending')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.notifications).toHaveLength(1);
      expect(response.body.notifications[0].status).toBe('pending');
    });

    it('should filter notifications by read status', async () => {
      await Notification.create([
        {
          user: testUser,
          type: 'email',
          title: 'Test Email',
          message: 'Test message',
          status: 'sent',
          read: true
        },
        {
          user: testUser,
          type: 'email',
          title: 'Test Email 2',
          message: 'Test message',
          status: 'sent',
          read: false
        }
      ]);

      const response = await request(app)
        .get('/api/notifications?read=true')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.notifications).toHaveLength(1);
      expect(response.body.notifications[0].read).toBe(true);
    });
  });

  describe('POST /api/notifications/send', () => {
    it('should send an email notification', async () => {
      const notificationData = {
        type: 'email',
        userId: testUser,
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
        userId: testUser,
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
        userId: testUser,
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

    it('should handle invalid notification type', async () => {
      const notificationData = {
        type: 'invalid_type',
        userId: testUser,
        title: 'Test',
        message: 'Test message'
      };

      const response = await request(app)
        .post('/api/notifications/send')
        .set('Authorization', `Bearer ${authToken}`)
        .send(notificationData);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('PUT /api/notifications/:id/read', () => {
    it('should mark a notification as read', async () => {
      const notification = await Notification.create({
        user: testUser,
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

    it('should handle non-existent notification', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();

      const response = await request(app)
        .put(`/api/notifications/${nonExistentId}/read`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('DELETE /api/notifications/:id', () => {
    it('should delete a notification', async () => {
      const notification = await Notification.create({
        user: testUser,
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

    it('should handle non-existent notification', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();

      const response = await request(app)
        .delete(`/api/notifications/${nonExistentId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('Error Handling', () => {
    it('should handle unauthorized access', async () => {
      const response = await request(app)
        .get('/api/notifications')
        .set('Authorization', 'Bearer invalid-token');

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });

    it('should handle missing authorization header', async () => {
      const response = await request(app)
        .get('/api/notifications');

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });

    it('should handle invalid request body', async () => {
      const response = await request(app)
        .post('/api/notifications/send')
        .set('Authorization', `Bearer ${authToken}`)
        .send({});

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });
}); 