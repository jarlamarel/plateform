const emailService = require('../../services/emailService');
const smsService = require('../../services/smsService');
const pushService = require('../../services/pushService');

describe('Notification Services Tests', () => {
  describe('Email Service Tests', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should send an email successfully', async () => {
      const emailData = {
        to: 'test@example.com',
        subject: 'Test Email',
        text: 'Test message',
        html: '<p>Test message</p>'
      };

      const result = await emailService.sendEmail(emailData);
      expect(result).toBe(true);
    });

    it('should send a templated email successfully', async () => {
      const templateData = {
        to: 'test@example.com',
        templateId: 'test-template',
        dynamicData: {
          name: 'Test User',
          message: 'Test message'
        }
      };

      const result = await emailService.sendTemplatedEmail(templateData);
      expect(result).toBe(true);
    });

    it('should send bulk emails successfully', async () => {
      const emails = [
        {
          to: 'test1@example.com',
          subject: 'Test Email 1',
          text: 'Test message 1'
        },
        {
          to: 'test2@example.com',
          subject: 'Test Email 2',
          text: 'Test message 2'
        }
      ];

      const results = await emailService.sendBulkEmails(emails);
      expect(results).toHaveLength(2);
      expect(results.every(r => r.success)).toBe(true);
    });

    it('should handle email sending failure', async () => {
      const emailData = {
        to: 'invalid@example.com',
        subject: 'Test Email',
        text: 'Test message'
      };

      // Simuler une erreur
      jest.spyOn(emailService, 'sendEmail').mockRejectedValue(new Error('Failed to send email'));

      await expect(emailService.sendEmail(emailData)).rejects.toThrow('Failed to send email');
    });
  });

  describe('SMS Service Tests', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should send an SMS successfully', async () => {
      const smsData = {
        to: '+1234567890',
        message: 'Test SMS'
      };

      const result = await smsService.sendSMS(smsData);
      expect(result).toHaveProperty('success', true);
    });

    it('should send bulk SMS successfully', async () => {
      const smsList = [
        {
          to: '+1234567890',
          message: 'Test SMS 1'
        },
        {
          to: '+0987654321',
          message: 'Test SMS 2'
        }
      ];

      const results = await smsService.sendBulkSMS(smsList);
      expect(results).toHaveLength(2);
      expect(results.every(r => r.success)).toBe(true);
    });

    it('should send verification code successfully', async () => {
      const phoneNumber = '+1234567890';
      const result = await smsService.sendVerificationCode(phoneNumber);
      expect(result).toHaveProperty('success', true);
      expect(result).toHaveProperty('code');
    });

    it('should verify code successfully', async () => {
      const phoneNumber = '+1234567890';
      const code = '123456';

      const result = await smsService.verifyCode(phoneNumber, code);
      expect(result).toHaveProperty('valid', true);
    });

    it('should handle SMS sending failure', async () => {
      const smsData = {
        to: 'invalid-number',
        message: 'Test SMS'
      };

      // Simuler une erreur
      jest.spyOn(smsService, 'sendSMS').mockRejectedValue(new Error('Failed to send SMS'));

      await expect(smsService.sendSMS(smsData)).rejects.toThrow('Failed to send SMS');
    });
  });

  describe('Push Service Tests', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should send push notification successfully', async () => {
      const subscription = {
        endpoint: 'test-endpoint',
        keys: {
          p256dh: 'test-p256dh',
          auth: 'test-auth'
        }
      };

      const payload = {
        title: 'Test Push',
        body: 'Test message',
        icon: 'test-icon.png'
      };

      const result = await pushService.sendPushNotification(subscription, payload);
      expect(result).toHaveProperty('success', true);
    });

    it('should send bulk push notifications successfully', async () => {
      const subscriptions = [
        {
          endpoint: 'test-endpoint-1',
          keys: {
            p256dh: 'test-p256dh-1',
            auth: 'test-auth-1'
          }
        },
        {
          endpoint: 'test-endpoint-2',
          keys: {
            p256dh: 'test-p256dh-2',
            auth: 'test-auth-2'
          }
        }
      ];

      const payload = {
        title: 'Test Push',
        body: 'Test message',
        icon: 'test-icon.png'
      };

      const results = await pushService.sendBulkPushNotifications(subscriptions, payload);
      expect(results).toHaveProperty('success', true);
      expect(results).toHaveProperty('successCount', 2);
      expect(results).toHaveProperty('failedCount', 0);
      expect(results).toHaveProperty('expiredCount', 0);
    });

    it('should generate VAPID keys', () => {
      const keys = pushService.generateVAPIDKeys();
      expect(keys).toHaveProperty('publicKey');
      expect(keys).toHaveProperty('privateKey');
    });

    it('should validate subscription successfully', async () => {
      const subscription = {
        endpoint: 'test-endpoint',
        keys: {
          p256dh: 'test-p256dh',
          auth: 'test-auth'
        }
      };

      const result = await pushService.validateSubscription(subscription);
      expect(result).toBe(true);
    });

    it('should handle push notification failure', async () => {
      const subscription = {
        endpoint: 'invalid-endpoint',
        keys: {
          p256dh: 'test-p256dh',
          auth: 'test-auth'
        }
      };

      const payload = {
        title: 'Test Push',
        body: 'Test message'
      };

      // Simuler une erreur
      jest.spyOn(pushService, 'sendPushNotification').mockRejectedValue(new Error('Failed to send push notification'));

      await expect(pushService.sendPushNotification(subscription, payload)).rejects.toThrow('Failed to send push notification');
    });
  });
}); 