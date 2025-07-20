const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true,
  },
  status: {
    type: String,
    enum: ['active', 'expired', 'cancelled'],
    default: 'active',
  },
  startDate: {
    type: Date,
    default: Date.now,
  },
  endDate: {
    type: Date,
    required: true,
  },
  paymentId: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  currency: {
    type: String,
    default: 'EUR',
  },
  paymentMethod: {
    type: String,
    required: true,
  },
  autoRenew: {
    type: Boolean,
    default: false,
  },
  lastPaymentDate: {
    type: Date,
    default: Date.now,
  },
  nextPaymentDate: Date,
  cancellationReason: String,
  refunded: {
    type: Boolean,
    default: false,
  },
  refundAmount: Number,
  refundDate: Date,
}, {
  timestamps: true,
});

// Méthode pour vérifier si l'abonnement est actif
subscriptionSchema.methods.isActive = function() {
  return this.status === 'active' && new Date() < this.endDate;
};

// Méthode pour annuler l'abonnement
subscriptionSchema.methods.cancel = function(reason) {
  this.status = 'cancelled';
  this.cancellationReason = reason;
  this.autoRenew = false;
  return this.save();
};

// Méthode pour renouveler l'abonnement
subscriptionSchema.methods.renew = function(months) {
  if (this.status === 'cancelled') {
    throw new Error('Cannot renew a cancelled subscription');
  }

  this.status = 'active';
  this.startDate = new Date();
  this.endDate = new Date(this.endDate.setMonth(this.endDate.getMonth() + months));
  this.lastPaymentDate = new Date();
  this.nextPaymentDate = new Date(this.endDate);
  return this.save();
};

// Méthode pour effectuer un remboursement
subscriptionSchema.methods.refund = function(amount) {
  if (this.refunded) {
    throw new Error('Subscription already refunded');
  }

  this.refunded = true;
  this.refundAmount = amount;
  this.refundDate = new Date();
  return this.save();
};

// Méthode pour obtenir les informations de l'abonnement
subscriptionSchema.methods.getInfo = function() {
  const subscription = this.toObject();
  delete subscription.__v;
  return subscription;
};

const Subscription = mongoose.model('Subscription', subscriptionSchema);

module.exports = Subscription; 