const {
  validateEmail,
  validatePhoneNumber,
  validatePushSubscription,
  formatNotificationMessage,
  generateNotificationId,
  parseNotificationMetadata,
  calculateRetryDelay,
  isNotificationExpired,
  sanitizeNotificationData
} = require('../../utils/notification.utils');

describe('Notification Utils Tests', () => {
  describe('Email Validation', () => {
    it('should validate correct email addresses', () => {
      expect(validateEmail('test@example.com')).toBe(true);
      expect(validateEmail('user.name@domain.co.uk')).toBe(true);
      expect(validateEmail('user+tag@example.com')).toBe(true);
    });

    it('should reject invalid email addresses', () => {
      expect(validateEmail('invalid-email')).toBe(false);
      expect(validateEmail('user@')).toBe(false);
      expect(validateEmail('@domain.com')).toBe(false);
      expect(validateEmail('user@.com')).toBe(false);
      expect(validateEmail('user@domain.')).toBe(false);
    });
  });

  describe('Phone Number Validation', () => {
    it('should validate correct phone numbers', () => {
      expect(validatePhoneNumber('+1234567890')).toBe(true);
      expect(validatePhoneNumber('+33 6 12 34 56 78')).toBe(true);
      expect(validatePhoneNumber('+1 (555) 123-4567')).toBe(true);
    });

    it('should reject invalid phone numbers', () => {
      expect(validatePhoneNumber('123456')).toBe(false);
      expect(validatePhoneNumber('+123')).toBe(false);
      expect(validatePhoneNumber('invalid')).toBe(false);
      expect(validatePhoneNumber('')).toBe(false);
    });
  });

  describe('Push Subscription Validation', () => {
    it('should validate correct push subscriptions', () => {
      const validSubscription = {
        endpoint: 'https://fcm.googleapis.com/fcm/send/...',
        keys: {
          p256dh: 'valid-p256dh-key',
          auth: 'valid-auth-key'
        }
      };

      expect(validatePushSubscription(validSubscription)).toBe(true);
    });

    it('should reject invalid push subscriptions', () => {
      const invalidSubscriptions = [
        { endpoint: 'invalid-endpoint' },
        { keys: { p256dh: 'key' } },
        { keys: { auth: 'key' } },
        {},
        null,
        undefined
      ];

      invalidSubscriptions.forEach(subscription => {
        expect(validatePushSubscription(subscription)).toBe(false);
      });
    });
  });

  describe('Message Formatting', () => {
    it('should format notification message with variables', () => {
      const template = 'Hello {{name}}, your course {{course}} is ready!';
      const variables = {
        name: 'John',
        course: 'JavaScript Basics'
      };

      const result = formatNotificationMessage(template, variables);
      expect(result).toBe('Hello John, your course JavaScript Basics is ready!');
    });

    it('should handle missing variables', () => {
      const template = 'Hello {{name}}, your course {{course}} is ready!';
      const variables = {
        name: 'John'
      };

      const result = formatNotificationMessage(template, variables);
      expect(result).toBe('Hello John, your course {{course}} is ready!');
    });

    it('should handle empty template', () => {
      expect(formatNotificationMessage('', {})).toBe('');
      expect(formatNotificationMessage(null, {})).toBe('');
      expect(formatNotificationMessage(undefined, {})).toBe('');
    });
  });

  describe('Notification ID Generation', () => {
    it('should generate unique notification IDs', () => {
      const id1 = generateNotificationId();
      const id2 = generateNotificationId();

      expect(id1).toBeDefined();
      expect(id2).toBeDefined();
      expect(id1).not.toBe(id2);
    });

    it('should generate IDs with correct format', () => {
      const id = generateNotificationId();
      expect(id).toMatch(/^[a-zA-Z0-9-_]{20,}$/);
    });
  });

  describe('Metadata Parsing', () => {
    it('should parse valid notification metadata', () => {
      const metadata = {
        email: 'test@example.com',
        phoneNumber: '+1234567890',
        customField: 'value'
      };

      const result = parseNotificationMetadata(metadata);
      expect(result).toEqual(metadata);
    });

    it('should handle invalid metadata', () => {
      const invalidMetadata = {
        email: 'invalid-email',
        phoneNumber: 'invalid-number'
      };

      const result = parseNotificationMetadata(invalidMetadata);
      expect(result).toEqual({});
    });

    it('should handle empty metadata', () => {
      expect(parseNotificationMetadata({})).toEqual({});
      expect(parseNotificationMetadata(null)).toEqual({});
      expect(parseNotificationMetadata(undefined)).toEqual({});
    });
  });

  describe('Retry Delay Calculation', () => {
    it('should calculate exponential backoff delay', () => {
      const retryCount = 3;
      const baseDelay = 1000;
      const maxDelay = 10000;

      const delay = calculateRetryDelay(retryCount, baseDelay, maxDelay);
      expect(delay).toBeGreaterThanOrEqual(baseDelay);
      expect(delay).toBeLessThanOrEqual(maxDelay);
    });

    it('should respect maximum delay', () => {
      const retryCount = 10;
      const baseDelay = 1000;
      const maxDelay = 10000;

      const delay = calculateRetryDelay(retryCount, baseDelay, maxDelay);
      expect(delay).toBeLessThanOrEqual(maxDelay);
    });

    it('should handle zero retry count', () => {
      const delay = calculateRetryDelay(0, 1000, 10000);
      expect(delay).toBe(1000);
    });
  });

  describe('Notification Expiration', () => {
    it('should detect expired notifications', () => {
      const expiredDate = new Date(Date.now() - 24 * 60 * 60 * 1000); // 24 hours ago
      expect(isNotificationExpired(expiredDate)).toBe(true);
    });

    it('should detect non-expired notifications', () => {
      const futureDate = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours in future
      expect(isNotificationExpired(futureDate)).toBe(false);
    });

    it('should handle invalid dates', () => {
      expect(isNotificationExpired(null)).toBe(true);
      expect(isNotificationExpired(undefined)).toBe(true);
      expect(isNotificationExpired('invalid-date')).toBe(true);
    });
  });

  describe('Data Sanitization', () => {
    it('should sanitize notification data', () => {
      const inputData = {
        type: 'email',
        title: '  Test Title  ',
        message: '  Test Message  ',
        metadata: {
          email: '  test@example.com  ',
          customField: '  value  '
        }
      };

      const expectedData = {
        type: 'email',
        title: 'Test Title',
        message: 'Test Message',
        metadata: {
          email: 'test@example.com',
          customField: 'value'
        }
      };

      const result = sanitizeNotificationData(inputData);
      expect(result).toEqual(expectedData);
    });

    it('should handle null or undefined values', () => {
      const inputData = {
        type: 'email',
        title: null,
        message: undefined,
        metadata: null
      };

      const result = sanitizeNotificationData(inputData);
      expect(result.title).toBe('');
      expect(result.message).toBe('');
      expect(result.metadata).toEqual({});
    });

    it('should handle empty objects', () => {
      expect(sanitizeNotificationData({})).toEqual({});
      expect(sanitizeNotificationData(null)).toEqual({});
      expect(sanitizeNotificationData(undefined)).toEqual({});
    });
  });
}); 