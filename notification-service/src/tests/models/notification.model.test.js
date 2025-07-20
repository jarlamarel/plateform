const mongoose = require('mongoose');
const Notification = require('../../models/Notification');

describe('Notification Model Tests', () => {
  beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_URI_TEST || 'mongodb://localhost:27017/notification_model_test');
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    await Notification.deleteMany({});
  });

  describe('Notification Schema Validation', () => {
    it('should create a valid notification', async () => {
      const notificationData = {
        user: new mongoose.Types.ObjectId(),
        type: 'email',
        title: 'Test Notification',
        message: 'Test message',
        status: 'pending',
        priority: 'medium'
      };

      const notification = new Notification(notificationData);
      const savedNotification = await notification.save();

      expect(savedNotification._id).toBeDefined();
      expect(savedNotification.type).toBe(notificationData.type);
      expect(savedNotification.title).toBe(notificationData.title);
      expect(savedNotification.message).toBe(notificationData.message);
      expect(savedNotification.status).toBe(notificationData.status);
      expect(savedNotification.priority).toBe(notificationData.priority);
      expect(savedNotification.read).toBe(false);
      expect(savedNotification.retryCount).toBe(0);
      expect(savedNotification.maxRetries).toBe(3);
    });

    it('should fail to create notification without required fields', async () => {
      const notificationData = {
        type: 'email',
        title: 'Test Notification'
        // message manquant
      };

      const notification = new Notification(notificationData);
      await expect(notification.save()).rejects.toThrow();
    });

    it('should fail to create notification with invalid type', async () => {
      const notificationData = {
        user: new mongoose.Types.ObjectId(),
        type: 'invalid_type',
        title: 'Test Notification',
        message: 'Test message'
      };

      const notification = new Notification(notificationData);
      await expect(notification.save()).rejects.toThrow();
    });

    it('should fail to create notification with invalid status', async () => {
      const notificationData = {
        user: new mongoose.Types.ObjectId(),
        type: 'email',
        title: 'Test Notification',
        message: 'Test message',
        status: 'invalid_status'
      };

      const notification = new Notification(notificationData);
      await expect(notification.save()).rejects.toThrow();
    });

    it('should fail to create notification with invalid priority', async () => {
      const notificationData = {
        user: new mongoose.Types.ObjectId(),
        type: 'email',
        title: 'Test Notification',
        message: 'Test message',
        priority: 'invalid_priority'
      };

      const notification = new Notification(notificationData);
      await expect(notification.save()).rejects.toThrow();
    });
  });

  describe('Notification Model Methods', () => {
    it('should mark notification as read', async () => {
      const notification = await Notification.create({
        user: new mongoose.Types.ObjectId(),
        type: 'email',
        title: 'Test Notification',
        message: 'Test message'
      });

      await notification.markAsRead();
      expect(notification.read).toBe(true);
      expect(notification.readAt).toBeDefined();
    });

    it('should mark notification as sent', async () => {
      const notification = await Notification.create({
        user: new mongoose.Types.ObjectId(),
        type: 'email',
        title: 'Test Notification',
        message: 'Test message'
      });

      await notification.markAsSent();
      expect(notification.status).toBe('sent');
      expect(notification.sentAt).toBeDefined();
    });

    it('should mark notification as failed', async () => {
      const notification = await Notification.create({
        user: new mongoose.Types.ObjectId(),
        type: 'email',
        title: 'Test Notification',
        message: 'Test message'
      });

      const error = 'Failed to send notification';
      await notification.markAsFailed(error);
      expect(notification.status).toBe('failed');
      expect(notification.error).toBe(error);
      expect(notification.retryCount).toBe(1);
    });

    it('should check if notification can be retried', async () => {
      const notification = await Notification.create({
        user: new mongoose.Types.ObjectId(),
        type: 'email',
        title: 'Test Notification',
        message: 'Test message',
        status: 'failed',
        retryCount: 2
      });

      expect(notification.canRetry()).toBe(true);

      notification.retryCount = 3;
      expect(notification.canRetry()).toBe(false);
    });

    it('should get notification info', async () => {
      const notification = await Notification.create({
        user: new mongoose.Types.ObjectId(),
        type: 'email',
        title: 'Test Notification',
        message: 'Test message',
        status: 'sent',
        priority: 'high'
      });

      const info = notification.getInfo();
      expect(info).toHaveProperty('id');
      expect(info).toHaveProperty('type', 'email');
      expect(info).toHaveProperty('title', 'Test Notification');
      expect(info).toHaveProperty('status', 'sent');
      expect(info).toHaveProperty('priority', 'high');
      expect(info).toHaveProperty('read', false);
    });
  });

  describe('Notification Model Indexes', () => {
    it('should have indexes for efficient querying', async () => {
      const indexes = await Notification.collection.indexes();
      const indexNames = indexes.map(index => index.name);

      expect(indexNames).toContain('user_1');
      expect(indexNames).toContain('status_1');
      expect(indexNames).toContain('priority_1');
      expect(indexNames).toContain('type_1');
    });
  });
}); 