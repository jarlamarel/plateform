const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  stripeSubscriptionId: {
    type: String,
    required: true,
    unique: true
  },
  stripeCustomerId: {
    type: String,
    required: true
  },
  stripePriceId: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'canceled', 'past_due', 'unpaid', 'incomplete'],
    default: 'incomplete'
  },
  currentPeriodStart: {
    type: Date,
    required: true
  },
  currentPeriodEnd: {
    type: Date,
    required: true
  },
  cancelAtPeriodEnd: {
    type: Boolean,
    default: false
  },
  canceledAt: {
    type: Date
  },
  trialStart: {
    type: Date
  },
  trialEnd: {
    type: Date
  },
  planName: {
    type: String,
    required: true
  },
  planPrice: {
    type: Number,
    required: true
  },
  planCurrency: {
    type: String,
    required: true,
    default: 'EUR'
  },
  planInterval: {
    type: String,
    enum: ['month', 'year'],
    required: true
  },
  metadata: {
    type: Map,
    of: String
  }
}, {
  timestamps: true
});

// Index pour les requêtes fréquentes
subscriptionSchema.index({ userId: 1 });
subscriptionSchema.index({ stripeSubscriptionId: 1 });
subscriptionSchema.index({ status: 1 });

// Méthodes du modèle
subscriptionSchema.methods.toJSON = function() {
  const subscription = this.toObject();
  delete subscription.__v;
  return subscription;
};

// Méthode pour marquer un abonnement comme annulé
subscriptionSchema.methods.markAsCanceled = async function() {
  this.status = 'canceled';
  this.canceledAt = new Date();
  return this.save();
};

// Méthode pour vérifier si l'abonnement est actif
subscriptionSchema.methods.isActive = function() {
  return this.status === 'active' && new Date() < this.currentPeriodEnd;
};

// Méthode pour vérifier si l'abonnement est en période d'essai
subscriptionSchema.methods.isInTrial = function() {
  const now = new Date();
  return this.trialStart && this.trialEnd && now >= this.trialStart && now <= this.trialEnd;
};

const Subscription = mongoose.model('Subscription', subscriptionSchema);

module.exports = Subscription;
