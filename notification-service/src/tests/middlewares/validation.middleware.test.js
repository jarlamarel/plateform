const request = require('supertest');
const app = require('../../index');
const {
  validateNotification,
  validateEmailNotification,
  validateSMSNotification,
  validatePushNotification,
  validateBulkNotification
} = require('../../middlewares/validation.middleware');

describe('Validation Middleware Tests', () => {
  describe('Notification Validation', () => {
    it('should validate valid notification data', () => {
      const req = {
        body: {
          type: 'email',
          userId: 'test-user-id',
          title: 'Test Notification',
          message: 'Test message',
          metadata: {
            email: 'test@example.com'
          }
        }
      };
      const res = {};
      const next = jest.fn();

      validateNotification(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should reject invalid notification type', () => {
      const req = {
        body: {
          type: 'invalid_type',
          userId: 'test-user-id',
          title: 'Test Notification',
          message: 'Test message'
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      const next = jest.fn();

      validateNotification(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        error: expect.any(String)
      }));
    });

    it('should reject missing required fields', () => {
      const req = {
        body: {
          type: 'email',
          userId: 'test-user-id'
          // title et message manquants
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      const next = jest.fn();

      validateNotification(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        error: expect.any(String)
      }));
    });
  });

  describe('Email Notification Validation', () => {
    it('should validate valid email notification', () => {
      const req = {
        body: {
          type: 'email',
          userId: 'test-user-id',
          title: 'Test Email',
          message: 'Test message',
          metadata: {
            email: 'test@example.com'
          }
        }
      };
      const res = {};
      const next = jest.fn();

      validateEmailNotification(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should reject invalid email address', () => {
      const req = {
        body: {
          type: 'email',
          userId: 'test-user-id',
          title: 'Test Email',
          message: 'Test message',
          metadata: {
            email: 'invalid-email'
          }
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      const next = jest.fn();

      validateEmailNotification(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        error: expect.any(String)
      }));
    });

    it('should reject missing email metadata', () => {
      const req = {
        body: {
          type: 'email',
          userId: 'test-user-id',
          title: 'Test Email',
          message: 'Test message'
          // metadata manquant
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      const next = jest.fn();

      validateEmailNotification(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        error: expect.any(String)
      }));
    });
  });

  describe('SMS Notification Validation', () => {
    it('should validate valid SMS notification', () => {
      const req = {
        body: {
          type: 'sms',
          userId: 'test-user-id',
          title: 'Test SMS',
          message: 'Test message',
          metadata: {
            phoneNumber: '+1234567890'
          }
        }
      };
      const res = {};
      const next = jest.fn();

      validateSMSNotification(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should reject invalid phone number', () => {
      const req = {
        body: {
          type: 'sms',
          userId: 'test-user-id',
          title: 'Test SMS',
          message: 'Test message',
          metadata: {
            phoneNumber: 'invalid-number'
          }
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      const next = jest.fn();

      validateSMSNotification(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        error: expect.any(String)
      }));
    });

    it('should reject missing phone number metadata', () => {
      const req = {
        body: {
          type: 'sms',
          userId: 'test-user-id',
          title: 'Test SMS',
          message: 'Test message'
          // metadata manquant
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      const next = jest.fn();

      validateSMSNotification(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        error: expect.any(String)
      }));
    });
  });

  describe('Push Notification Validation', () => {
    it('should validate valid push notification', () => {
      const req = {
        body: {
          type: 'push',
          userId: 'test-user-id',
          title: 'Test Push',
          message: 'Test message',
          metadata: {
            subscription: {
              endpoint: 'https://fcm.googleapis.com/fcm/send/...',
              keys: {
                p256dh: 'valid-p256dh-key',
                auth: 'valid-auth-key'
              }
            }
          }
        }
      };
      const res = {};
      const next = jest.fn();

      validatePushNotification(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should reject invalid push subscription', () => {
      const req = {
        body: {
          type: 'push',
          userId: 'test-user-id',
          title: 'Test Push',
          message: 'Test message',
          metadata: {
            subscription: {
              endpoint: 'invalid-endpoint'
            }
          }
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      const next = jest.fn();

      validatePushNotification(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        error: expect.any(String)
      }));
    });

    it('should reject missing subscription metadata', () => {
      const req = {
        body: {
          type: 'push',
          userId: 'test-user-id',
          title: 'Test Push',
          message: 'Test message'
          // metadata manquant
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      const next = jest.fn();

      validatePushNotification(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        error: expect.any(String)
      }));
    });
  });

  describe('Bulk Notification Validation', () => {
    it('should validate valid bulk notifications', () => {
      const req = {
        body: {
          notifications: [
            {
              type: 'email',
              userId: 'test-user-id',
              title: 'Test Email 1',
              message: 'Test message 1',
              metadata: {
                email: 'test1@example.com'
              }
            },
            {
              type: 'sms',
              userId: 'test-user-id',
              title: 'Test SMS 1',
              message: 'Test message 2',
              metadata: {
                phoneNumber: '+1234567890'
              }
            }
          ]
        }
      };
      const res = {};
      const next = jest.fn();

      validateBulkNotification(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should reject empty notifications array', () => {
      const req = {
        body: {
          notifications: []
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      const next = jest.fn();

      validateBulkNotification(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        error: expect.any(String)
      }));
    });

    it('should reject invalid notifications in bulk', () => {
      const req = {
        body: {
          notifications: [
            {
              type: 'email',
              userId: 'test-user-id',
              title: 'Test Email',
              message: 'Test message',
              metadata: {
                email: 'invalid-email'
              }
            }
          ]
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      const next = jest.fn();

      validateBulkNotification(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        error: expect.any(String)
      }));
    });
  });

  describe('Integration Tests', () => {
    it('should validate notification creation request', async () => {
      const response = await request(app)
        .post('/api/notifications/send')
        .send({
          type: 'email',
          userId: 'test-user-id',
          title: 'Test Email',
          message: 'Test message',
          metadata: {
            email: 'test@example.com'
          }
        });

      expect(response.status).not.toBe(400);
    });

    it('should reject invalid notification creation request', async () => {
      const response = await request(app)
        .post('/api/notifications/send')
        .send({
          type: 'email',
          userId: 'test-user-id',
          title: 'Test Email',
          message: 'Test message',
          metadata: {
            email: 'invalid-email'
          }
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('should validate bulk notification request', async () => {
      const response = await request(app)
        .post('/api/notifications/bulk')
        .send({
          notifications: [
            {
              type: 'email',
              userId: 'test-user-id',
              title: 'Test Email',
              message: 'Test message',
              metadata: {
                email: 'test@example.com'
              }
            }
          ]
        });

      expect(response.status).not.toBe(400);
    });

    it('should reject invalid bulk notification request', async () => {
      const response = await request(app)
        .post('/api/notifications/bulk')
        .send({
          notifications: [
            {
              type: 'email',
              userId: 'test-user-id',
              title: 'Test Email',
              message: 'Test message',
              metadata: {
                email: 'invalid-email'
              }
            }
          ]
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });
}); 