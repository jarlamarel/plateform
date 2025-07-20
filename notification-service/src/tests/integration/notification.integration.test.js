const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../index');
const Notification = require('../../models/Notification');
const emailService = require('../../services/emailService');
const smsService = require('../../services/smsService');
const pushService = require('../../services/pushService');

describe('Notification Service Integration Tests', () => {
  let authToken;
  let testUser;

  beforeAll(async () => {
    // Connexion à la base de données de test
    await mongoose.connect(process.env.MONGODB_URI_TEST || 'mongodb://localhost:27017/notification_integration_test');

    // Créer un utilisateur de test
    testUser = new mongoose.Types.ObjectId();
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

  describe('Notification Flow Tests', () => {
    it('should complete a full notification flow', async () => {
      // 1. Créer une notification
      const notificationData = {
        type: 'email',
        userId: testUser,
        title: 'Test Email',
        message: 'Test message',
        metadata: {
          email: 'test@example.com'
        }
      };

      const createResponse = await request(app)
        .post('/api/notifications/send')
        .set('Authorization', `Bearer ${authToken}`)
        .send(notificationData);

      expect(createResponse.status).toBe(201);
      const notificationId = createResponse.body._id;

      // 2. Vérifier que la notification a été créée
      const getResponse = await request(app)
        .get(`/api/notifications/${notificationId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(getResponse.status).toBe(200);
      expect(getResponse.body).toHaveProperty('type', 'email');
      expect(getResponse.body).toHaveProperty('status', 'sent');

      // 3. Marquer la notification comme lue
      const readResponse = await request(app)
        .put(`/api/notifications/${notificationId}/read`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(readResponse.status).toBe(200);
      expect(readResponse.body).toHaveProperty('read', true);
      expect(readResponse.body).toHaveProperty('readAt');

      // 4. Vérifier que la notification apparaît dans la liste des notifications lues
      const listResponse = await request(app)
        .get('/api/notifications?read=true')
        .set('Authorization', `Bearer ${authToken}`);

      expect(listResponse.status).toBe(200);
      expect(listResponse.body.notifications).toHaveLength(1);
      expect(listResponse.body.notifications[0]._id).toBe(notificationId);

      // 5. Supprimer la notification
      const deleteResponse = await request(app)
        .delete(`/api/notifications/${notificationId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(deleteResponse.status).toBe(200);

      // 6. Vérifier que la notification a été supprimée
      const finalGetResponse = await request(app)
        .get(`/api/notifications/${notificationId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(finalGetResponse.status).toBe(404);
    });
  });

  describe('Bulk Operations Tests', () => {
    it('should handle bulk notification operations', async () => {
      // 1. Créer plusieurs notifications
      const notifications = [
        {
          type: 'email',
          userId: testUser,
          title: 'Bulk Email 1',
          message: 'Test message 1',
          metadata: { email: 'test1@example.com' }
        },
        {
          type: 'sms',
          userId: testUser,
          title: 'Bulk SMS 1',
          message: 'Test message 2',
          metadata: { phoneNumber: '+1234567890' }
        },
        {
          type: 'push',
          userId: testUser,
          title: 'Bulk Push 1',
          message: 'Test message 3',
          metadata: { subscription: { endpoint: 'test-endpoint' } }
        }
      ];

      const createResponse = await request(app)
        .post('/api/notifications/bulk')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ notifications });

      expect(createResponse.status).toBe(201);
      expect(createResponse.body).toHaveProperty('success', true);
      expect(createResponse.body).toHaveProperty('notifications');
      expect(createResponse.body.notifications).toHaveLength(3);

      // 2. Vérifier que toutes les notifications ont été créées
      const listResponse = await request(app)
        .get('/api/notifications')
        .set('Authorization', `Bearer ${authToken}`);

      expect(listResponse.status).toBe(200);
      expect(listResponse.body.notifications).toHaveLength(3);

      // 3. Marquer toutes les notifications comme lues
      const notificationIds = createResponse.body.notifications.map(n => n._id);
      const readResponse = await request(app)
        .put('/api/notifications/bulk/read')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ notificationIds });

      expect(readResponse.status).toBe(200);
      expect(readResponse.body).toHaveProperty('success', true);

      // 4. Vérifier que toutes les notifications sont marquées comme lues
      const finalListResponse = await request(app)
        .get('/api/notifications?read=true')
        .set('Authorization', `Bearer ${authToken}`);

      expect(finalListResponse.status).toBe(200);
      expect(finalListResponse.body.notifications).toHaveLength(3);
      expect(finalListResponse.body.notifications.every(n => n.read)).toBe(true);
    });
  });

  describe('Error Handling Tests', () => {
    it('should handle invalid notification data', async () => {
      const invalidData = {
        type: 'invalid_type',
        userId: testUser,
        title: 'Test',
        message: 'Test message'
      };

      const response = await request(app)
        .post('/api/notifications/send')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidData);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('should handle non-existent notification', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();

      const response = await request(app)
        .get(`/api/notifications/${nonExistentId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error');
    });

    it('should handle unauthorized access', async () => {
      const response = await request(app)
        .get('/api/notifications')
        .set('Authorization', 'Bearer invalid-token');

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });
  });
}); 