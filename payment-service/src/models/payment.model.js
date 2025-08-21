const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    required: true,
    default: 'EUR'
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded', 'canceled', 'disputed'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['card', 'bank_transfer', 'paypal'],
    required: true
  },
  stripePaymentId: {
    type: String,
    required: true
  },
  stripeCustomerId: {
    type: String,
    required: true
  },
  metadata: {
    type: Map,
    of: String
  },
  refundReason: {
    type: String
  },
  refundedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Méthodes du modèle
paymentSchema.methods.toJSON = function() {
  const payment = this.toObject();
  delete payment.__v;
  return payment;
};

// Méthode pour marquer un paiement comme remboursé
paymentSchema.methods.markAsRefunded = async function(reason) {
  this.status = 'refunded';
  this.refundReason = reason;
  this.refundedAt = new Date();
  return this.save();
};

const Payment = mongoose.model('Payment', paymentSchema);

module.exports = Payment; 