const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['email', 'sms', 'push', 'in_app'],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'sent', 'failed'],
    default: 'pending'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  metadata: {
    type: Map,
    of: mongoose.Schema.Types.Mixed
  },
  read: {
    type: Boolean,
    default: false
  },
  readAt: {
    type: Date
  },
  sentAt: {
    type: Date
  },
  error: {
    type: String
  },
  retryCount: {
    type: Number,
    default: 0
  },
  maxRetries: {
    type: Number,
    default: 3
  }
}, {
  timestamps: true
});

// Méthodes du modèle
notificationSchema.methods.markAsRead = function() {
  this.read = true;
  this.readAt = new Date();
  return this.save();
};

notificationSchema.methods.markAsSent = function() {
  this.status = 'sent';
  this.sentAt = new Date();
  return this.save();
};

notificationSchema.methods.markAsFailed = function(error) {
  this.status = 'failed';
  this.error = error;
  this.retryCount += 1;
  return this.save();
};

notificationSchema.methods.canRetry = function() {
  return this.status === 'failed' && this.retryCount < this.maxRetries;
};

notificationSchema.methods.getInfo = function() {
  return {
    id: this._id,
    type: this.type,
    title: this.title,
    message: this.message,
    status: this.status,
    priority: this.priority,
    read: this.read,
    readAt: this.readAt,
    sentAt: this.sentAt,
    createdAt: this.createdAt
  };
};

// Indexes
notificationSchema.index({ user: 1, createdAt: -1 });
notificationSchema.index({ status: 1, priority: 1 });
notificationSchema.index({ type: 1, status: 1 });

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification; 